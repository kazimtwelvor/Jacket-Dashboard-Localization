"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import type { Category, Color, Product, Size } from "@prisma/client"
import { Check, ChevronLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Heading } from "@/components/ui/heading"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
const formSchema = z.object({
  updateCategory: z.boolean().default(false),
  categoryId: z.string().optional(),

  updatePrice: z.boolean().default(false),
  price: z.coerce.number().min(0).optional(),

  updateSize: z.boolean().default(false),
  sizeId: z.string().optional(),

  updateColor: z.boolean().default(false),
  colorId: z.string().optional(),

  updateFeatured: z.boolean().default(false),
  isFeatured: z.boolean().default(false),

  updatePublished: z.boolean().default(false),
  isPublished: z.boolean().default(false),

  updateArchived: z.boolean().default(false),
  isArchived: z.boolean().default(false),
})
type ProductWithRelations = Product & {
  category: Category | null
  size: Size | null
  color: Color | null
  images: { url: string }[]
}
interface BulkEditFormWrapperProps {
  products: ProductWithRelations[]
  categories: Category[]
  sizes: Size[]
  colors: Color[]
  storeId: string
}
export const BulkEditFormWrapper = ({ products, categories, sizes, colors, storeId }: BulkEditFormWrapperProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      updateCategory: false,
      updatePrice: false,
      updateSize: false,
      updateColor: false,
      updateFeatured: false,
      updatePublished: false,
      updateArchived: false,
      isFeatured: false,
      isPublished: true,
      isArchived: false,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const hasUpdate =
        values.updateCategory ||
        values.updatePrice ||
        values.updateSize ||
        values.updateColor ||
        values.updateFeatured ||
        values.updatePublished ||
        values.updateArchived

      if (!hasUpdate) {
        toast.error("Please select at least one field to update")
        return
      }

      setLoading(true)

      const updateData: Record<string, any> = {}

      if (values.updateCategory && values.categoryId) {
        updateData.categoryId = values.categoryId
      }

      if (values.updatePrice && values.price !== undefined) {
        updateData.price = values.price
      }

      if (values.updateSize && values.sizeId) {
        updateData.sizeId = values.sizeId
      }

      if (values.updateColor && values.colorId) {
        updateData.colorId = values.colorId
      }

      if (values.updateFeatured) {
        updateData.isFeatured = values.isFeatured
      }

      if (values.updatePublished) {
        updateData.isPublished = values.isPublished
      }

      if (values.updateArchived) {
        updateData.isArchived = values.isArchived
      }

      const response = await fetch(`/api/${storeId}/products/bulk`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productIds: products.map((p) => p.id),
          data: updateData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update products")
      }

      router.refresh()
      router.push(`/${storeId}/products`)
      toast.success(`${products.length} products updated successfully`)
    } catch (error) {
      console.error("Error updating products:", error)
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Bulk Edit ${products.length} Products`} description="Update multiple products at once" />
        <Button disabled={loading} variant="outline" size="sm" onClick={() => router.push(`/${storeId}/products`)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to products
        </Button>
      </div>
      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Selected Products</CardTitle>
              <CardDescription>You are editing {products.length} products</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto">
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center space-x-4 border-b pb-4">
                    <div className="h-16 w-16 relative rounded-md overflow-hidden">
                      <Image
                        fill
                        alt={product.name}
                        src={product.images[0]?.url || "/placeholder.svg?height=100&width=100&query=product"}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.isPublished && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Published
                          </Badge>
                        )}
                        {!product.isPublished && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Draft
                          </Badge>
                        )}
                        {product.isFeatured && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Featured
                          </Badge>
                        )}
                        {product.isArchived && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Archived
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Bulk Update Options</CardTitle>
                  <CardDescription>Select which fields to update for all selected products</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <FormField
                        control={form.control}
                        name="updateCategory"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Update Category</FormLabel>
                              <FormDescription>Change the category for all selected products</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {form.watch("updateCategory") && (
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select
                              disabled={loading}
                              onValueChange={field.onChange}
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" defaultValue={field.value} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <FormField
                        control={form.control}
                        name="updatePrice"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Update Price</FormLabel>
                              <FormDescription>Change the price for all selected products</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {form.watch("updatePrice") && (
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                disabled={loading}
                                placeholder="9.99"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <FormField
                        control={form.control}
                        name="updateSize"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Update Size</FormLabel>
                              <FormDescription>Change the size for all selected products</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {form.watch("updateSize") && (
                      <FormField
                        control={form.control}
                        name="sizeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Size</FormLabel>
                            <Select
                              disabled={loading}
                              onValueChange={field.onChange}
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a size" defaultValue={field.value} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {sizes.map((size) => (
                                  <SelectItem key={size.id} value={size.id}>
                                    {size.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <FormField
                        control={form.control}
                        name="updateColor"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Update Color</FormLabel>
                              <FormDescription>Change the color for all selected products</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {form.watch("updateColor") && (
                      <FormField
                        control={form.control}
                        name="colorId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color</FormLabel>
                            <Select
                              disabled={loading}
                              onValueChange={field.onChange}
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a color" defaultValue={field.value} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {colors.map((color) => (
                                  <SelectItem key={color.id} value={color.id}>
                                    <div className="flex items-center gap-x-2">
                                      <div
                                        className="h-4 w-4 rounded-full border"
                                        style={{ backgroundColor: color.value }}
                                      />
                                      {color.name}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <FormField
                        control={form.control}
                        name="updateFeatured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Update Featured Status</FormLabel>
                              <FormDescription>Change the featured status for all selected products</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {form.watch("updateFeatured") && (
                      <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Featured</FormLabel>
                              <FormDescription>This product will appear on the home page</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <FormField
                        control={form.control}
                        name="updatePublished"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Update Published Status</FormLabel>
                              <FormDescription>Change the published status for all selected products</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {form.watch("updatePublished") && (
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
                              <FormDescription>This product will be visible in the store</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <FormField
                        control={form.control}
                        name="updateArchived"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Update Archived Status</FormLabel>
                              <FormDescription>Change the archived status for all selected products</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {form.watch("updateArchived") && (
                      <FormField
                        control={form.control}
                        name="isArchived"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Archived</FormLabel>
                              <FormDescription>This product will not appear anywhere in the store</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button disabled={loading} className="ml-auto" type="submit">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Update {products.length} Products
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>
      </div>
    </>
  )
}
