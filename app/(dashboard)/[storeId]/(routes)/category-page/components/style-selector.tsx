"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import axios from "axios"
import { UseFormReturn } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface Style {
  id: string
  name: string
}

interface StyleSelectorProps {
  form: UseFormReturn<any>
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ form }) => {
  const params = useParams()
  const [styles, setStyles] = useState<Style[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchStyles = async () => {
      try {
        // Use the categories endpoint with style filter
        const response = await axios.get(`/api/${params.storeId}/categories`)
        // Filter only style categories
        const styleCategories = response.data
          .filter((item: any) => item.type === "style")
          .map((item: any) => ({
            id: item.id,
            name: item.name
          }))
        setStyles(styleCategories || [])
      } catch (error) {
        console.error("Failed to fetch styles:", error)
        // Provide some default styles in case of error
        setStyles([
          { id: "casual", name: "Casual" },
          { id: "formal", name: "Formal" },
          { id: "sporty", name: "Sporty" },
          { id: "vintage", name: "Vintage" }
        ])
      } finally {
        setLoading(false)
      }
    }
    
    fetchStyles()
  }, [params.storeId])
  
  const selectedStyles = form.watch("styles") || []
  
  const toggleStyle = (styleName: string) => {
    const current = form.getValues("styles") || []
    const updated = current.includes(styleName)
      ? current.filter((name: string) => name !== styleName)
      : [...current, styleName]
    
    form.setValue("styles", updated, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }
  
  if (loading) {
    return <div>Loading styles...</div>
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Styles</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {styles.map((style) => (
          <label
            key={style.id}
            className={`flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-colors hover:bg-primary/5 ${
              selectedStyles.includes(style.name) ? "bg-primary/10 border-primary" : "border-gray-200"
            }`}
          >
            <Checkbox
              checked={selectedStyles.includes(style.name)}
              onCheckedChange={() => toggleStyle(style.name)}
              className="data-[state=checked]:bg-primary data-[state=checked]:text-white"
            />
            <span className="text-sm">{style.name}</span>
          </label>
        ))}
      </div>
    </div>
  )
}