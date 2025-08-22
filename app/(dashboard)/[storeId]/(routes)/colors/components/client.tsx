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
import type { ColorColumn } from "./columns"

interface ColorsClientProps {
  data: ColorColumn[]
}

export const ColorsClient: React.FC<ColorsClientProps> = ({ data }) => {
  const router = useRouter()
  const params = useParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")

  // Helper function to determine if a color is light or dark
  const isLightColor = (hexColor: string) => {
    // Remove the hash if it exists
    hexColor = hexColor.replace("#", "")

    // Convert to RGB
    const r = Number.parseInt(hexColor.substr(0, 2), 16)
    const g = Number.parseInt(hexColor.substr(2, 2), 16)
    const b = Number.parseInt(hexColor.substr(4, 2), 16)

    // Calculate brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000

    return brightness > 128
  }

  // Filter and sort data
  const filteredData = data
    .filter((color) => {
      if (searchQuery) {
        return (
          color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          color.value.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      return true
    })
    .filter((color) => {
      if (filterType === "light") {
        return isLightColor(color.value)
      }
      if (filterType === "dark") {
        return !isLightColor(color.value)
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name)
      }
      if (sortBy === "value") {
        return a.value.localeCompare(b.value)
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  // Calculate stats
  const totalColors = data.length
  const lightColors = data.filter((color) => isLightColor(color.value)).length
  const darkColors = totalColors - lightColors

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Colors (${filteredData.length})`} description="Manage colors for your store" />
        <Button onClick={() => router.push(`/${params.storeId}/colors/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Colors</CardTitle>
            <CardDescription>Overview of your color categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>All Colors</span>
                <span className="font-bold">{totalColors}</span>
              </div>
              <div className="flex justify-between">
                <span>Light Colors</span>
                <span className="font-bold">{lightColors}</span>
              </div>
              <div className="flex justify-between">
                <span>Dark Colors</span>
                <span className="font-bold">{darkColors}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Filters & Sort</CardTitle>
            <CardDescription>Customize your color view</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search colors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-full"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Colors</SelectItem>
                    <SelectItem value="light">Light Colors</SelectItem>
                    <SelectItem value="dark">Dark Colors</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date Created</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="value">Value</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <DataTable columns={columns} data={filteredData} searchKey="name" />
      <Heading title="API" description="API calls for Colors" />
      <Separator />
      <ApiList entityName="colors" entityIdName="colorId" />
    </>
  )
}
