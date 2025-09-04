"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
interface ProductFiltersProps {
  categories: { id: string; name: string }[]
  sizes: { id: string; name: string }[]
  colors: { id: string; name: string; value: string }[]
}
export const ProductFilters = ({ categories, sizes, colors }: ProductFiltersProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeFilters, setActiveFilters] = useState({
    categoryId: searchParams?.get("categoryId") || "",
    sizeId: searchParams?.get("sizeId") || "",
    colorId: searchParams?.get("colorId") || "",
    status: searchParams?.get("status") || "",
  })

  const applyFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "")

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    setActiveFilters((prev) => ({
      ...prev,
      [key]: value,
    }))

    router.push(`?${params.toString()}`)
  }

  const clearAllFilters = () => {
    setActiveFilters({
      categoryId: "",
      sizeId: "",
      colorId: "",
      status: "",
    })

    router.push("")
  }

  const hasActiveFilters = Object.values(activeFilters).some(Boolean)

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Select value={activeFilters.categoryId} onValueChange={(value) => applyFilter("categoryId", value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={activeFilters.sizeId} onValueChange={(value) => applyFilter("sizeId", value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sizes</SelectItem>
            {sizes.map((size) => (
              <SelectItem key={size.id} value={size.id}>
                {size.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={activeFilters.colorId} onValueChange={(value) => applyFilter("colorId", value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Color" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Colors</SelectItem>
            {colors.map((color) => (
              <SelectItem key={color.id} value={color.id}>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: color.value }} />
                  {color.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={activeFilters.status} onValueChange={(value) => applyFilter("status", value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {activeFilters.categoryId && (
              <Badge variant="outline" className="flex items-center gap-1">
                Category: {categories.find((c) => c.id === activeFilters.categoryId)?.name}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0"
                  onClick={() => applyFilter("categoryId", "")}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove category filter</span>
                </Button>
              </Badge>
            )}

            {activeFilters.sizeId && (
              <Badge variant="outline" className="flex items-center gap-1">
                Size: {sizes.find((s) => s.id === activeFilters.sizeId)?.name}
                <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => applyFilter("sizeId", "")}>
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove size filter</span>
                </Button>
              </Badge>
            )}

            {activeFilters.colorId && (
              <Badge variant="outline" className="flex items-center gap-1">
                Color: {colors.find((c) => c.id === activeFilters.colorId)?.name}
                <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => applyFilter("colorId", "")}>
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove color filter</span>
                </Button>
              </Badge>
            )}

            {activeFilters.status && (
              <Badge variant="outline" className="flex items-center gap-1">
                Status: {activeFilters.status === "published" ? "Published" : "Draft"}
                <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => applyFilter("status", "")}>
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove status filter</span>
                </Button>
              </Badge>
            )}
          </div>

          <Separator orientation="vertical" className="h-4" />

          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={clearAllFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
