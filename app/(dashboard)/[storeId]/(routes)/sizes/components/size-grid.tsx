"use client"

import { Checkbox } from "@/components/ui/checkbox"
import type { SizeColumn } from "./columns"
import { SizeCard } from "./size-card"

interface SizeGridProps {
  data: SizeColumn[]
  onSelect: (size: SizeColumn) => void
  selectedItems: string[]
  onToggleSelect: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export const SizeGrid = ({ data, onSelect, selectedItems, onToggleSelect, onEdit, onDelete }: SizeGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {data.map((size) => (
        <div key={size.id} className="relative group">
          <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={selectedItems.includes(size.id)}
              onCheckedChange={() => onToggleSelect(size.id)}
              className="h-5 w-5 bg-background/80 backdrop-blur-sm border-muted-foreground/30"
            />
          </div>
          <SizeCard size={size} onClick={() => onSelect(size)} />
        </div>
      ))}
    </div>
  )
}
