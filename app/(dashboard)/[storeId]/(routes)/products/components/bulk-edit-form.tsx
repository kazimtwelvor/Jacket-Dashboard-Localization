"use client"

import { useState } from "react"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

interface Category {
  id: string
  name: string
}

interface Size {
  id: string
  name: string
}

interface Color {
  id: string
  name: string
  value: string
}

interface ProductType {
  id: string
  name: string
}

interface StockStatus {
  id: string
  name: string
}

interface BulkEditFormProps {
  categories: Category[]
  sizes: Size[]
  colors: Color[]
  productTypes: ProductType[]
  stockStatuses: StockStatus[]
  onSubmit: (data: any) => void
  loading: boolean
}

const formSchema = z.object({
  categoryId: z.string().optional(),
  sizeId: z.string().optional(),
  colorId: z.string().optional(),
  productType: z.string().optional(),
  price: z.string().optional(),
  salePrice: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  stockStatus: z.string().optional(),
  seoScore: z.number().optional(),
  focusKeyword: z.string().optional(),
})

export const BulkEditForm = ({
  categories,
  sizes,
  colors,
  productTypes,
  stockStatuses,
  onSubmit,
  loading,
}: BulkEditFormProps) => {
  const [updateFields, setUpdateFields] = useState({
    category: false,
    size: false,
    color: false,
    productType: false,
    price: false,
    salePrice: false,
    isFeatured: false,
    isPublished: false,
    isArchived: false,
    stockStatus: false,
    seo: false,
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: "",
      sizeId: "",
      colorId: "",
      productType: "",
      price: "",
      salePrice: "",
      isFeatured: false,
      isPublished: true,
      isArchived: false,
      stockStatus: "instock",
      seoScore: 0,
      focusKeyword: "",
    },
  })

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const dataToSubmit: any = {}

    if (updateFields.category && values.categoryId) {
      dataToSubmit.categoryId = values.categoryId
    }

    if (updateFields.size && values.sizeId) {
      dataToSubmit.sizeId = values.sizeId
    }

    if (updateFields.color && values.colorId) {
      dataToSubmit.colorId = values.colorId
    }

    if (updateFields.productType && values.productType) {
      dataToSubmit.productType = values.productType
    }

    if (updateFields.price && values.price) {
      dataToSubmit.price = values.price
    }

    if (updateFields.salePrice) {
      dataToSubmit.salePrice = values.salePrice || null
    }

    if (updateFields.isFeatured) {
      dataToSubmit.isFeatured = values.isFeatured
    }

    if (updateFields.isPublished) {
      dataToSubmit.isPublished = values.isPublished
    }

    if (updateFields.isArchived) {
      dataToSubmit.isArchived = values.isArchived
    }

    if (updateFields.stockStatus && values.stockStatus) {
      dataToSubmit.stockStatus = values.stockStatus
    }

    if (updateFields.seo) {
      if (values.focusKeyword) {
        dataToSubmit.focusKeyword = values.focusKeyword
      }
      if (values.seoScore) {
        dataToSubmit.seoScore = values.seoScore
      }
    }

    onSubmit(dataToSubmit)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="update-category"
            checked={updateFields.category}
            onCheckedChange={(checked) => setUpdateFields({ ...updateFields, category: checked === true })}
          />
          <div className="grid gap-1.5 w-full">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center" htmlFor="update-category">
                    Category
                  </FormLabel>
                  <Select
                    disabled={!updateFields.category || loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
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
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="update-size"
            checked={updateFields.size}
            onCheckedChange={(checked) => setUpdateFields({ ...updateFields, size: checked === true })}
          />
          <div className="grid gap-1.5 w-full">
            <FormField
              control={form.control}
              name="sizeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center" htmlFor="update-size">
                    Size
                  </FormLabel>
                  <Select
                    disabled={!updateFields.size || loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a size" />
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
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="update-color"
            checked={updateFields.color}
            onCheckedChange={(checked) => setUpdateFields({ ...updateFields, color: checked === true })}
          />
          <div className="grid gap-1.5 w-full">
            <FormField
              control={form.control}
              name="colorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center" htmlFor="update-color">
                    Color
                  </FormLabel>
                  <Select
                    disabled={!updateFields.color || loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color.id} value={color.id}>
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: color.value }} />
                            {color.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="update-product-type"
            checked={updateFields.productType}
            onCheckedChange={(checked) => setUpdateFields({ ...updateFields, productType: checked === true })}
          />
          <div className="grid gap-1.5 w-full">
            <FormField
              control={form.control}
              name="productType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center" htmlFor="update-product-type">
                    Product Type
                  </FormLabel>
                  <Select
                    disabled={!updateFields.productType || loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="update-price"
            checked={updateFields.price}
            onCheckedChange={(checked) => setUpdateFields({ ...updateFields, price: checked === true })}
          />
          <div className="grid gap-1.5 w-full">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center" htmlFor="update-price">
                    Price
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      disabled={!updateFields.price || loading}
                      placeholder="Enter price"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="update-sale-price"
            checked={updateFields.salePrice}
            onCheckedChange={(checked) => setUpdateFields({ ...updateFields, salePrice: checked === true })}
          />
          <div className="grid gap-1.5 w-full">
            <FormField
              control={form.control}
              name="salePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center" htmlFor="update-sale-price">
                    Sale Price
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      disabled={!updateFields.salePrice || loading}
                      placeholder="Enter sale price (leave empty to remove)"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="update-stock"
            checked={updateFields.stockStatus}
            onCheckedChange={(checked) => setUpdateFields({ ...updateFields, stockStatus: checked === true })}
          />
          <div className="grid gap-1.5 w-full">
            <FormField
              control={form.control}
              name="stockStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center" htmlFor="update-stock">
                    Stock Status
                  </FormLabel>
                  <Select
                    disabled={!updateFields.stockStatus || loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stock status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stockStatuses.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="update-seo"
            checked={updateFields.seo}
            onCheckedChange={(checked) => setUpdateFields({ ...updateFields, seo: checked === true })}
          />
          <div className="grid gap-1.5 w-full">
            <FormLabel className="flex items-center" htmlFor="update-seo">
              SEO Settings
            </FormLabel>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="focusKeyword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Focus Keyword</FormLabel>
                    <FormControl>
                      <Input disabled={!updateFields.seo || loading} placeholder="Enter focus keyword" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="update-featured"
            checked={updateFields.isFeatured}
            onCheckedChange={(checked) => setUpdateFields({ ...updateFields, isFeatured: checked === true })}
          />
          <div className="grid gap-1.5 w-full">
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel className="flex items-center" htmlFor="update-featured">
                      Featured Status
                    </FormLabel>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!updateFields.isFeatured || loading}
                      />
                    </FormControl>
                  </div>
                  <FormDescription>Mark selected products as featured</FormDescription>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="update-published"
            checked={updateFields.isPublished}
            onCheckedChange={(checked) => setUpdateFields({ ...updateFields, isPublished: checked === true })}
          />
          <div className="grid gap-1.5 w-full">
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel className="flex items-center" htmlFor="update-published">
                      Published Status
                    </FormLabel>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!updateFields.isPublished || loading}
                      />
                    </FormControl>
                  </div>
                  <FormDescription>Make selected products visible on the store</FormDescription>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="update-archived"
            checked={updateFields.isArchived}
            onCheckedChange={(checked) => setUpdateFields({ ...updateFields, isArchived: checked === true })}
          />
          <div className="grid gap-1.5 w-full">
            <FormField
              control={form.control}
              name="isArchived"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel className="flex items-center" htmlFor="update-archived">
                      Archived Status
                    </FormLabel>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!updateFields.isArchived || loading}
                      />
                    </FormControl>
                  </div>
                  <FormDescription>Archive selected products (they won't be visible on the store)</FormDescription>
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full mt-6">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Selected Products"
          )}
        </Button>
      </form>
    </Form>
  )
}
