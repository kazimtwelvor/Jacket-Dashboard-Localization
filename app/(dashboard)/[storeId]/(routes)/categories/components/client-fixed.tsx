"use client"

import type React from "react"

import { Plus, Grid, List, SearchIcon } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/data-table"
import { CategoryCard } from "./category-card"
import { CategoryFilters } from "./category-filters"
import { CategoryStats } from "./category-stats"

import { type CategoryColumn, columns } from "./columns"

interface CategoriesClientProps {
  data: CategoryColumn[]
  billboardData: { id: string; label: string }[]
}

export const CategoriesClient: React.FC<CategoriesClientProps> = ({ data, billboardData }) => {
  const params = useParams()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredData = data.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Heading title={`Categories (${data.length})`} description="Manage categories for your store" />
          <Button onClick={() => router.push(`/${params.storeId}/categories/new`)}>
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Button>
        </div>
        <Separator />

        {/* Category Stats - Only rendered once */}
        <CategoryStats categories={data} />

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-72">
            <SearchIcon className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex items-center gap-2">
            <CategoryFilters billboardData={billboardData} />
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0 rounded-r-none"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0 rounded-l-none"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredData.map((item) => (
              <CategoryCard key={item.id} data={item} />
            ))}
          </div>
        ) : (
          <DataTable searchKey="name" columns={columns} data={filteredData} />
        )}
      </div>
    </>
  )
}
