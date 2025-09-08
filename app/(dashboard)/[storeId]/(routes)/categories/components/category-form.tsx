"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "react-hot-toast"
import axios from "axios"
import { Trash } from "lucide-react"
import type { Billboard, Category } from "@prisma/client"
import { Heading } from "@/components/ui/heading"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertModal } from "@/components/modals/alert-modal"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CategoryFormProps {
  initialData: Category | null
  billboards: Billboard[]
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  billboardId: z.string().optional(),
  type: z.enum(["material", "style", "gender", "regular"]),
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
          type: (initialData.type as "material" | "style" | "gender" | "regular") || "regular",
          isBest: initialData.isBest || false,
        }
      : {
          name: "",
          slug: "",
          billboardId: undefined,
          type: (typeParam as "material" | "style" | "gender" | "regular") || "regular",
          isBest: false,
        },
  })

  useEffect(() => {
  }, [form.watch("type")])

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

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "material":
        return "bg-blue-100 text-blue-700"
      case "style":
        return "bg-purple-100 text-purple-700"
      case "gender":
        return "bg-green-100 text-green-700"
      default:
        return ""
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
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          form.setValue("type", value as "material" | "style" | "gender" | "regular")
                        }}
                        className="grid grid-cols-2 gap-4"
                      >
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Card
                              className={`relative flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer ${field.value === "material" ? "border-blue-500" : "border-muted"} ${field.value === "material" ? "bg-blue-50" : ""}`}
                            >
                              <RadioGroupItem value="material" id="material" className="sr-only" />
                              <div className="flex flex-col items-center gap-1 text-center">
                                <div className="text-sm font-medium">Material</div>
                                <Badge className={getBadgeColor("material")}>Material</Badge>
                              </div>
                            </Card>
                          </FormControl>
                        </FormItem>
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Card
                              className={`relative flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer ${field.value === "style" ? "border-purple-500" : "border-muted"} ${field.value === "style" ? "bg-purple-50" : ""}`}
                            >
                              <RadioGroupItem value="style" id="style" className="sr-only" />
                              <div className="flex flex-col items-center gap-1 text-center">
                                <div className="text-sm font-medium">Style</div>
                                <Badge className={getBadgeColor("style")}>Style</Badge>
                              </div>
                            </Card>
                          </FormControl>
                        </FormItem>
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Card
                              className={`relative flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer ${field.value === "gender" ? "border-green-500" : "border-muted"} ${field.value === "gender" ? "bg-green-50" : ""}`}
                            >
                              <RadioGroupItem value="gender" id="gender" className="sr-only" />
                              <div className="flex flex-col items-center gap-1 text-center">
                                <div className="text-sm font-medium">Gender</div>
                                <Badge className={getBadgeColor("gender")}>Gender</Badge>
                              </div>
                            </Card>
                          </FormControl>
                        </FormItem>
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Card
                              className={`relative flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer ${field.value === "regular" ? "border-gray-500" : "border-muted"} ${field.value === "regular" ? "bg-gray-50" : ""}`}
                            >
                              <RadioGroupItem value="regular" id="regular" className="sr-only" />
                              <div className="flex flex-col items-center gap-1 text-center">
                                <div className="text-sm font-medium">Regular</div>
                                <Badge variant="outline">Regular</Badge>
                              </div>
                            </Card>
                          </FormControl>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
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
