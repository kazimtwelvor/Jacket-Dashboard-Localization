"use client"

import type React from "react"

import { useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "react-hot-toast"
import axios from "axios"
import { Trash, Palette, Tag, Shirt, ImageIcon } from "lucide-react"
import type { Billboard, Category } from "@prisma/client"
import { Heading } from "@/components/ui/heading"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertModal } from "@/components/modals/alert-modal"
import { EditableCategoryTemplate } from "./editable-category-template"
import ImageUpload from "@/components/ui/image-upload"

interface CategoryFormProps {
  initialData: Category | null
  billboards: Billboard[]
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  billboardId: z.string().nullable().optional(),
  type: z.enum(["material", "style", "gender"]),
  imageUrl: z.string().optional(),
  categoryContent: z.string().optional(),
  isBest: z.boolean().optional(),
})

type CategoryFormValues = z.infer<typeof formSchema>

export const CategoryForm: React.FC<CategoryFormProps> = ({ initialData, billboards }) => {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeParam = searchParams.get("type")

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const title = initialData ? "Edit Category" : "Create Category"
  const description = initialData ? "Edit a category" : "Add a new category"
  const toastMessage = initialData ? "Category updated." : "Category created."
  const action = initialData ? "Save changes" : "Create"

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          billboardId: initialData.billboardId || undefined,
          type: initialData.type as "material" | "style" | "gender",
          imageUrl: initialData.imageUrl || "",
          categoryContent: initialData.categoryContent ? JSON.stringify(initialData.categoryContent) : undefined,
          isBest: initialData.isBest || false,
        }
      : {
          name: "",
          slug: "",
          billboardId: undefined,
          type: (typeParam as "material" | "style" | "gender") || "material",
          imageUrl: "",
          categoryContent: undefined,
          isBest: false,
        },
  })

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    form.setValue("name", name)

    if (!initialData?.slug && !form.getValues("slug")) {
      const slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
      form.setValue("slug", slug)
    }
  }

  const onCancel = () => {
    router.push(`/${params.storeId}/attributes?tab=categories`)
  }

  const onSuccess = () => {
    router.push(`/${params.storeId}/attributes?tab=categories`)
  }

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      setLoading(true)
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/categories/${params.categoryId}`, data)
      } else {
        await axios.post(`/api/${params.storeId}/categories`, data)
      }
      router.refresh()
      onSuccess()
      toast.success(toastMessage)
    } catch (err) {
      console.error(err)
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/${params.storeId}/categories/${params.categoryId}`)
      router.refresh()
      onCancel()
      toast.success("Category deleted.")
    } catch (err) {
      console.error(err)
      toast.error("Make sure you removed all products using this category first.")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "material":
        return <Palette className="h-5 w-5" />
      case "style":
        return <Tag className="h-5 w-5" />
      case "gender":
        return <Shirt className="h-5 w-5" />
      default:
        return <Palette className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "material":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "style":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "gender":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-blue-100 text-blue-700 border-blue-200"
    }
  }

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button variant="destructive" size="sm" onClick={() => setOpen(true)} disabled={loading}>
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder="Category name" {...field} onChange={onNameChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="category-slug"
                        {...field}
                        onChange={(e) => {
                          field.onChange(
                            e.target.value
                              .toLowerCase()
                              .replace(/\s+/g, "-")
                              .replace(/[^a-z0-9-]/g, ""),
                          )
                        }}
                      />
                    </FormControl>
                    <FormDescription>URL: /categories/{field.value}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Type</FormLabel>
                    <div className="grid grid-cols-3 gap-3">
                      {["material", "style", "gender"].map((type) => (
                        <div
                          key={type}
                          onClick={() => form.setValue("type", type as "material" | "style" | "gender")}
                          className={`flex items-center gap-2 p-3 rounded-md border-2 cursor-pointer transition-all ${
                            form.watch("type") === type
                              ? `border-${type === "material" ? "blue" : type === "style" ? "purple" : "green"}-500 ${getTypeColor(type)}`
                              : "border-muted"
                          }`}
                        >
                          <input
                            type="radio"
                            id={type}
                            value={type}
                            checked={form.watch("type") === type}
                            onChange={() => form.setValue("type", type as "material" | "style" | "gender")}
                            className="sr-only"
                          />
                          <div
                            className={`p-1.5 rounded-full ${
                              type === "material" ? "bg-blue-100" : type === "style" ? "bg-purple-100" : "bg-green-100"
                            }`}
                          >
                            {getTypeIcon(type)}
                          </div>
                          <div>
                            <div className="text-sm font-medium capitalize">{type}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billboardId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billboard (Optional)</FormLabel>
                    <Select
                      disabled={loading}
                      onValueChange={(value) => field.onChange(value === "none" ? undefined : value)}
                      value={field.value || "none"}
                      defaultValue={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a billboard (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {billboards.map((billboard) => (
                          <SelectItem key={billboard.id} value={billboard.id}>
                            {billboard.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Associate this category with a billboard (optional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isBest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Is Best Category</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value === "true")} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="false">False</SelectItem>
                        <SelectItem value="true">True</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Image</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value ? [field.value] : []}
                    disabled={loading}
                    onChange={(url) => field.onChange(url)}
                    onRemove={() => field.onChange("")}
                    multiple={false}
                  />
                </FormControl>
                <FormDescription>Upload an image for this category</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <EditableCategoryTemplate form={form} />

          <div className="flex items-center justify-end gap-4">
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button disabled={loading} className="ml-auto" type="submit">
              {action}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}
