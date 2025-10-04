"use client"

import type React from "react"
import type { UseFormReturn } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ColorDisplay } from "@/components/ui/color-display"
import { useEffect } from "react"
import type { Color } from "../../../../types"
import type { ProductFormValues } from "../../product-form-schema"

interface ColorVariationsSectionProps {
  form: UseFormReturn<ProductFormValues>
  colors: Color[]
}

export const ColorVariationsSection: React.FC<ColorVariationsSectionProps> = ({ form, colors }) => {
  const colorSpecifications = form.watch("specifications.color") || []
  const colorVariations = form.watch("categories.variationColors") || []

  useEffect(() => {
    if (colorSpecifications && colorSpecifications.length > 0) {
      const currentColorVariations = form.getValues("categories.variationColors") || []

      const colorSpecsSet = new Set(colorSpecifications)
      const colorVariationsSet = new Set(currentColorVariations)

      let needsUpdate = false

      for (const color of colorSpecifications) {
        if (!colorVariationsSet.has(color)) {
          needsUpdate = true
          break
        }
      }

      if (needsUpdate) {
        form.setValue("categories.variationColors", [...colorSpecifications], {
          shouldValidate: true,
          shouldDirty: true,
        })
      }
    }
  }, [colorSpecifications, form])

  // Sync colorDetails with selected colors
  useEffect(() => {
    const currentColorDetails = form.getValues("colorDetails") || []
    
    // Get color objects for selected colors
    const selectedColorObjects = colors.filter(color => 
      colorVariations.includes(color.name)
    )
    
    // Check if colorDetails needs updating
    const needsUpdate = selectedColorObjects.length !== currentColorDetails.length ||
      selectedColorObjects.some(color => 
        !currentColorDetails.some((cd: any) => cd.id === color.id)
      )
    
    if (needsUpdate) {
      const updatedColorDetails = selectedColorObjects.map(color => ({
        id: color.id,
        name: color.name,
        value: color.value
      }))
      
      console.log('[ColorVariationsSection] Updating colorDetails:', {
        colorVariations,
        selectedColorObjects,
        updatedColorDetails
      })
      
      form.setValue("colorDetails", updatedColorDetails, {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
  }, [colorVariations, colors, form])

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="categories.variationColors"
        render={({ field }) => (
          <FormItem>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base font-medium">
                  Available Colors <span className="text-red-500">*</span>
                </FormLabel>
                <Badge variant="outline" className="font-normal">
                  Synced with Color Specifications
                </Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                {colors.map((color) => {
                  const fieldValue = Array.isArray(field.value) ? field.value : []
                  const checked = fieldValue.includes(color.name)

                  return (
                    <label
                      key={color.id}
                      className={`flex items-center p-3 rounded-md border cursor-pointer transition-colors hover:bg-primary/5 ${
                        checked ? "bg-primary/10 border-primary" : "border-gray-200"
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(isChecked) => {
                          const current = Array.isArray(field.value) ? field.value : []
                          const updated = isChecked
                            ? [...current, color.name]
                            : current.filter((value) => value !== color.name)

                          field.onChange(updated)

                          const currentColorSpecs = form.getValues("specifications.color") || []
                          const updatedColorSpecs = isChecked
                            ? [...currentColorSpecs, color.name]
                            : currentColorSpecs.filter((value: string) => value !== color.name)

                          form.setValue("specifications.color", updatedColorSpecs, {
                            shouldValidate: true,
                            shouldDirty: true,
                          })

                          const currentColorDetails = form.getValues("colorDetails") || []
                          const updatedColorDetails = isChecked
                            ? [...currentColorDetails, { id: color.id, name: color.name, value: color.value }]
                            : currentColorDetails.filter((c: any) => c.id !== color.id)

                          form.setValue("colorDetails", updatedColorDetails, {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }}
                        className="data-[state=checked]:bg-primary data-[state=checked]:text-white"
                      />
                      <div className="ml-2 flex items-center gap-2">
                        <ColorDisplay 
                          color1={color.value} 
                          color2={color.value2}
                          size="sm"
                        />
                        <span>{color.name}</span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
