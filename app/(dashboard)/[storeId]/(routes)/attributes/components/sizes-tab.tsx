"use client"

import type React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { DataTable } from "@/components/ui/data-table"
import { ApiList } from "@/components/ui/api-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

import { columns } from "../../sizes/components/columns"

interface SizesTabProps {
  data: any[]
}

export const SizesTab: React.FC<SizesTabProps> = ({ data }) => {
  const router = useRouter()
  const params = useParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")

  const filteredData = data
    .filter((size) => {
      if (searchQuery) {
        return (
          size.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          size.value.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      return true
    })
    .filter((size) => {
      if (filterType === "common") {
        return ["S", "M", "L", "XL", "XXL"].includes(size.value)
      }
      if (filterType === "special") {
        return !["S", "M", "L", "XL", "XXL"].includes(size.value)
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

  const totalSizes = data.length
  const commonSizes = data.filter((size) => ["S", "M", "L", "XL", "XXL"].includes(size.value)).length
  const specialSizes = totalSizes - commonSizes

  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Size Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>All Sizes</span>
                <span className="font-bold">{totalSizes}</span>
              </div>
              <div className="flex justify-between">
                <span>Common Sizes</span>
                <span className="font-bold">{commonSizes}</span>
              </div>
              <div className="flex justify-between">
                <span>Special Sizes</span>
                <span className="font-bold">{specialSizes}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Filters & Sort</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search sizes..."
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
                    <SelectItem value="all">All Sizes</SelectItem>
                    <SelectItem value="common">Common Sizes</SelectItem>
                    <SelectItem value="special">Special Sizes</SelectItem>
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

      <Separator />
      <ApiList entityName="sizes" entityIdName="sizeId" />
    </div>
  )
}
