"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import axios from "axios"
import { UseFormReturn } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"

interface Material {
  id: string
  name: string
}

interface MaterialSelectorProps {
  form: UseFormReturn<any>
}

export const MaterialSelector: React.FC<MaterialSelectorProps> = ({ form }) => {
  const params = useParams()
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await axios.get(`/api/${params?.storeId}/categories`)
        const materialCategories = response.data
          .filter((item: any) => item.type === "material")
          .map((item: any) => ({
            id: item.id,
            name: item.name
          }))
        setMaterials(materialCategories || [])
      } catch (error) {
        console.error("Failed to fetch materials:", error)
        setMaterials([
          { id: "leather", name: "Leather" },
          { id: "cotton", name: "Cotton" },
          { id: "polyester", name: "Polyester" },
          { id: "wool", name: "Wool" }
        ])
      } finally {
        setLoading(false)
      }
    }
    
    fetchMaterials()
  }, [params?.storeId])
  
  const selectedMaterials = form.watch("materials") || []
  
  const toggleMaterial = (materialName: string) => {
    const current = form.getValues("materials") || []
    const updated = current.includes(materialName)
      ? current.filter((name: string) => name !== materialName)
      : [...current, materialName]
    
    form.setValue("materials", updated, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }
  
  if (loading) {
    return <div>Loading materials...</div>
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Materials</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {materials.map((material) => (
          <label
            key={material.id}
            className={`flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-colors hover:bg-primary/5 ${
              selectedMaterials.includes(material.name) ? "bg-primary/10 border-primary" : "border-gray-200"
            }`}
          >
            <Checkbox
              checked={selectedMaterials.includes(material.name)}
              onCheckedChange={() => toggleMaterial(material.name)}
              className="data-[state=checked]:bg-primary data-[state=checked]:text-white"
            />
            <span className="text-sm">{material.name}</span>
          </label>
        ))}
      </div>
    </div>
  )
}