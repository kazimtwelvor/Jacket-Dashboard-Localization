"use client"

import { useParams } from "next/navigation"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { CategoryPageForm } from "../components/category-page-form"

export default function NewCategoryPage() {
  const params = useParams()
  
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading
          title="Create Category Page"
          description="Create a new category page"
        />
        <Separator />
        <CategoryPageForm />
      </div>
    </div>
  )
}