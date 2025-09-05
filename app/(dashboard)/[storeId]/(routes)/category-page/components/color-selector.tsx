"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import axios from "axios"
import { UseFormReturn } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"

interface Color {
  id: string
  name: string
  value: string
}

interface ColorSelectorProps {
  form: UseFormReturn<any>
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({ form }) => {
  const params = useParams()
  const [colors, setColors] = useState<Color[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchColors = async () => {
      try {
        const response = await axios.get(`/api/${params?.storeId}/colors`)
        setColors(response.data || [])
      } catch (error) {
        console.error("Failed to fetch colors:", error)
        setColors([
          { id: "black", name: "Black", value: "#000000" },
          { id: "white", name: "White", value: "#FFFFFF" },
          { id: "red", name: "Red", value: "#FF0000" },
          { id: "blue", name: "Blue", value: "#0000FF" }
        ])
      } finally {
        setLoading(false)
      }
    }
    
    fetchColors()
  }, [params?.storeId])
  
  const selectedColors = form.watch("colors") || []
  
  const toggleColor = (colorName: string) => {
    const current = form.getValues("colors") || []
    const updated = current.includes(colorName)
      ? current.filter((name: string) => name !== colorName)
      : [...current, colorName]
    
    form.setValue("colors", updated, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }
  
  if (loading) {
    return <div>Loading colors...</div>
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Colors</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {colors.map((color) => (
          <label
            key={color.id}
            className={`flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-colors hover:bg-primary/5 ${
              selectedColors.includes(color.name) ? "bg-primary/10 border-primary" : "border-gray-200"
            }`}
          >
            <Checkbox
              checked={selectedColors.includes(color.name)}
              onCheckedChange={() => toggleColor(color.name)}
              className="data-[state=checked]:bg-primary data-[state=checked]:text-white"
            />
            <div className="flex items-center space-x-2">
              <div 
                className="h-4 w-4 rounded-full border" 
                style={{ backgroundColor: color.value }}
              />
              <span className="text-sm">{color.name}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}