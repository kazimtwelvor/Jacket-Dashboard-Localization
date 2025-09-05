"use client"

import { Checkbox } from "@/components/ui/checkbox"
import type { ColorColumn } from "./columns"
import { ColorCard } from "./color-card"

interface ColorGridProps {
  data: ColorColumn[]
  onSelect: (color: ColorColumn) => void
  selectedItems: string[]
  onToggleSelect: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export const ColorGrid = ({ data, onSelect, selectedItems, onToggleSelect }: ColorGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {data.map((color) => (
        <div key={color.id} className="relative group">
          <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={selectedItems.includes(color.id)}
              onCheckedChange={() => onToggleSelect(color.id)}
              className="h-5 w-5 bg-background/80 backdrop-blur-sm border-muted-foreground/30"
            />
          </div>
          <ColorCard color={color} onClick={() => onSelect(color)} />
        </div>
      ))}
    </div>
  )
}
