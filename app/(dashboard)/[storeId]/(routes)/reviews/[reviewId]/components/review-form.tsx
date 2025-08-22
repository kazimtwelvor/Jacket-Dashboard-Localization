"use client"

import type React from "react"

import { useState } from "react"
import * as z from "zod"
import { Heading } from "@/components/ui/heading"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Trash } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"
import { AlertModal } from "@/components/modals/alert-modal"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Product } from "@prisma/client"

const formSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  userName: z.string().min(1, "Customer name is required"),
  rating: z.coerce.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(1, "Review comment is required"),
  isApproved: z.boolean().default(false),
})

type ReviewFormValues = z.infer<typeof formSchema>

interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  title: string | null
  comment: string
  isApproved: boolean
  createdAt: Date
  updatedAt: Date
  storeId: string
}

interface ReviewFormProps {
  initialData: Review | null
  products: Product[]
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ initialData, products }) => {
  const params = useParams()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const title = initialData ? "Edit review" : "Create test review"
  const description = initialData ? "Edit a review" : "Add a new test review"
  const toastMessage = initialData ? "Review updated." : "Review created."
  const action = initialData ? "Save changes" : "Create"

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          productId: initialData.productId,
          userName: initialData.userName,
          rating: initialData.rating,
          title: initialData.title || "",
          comment: initialData.comment,
          isApproved: initialData.isApproved,
        }
      : {
          productId: "",
          userName: "",
          rating: 5,
          title: "",
          comment: "",
          isApproved: false,
        },
  })

  const onSubmit = async (data: ReviewFormValues) => {
    try {
      setLoading(true)
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/reviews/${params.reviewId}`, data)
      } else {
        await axios.post(`/api/${params.storeId}/reviews`, data)
      }
      router.refresh()
      router.push(`/${params.storeId}/reviews`)
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
      await axios.delete(`/api/${params.storeId}/reviews/${params.reviewId}`)
      router.refresh()
      router.push(`/${params.storeId}/reviews`)
      toast.success("Review deleted.")
    } catch (err) {
      console.error(err)
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button variant="destructive" size="sm" onClick={() => setOpen(true)} disabled={loading}>
            <Trash className="w-4 h-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Customer name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating (1-5)</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={(value) => field.onChange(Number.parseInt(value))}
                    value={field.value.toString()}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} placeholder="Select a rating" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {rating} {rating === 1 ? "Star" : "Stars"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Title (Optional)</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Review title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormLabel>Review Comment</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={loading}
                      placeholder="Write your review here..."
                      className="resize-none"
                      {...field}
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isApproved"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={loading} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Approved</FormLabel>
                    <FormDescription>Mark this review as approved to display it on the store</FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  )
}
