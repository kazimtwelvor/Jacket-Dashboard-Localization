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

import { columns } from "../../colors/components/columns"

interface ColorsTabProps {
  data: any[]
}

export const ColorsTab: React.FC<ColorsTabProps> = ({ data }) => {
  const router = useRouter()
  const params = useParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")

  const isLightColor = (hexColor: string) => {
    hexColor = hexColor.replace("#", "")

    const r = Number.parseInt(hexColor.substr(0, 2), 16)
    const g = Number.parseInt(hexColor.substr(2, 2), 16)
    const b = Number.parseInt(hexColor.substr(4, 2), 16)

    const brightness = (r * 299 + g * 587 + b * 114) / 1000

    return brightness > 128
  }

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

  const totalColors = data.length
  const lightColors = data.filter((color) => isLightColor(color.value)).length
  const darkColors = totalColors - lightColors

  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Color Statistics</CardTitle>
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
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Filters & Sort</CardTitle>
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

      <Separator />
      <ApiList entityName="colors" entityIdName="colorId" />
    </div>
  )
}
