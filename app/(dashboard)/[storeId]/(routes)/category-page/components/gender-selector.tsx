"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import axios from "axios"
import { UseFormReturn } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface Gender {
  id: string
  name: string
}

interface GenderSelectorProps {
  form: UseFormReturn<any>
}

export const GenderSelector: React.FC<GenderSelectorProps> = ({ form }) => {
  const params = useParams()
  const [genders, setGenders] = useState<Gender[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchGenders = async () => {
      try {
        // Use the categories endpoint with gender filter
        const response = await axios.get(`/api/${params.storeId}/categories`)
        // Filter only gender categories
        const genderCategories = response.data
          .filter((item: any) => item.type === "gender")
          .map((item: any) => ({
            id: item.id,
            name: item.name
          }))
        setGenders(genderCategories.length > 0 ? genderCategories : [
          { id: "men", name: "Men" },
          { id: "women", name: "Women" },
          { id: "unisex", name: "Unisex" },
          { id: "kids", name: "Kids" }
        ])
      } catch (error) {
        console.error("Failed to fetch genders:", error)
        // Provide some default genders in case of error
        setGenders([
          { id: "men", name: "Men" },
          { id: "women", name: "Women" },
          { id: "unisex", name: "Unisex" },
          { id: "kids", name: "Kids" }
        ])
      } finally {
        setLoading(false)
      }
    }
    
    fetchGenders()
  }, [params.storeId])
  
  const selectedGenders = form.watch("genders") || []
  
  const toggleGender = (genderName: string) => {
    const current = form.getValues("genders") || []
    const updated = current.includes(genderName)
      ? current.filter((name: string) => name !== genderName)
      : [...current, genderName]
    
    form.setValue("genders", updated, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }
  
  if (loading) {
    return <div>Loading genders...</div>
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Gender</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {genders.map((gender) => (
          <label
            key={gender.id}
            className={`flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-colors hover:bg-primary/5 ${
              selectedGenders.includes(gender.name) ? "bg-primary/10 border-primary" : "border-gray-200"
            }`}
          >
            <Checkbox
              checked={selectedGenders.includes(gender.name)}
              onCheckedChange={() => toggleGender(gender.name)}
              className="data-[state=checked]:bg-primary data-[state=checked]:text-white"
            />
            <span className="text-sm">{gender.name}</span>
          </label>
        ))}
      </div>
    </div>
  )
}