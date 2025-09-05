"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import axios from "axios"
import { Trash } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { AlertModal } from "@/components/modals/alert-modal"
import { Checkbox } from "@/components/ui/checkbox"
import { PageBuilder } from "./page-builder"
const formSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  isPublished: z.boolean().default(false),
  content: z.string().optional(),
})
type PageFormValues = z.infer<typeof formSchema>
interface PageFormProps {
  initialData: any | null
  categories?: any[]
}

export const PageForm: React.FC<PageFormProps> = ({ initialData, categories }) => {
  const params = useParams()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPageBuilder, setShowPageBuilder] = useState(false)
  const [pageElements, setPageElements] = useState<any[]>(initialData?.content ? JSON.parse(initialData.content) : [])

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const isFromTemplate = searchParams.get("template") === "custom"

    if (isFromTemplate) {
      try {
        const templateElementsJson = localStorage.getItem("templateElements")

        if (templateElementsJson) {
          const templateElements = JSON.parse(templateElementsJson)

          if (Array.isArray(templateElements) && templateElements.length > 0) {
            setPageElements(templateElements)
            form.setValue("content", JSON.stringify(templateElements))

            setShowPageBuilder(true)

            localStorage.removeItem("templateElements")

            toast.success("Template loaded successfully!")
          } else {
            toast.error("Template elements could not be loaded properly")
          }
        } else {
        }
      } catch (error) {
        toast.error("Error loading template")
      }
    }
  }, [])

  const title = initialData ? "Edit page" : "Create page"
  const description = initialData ? "Edit your custom page" : "Create a new custom page"
  const toastMessage = initialData ? "Page updated." : "Page created."
  const action = initialData ? "Save changes" : "Create"

  const form = useForm<PageFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
        }
      : {
          title: "",
          slug: "",
          isPublished: false,
          content: "",
        },
  })

  const onSubmit = async (data: PageFormValues) => {
    try {
      setLoading(true)
      if (initialData) {
        await axios.patch(`/api/${params?.storeId}/pages/${params?.pageId}`, data)
      } else {
        await axios.post(`/api/${params?.storeId}/pages`, data)
      }
      router.refresh()
      router.push(`/${params?.storeId}/pages`)
      toast.success(toastMessage)
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || "Something went wrong."
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/${params?.storeId}/pages/${params?.pageId}`)
      router.refresh()
      router.push(`/${params?.storeId}/pages`)
      toast.success("Page deleted.")
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || "Something went wrong."
      toast.error(errorMessage)
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  const handlePageBuilderToggle = () => {
    setShowPageBuilder(!showPageBuilder)
  }

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button disabled={loading} variant="destructive" size="sm" onClick={() => setOpen(true)}>
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      {showPageBuilder ? (
        <div className="h-[calc(100vh-120px)] flex flex-col">
          <PageBuilder
            onClose={handlePageBuilderToggle}
            onSave={(content) => {
              form.setValue("content", JSON.stringify(content))
              setShowPageBuilder(false)
            }}
            onPublish={(content) => {
              form.setValue("content", JSON.stringify(content))
              form.setValue("isPublished", true)
              form.handleSubmit(onSubmit)()
            }}
            initialContent={form.getValues("content") ? JSON.parse(form.getValues("content") ?? "") : []}
          />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder="Page title" {...field} />
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
                      <Input disabled={loading} placeholder="page-slug" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Published</FormLabel>
                    <p className="text-sm text-muted-foreground">This page will be visible on your store</p>
                  </div>
                </FormItem>
              )}
            />
            <div>
              <Button type="button" onClick={handlePageBuilderToggle} variant="outline">
                Open Page Builder
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Use the page builder to create your page content visually
              </p>
            </div>
            <Button disabled={loading} className="ml-auto" type="submit">
              {action}
            </Button>
          </form>
        </Form>
      )}
    </>
  )
}
