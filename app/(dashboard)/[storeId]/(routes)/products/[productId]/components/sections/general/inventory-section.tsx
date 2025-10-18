"use client"

import type React from "react"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useSkuPrefix } from "@/hooks/use-sku-prefix"
import { useState } from "react"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RelatedProductsSelector } from "../../related-products-selector"
import { CountryFormSelector } from "@/components/ui/country-selector"

interface InventorySectionProps {
  form: any
  storeId: string
  isCreating?: boolean
  currentProductId?: string
}

export const InventorySection: React.FC<InventorySectionProps> = ({ form, storeId, isCreating = false, currentProductId }) => {
  const { skuPrefix, isLoading } = useSkuPrefix(storeId)
  const [isCustomSku, setIsCustomSku] = useState(!isCreating && !!form.getValues("sku"))

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <CardTitle>Inventory</CardTitle>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>SKU <span className="text-red-500">*</span></FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        You can enter a custom SKU or leave it blank to auto-generate one based on your store's prefix (
                        {skuPrefix || "SKU"}).
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormControl>
                <div className="relative">
                  <Input
                    disabled={form.formState.isSubmitting}
                    placeholder={isCreating ? `${skuPrefix}-XXXX (optional)` : ""}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      setIsCustomSku(!!e.target.value)
                    }}
                  />
                  {isCreating && !isCustomSku && (
                    <div className="absolute right-3 top-2.5 text-xs text-muted-foreground">Will auto-generate</div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                {isCustomSku
                  ? "Using custom SKU. Make sure it's unique across your store."
                  : `Leave blank to auto-generate based on your store's prefix (${skuPrefix || "SKU"}).`}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stockStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Stock Status
              </FormLabel>
              <Select
                disabled={form.formState.isSubmitting}
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
                  <SelectItem value="instock">In Stock</SelectItem>
                  <SelectItem value="outofstock">Out of Stock</SelectItem>
                  <SelectItem value="backorder">On Backorder</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="countryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country</FormLabel>
            <CountryFormSelector
              value={field.value || ""}
              onChange={field.onChange}
              disabled={form.formState.isSubmitting}
              placeholder="Select a country for this product"
            />
            <FormDescription>
              Select the country where this product is available.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Product Status
            </FormLabel>
            <Select
              disabled={form.formState.isSubmitting}
              onValueChange={(value) => {
                field.onChange(value)
                form.setValue("isPublished", value === "published")
              }}
              value={field.value}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select product status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="isFeatured"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Featured Product</FormLabel>
              <FormDescription>Mark this product as featured to highlight it on your store</FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="relatedProducts"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Related Products</FormLabel>
            <FormControl>
              <RelatedProductsSelector
                value={field.value || []}
                onChange={field.onChange}
                storeId={storeId}
                currentProductId={currentProductId}
                disabled={form.formState.isSubmitting}
              />
            </FormControl>
            <FormDescription>
              Select products that are related to this product. They will be shown as recommendations.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
