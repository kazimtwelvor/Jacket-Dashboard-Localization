"use client"

import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ActiveFiltersProps {
  categories: { id: string; name: string }[]
  sizes: { id: string; name: string }[]
  colors: { id: string; name: string; value: string }[]
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({ categories, sizes, colors }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentStatus = searchParams?.get("status")?.split(",") || []
  const currentGender = searchParams?.get("gender")?.split(",") || []
  const currentMaterial = searchParams?.get("material")?.split(",") || []
  const currentStyle = searchParams?.get("style")?.split(",") || []
  const currentSize = searchParams?.get("size")?.split(",") || []
  const currentColor = searchParams?.get("color")?.split(",") || []
  const currentMinPrice = searchParams?.get("minPrice")
  const currentMaxPrice = searchParams?.get("maxPrice")

  const hasActiveFilters =
    currentStatus.length > 0 ||
    currentGender.length > 0 ||
    currentMaterial.length > 0 ||
    currentStyle.length > 0 ||
    currentSize.length > 0 ||
    currentColor.length > 0 ||
    currentMinPrice ||
    currentMaxPrice

  if (!hasActiveFilters) {
    return null
  }

  const getCategoryName = (id: string) => {
    const category = categories.find((cat) => cat.id === id)
    return category?.name || id
  }

  const getSizeName = (id: string) => {
    const size = sizes.find((s) => s.id === id)
    return size?.name || id
  }

  const getColorInfo = (id: string) => {
    const color = colors.find((c) => c.id === id)
    return color || { id, name: id, value: "#000000" }
  }

  const removeFilter = (type: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "")

    const currentValues = params.get(type)?.split(",") || []
    const newValues = currentValues.filter((v) => v !== value)

    if (newValues.length > 0) {
      params.set(type, newValues.join(","))
    } else {
      params.delete(type)
    }

    const search = params.toString()
    const query = search ? `?${search}` : ""

    router.push(`${window.location.pathname}${query}`)
  }

  const removePriceFilter = (type: "minPrice" | "maxPrice") => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    params.delete(type)

    const search = params.toString()
    const query = search ? `?${search}` : ""

    router.push(`${window.location.pathname}${query}`)
  }

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams?.toString() || "")

    params.delete("status")
    params.delete("gender")
    params.delete("material")
    params.delete("style")
    params.delete("size")
    params.delete("color")
    params.delete("minPrice")
    params.delete("maxPrice")

    const search = params.toString()
    const query = search ? `?${search}` : ""

    router.push(`${window.location.pathname}${query}`)
  }

  return (
    <div className="flex flex-wrap gap-2 my-4">
      {currentStatus.map((status) => (
        <Badge key={`status-${status}`} variant="outline" className="flex items-center gap-1">
          Status: {status.charAt(0).toUpperCase() + status.slice(1)}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => removeFilter("status", status)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {currentGender.map((id) => (
        <Badge key={`gender-${id}`} variant="outline" className="flex items-center gap-1">
          Gender: {getCategoryName(id)}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => removeFilter("gender", id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {currentMaterial.map((id) => (
        <Badge key={`material-${id}`} variant="outline" className="flex items-center gap-1">
          Material: {getCategoryName(id)}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => removeFilter("material", id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {currentStyle.map((id) => (
        <Badge key={`style-${id}`} variant="outline" className="flex items-center gap-1">
          Style: {getCategoryName(id)}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => removeFilter("style", id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {currentSize.map((id) => (
        <Badge key={`size-${id}`} variant="outline" className="flex items-center gap-1">
          Size: {getSizeName(id)}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => removeFilter("size", id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {currentColor.map((id) => {
        const colorInfo = getColorInfo(id)
        return (
          <Badge key={`color-${id}`} variant="outline" className="flex items-center gap-1">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full border" style={{ backgroundColor: colorInfo.value }} />
              Color: {colorInfo.name}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeFilter("color", id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )
      })}

      {currentMinPrice && (
        <Badge variant="outline" className="flex items-center gap-1">
          Min Price: ${currentMinPrice}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => removePriceFilter("minPrice")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {currentMaxPrice && (
        <Badge variant="outline" className="flex items-center gap-1">
          Max Price: ${currentMaxPrice}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => removePriceFilter("maxPrice")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={clearAllFilters}>
        Clear All
      </Button>
    </div>
  )
}
