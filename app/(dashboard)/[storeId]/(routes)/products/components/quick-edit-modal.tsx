"use client"

import type React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import type { ProductColumn } from "../types"

const formSchema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().min(0.01),
  sku: z.string().optional(),
  isPublished: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  description: z.string().optional(),
})

type QuickEditFormValues = z.infer<typeof formSchema>

interface QuickEditModalProps {
  isOpen: boolean
  onClose: () => void
  product: ProductColumn
}

export const QuickEditModal: React.FC<QuickEditModalProps> = ({ isOpen, onClose, product }) => {
  const [loading, setLoading] = useState(false)
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<QuickEditFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product.name,
      price: Number.parseFloat(product.price.replace(/[^0-9.]/g, "")),
      sku: product.sku || "",
      isPublished: product.isPublished,
      isArchived: product.isArchived,
      description: product.description || "",
    },
  })

  const onSubmit = async (data: QuickEditFormValues) => {
    try {
      setLoading(true)

      // If saving as draft, explicitly set isArchived to false
      if (data.isPublished === false && data.isArchived === false) {
        data.isPublished = false
        data.isArchived = false
      } else if (data.isPublished === true && data.isArchived === false) {
        data.isPublished = true
        data.isArchived = false
      } else if (data.isPublished === false && data.isArchived === true) {
        data.isArchived = true
      }

      const response = await fetch(`/api/${params.storeId}/products/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update product")
      }

      toast({
        title: "Success",
        description: "Product updated successfully.",
      })

      router.refresh()
      onClose()
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Quick Edit Product</DialogTitle>
          <DialogDescription>
            Make quick changes to your product. For more detailed edits, use the full editor.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="9.99" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="SKU-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Product description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
            <div className="flex items-center space-x-4">
              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">Published</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isArchived"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">Archived</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
