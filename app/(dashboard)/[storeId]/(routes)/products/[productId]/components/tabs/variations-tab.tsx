"use client"

import type React from "react"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Palette, Ruler, Tag, Link2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CategoriesAttributesSection } from "../sections/variations/categories-attributes-section"
import { SizeSelectionSection } from "../sections/variations/size-selection-section"
import { ColorVariationsSection } from "../sections/variations/color-variations-section"
import { ColorLinksSection } from "../sections/variations/color-links-section"
import type { UseFormReturn } from "react-hook-form"
import type { ProductFormValues } from "../product-form-schema"
import type { Size, Color } from "../../../types"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { Category } from "@prisma/client"

interface VariationsTabProps {
  form: UseFormReturn<ProductFormValues>
  sizes: Size[]
  colors: Color[]
  categories?: {
    genderCategories: Category[]
    materialCategories: Category[]
    styleCategories: Category[]
  }
}

export const VariationsTab: React.FC<VariationsTabProps> = ({ form, sizes, colors, categories }) => {
  const [activeSubTab, setActiveSubTab] = useState("categories")

  const getCategoriesCompletion = () => {
    const gender = form.watch("categories.gender")
    const material = form.watch("categories.material") || []
    const style = form.watch("categories.style") || []
    const tags = form.watch("tags") || []

    let completed = 0
    const total = 3 

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

  const getLinksCompletion = () => {
    const colors = form.watch("categories.variationColors") || []
    const links = form.watch("categories.colorVariationLinks") || {}

    if (colors.length === 0) return 0
    if (colors.length === 1) return 100 

    const linkCount = Object.keys(links).filter((key) => links[key]).length
    return Math.round((linkCount / colors.length) * 100)
  }
  const getOverallCompletion = () => {
    const categoriesWeight = 0.4
    const sizesWeight = 0.3
    const colorsWeight = 0.3

    return Math.round(
      getCategoriesCompletion() * categoriesWeight +
        getSizesCompletion() * sizesWeight +
        getColorsCompletion() * colorsWeight,
    )
  }

  const hasErrors = (section: string) => {
    const errors = form.formState.errors

    switch (section) {
      case "categories":
        return !!errors.categories?.gender || !!errors.categories?.material || !!errors.categories?.style
      case "sizes":
        return !!errors.categories?.sizes
      case "colors":
        return !!errors.specifications?.color || !!errors.categories?.variationColors
      default:
        return false
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold">Product Variations Setup</h3>
              <p className="text-sm text-muted-foreground">Configure categories, sizes, and colors for your product</p>
            </div>
            <Badge variant={getOverallCompletion() === 100 ? "outline" : "outline"} className="px-3 py-1">
              {getOverallCompletion()}% Complete
            </Badge>
          </div>
          <Progress value={getOverallCompletion()} className="h-2" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <ProgressCard
              title="Categories"
              icon={<Tag className="h-4 w-4" />}
              progress={getCategoriesCompletion()}
              hasError={hasErrors("categories")}
              onClick={() => setActiveSubTab("categories")}
            />
            <ProgressCard
              title="Sizes"
              icon={<Ruler className="h-4 w-4" />}
              progress={getSizesCompletion()}
              hasError={hasErrors("sizes")}
              onClick={() => setActiveSubTab("sizes")}
            />
            <ProgressCard
              title="Colors"
              icon={<Palette className="h-4 w-4" />}
              progress={getColorsCompletion()}
              hasError={hasErrors("colors")}
              onClick={() => setActiveSubTab("colors")}
            />
            <ProgressCard
              title="Color Links"
              icon={<Link2 className="h-4 w-4" />}
              progress={getLinksCompletion()}
              onClick={() => setActiveSubTab("links")}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="w-full grid grid-cols-4 mb-6">
          <TabsTrigger value="categories" className="relative">
            <span className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="hidden sm:inline">Categories</span>
            </span>
            {hasErrors("categories") && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sizes" className="relative">
            <span className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              <span className="hidden sm:inline">Sizes</span>
            </span>
            {hasErrors("sizes") && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>}
          </TabsTrigger>
          <TabsTrigger value="colors" className="relative">
            <span className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Colors</span>
            </span>
            {hasErrors("colors") && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
            )}
          </TabsTrigger>
          <TabsTrigger value="links">
            <span className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">Color Links</span>
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4 mt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Categories & Attributes</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Info className="h-4 w-4" />
                      <span className="sr-only">Info</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Assign categories and attributes to help customers find your product. Gender, material, and style
                      are required.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Badge variant={getCategoriesCompletion() === 100 ? "outline" : "outline"}>
              {getCategoriesCompletion()}% Complete
            </Badge>
          </div>
          <CategoriesAttributesSection form={form} categories={categories} />
        </TabsContent>

        <TabsContent value="sizes" className="space-y-4 mt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Size Selection</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Info className="h-4 w-4" />
                      <span className="sr-only">Info</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Select all available sizes for this product. At least one size is required.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Badge variant={getSizesCompletion() === 100 ? "outline" : "outline"}>
              {getSizesCompletion()}% Complete
            </Badge>
          </div>
          <SizeSelectionSection form={form} sizes={sizes} />
        </TabsContent>

        <TabsContent value="colors" className="space-y-4 mt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Color Variations</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Info className="h-4 w-4" />
                      <span className="sr-only">Info</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Select all colors available for this product. At least one color is required.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Badge variant={getColorsCompletion() === 100 ? "outline" : "outline"}>
              {getColorsCompletion()}% Complete
            </Badge>
          </div>
          <Card>
            <CardContent className="pt-6">
              <ColorVariationsSection form={form} colors={colors} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-4 mt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Color Variation Links</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Info className="h-4 w-4" />
                      <span className="sr-only">Info</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Add links to other color variations of this product for cross-selling and navigation.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Badge variant={getLinksCompletion() === 100 ? "outline" : "outline"}>
              {getLinksCompletion()}% Complete
            </Badge>
          </div>
          <Card>
            <CardContent className="pt-6">
              <ColorLinksSection form={form} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ProgressCardProps {
  title: string
  icon: React.ReactNode
  progress: number
  hasError?: boolean
  onClick?: () => void
}

const ProgressCard: React.FC<ProgressCardProps> = ({ title, icon, progress, hasError = false, onClick }) => {
  return (
    <Card
      className={`hover:shadow-md transition-all cursor-pointer ${
        hasError ? "border-destructive/50" : progress === 100 ? "border-green-500/50" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1 sm:gap-2">
            {icon}
            <span className="font-medium text-xs sm:text-sm">{title}</span>
          </div>
          {hasError && <span className="h-2 w-2 rounded-full bg-destructive"></span>}
        </div>
        <Progress value={progress} className="h-1.5" />
        <div className="mt-2 text-right">
          <span
            className={`text-xs font-medium ${
              progress === 100 ? "text-green-500" : hasError ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {progress}%
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
