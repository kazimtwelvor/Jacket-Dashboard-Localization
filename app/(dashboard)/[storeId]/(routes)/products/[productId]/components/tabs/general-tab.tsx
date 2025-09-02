"use client"

import type React from "react"

import type { UseFormReturn } from "react-hook-form"
import { Package2, ImageIcon, ClipboardList, DollarSign, Tag, Ruler, Palette, Link2, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { ProductFormValues } from "../product-form-schema"
import { InventorySection } from "../sections/general/inventory-section"
import { ImagesSection } from "../sections/general/images-section"
import { BasicInfoSection } from "../sections/general/basic-info-section"
import { PricingSection } from "../sections/general/pricing-section"
import { CategoriesAttributesSection } from "../sections/variations/categories-attributes-section"
import { SizeSelectionSection } from "../sections/variations/size-selection-section"
import { ColorVariationsSection } from "../sections/variations/color-variations-section"
import { ColorLinksSection } from "../sections/variations/color-links-section"
import { DescriptionSection } from "../sections/general/description-section"
import { ReviewsSection } from "../sections/general/reviews-section"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { Size, Color, Category } from "../../../types"

interface GeneralTabProps {
  form: UseFormReturn<ProductFormValues>
  isUploading: boolean
  getFormattedSpecifications: () => string
  sizes: Size[]
  colors: Color[]
  categories?: {
    genderCategories: Category[]
    materialCategories: Category[]
    styleCategories: Category[]
  }
  storeId?: string
  currentProductId?: string
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  form,
  isUploading,
  getFormattedSpecifications,
  sizes,
  colors,
  categories,
  storeId,
  currentProductId,
}) => {
  // Calculate completion percentage for variations sections
  const getCategoriesCompletion = () => {
    const gender = form.watch("categories.gender")
    const material = form.watch("categories.material") || []
    const style = form.watch("categories.style") || []

    let completed = 0
    const total = 3 // Required fields: gender, material, style

    if (gender) completed++
    if (material.length > 0) completed++
    if (style.length > 0) completed++

    return Math.round((completed / total) * 100)
  }

  const getSizesCompletion = () => {
    const selectedSizes = form.watch("categories.sizes") || []
    return selectedSizes.length > 0 ? 100 : 0
  }

  const getColorsCompletion = () => {
    const colors = form.watch("categories.variationColors") || []
    return colors.length > 0 ? 100 : 0
  }

  const categorizedCategories = categories || {
    genderCategories: [],
    materialCategories: [],
    styleCategories: [],
  }

  return (
    <div className="space-y-8">
      {/* Step 1: Pricing and Inventory */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="overflow-hidden border-2 border-primary/10 shadow-md">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Package2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Step 1: Inventory</CardTitle>
                <CardDescription>Manage stock and SKU</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <InventorySection 
              form={form} 
              storeId={storeId || ""}
              currentProductId={currentProductId}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-2 border-primary/10 shadow-md">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Step 2: Pricing</CardTitle>
                <CardDescription>Set your product pricing</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <PricingSection form={form} />
          </CardContent>
        </Card>
      </div>

      {/* Step 2: Product Images */}
      <Card className="overflow-hidden border-2 border-primary/10 shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Step 3: Product Images</CardTitle>
              <CardDescription>Upload high-quality images of your product</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <ImagesSection isUploading={isUploading} />
        </CardContent>
      </Card>

      {/* Step 3: Basic Information */}
      <Card className="overflow-hidden border-2 border-primary/10 shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Step 4: Basic Information</CardTitle>
              <CardDescription>Enter product details and specifications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <BasicInfoSection
            form={form}
            getFormattedSpecifications={getFormattedSpecifications}
            materialCategories={categorizedCategories.materialCategories}
            colors={colors}
            isUploading={isUploading}
          />
        </CardContent>
      </Card>

      {/* Step 5: Product Variations - Categories & Attributes */}
      <Card className="overflow-hidden border-2 border-primary/10 shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Step 5: Categories & Attributes</CardTitle>
              <CardDescription>Assign categories and attributes to your product</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Categories & Attributes</h3>
            </div>
            <Badge variant={getCategoriesCompletion() === 100 ? "success" : "outline"}>
              {getCategoriesCompletion()}% Complete
            </Badge>
          </div>
          <Progress value={getCategoriesCompletion()} className="h-2 mb-6" />
          <CategoriesAttributesSection
            form={form}
            categories={
              categories
                ? {
                    genderCategories: categories.genderCategories || [],
                    materialCategories: categories.materialCategories || [],
                    styleCategories: categories.styleCategories || [],
                  }
                : undefined
            }
          />
        </CardContent>
      </Card>

      {/* Step 6: Product Variations - Size Selection */}
      <Card className="overflow-hidden border-2 border-primary/10 shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Ruler className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Step 6: Size Selection</CardTitle>
              <CardDescription>Select available sizes for your product</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Size Selection</h3>
            </div>
            <Badge variant={getSizesCompletion() === 100 ? "success" : "outline"}>
              {getSizesCompletion()}% Complete
            </Badge>
          </div>
          <Progress value={getSizesCompletion()} className="h-2 mb-6" />
          <SizeSelectionSection form={form} sizes={sizes} />
        </CardContent>
      </Card>

      {/* Step 7: Product Variations - Color Variations */}
      <Card className="overflow-hidden border-2 border-primary/10 shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Step 7: Color Variations</CardTitle>
              <CardDescription>Select available colors for your product</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Color Variations</h3>
            </div>
            <Badge variant={getColorsCompletion() === 100 ? "success" : "outline"}>
              {getColorsCompletion()}% Complete
            </Badge>
          </div>
          <Progress value={getColorsCompletion()} className="h-2 mb-6" />
          <ColorVariationsSection form={form} colors={colors} />
        </CardContent>
      </Card>

      {/* Step 8: Product Variations - Color Links */}
      <Card className="overflow-hidden border-2 border-primary/10 shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Step 8: Color Variation Links</CardTitle>
              <CardDescription>Add links to other color variations of this product</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <ColorLinksSection form={form} storeId={storeId} currentProductId={currentProductId} />
        </CardContent>
      </Card>

      {/* Step 9: Product Description - Moved to the bottom */}
      <DescriptionSection form={form} />
      
      {/* Step 10: Reviews Generator */}
      <Card className="overflow-hidden border-2 border-primary/10 shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Step 10: Reviews Generator</CardTitle>
              <CardDescription>Generate AI-powered reviews for your product</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <ReviewsSection />
        </CardContent>
      </Card>
    </div>
  )
}
