"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { CategoryPageForm } from "../components/category-page-form"
import axios from "axios"
import { toast } from "react-hot-toast"

export default function EditCategoryPage() {
  const params = useParams()
  const [categoryPage, setCategoryPage] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchCategoryPage = async () => {
      try {
        const response = await axios.get(`/api/${params.storeId}/category-pages/${params.categoryPageId}`)
        
        const data = response.data
        
        data.focusKeyword = data.focusKeyword || ""
        data.supportingKeywords = data.supportingKeywords || []
        
        if (data.categoryContent) {
          console.log('Original categoryContent type:', typeof data.categoryContent);
          if (typeof data.categoryContent !== 'string') {
            data.categoryContent = JSON.stringify(data.categoryContent);
            console.log('Converted categoryContent to string');
          }
        }
        
        data.apiSlug = data.apiSlug || "";
        
        console.log('Setting category page data:', JSON.stringify(data));
        setCategoryPage(data)
      } catch (error) {
        toast.error("Failed to load category page")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCategoryPage()
  }, [params?.storeId, params?.categoryPageId])
  
  if (loading) {
    return <div className="flex-1 space-y-4 p-8 pt-6">Loading...</div>
  }
  
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading
          title="Edit Category Page"
          description="Edit an existing category page"
        />
        <Separator />
        {categoryPage && <CategoryPageForm initialData={categoryPage} />}
      </div>
    </div>
  )
}