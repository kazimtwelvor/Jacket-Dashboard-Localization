"use client"

import type React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { DataTable } from "@/components/ui/data-table"
import { ApiList } from "@/components/ui/api-list"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Tag, Shirt, Palette, Search } from "lucide-react"

import { columns } from "../../categories/components/columns"

interface CategoriesTabProps {
  data: any[]
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({ data }) => {
  const router = useRouter()
  const params = useParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [categoryType, setCategoryType] = useState<"all" | "material" | "style" | "gender">("all")

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
        return category.billboardLabel
      }
      if (filterType === "without-billboard") {
        return !category.billboardLabel
      }
      return true
    })
    .filter((category) => {
      if (categoryType !== "all") {
        return category.type === categoryType
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
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const totalCategories = data.length
  const withBillboard = data.filter((category) => category.billboardLabel).length
  const withoutBillboard = totalCategories - withBillboard

  const materialCategories = data.filter((category) => category.type === "material").length
  const styleCategories = data.filter((category) => category.type === "style").length
  const genderCategories = data.filter((category) => category.type === "gender").length

  const handleCreateCategory = (type?: "material" | "style" | "gender") => {
    if (type) {
      router.push(`/${params.storeId}/categories/new?type=${type}`)
    } else {
      router.push(`/${params.storeId}/categories/new`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
          <Badge variant="outline" className="ml-2">
            {totalCategories}
          </Badge>
        </div>
        <Button onClick={() => handleCreateCategory()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 hover:shadow-md transition-all cursor-pointer"
          onClick={() => setCategoryType(categoryType === "material" ? "all" : "material")}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
                <Palette className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Material</h3>
                <p className="text-xs text-muted-foreground">Cotton, wool, leather, etc.</p>
              </div>
            </div>
            <Badge
              variant={categoryType === "material" ? "default" : "outline"}
              className={categoryType === "material" ? "bg-blue-500" : ""}
            >
              {materialCategories}
            </Badge>
          </CardContent>
        </Card>

        <Card
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700 hover:shadow-md transition-all cursor-pointer"
          onClick={() => setCategoryType(categoryType === "style" ? "all" : "style")}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-800 p-2 rounded-full">
                <Tag className="h-5 w-5 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Style</h3>
                <p className="text-xs text-muted-foreground">Casual, formal, sporty, etc.</p>
              </div>
            </div>
            <Badge
              variant={categoryType === "style" ? "default" : "outline"}
              className={categoryType === "style" ? "bg-purple-500" : ""}
            >
              {styleCategories}
            </Badge>
          </CardContent>
        </Card>

        <Card
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700 hover:shadow-md transition-all cursor-pointer"
          onClick={() => setCategoryType(categoryType === "gender" ? "all" : "gender")}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full">
                <Shirt className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Gender</h3>
                <p className="text-xs text-muted-foreground">Men, women, unisex, etc.</p>
              </div>
            </div>
            <Badge
              variant={categoryType === "gender" ? "default" : "outline"}
              className={categoryType === "gender" ? "bg-green-500" : ""}
            >
              {genderCategories}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-auto flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by" />
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

      {categoryType !== "all" && (
        <div className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
          <div className="flex items-center gap-2">
            <Badge
              variant={categoryType === "material" ? "default" : categoryType === "style" ? "secondary" : "outline"}
              className={
                categoryType === "material"
                  ? "bg-blue-500"
                  : categoryType === "style"
                    ? "bg-purple-500"
                    : "bg-green-500"
              }
            >
              {categoryType.charAt(0).toUpperCase() + categoryType.slice(1)}
            </Badge>
            <span className="text-sm">categories only</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setCategoryType("all")}>
            Clear Filter
          </Button>
          <Button size="sm" onClick={() => handleCreateCategory(categoryType)}>
            <PlusCircle className="mr-2 h-3 w-3" />
            Add {categoryType.charAt(0).toUpperCase() + categoryType.slice(1)} Category
          </Button>
        </div>
      )}

      <DataTable
        columns={[
          ...columns,
          {
            accessorKey: "type",
            header: "Category Type",
            cell: ({ row }) => {
              const type = row.original.type || "material"
              const badgeClass =
                type === "material"
                  ? "bg-blue-100 text-blue-700"
                  : type === "style"
                    ? "bg-purple-100 text-purple-700"
                    : type === "gender"
                      ? "bg-green-100 text-green-700"
                      : ""

              return (
                <Badge variant="outline" className={badgeClass}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Badge>
              )
            },
          },
        ]}
        data={filteredData}
        searchKey="name"
      />

      <Separator />
      <ApiList entityName="categories" entityIdName="categoryId" />
    </div>
  )
}
