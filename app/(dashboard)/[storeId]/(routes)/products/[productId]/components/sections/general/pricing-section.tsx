

"use client"

import { useFormContext } from "react-hook-form"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { ProductFormValues } from "../../product-form-schema"

export const PricingSection = () => {
  const form = useFormContext<ProductFormValues>()
  const [salePriceFocused, setSalePriceFocused] = useState(false)

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
          name="salePrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sale Price</FormLabel>
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
                    placeholder="69.69 (optional)"
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
      </CardContent>
    </Card>
  )
}
