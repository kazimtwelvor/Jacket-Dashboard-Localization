"use client"
import { useParams } from "next/navigation"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { TemplateGrid } from "./template-grid"

const TEMPLATES = [
  {
    id: "custom-template",
    title: "Custom Template",
    description: "A modern, responsive custom template for your store",
    imageUrl: "/placeholder.svg?height=300&width=400",
  },
  // More templates can be added here
]

export const TemplatesClient = () => {
  const params = useParams()
  const storeId = params.storeId as string

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title="Page Templates" description="Choose a template for your store page" />
      </div>
      <Separator className="my-4" />
      <TemplateGrid templates={TEMPLATES} storeId={storeId} />
    </>
  )
}
