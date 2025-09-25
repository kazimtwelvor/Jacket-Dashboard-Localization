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
import { useFormContext } from "react-hook-form"
import { useParams } from "next/navigation"
import { ColorDisplay } from "@/components/ui/color-display"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

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

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
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
          setSlugValue(newSlug || "")
          
          if (newSlug) {
            checkSlugUniqueness(newSlug);
          }
        }
      }
    })

    const initialSlug = form.getValues("slug") || ""
    setSlugValue(initialSlug)
    
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

  const checkSlugUniqueness = async (slug: string) => {
    if (!slug || slug.trim() === "") {
      setIsSlugUnique(null);
      return;
    }
    
    try {
      setIsCheckingSlug(true);
      const storeId = params?.storeId;
      const productId = params?.productId !== "new" ? params?.productId : null;
      
      const response = await fetch(
        `/api/stores/${storeId}/check-slug?slug=${encodeURIComponent(slug)}${productId ? `&productId=${productId}` : ""}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to check slug uniqueness");
      }
      
      const data = await response.json();
      setIsSlugUnique(data.isUnique);
    } catch (error) {
      setIsSlugUnique(null);
    } finally {
      setIsCheckingSlug(false);
    }
  };

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
    
    if (slugCheckTimerRef.current) {
      clearTimeout(slugCheckTimerRef.current);
    }
    
    slugCheckTimerRef.current = window.setTimeout(() => {
      checkSlugUniqueness(formattedSlug);
    }, 500); 
  }

  const safeSpecOptions = {
    ...specificationOptions,
    externalMaterial: [],
    color: [],
  }

  const selectedMaterialCategories = form.watch("categories.material") || []

  const selectedColorVariations = form.watch("categories.variationColors") || []

  useEffect(() => {
    if (selectedMaterialCategories && selectedMaterialCategories.length > 0) {
      const currentExternalMaterial = form.getValues("specifications.externalMaterial") || []

      const externalMaterialSet = new Set(currentExternalMaterial)

      let needsUpdate = false

      for (const material of selectedMaterialCategories) {
        if (!externalMaterialSet.has(material)) {
          needsUpdate = true
          break
        }
      }

      if (needsUpdate) {
        form.setValue("specifications.externalMaterial", [...selectedMaterialCategories], {
          shouldValidate: true,
          shouldDirty: true,
        })
      }
    }
  }, [selectedMaterialCategories, form])

  useEffect(() => {
    if (selectedColorVariations && selectedColorVariations.length > 0) {
      const currentColorSpecs = form.getValues("specifications.color") || []

      const colorSpecsSet = new Set(currentColorSpecs)

      let needsUpdate = false

      for (const color of selectedColorVariations) {
        if (!colorSpecsSet.has(color)) {
          needsUpdate = true
          break
        }
      }

      if (needsUpdate) {
        form.setValue("specifications.color", [...selectedColorVariations], {
          shouldValidate: true,
          shouldDirty: true,
        })
      }
    }
  }, [selectedColorVariations, form])

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} disabled={isUploading} />
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

      <div className="rounded-lg border-2 border-primary/10 p-6 bg-gradient-to-r from-background to-primary/5 dark:from-background dark:to-primary/10">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-bold text-foreground">
            Product Specifications <span className="text-red-500">*</span>
          </h3>
          <Badge variant="outline" className="font-normal bg-background text-foreground border-border">
            Step 2
          </Badge>
        </div>

        <FormField
          control={form.control}
          name="specifications"
          render={() => (
            <FormItem>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-lg border p-6 max-h-[600px] overflow-y-auto bg-card">
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
                                const current = Array.isArray(fieldValue) ? fieldValue : []
                                const updated = isChecked
                                  ? [...current, category.name]
                                  : current.filter((value: string) => value !== category.name)

                                form.setValue(fieldPath, updated, {
                                  shouldDirty: true,
                                })

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

                  {/* <div className="mb-6">
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
                                form.setValue(fieldPath, [color.name], {
                                  shouldDirty: true,
                                })

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
                  </div> */}

                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-3 flex items-center">
                      Base Color
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Select the primary color for this product. This will be stored as the base color and is independent of color specifications.
                    </p>
                    
                    <FormField
                      control={form.control}
                      name="baseColor"
                      render={({ field }) => (
                        <FormItem>
                          <RadioGroup
                            value={field.value?.name || ""}
                            onValueChange={(colorName) => {
                              const color = colors.find(c => c.name === colorName)
                              if (color) {
                                field.onChange({
                                  id: color.id,
                                  name: color.name,
                                  value: color.value
                                })
                              } else {
                                field.onChange(undefined)
                              }
                            }}
                            className="grid grid-cols-2 gap-3"
                          >
                            {colors.map((color) => (
                              <label
                                key={color.id}
                                className={`flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-colors hover:bg-primary/5 ${
                                  field.value?.name === color.name ? "bg-primary/10 border-primary" : "border-gray-200"
                                }`}
                              >
                                <RadioGroupItem value={color.name} className="mr-2" />
                                <div className="flex items-center gap-2">
                                  <ColorDisplay 
                                    color1={color.value} 
                                    color2={color.value2}
                                    size="sm"
                                  />
                                  <span className="text-sm">{color.name}</span>
                                </div>
                              </label>
                            ))}
                          </RadioGroup>
                          {field.value && (
                            <div className="flex justify-end mt-2">
                              <button
                                type="button"
                                onClick={() => field.onChange(undefined)}
                                className="text-xs text-muted-foreground hover:text-foreground underline"
                              >
                                Clear Base Color
                              </button>
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {safeSpecOptions &&
                    Object.entries(safeSpecOptions)
                      .filter(([category]) => category !== "externalMaterial" && category !== "color") 
                      .map(([category, options]) => (
                        <div key={category} className="mb-6">
                          <h4 className="text-sm font-medium mb-3 flex items-center">
                            {category.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            {(options as string[]).map((option) => {
                              const fieldPath = `specifications.${category}` as const

                              return (
                                <FormField
                                  key={option}
                                  control={form.control}
                                  name={fieldPath as any}
                                  render={({ field }) => {
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
                                            const current = Array.isArray(field.value) ? field.value : []
                                            const updated = isChecked
                                              ? [...current, option]
                                              : current.filter((value: string) => value !== option)

                                            form.setValue(fieldPath as any, updated, {
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
                  <div className="border rounded-md p-4 bg-card min-h-[600px] whitespace-pre-line text-foreground">
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
