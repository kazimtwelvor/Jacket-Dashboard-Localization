"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { CategoriesTab } from "./categories-tab"
import { SizesTab } from "./sizes-tab"
import { ColorsTab } from "./colors-tab"
import { Button } from "@/components/ui/button"
import { PlusCircle, Tag, Ruler, Palette } from "lucide-react"

interface AttributesClientProps {
  categories: any[]
  sizes: any[]
  colors: any[]
  initialTab?: string
}

export const AttributesClient: React.FC<AttributesClientProps> = ({
  categories,
  sizes,
  colors,
  initialTab = "categories",
}) => {
  const router = useRouter()
  const params = useParams()
  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    router.push(`/${params.storeId}/attributes?tab=${activeTab}`, { scroll: false })
  }, [activeTab, params.storeId, router])

  const handleAddNew = () => {
    router.push(`/${params.storeId}/attributes?tab=${activeTab}&action=new`)
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title="Product Attributes" description="Manage your product categories, sizes, and colors" />
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />

      <Tabs defaultValue={initialTab} value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="sizes" className="flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Sizes
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Colors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <CategoriesTab data={categories} />
        </TabsContent>

        <TabsContent value="sizes" className="space-y-4">
          <SizesTab data={sizes} />
        </TabsContent>

        <TabsContent value="colors" className="space-y-4">
          <ColorsTab data={colors} />
        </TabsContent>
      </Tabs>
    </>
  )
}
