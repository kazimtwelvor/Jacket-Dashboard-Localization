"use client"

import type React from "react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { type ProductFormValues, specificationOptions } from "../../product-form-schema"
import { useEffect, useState, useRef } from "react"
import type { Category, Color } from "../../../../types"
import { Card, CardContent } from "@/components/ui/card"
import { useFormContext, type Subscription } from "react-hook-form"
import { useParams } from "next/navigation"
import { ColorDisplay } from "@/components/ui/color-display"

interface BasicInfoSectionProps {
  getFormattedSpecifications: () => string
  materialCategories?: Category[]
  colors?: Color[]
  isUploading?: boolean
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  getFormattedSpecifications,
  materialCategories = [],
  colors = [],
  isUploading = false,
}) => {
  const form = useFormContext<ProductFormValues>()
  const [slugValue, setSlugValue] = useState("")
  const [isSlugUnique, setIsSlugUnique] = useState<boolean | null>(null)
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const slugCheckTimerRef = useRef<number | null>(null)
  const params = useParams()

  // Generate slug from name when name changes and slug is empty
  useEffect(() => {
    const subscription: Subscription = form.watch((value, { name }) => {
      if (name === "name") {
        const currentSlug = form.getValues("slug")
        if (!currentSlug) {
          const newSlug = value.name
            ?.toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
          form.setValue("slug", newSlug, { shouldValidate: true })
          form.setValue("seo.slug", newSlug, { shouldValidate: true })
          setSlugValue(newSlug)
          
          // Check uniqueness of the generated slug
          if (newSlug) {
            checkSlugUniqueness(newSlug);
          }
        }
      }
    })

    // Initialize slug value
    const initialSlug = form.getValues("slug") || ""
    setSlugValue(initialSlug)
    
    // Initial check if slug already exists
    if (initialSlug) {
      checkSlugUniqueness(initialSlug);
    }

    return () => {
      subscription.unsubscribe()
      if (slugCheckTimerRef.current) {
        clearTimeout(slugCheckTimerRef.current);
      }
    }
  }, [form])

  // Function to check if slug is unique
  const checkSlugUniqueness = async (slug: string) => {
    if (!slug || slug.trim() === "") {
      setIsSlugUnique(null);
      return;
    }
    
    try {
      setIsCheckingSlug(true);
      const storeId = params.storeId;
      const productId = params.productId !== "new" ? params.productId : null;
      
      // Use the dedicated check-slug endpoint
      const response = await fetch(
        `/api/stores/${storeId}/check-slug?slug=${encodeURIComponent(slug)}${productId ? `&productId=${productId}` : ""}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to check slug uniqueness");
      }
      
      const data = await response.json();
      setIsSlugUnique(data.isUnique);
    } catch (error) {
      console.error("Error checking slug uniqueness:", error);
      setIsSlugUnique(null);
    } finally {
      setIsCheckingSlug(false);
    }
  };

  // Handle slug input change with formatting
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const formattedSlug = value
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")

    setSlugValue(formattedSlug)
    form.setValue("slug", formattedSlug, { shouldValidate: true })
    form.setValue("seo.slug", formattedSlug, { shouldValidate: true })
    
    // Clear any existing timer
    if (slugCheckTimerRef.current) {
      clearTimeout(slugCheckTimerRef.current);
    }
    
    // Set a new timer to check after typing stops
    slugCheckTimerRef.current = window.setTimeout(() => {
      checkSlugUniqueness(formattedSlug);
    }, 500); // 500ms debounce
  }

  // Ensure specificationOptions is defined
  const safeSpecOptions = {
    ...specificationOptions,
    // Override externalMaterial with empty array as we'll use materialCategories instead
    externalMaterial: [],
    // Override color with empty array as we'll use colors from props instead
    color: [],
  }

  // Watch material categories to sync with external material specifications
  const selectedMaterialCategories = form.watch("categories.material") || []

  // Watch color variations to sync with color specifications
  const selectedColorVariations = form.watch("categories.variationColors") || []

  // Sync material categories with external material specifications
  useEffect(() => {
    if (selectedMaterialCategories && selectedMaterialCategories.length > 0) {
      const currentExternalMaterial = form.getValues("specifications.externalMaterial") || []

      // Check if the arrays are different
      const materialCategoriesSet = new Set(selectedMaterialCategories)
      const externalMaterialSet = new Set(currentExternalMaterial)

      let needsUpdate = false

      // Check if material categories has items not in external materials
      for (const material of selectedMaterialCategories) {
        if (!externalMaterialSet.has(material)) {
          needsUpdate = true
          break
        }
      }

      // If they're different, update external materials based on material categories
      if (needsUpdate) {
        console.log("Syncing external materials from material categories:", selectedMaterialCategories)
        form.setValue("specifications.externalMaterial", [...selectedMaterialCategories], {
          shouldValidate: true,
          shouldDirty: true,
        })
      }
    }
  }, [selectedMaterialCategories, form])

  // Sync color variations with color specifications
  useEffect(() => {
    if (selectedColorVariations && selectedColorVariations.length > 0) {
      const currentColorSpecs = form.getValues("specifications.color") || []

      // Check if the arrays are different
      const colorVariationsSet = new Set(selectedColorVariations)
      const colorSpecsSet = new Set(currentColorSpecs)

      let needsUpdate = false

      // Check if color variations has items not in color specs
      for (const color of selectedColorVariations) {
        if (!colorSpecsSet.has(color)) {
          needsUpdate = true
          break
        }
      }

      // If they're different, update color specs based on color variations
      if (needsUpdate) {
        console.log("Syncing color specifications from color variations:", selectedColorVariations)
        form.setValue("specifications.color", [...selectedColorVariations], {
          shouldValidate: true,
          shouldDirty: true,
        })
      }
    }
  }, [selectedColorVariations, form])

  return (
    <div className="space-y-8">
      {/* Product Name Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} disabled={isUploading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Add slug field */}
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    URL Slug
                    <span className="ml-1 text-xs text-muted-foreground">(used in product URL)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground mr-1">/products/</span>
                      <div className="relative flex-1">
                        <Input
                          placeholder="product-url-slug"
                          value={slugValue}
                          onChange={handleSlugChange}
                          className={`w-full ${isSlugUnique === false ? "border-red-500" : ""}`}
                          disabled={isUploading}
                        />
                        {isCheckingSlug && (
                          <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">
                            Checking...
                          </span>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  {isSlugUnique === false && (
                    <div className="text-red-500 text-sm mt-1">
                      This slug is already in use. Please choose a different one.
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Specifications Section */}
      <div className="rounded-lg border-2 border-primary/10 p-6 bg-gradient-to-r from-white to-primary/5">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-bold">
            Product Specifications <span className="text-red-500">*</span>
          </h3>
          <Badge variant="outline" className="font-normal">
            Step 2
          </Badge>
        </div>

        <FormField
          control={form.control}
          name="specifications"
          render={() => (
            <FormItem>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-lg border p-6 max-h-[600px] overflow-y-auto bg-white">
                  {/* External Material Section - Using Material Categories */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-3 flex items-center">
                      External Material
                      <Badge variant="outline" className="ml-2 font-normal">
                        Using Material Categories
                      </Badge>
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {materialCategories.map((category) => {
                        const fieldPath = "specifications.externalMaterial" as const
                        const fieldValue = form.getValues(fieldPath) || []
                        const checked = Array.isArray(fieldValue) && fieldValue.includes(category.name)

                        return (
                          <label
                            key={category.id}
                            className={`flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-colors hover:bg-primary/5 ${
                              checked ? "bg-primary/10 border-primary" : "border-gray-200"
                            }`}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(isChecked) => {
                                // Ensure we're working with an array
                                const current = Array.isArray(fieldValue) ? fieldValue : []
                                const updated = isChecked
                                  ? [...current, category.name]
                                  : current.filter((value: string) => value !== category.name)

                                // Update external material
                                form.setValue(fieldPath, updated, {
                                  shouldDirty: true,
                                })

                                // Also update material categories
                                const currentMaterialCategories = form.getValues("categories.material") || []
                                const updatedMaterialCategories = isChecked
                                  ? [...currentMaterialCategories, category.name]
                                  : currentMaterialCategories.filter((value: string) => value !== category.name)

                                form.setValue("categories.material", updatedMaterialCategories, {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                })
                              }}
                              className="data-[state=checked]:bg-primary data-[state=checked]:text-white"
                              disabled={isUploading}
                            />
                            <span className="text-sm">{category.name}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {/* Color Section - Using Color Attributes */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-3 flex items-center">
                      Color
                      <span className="text-red-500 ml-1">*</span>
                      <Badge variant="secondary" className="ml-2 font-normal">
                        Required
                      </Badge>
                      <Badge variant="outline" className="ml-2 font-normal">
                        Using Color Attributes
                      </Badge>
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {colors.map((color) => {
                        const fieldPath = "specifications.color" as const
                        const fieldValue = form.getValues(fieldPath) || []
                        const checked = Array.isArray(fieldValue) && fieldValue.includes(color.name)

                        return (
                          <label
                            key={color.id}
                            className={`flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-colors hover:bg-primary/5 ${
                              checked ? "bg-primary/10 border-primary" : "border-gray-200"
                            }`}
                          >
                            <input
                              type="radio"
                              checked={checked}
                              onChange={() => {
                                // Update color specifications
                                form.setValue(fieldPath, [color.name], {
                                  shouldDirty: true,
                                })

                                // Also update color variations
                                form.setValue("categories.variationColors", [color.name], {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                })
                              }}
                              className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                              disabled={isUploading}
                            />
                            <div className="flex items-center gap-2">
                              <ColorDisplay 
                                color1={color.value} 
                                color2={color.value2}
                                size="sm"
                              />
                              <span className="text-sm">{color.name}</span>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {/* Other Specification Options */}
                  {safeSpecOptions &&
                    Object.entries(safeSpecOptions)
                      .filter(([category]) => category !== "externalMaterial" && category !== "color") // Skip externalMaterial and color as we handled them separately
                      .map(([category, options]) => (
                        <div key={category} className="mb-6">
                          <h4 className="text-sm font-medium mb-3 flex items-center">
                            {category.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            {(options as string[]).map((option) => {
                              // Use type assertion to tell TypeScript this is a valid path
                              const fieldPath = `specifications.${category}` as const

                              return (
                                <FormField
                                  key={option}
                                  control={form.control}
                                  // @ts-ignore - We know this is a valid path even if TypeScript doesn't
                                  name={fieldPath}
                                  render={({ field }) => {
                                    // Ensure field.value is an array
                                    const fieldValue = Array.isArray(field.value) ? field.value : []

                                    const checked = fieldValue.includes(option)
                                    return (
                                      <label
                                        className={`flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-colors hover:bg-primary/5 ${
                                          checked ? "bg-primary/10 border-primary" : "border-gray-200"
                                        }`}
                                      >
                                        <Checkbox
                                          checked={checked}
                                          onCheckedChange={(isChecked) => {
                                            // Ensure we're working with an array
                                            const current = Array.isArray(field.value) ? field.value : []
                                            const updated = isChecked
                                              ? [...current, option]
                                              : current.filter((value: string) => value !== option)

                                            // @ts-ignore - We know this is a valid path
                                            form.setValue(fieldPath, updated, {
                                              shouldDirty: true,
                                            })
                                          }}
                                          className="data-[state=checked]:bg-primary data-[state=checked]:text-white"
                                          disabled={isUploading}
                                        />
                                        <span className="text-sm">{option}</span>
                                      </label>
                                    )
                                  }}
                                />
                              )
                            })}
                          </div>
                        </div>
                      ))}
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <FormLabel className="text-base">Specifications Preview</FormLabel>
                    <Badge variant="outline" className="font-normal">
                      Auto-formatted
                    </Badge>
                  </div>
                  <div className="border rounded-md p-4 bg-white min-h-[600px] whitespace-pre-line">
                    {getFormattedSpecifications()}
                  </div>
                </div>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
