"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronDown, ChevronUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"

interface FilterSidebarProps {
  categories: { id: string; name: string }[]
  sizes: { id: string; name: string }[]
  colors: { id: string; name: string; value: string }[]
  open: boolean
  onClose: () => void
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ categories, sizes, colors, open, onClose }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get current filter values from URL
  const currentStatus = searchParams.get("status")?.split(",") || []
  const currentGender = searchParams.get("gender")?.split(",") || []
  const currentMaterial = searchParams.get("material")?.split(",") || []
  const currentStyle = searchParams.get("style")?.split(",") || []
  const currentSize = searchParams.get("size")?.split(",") || []
  const currentColor = searchParams.get("color")?.split(",") || []
  const currentMinPrice = searchParams.get("minPrice") || "0"
  const currentMaxPrice = searchParams.get("maxPrice") || "1000"

  // Local state for filter values
  const [statusFilters, setStatusFilters] = useState<string[]>(currentStatus)
  const [genderFilters, setGenderFilters] = useState<string[]>(currentGender)
  const [materialFilters, setMaterialFilters] = useState<string[]>(currentMaterial)
  const [styleFilters, setStyleFilters] = useState<string[]>(currentStyle)
  const [sizeFilters, setSizeFilters] = useState<string[]>(currentSize)
  const [colorFilters, setColorFilters] = useState<string[]>(currentColor)
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number.parseInt(currentMinPrice),
    Number.parseInt(currentMaxPrice),
  ])

  // Accordion state
  const [expandedSections, setExpandedSections] = useState({
    status: true,
    categories: true,
    sizes: true,
    colors: true,
    price: true,
  })

  // Update local state when URL params change
  useEffect(() => {
    setStatusFilters(currentStatus)
    setGenderFilters(currentGender)
    setMaterialFilters(currentMaterial)
    setStyleFilters(currentStyle)
    setSizeFilters(currentSize)
    setColorFilters(currentColor)
    setPriceRange([Number.parseInt(currentMinPrice || "0"), Number.parseInt(currentMaxPrice || "1000")])
  }, [
    currentStatus,
    currentGender,
    currentMaterial,
    currentStyle,
    currentSize,
    currentColor,
    currentMinPrice,
    currentMaxPrice,
  ])

  // Categorize categories by type
  const genderCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes("men") ||
      cat.name.toLowerCase().includes("women") ||
      cat.name.toLowerCase().includes("unisex") ||
      cat.name.toLowerCase().includes("kids"),
  )

  const materialCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes("cotton") ||
      cat.name.toLowerCase().includes("wool") ||
      cat.name.toLowerCase().includes("polyester") ||
      cat.name.toLowerCase().includes("leather") ||
      cat.name.toLowerCase().includes("denim") ||
      cat.name.toLowerCase().includes("silk"),
  )

  const styleCategories = categories.filter(
    (cat) => !genderCategories.includes(cat) && !materialCategories.includes(cat),
  )

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleStatusChange = (value: string) => {
    setStatusFilters((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  const handleGenderChange = (value: string) => {
    setGenderFilters((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  const handleMaterialChange = (value: string) => {
    setMaterialFilters((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  const handleStyleChange = (value: string) => {
    setStyleFilters((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  const handleSizeChange = (value: string) => {
    setSizeFilters((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  const handleColorChange = (value: string) => {
    setColorFilters((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  const handlePriceChange = (value: [number, number]) => {
    setPriceRange(value)
  }

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Update or remove status filter
    if (statusFilters.length > 0) {
      params.set("status", statusFilters.join(","))
    } else {
      params.delete("status")
    }

    // Update or remove gender filter
    if (genderFilters.length > 0) {
      params.set("gender", genderFilters.join(","))
    } else {
      params.delete("gender")
    }

    // Update or remove material filter
    if (materialFilters.length > 0) {
      params.set("material", materialFilters.join(","))
    } else {
      params.delete("material")
    }

    // Update or remove style filter
    if (styleFilters.length > 0) {
      params.set("style", styleFilters.join(","))
    } else {
      params.delete("style")
    }

    // Update or remove size filter
    if (sizeFilters.length > 0) {
      params.set("size", sizeFilters.join(","))
    } else {
      params.delete("size")
    }

    // Update or remove color filter
    if (colorFilters.length > 0) {
      params.set("color", colorFilters.join(","))
    } else {
      params.delete("color")
    }

    // Update or remove price range
    if (priceRange[0] > 0) {
      params.set("minPrice", priceRange[0].toString())
    } else {
      params.delete("minPrice")
    }

    if (priceRange[1] < 1000) {
      params.set("maxPrice", priceRange[1].toString())
    } else {
      params.delete("maxPrice")
    }

    // Reset to page 1 when filters change
    params.delete("page")

    const search = params.toString()
    const query = search ? `?${search}` : ""

    router.push(`${window.location.pathname}${query}`)
    onClose()
  }

  const resetFilters = () => {
    setStatusFilters([])
    setGenderFilters([])
    setMaterialFilters([])
    setStyleFilters([])
    setSizeFilters([])
    setColorFilters([])
    setPriceRange([0, 1000])
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[300px] sm:w-[400px] p-0">
        <SheetHeader className="p-4 pb-2">
          <SheetTitle className="text-lg font-bold">Filter Products</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] px-4">
          {/* Status Filter */}
          <div className="mb-4">
            <div
              className="flex items-center justify-between cursor-pointer py-2"
              onClick={() => toggleSection("status")}
            >
              <h3 className="text-sm font-medium">Status</h3>
              {expandedSections.status ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>

            {expandedSections.status && (
              <div className="space-y-2 ml-2 mt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status-published"
                    checked={statusFilters.includes("published")}
                    onCheckedChange={() => handleStatusChange("published")}
                  />
                  <Label htmlFor="status-published">Published</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status-draft"
                    checked={statusFilters.includes("draft")}
                    onCheckedChange={() => handleStatusChange("draft")}
                  />
                  <Label htmlFor="status-draft">Draft</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status-archived"
                    checked={statusFilters.includes("archived")}
                    onCheckedChange={() => handleStatusChange("archived")}
                  />
                  <Label htmlFor="status-archived">Archived</Label>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Categories Filter */}
          <div className="my-4">
            <div
              className="flex items-center justify-between cursor-pointer py-2"
              onClick={() => toggleSection("categories")}
            >
              <h3 className="text-sm font-medium">Categories</h3>
              {expandedSections.categories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>

            {expandedSections.categories && (
              <div className="space-y-4 ml-2 mt-1">
                {/* Gender Categories */}
                {genderCategories.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Gender</h4>
                    <div className="space-y-2">
                      {genderCategories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`gender-${category.id}`}
                            checked={genderFilters.includes(category.id)}
                            onCheckedChange={() => handleGenderChange(category.id)}
                          />
                          <Label htmlFor={`gender-${category.id}`}>{category.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Material Categories */}
                {materialCategories.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Material</h4>
                    <div className="space-y-2">
                      {materialCategories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`material-${category.id}`}
                            checked={materialFilters.includes(category.id)}
                            onCheckedChange={() => handleMaterialChange(category.id)}
                          />
                          <Label htmlFor={`material-${category.id}`}>{category.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Style Categories */}
                {styleCategories.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Style</h4>
                    <div className="space-y-2">
                      {styleCategories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`style-${category.id}`}
                            checked={styleFilters.includes(category.id)}
                            onCheckedChange={() => handleStyleChange(category.id)}
                          />
                          <Label htmlFor={`style-${category.id}`}>{category.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Sizes Filter */}
          <div className="my-4">
            <div
              className="flex items-center justify-between cursor-pointer py-2"
              onClick={() => toggleSection("sizes")}
            >
              <h3 className="text-sm font-medium">Sizes</h3>
              {expandedSections.sizes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>

            {expandedSections.sizes && (
              <div className="grid grid-cols-2 gap-2 ml-2 mt-1">
                {sizes.map((size) => (
                  <div key={size.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`size-${size.id}`}
                      checked={sizeFilters.includes(size.id)}
                      onCheckedChange={() => handleSizeChange(size.id)}
                    />
                    <Label htmlFor={`size-${size.id}`}>{size.name}</Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Colors Filter */}
          <div className="my-4">
            <div
              className="flex items-center justify-between cursor-pointer py-2"
              onClick={() => toggleSection("colors")}
            >
              <h3 className="text-sm font-medium">Colors</h3>
              {expandedSections.colors ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>

            {expandedSections.colors && (
              <div className="grid grid-cols-2 gap-2 ml-2 mt-1">
                {colors.map((color) => (
                  <div key={color.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`color-${color.id}`}
                      checked={colorFilters.includes(color.id)}
                      onCheckedChange={() => handleColorChange(color.id)}
                    />
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: color.value }} />
                      <Label htmlFor={`color-${color.id}`}>{color.name}</Label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Price Range Filter */}
          <div className="my-4">
            <div
              className="flex items-center justify-between cursor-pointer py-2"
              onClick={() => toggleSection("price")}
            >
              <h3 className="text-sm font-medium">Price Range</h3>
              {expandedSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>

            {expandedSections.price && (
              <div className="space-y-4 ml-2 mt-1">
                <div className="flex justify-between">
                  <span className="text-sm">${priceRange[0]}</span>
                  <span className="text-sm">${priceRange[1]}</span>
                </div>
                <Slider
                  defaultValue={priceRange}
                  min={0}
                  max={1000}
                  step={10}
                  value={priceRange}
                  onValueChange={handlePriceChange}
                  className="my-4"
                />
              </div>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="p-4 border-t">
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={resetFilters}>
              Reset
            </Button>
            <Button onClick={applyFilters}>Apply Filters</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
