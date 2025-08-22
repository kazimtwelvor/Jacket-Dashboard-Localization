"use client"

import { useState, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Check, ChevronDown } from "lucide-react"

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const presetColors = [
  "#000000", // Black
  "#FFFFFF", // White
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FFA500", // Orange
  "#800080", // Purple
  "#008000", // Dark Green
  "#800000", // Maroon
  "#008080", // Teal
  "#000080", // Navy
  "#808080", // Gray
  "#C0C0C0", // Silver
]

export function ColorPicker({ value, onChange, disabled }: ColorPickerProps) {
  const [color, setColor] = useState(value || "#000000")

  useEffect(() => {
    if (value !== color) {
      setColor(value || "#000000")
    }
  }, [value, color])

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    onChange(newColor)
  }

  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <Button variant="outline" className={cn("w-full justify-between", disabled && "opacity-50 cursor-not-allowed")}>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: color }} />
            <span>{color}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-8 w-full rounded-md border" style={{ backgroundColor: color }} />
          </div>
          <input
            type="color"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-full h-10 cursor-pointer"
          />
          <div className="grid grid-cols-8 gap-1">
            {presetColors.map((presetColor) => (
              <button
                key={presetColor}
                className={cn(
                  "h-6 w-6 rounded-md border flex items-center justify-center",
                  color === presetColor && "ring-2 ring-primary",
                )}
                style={{ backgroundColor: presetColor }}
                onClick={() => handleColorChange(presetColor)}
              >
                {color === presetColor && <Check className="h-3 w-3 text-white" />}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
