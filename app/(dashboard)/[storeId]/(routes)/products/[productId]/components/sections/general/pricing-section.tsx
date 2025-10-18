

"use client"

import { useFormContext } from "react-hook-form"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import type { ProductFormValues } from "../../product-form-schema"

export const PricingSection = () => {
  const form = useFormContext<ProductFormValues>()
  const [salePriceFocused, setSalePriceFocused] = useState(false)
  const isSale = form.watch("isSale")

  const validateSalePrice = (salePrice: string, regularPrice: string) => {
    if (!salePrice || !regularPrice) return true

    const salePriceNum = Number.parseFloat(salePrice)
    const regularPriceNum = Number.parseFloat(regularPrice)

    return salePriceNum < regularPriceNum
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Pricing</CardTitle>
        <CardDescription>Set the pricing for your product.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="regularPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Regular Price <span className="text-red-500 font-bold">*</span>
              </FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <div className="bg-muted px-3 py-2 border border-r-0 rounded-l-md text-sm text-muted-foreground">
                    $
                  </div>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={form.formState.isSubmitting}
                    placeholder="96.96 (required)"
                    className="rounded-l-none"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.valueAsNumber
                      if (value < 0) {
                        e.target.value = "0"
                        field.onChange("0")
                      } else {
                        field.onChange(e)
                      }

                      const salePrice = form.getValues("salePrice")
                      if (salePrice) {
                        const isValid = validateSalePrice(salePrice, e.target.value)
                        if (!isValid) {
                        }
                      }
                    }}
                    onBlur={(e) => {
                      field.onBlur()

                      const salePrice = form.getValues("salePrice")
                      if (salePrice) {
                        const isValid = validateSalePrice(salePrice, e.target.value)
                        if (!isValid) {
                          form.setError("salePrice", {
                            type: "manual",
                            message: "Sale price must be less than regular price",
                          })
                        } else {
                          form.clearErrors("salePrice")
                        }
                      }
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isSale"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked)
                    // Clear sale price when unchecking isSale
                    if (!checked) {
                      form.setValue("salePrice", "")
                    }
                  }}
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="cursor-pointer">
                  This product is on sale
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  Check this box to enable sale pricing for this product
                </p>
              </div>
            </FormItem>
          )}
        />

        {isSale && (
          <FormField
            control={form.control}
            name="salePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Sale Price <span className="text-red-500 font-bold">*</span>
                </FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <div className="bg-muted px-3 py-2 border border-r-0 rounded-l-md text-sm text-muted-foreground">
                      $
                    </div>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      disabled={form.formState.isSubmitting}
                      placeholder="69.69 (required when on sale)"
                      className="rounded-l-none"
                      {...field}
                      value={salePriceFocused && field.value === "0" ? "" : field.value}
                      onFocus={() => {
                        setSalePriceFocused(true)
                        if (field.value === "0") {
                          field.onChange("")
                        }
                      }}
                      onChange={(e) => {
                        const value = e.target.valueAsNumber
                        if (value < 0) {
                          e.target.value = "0"
                          field.onChange("0")
                        } else {
                          field.onChange(e)
                        }
                      }}
                      onBlur={(e) => {
                        setSalePriceFocused(false)
                        field.onBlur()
                        const regularPrice = form.getValues("regularPrice")
                        if (e.target.value && regularPrice) {
                          const isValid = validateSalePrice(e.target.value, regularPrice)
                          if (!isValid) {
                            form.setError("salePrice", {
                              type: "manual",
                              message: "Sale price must be less than regular price",
                            })
                          } else {
                            form.clearErrors("salePrice")
                          }
                        }
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  )
}
