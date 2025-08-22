"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Filter, X, Check, Tag, ShoppingBag, Calendar } from "lucide-react"
import type { CategoryColumn } from "../types"

interface CategoryFiltersProps {
  isOpen: boolean
  onClose: () => void
  data: CategoryColumn[]
  onApply: (filteredData: CategoryColumn[]) => void
}

export const CategoryFilters = ({ isOpen, onClose, data, onApply }: CategoryFiltersProps) => {
  const [productStatus, setProductStatus] = useState<string>("all")
  const [minProducts, setMinProducts] = useState<string>("")
  const [maxProducts, setMaxProducts] = useState<string>("")
  const [showActive, setShowActive] = useState<boolean>(true)
  const [showInactive, setShowInactive] = useState<boolean>(true)
  const [hasBillboard, setHasBillboard] = useState<boolean | null>(null)
  const [hasImage, setHasImage] = useState<boolean | null>(null)
  const [isBest, setIsBest] = useState<boolean | null>(null)
  const [dateRange, setDateRange] = useState<[number, number]>([0, 100])

  // Calculate max product count for slider
  const maxProductCount = Math.max(...data.map((category) => category.productCount), 10)

  // Calculate date range
  const dates = data.map((category) => new Date(category.createdAt).getTime())
  const minDate = Math.min(...dates)
  const maxDate = Math.max(...dates)

  // Count how many filters are applied
  const getAppliedFiltersCount = () => {
    let count = 0
    if (productStatus !== "all") count++
    if (minProducts) count++
    if (maxProducts) count++
    if (!showActive || !showInactive) count++
    if (hasBillboard !== null) count++
    if (hasImage !== null) count++
    if (isBest !== null) count++
    if (dateRange[0] > 0 || dateRange[1] < 100) count++
    return count
  }

  const appliedFiltersCount = getAppliedFiltersCount()

  const handleApply = () => {
    let filtered = [...data]

    // Filter by product status
    if (productStatus === "with-products") {
      filtered = filtered.filter((category) => category.productCount > 0)
    } else if (productStatus === "without-products") {
      filtered = filtered.filter((category) => category.productCount === 0)
    }

    // Filter by product count range
    if (minProducts) {
      filtered = filtered.filter((category) => category.productCount >= Number.parseInt(minProducts))
    }

    if (maxProducts) {
      filtered = filtered.filter((category) => category.productCount <= Number.parseInt(maxProducts))
    }

    // Filter by active status
    if (showActive && !showInactive) {
      filtered = filtered.filter((category) => category.isActive !== false)
    } else if (!showActive && showInactive) {
      filtered = filtered.filter((category) => category.isActive === false)
    } else if (!showActive && !showInactive) {
      filtered = []
    }

    // Filter by billboard
    if (hasBillboard === true) {
      filtered = filtered.filter((category) => category.billboardLabel && category.billboardLabel.length > 0)
    } else if (hasBillboard === false) {
      filtered = filtered.filter((category) => !category.billboardLabel || category.billboardLabel.length === 0)
    }

    // Filter by image
    if (hasImage === true) {
      filtered = filtered.filter((category) => category.imageUrl && category.imageUrl.length > 0)
    } else if (hasImage === false) {
      filtered = filtered.filter((category) => !category.imageUrl || category.imageUrl.length === 0)
    }

    // Filter by isBest
    if (isBest === true) {
      filtered = filtered.filter((category) => category.isBest === true)
    } else if (isBest === false) {
      filtered = filtered.filter((category) => category.isBest !== true)
    }

    // Filter by date range
    if (dateRange[0] > 0 || dateRange[1] < 100) {
      const rangeStart = minDate + (maxDate - minDate) * (dateRange[0] / 100)
      const rangeEnd = minDate + (maxDate - minDate) * (dateRange[1] / 100)

      filtered = filtered.filter((category) => {
        const categoryDate = new Date(category.createdAt).getTime()
        return categoryDate >= rangeStart && categoryDate <= rangeEnd
      })
    }

    onApply(filtered)
  }

  const handleReset = () => {
    setProductStatus("all")
    setMinProducts("")
    setMaxProducts("")
    setShowActive(true)
    setShowInactive(true)
    setHasBillboard(null)
    setHasImage(null)
    setIsBest(null)
    setDateRange([0, 100])
    onApply(data)
  }

  // Format date for display
  const formatDate = (percent: number) => {
    const timestamp = minDate + (maxDate - minDate) * (percent / 100)
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Categories
            {appliedFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {appliedFiltersCount} active
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>Narrow down categories based on specific criteria</SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Product Status
              </Label>
              {productStatus !== "all" && (
                <Button variant="ghost" size="sm" onClick={() => setProductStatus("all")} className="h-6 px-2">
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            <Select value={productStatus} onValueChange={setProductStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select product status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="with-products">With Products</SelectItem>
                <SelectItem value="without-products">Without Products</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Product Count Range
              </Label>
              {(minProducts || maxProducts) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMinProducts("")
                    setMaxProducts("")
                  }}
                  className="h-6 px-2"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Min</Label>
                <Input
                  type="number"
                  value={minProducts}
                  onChange={(e) => setMinProducts(e.target.value)}
                  placeholder="0"
                  min="0"
                  max={maxProductCount}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Max</Label>
                <Input
                  type="number"
                  value={maxProducts}
                  onChange={(e) => setMaxProducts(e.target.value)}
                  placeholder={maxProductCount.toString()}
                  min="0"
                  max={maxProductCount}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Category Status
              </Label>
              {(!showActive || !showInactive) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowActive(true)
                    setShowInactive(true)
                  }}
                  className="h-6 px-2"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={showActive}
                  onCheckedChange={(checked) => setShowActive(checked as boolean)}
                />
                <label
                  htmlFor="active"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Show Active Categories
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inactive"
                  checked={showInactive}
                  onCheckedChange={(checked) => setShowInactive(checked as boolean)}
                />
                <label
                  htmlFor="inactive"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Show Inactive Categories
                </label>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Billboard
              </Label>
              {hasBillboard !== null && (
                <Button variant="ghost" size="sm" onClick={() => setHasBillboard(null)} className="h-6 px-2">
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={hasBillboard === true ? "default" : "outline"}
                size="sm"
                onClick={() => setHasBillboard(hasBillboard === true ? null : true)}
                className="flex-1"
              >
                {hasBillboard === true && <Check className="h-4 w-4 mr-2" />}
                Has Billboard
              </Button>
              <Button
                variant={hasBillboard === false ? "default" : "outline"}
                size="sm"
                onClick={() => setHasBillboard(hasBillboard === false ? null : false)}
                className="flex-1"
              >
                {hasBillboard === false && <Check className="h-4 w-4 mr-2" />}
                No Billboard
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Category Image
              </Label>
              {hasImage !== null && (
                <Button variant="ghost" size="sm" onClick={() => setHasImage(null)} className="h-6 px-2">
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={hasImage === true ? "default" : "outline"}
                size="sm"
                onClick={() => setHasImage(hasImage === true ? null : true)}
                className="flex-1"
              >
                {hasImage === true && <Check className="h-4 w-4 mr-2" />}
                Has Image
              </Button>
              <Button
                variant={hasImage === false ? "default" : "outline"}
                size="sm"
                onClick={() => setHasImage(hasImage === false ? null : false)}
                className="flex-1"
              >
                {hasImage === false && <Check className="h-4 w-4 mr-2" />}
                No Image
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Best Category
              </Label>
              {isBest !== null && (
                <Button variant="ghost" size="sm" onClick={() => setIsBest(null)} className="h-6 px-2">
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={isBest === true ? "default" : "outline"}
                size="sm"
                onClick={() => setIsBest(isBest === true ? null : true)}
                className="flex-1"
              >
                {isBest === true && <Check className="h-4 w-4 mr-2" />}
                Best Only
              </Button>
              <Button
                variant={isBest === false ? "default" : "outline"}
                size="sm"
                onClick={() => setIsBest(isBest === false ? null : false)}
                className="flex-1"
              >
                {isBest === false && <Check className="h-4 w-4 mr-2" />}
                Non-Best
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Created
              </Label>
              {(dateRange[0] > 0 || dateRange[1] < 100) && (
                <Button variant="ghost" size="sm" onClick={() => setDateRange([0, 100])} className="h-6 px-2">
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            <Slider
              defaultValue={[0, 100]}
              value={dateRange}
              onValueChange={(value) => setDateRange(value as [number, number])}
              max={100}
              step={1}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatDate(dateRange[0])}</span>
              <span>{formatDate(dateRange[1])}</span>
            </div>
          </div>
        </div>

        <SheetFooter className="sm:justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            Reset Filters
          </Button>
          <Button onClick={handleApply}>
            Apply Filters
            {appliedFiltersCount > 0 && (
              <Badge variant="outline" className="ml-2 bg-primary text-primary-foreground">
                {appliedFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
