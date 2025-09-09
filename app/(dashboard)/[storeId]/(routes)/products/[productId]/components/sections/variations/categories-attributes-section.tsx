"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, X, Search, CheckCircle2 } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import type { ProductFormValues } from "../../product-form-schema"
import type { Category } from "@prisma/client"

interface CategoriesAttributesSectionProps {
  form: UseFormReturn<ProductFormValues>
  categories?: {
    genderCategories: Category[]
    materialCategories: Category[]
    styleCategories: Category[]
  }
}

export const CategoriesAttributesSection: React.FC<CategoriesAttributesSectionProps> = ({ form, categories }) => {
  const [newTag, setNewTag] = useState("")
  const tags = form.watch("tags") || []
  const [styleSearch, setStyleSearch] = useState("")
  const [materialSearch, setMaterialSearch] = useState("")

  const defaultGenderOptions = ["Men", "Women", "Unisex", "Boys", "Girls"]
  const defaultMaterialOptions = [
    "Cotton",
    "Polyester",
    "Wool",
    "Silk",
    "Linen",
    "Denim",
    "Leather",
    "Cashmere",
    "Nylon",
    "Spandex",
  ]
  const defaultStyleOptions = [
    "Bomber",
    "Puffer",
    "Varsity",
    "Letterman",
    "Biker",
    "Aviator",
    "Quilted",
    "Blazer",
    "Cropped",
    "Long Coat",
    "Denim",
    "Leather",
    "Winter",
    "Casual",
    "Formal",
  ]

  const genderOptions = categories?.genderCategories?.length
    ? categories.genderCategories.map((cat) => cat.name)
    : defaultGenderOptions

  const materialOptions = categories?.materialCategories?.length
    ? categories.materialCategories.map((cat) => cat.name)
    : defaultMaterialOptions

  const styleOptions = categories?.styleCategories?.length
    ? categories.styleCategories.map((cat) => cat.name)
    : defaultStyleOptions

  useEffect(() => {
  }, [genderOptions, materialOptions, styleOptions])

  const filteredMaterials = materialOptions.filter((material) =>
    material.toLowerCase().includes(materialSearch.toLowerCase()),
  )

  const filteredStyles = styleOptions.filter((style) => style.toLowerCase().includes(styleSearch.toLowerCase()))

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()]
      form.setValue("tags", updatedTags)
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    const updatedTags = tags.filter((t) => t !== tag)
    form.setValue("tags", updatedTags)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const toggleMaterial = (material: string) => {
    const currentMaterials = form.watch("categories.material") || []
    const isSelected = currentMaterials.includes(material)

    const updatedMaterials = isSelected
      ? currentMaterials.filter((m) => m !== material)
      : [...currentMaterials, material]

    form.setValue("categories.material", updatedMaterials)
  }

  const toggleStyle = (style: string) => {
    const currentStyles = form.watch("categories.style") || []
    const isSelected = currentStyles.includes(style)

    const updatedStyles = isSelected ? currentStyles.filter((s) => s !== style) : [...currentStyles, style]

    form.setValue("categories.style", updatedStyles)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Gender <span className="text-red-500">*</span></Label>
              <p className="text-sm text-muted-foreground mb-3">Select the gender this product is designed for</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {genderOptions.map((gender) => {
                const isSelected = form.watch("categories.gender") === gender
                return (
                  <div
                    key={gender}
                    className={`
                      flex items-center p-3 rounded-md border cursor-pointer transition-all
                      ${isSelected ? "bg-primary/10 border-primary shadow-sm" : "hover:bg-muted/50 border-border"}
                    `}
                    onClick={() => form.setValue("categories.gender", gender)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Label htmlFor={`gender-${gender}`} className="cursor-pointer">
                        {gender}
                      </Label>
                      {isSelected ? (
                        <CheckCircle2 className="h-5 w-5 text-primary ml-2" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-muted-foreground/30 ml-2"></div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            {form.formState.errors.categories?.gender && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.categories.gender.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Material <span className="text-red-500">*</span></Label>
              <p className="text-sm text-muted-foreground mb-3">Select all materials used in this product</p>
            </div>

            <div className="relative w-full mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
                className="pl-8 w-full"
                value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)}
              />
              {materialSearch && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1.5 h-6 w-6"
                  onClick={() => setMaterialSearch("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => form.setValue("categories.material", [])}
              >
                Clear All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => form.setValue("categories.material", filteredMaterials)}
              >
                Select All
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredMaterials.map((material) => {
                const isSelected = (form.watch("categories.material") || []).includes(material)
                return (
                  <div
                    key={material}
                    className={`
                      flex items-center p-3 rounded-md border cursor-pointer transition-all
                      ${isSelected ? "bg-primary/10 border-primary shadow-sm" : "hover:bg-muted/50 border-border"}
                    `}
                    onClick={() => toggleMaterial(material)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Label htmlFor={`material-${material}`} className="cursor-pointer">
                        {material}
                      </Label>
                      <Checkbox id={`material-${material}`} checked={isSelected} className="pointer-events-none" />
                    </div>
                  </div>
                )
              })}

              {filteredMaterials.length === 0 && (
                <div className="col-span-full text-center py-4 text-muted-foreground">
                  No materials found matching "{materialSearch}"
                </div>
              )}
            </div>

            {(form.watch("categories.material") || []).length > 0 && (
              <div className="mt-2 text-sm text-muted-foreground">
                <Badge variant="outline">{(form.watch("categories.material") || []).length} materials selected</Badge>
              </div>
            )}

            {form.formState.errors.categories?.material && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.categories.material.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Style <span className="text-red-500">*</span></Label>
              <p className="text-sm text-muted-foreground mb-3">Select all styles that apply to this product</p>
            </div>

            <div className="relative w-full mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search styles..."
                className="pl-8 w-full"
                value={styleSearch}
                onChange={(e) => setStyleSearch(e.target.value)}
              />
              {styleSearch && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1.5 h-6 w-6"
                  onClick={() => setStyleSearch("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <Button type="button" variant="outline" size="sm" onClick={() => form.setValue("categories.style", [])}>
                Clear All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => form.setValue("categories.style", filteredStyles)}
              >
                Select All
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredStyles.map((style) => {
                const isSelected = (form.watch("categories.style") || []).includes(style)
                return (
                  <div
                    key={style}
                    className={`
                      flex items-center p-3 rounded-md border cursor-pointer transition-all
                      ${isSelected ? "bg-primary/10 border-primary shadow-sm" : "hover:bg-muted/50 border-border"}
                    `}
                    onClick={() => toggleStyle(style)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Label htmlFor={`style-${style}`} className="cursor-pointer truncate text-sm">
                        {style}
                      </Label>
                      <Checkbox id={`style-${style}`} checked={isSelected} className="pointer-events-none" />
                    </div>
                  </div>
                )
              })}

              {filteredStyles.length === 0 && (
                <div className="col-span-full text-center py-4 text-muted-foreground">
                  No styles found matching "{styleSearch}"
                </div>
              )}
            </div>

            {(form.watch("categories.style") || []).length > 0 && (
              <div className="mt-2 text-sm text-muted-foreground">
                <Badge variant="outline">{(form.watch("categories.style") || []).length} styles selected</Badge>
              </div>
            )}

            {form.formState.errors.categories?.style && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.categories.style.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Tags</Label>
              <p className="text-sm text-muted-foreground mb-3">Add tags to help customers find your product</p>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {tag} tag</span>
                  </button>
                </Badge>
              ))}
              {tags.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No tags added yet. Add some tags to improve discoverability.
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button type="button" onClick={addTag} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
