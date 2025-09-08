"use client"

import type React from "react"

import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { ApiList } from "@/components/ui/api-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

import { columns } from "./columns"
import type { CategoryColumn } from "./columns"

interface CategoriesClientProps {
  data: CategoryColumn[]
}

export const CategoriesClient: React.FC<CategoriesClientProps> = ({ data }) => {
  const router = useRouter()
  const params = useParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")

  const filteredData = data
    .filter((category) => {
      if (searchQuery) {
        return (
          category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (category.billboardLabel && category.billboardLabel.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      }
      return true
    })
    .filter((category) => {
      if (filterType === "with-billboard") {
        return !!category.billboardLabel
      }
      if (filterType === "without-billboard") {
        return !category.billboardLabel
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name)
      }
      if (sortBy === "billboard") {
        return (a.billboardLabel || "").localeCompare(b.billboardLabel || "")
      }
      return 0 
    })

  const totalCategories = data.length
  const withBillboard = data.filter((category) => category.billboardLabel).length
  const withoutBillboard = totalCategories - withBillboard

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Categories (${filteredData.length})`} description="Manage categories for your store" />
        <Button onClick={() => router.push(`/${params.storeId}/categories/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Categories</CardTitle>
            <CardDescription>Overview of your categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>All Categories</span>
                <span className="font-bold">{totalCategories}</span>
              </div>
              <div className="flex justify-between">
                <span>With Billboard</span>
                <span className="font-bold">{withBillboard}</span>
              </div>
              <div className="flex justify-between">
                <span>Without Billboard</span>
                <span className="font-bold">{withoutBillboard}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Filters & Sort</CardTitle>
            <CardDescription>Customize your category view</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-full"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="with-billboard">With Billboard</SelectItem>
                    <SelectItem value="without-billboard">Without Billboard</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date Created</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="billboard">Billboard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <DataTable columns={columns} data={filteredData} searchKey="name" />
      <Heading title="API" description="API calls for Categories" />
      <Separator />
      <ApiList entityName="categories" entityIdName="categoryId" />
    </>
  )
}
