"use client"

import type React from "react"

import { useState } from "react"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FilterSidebar } from "./filter/filter-sidebar"

interface FilterButtonProps {
  categories: any[]
  sizes: any[]
  colors: any[]
}

export const FilterButton: React.FC<FilterButtonProps> = ({ categories, sizes, colors }) => {
  const [filterOpen, setFilterOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setFilterOpen(true)} className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        Filter
      </Button>

      <FilterSidebar
        categories={categories}
        sizes={sizes}
        colors={colors}
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
      />
    </>
  )
}
