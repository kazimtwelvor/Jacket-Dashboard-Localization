"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { FormLabel } from "@/components/ui/form"
import type { Size } from "../../../../types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"

interface SizeSelectionSectionProps {
  sizes: Size[]
  form: any
}

export const SizeSelectionSection: React.FC<SizeSelectionSectionProps> = ({ sizes, form }) => {
  const selectedSizes = form.watch("categories.sizes") || []
  const [searchTerm, setSearchTerm] = useState("")

  const selectedSizeIds = Array.isArray(selectedSizes)
    ? selectedSizes.map((s) => (typeof s === "object" && s !== null ? s.id : s))
    : []

  useEffect(() => {
    console.log("Selected sizes raw value:", selectedSizes)
    console.log("Converted to IDs for comparison:", selectedSizeIds)
  }, [selectedSizes])

  const handleSizeChange = (sizeId: string, checked: boolean) => {
    try {
      let updatedSizeIds = [...selectedSizeIds]

      if (checked) {
        if (!updatedSizeIds.includes(sizeId)) {
          updatedSizeIds.push(sizeId)
        }
      } else {
        updatedSizeIds = updatedSizeIds.filter((id) => id !== sizeId)
      }

      form.setValue("categories.sizes", updatedSizeIds, { shouldValidate: true })

      const sizeDetailsArray = sizes
        .filter((size) => updatedSizeIds.includes(size.id))
        .map((size) => ({
          id: size.id,
          name: size.name,
          value: size.value,
        }))

      form.setValue("sizeDetails", sizeDetailsArray, { shouldValidate: false })

      console.log("Updated size IDs:", updatedSizeIds)
      console.log("Updated size details:", sizeDetailsArray)
    } catch (error) {
      console.error("Error in handleSizeChange:", error)
    }
  }

  const handleSelectAll = () => {
    const allSizeIds = sizes.map((size) => size.id)
    form.setValue("categories.sizes", allSizeIds, { shouldValidate: true })

    const allSizeDetails = sizes.map((size) => ({
      id: size.id,
      name: size.name,
      value: size.value,
    }))
    form.setValue("sizeDetails", allSizeDetails, { shouldValidate: false })
  }

  const handleClearAll = () => {
    form.setValue("categories.sizes", [], { shouldValidate: true })
    form.setValue("sizeDetails", [], { shouldValidate: false })
  }

  const filteredSizes = sizes.filter(
    (size) =>
      size.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      size.value.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FormLabel className="text-base font-semibold">Available Sizes</FormLabel>
          <Badge variant="outline" className="ml-2">
            {selectedSizeIds.length} selected
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleSelectAll} className="text-xs h-8">
            Select All
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleClearAll} className="text-xs h-8">
            Clear All
          </Button>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search sizes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Card className="border border-input">
        <CardContent className="p-0">
          {filteredSizes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-4">
              {filteredSizes.map((size) => {
                const isSelected = selectedSizeIds.includes(size.id)
                return (
                  <div
                    key={size.id}
                    onClick={() => handleSizeChange(size.id, !isSelected)}
                    className={`
                      flex items-center justify-between p-3 rounded-md cursor-pointer
                      transition-all duration-200 border
                      ${
                        isSelected
                          ? "bg-primary/10 border-primary shadow-sm"
                          : "bg-background border-input hover:bg-muted/50"
                      }
                    `}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{size.name}</span>
                      <span className="text-xs text-muted-foreground">{size.value}</span>
                    </div>
                    <div
                      className={`
                      flex items-center justify-center h-5 w-5 rounded-full border
                      ${isSelected ? "bg-primary border-primary text-primary-foreground" : "bg-background border-input"}
                    `}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center p-6 text-muted-foreground">No sizes match your search</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
