"use client"

import { SidebarSeparator } from "@/components/ui/sidebar"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarInput,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  LayoutGrid,
  PlusCircle,
  Layers,
  LayoutList,
  ArrowUpDown,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Calendar,
  Trash2,
} from "lucide-react"
import { ColorList } from "./color-list"
import { ColorGrid } from "./color-grid"
import { ColorDetail } from "./color-detail"
import { ColorStats } from "./color-stats"
import { ColorBulkActions } from "./color-bulk-actions"
import { ColorEmptyState } from "./color-empty-state"
import { ColorCreateButton } from "./color-create-button"
import { Badge } from "@/components/ui/badge"
import { AlertModal } from "@/components/modals/alert-modal"
import { toast } from "react-hot-toast"
import axios from "axios"
import type { ColorColumn } from "./columns"

interface ColorsViewProps {
  data: ColorColumn[]
}

export const ColorsView = ({ data }: ColorsViewProps) => {
  const router = useRouter()
  const params = useParams()

  // State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filteredData, setFilteredData] = useState<ColorColumn[]>(data)
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState<ColorColumn | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sortField, setSortField] = useState<"name" | "value" | "createdAt">("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterStatus, setFilterStatus] = useState<"all" | "light" | "dark">("all")
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false)

  // Calculate stats
  const totalColors = filteredData.length

  // Helper function to determine if a color is light or dark
  const isLightColor = (hexColor: string) => {
    // Remove the hash if it exists
    hexColor = hexColor.replace("#", "")

    // Convert to RGB
    const r = Number.parseInt(hexColor.substr(0, 2), 16)
    const g = Number.parseInt(hexColor.substr(2, 2), 16)
    const b = Number.parseInt(hexColor.substr(4, 2), 16)

    // Calculate brightness (using the formula for relative luminance)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000

    // Return true if the color is light (brightness > 128)
    return brightness > 128
  }

  const lightColors = filteredData.filter((color) => isLightColor(color.value)).length
  const darkColors = totalColors - lightColors

  // Filter data based on status
  useEffect(() => {
    let result = [...data]

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (color) =>
          color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          color.value.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply status filter
    if (filterStatus === "light") {
      result = result.filter((color) => isLightColor(color.value))
    } else if (filterStatus === "dark") {
      result = result.filter((color) => !isLightColor(color.value))
    }

    // Apply sort
    result = result.sort((a, b) => {
      if (sortField === "name") {
        return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      } else if (sortField === "value") {
        return sortOrder === "asc" ? a.value.localeCompare(b.value) : b.value.localeCompare(a.value)
      } else {
        return sortOrder === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    setFilteredData(result)
  }, [data, searchQuery, filterStatus, sortField, sortOrder])

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Handle sort
  const handleSort = (field: "name" | "value" | "createdAt") => {
    const newOrder = field === sortField && sortOrder === "asc" ? "desc" : "asc"
    setSortField(field)
    setSortOrder(newOrder)
  }

  // Handle color selection
  const handleColorSelect = (color: ColorColumn) => {
    setSelectedColor(color)
  }

  // Handle color creation
  const handleCreateColor = () => {
    router.push(`/${params.storeId}/colors/new`)
  }

  // Handle color edit
  const handleEditColor = (id: string) => {
    router.push(`/${params.storeId}/colors/${id}`)
  }

  // Handle color delete
  const handleDeleteColor = async () => {
    if (!selectedColor) return

    try {
      setIsLoading(true)
      await axios.delete(`/api/${params.storeId}/colors/${selectedColor.id}`)
      router.refresh()
      toast.success("Color deleted successfully.")
      setSelectedColor(null)
    } catch (error) {
      toast.error("Make sure you removed all products using this color first.")
    } finally {
      setIsLoading(false)
      setDeleteModalOpen(false)
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      setIsLoading(true)
      // This would need to be implemented in the API
      await Promise.all(selectedItems.map((id) => axios.delete(`/api/${params.storeId}/colors/${id}`)))
      router.refresh()
      toast.success(`${selectedItems.length} colors deleted successfully.`)
      setSelectedItems([])
    } catch (error) {
      toast.error("Failed to delete some colors. Make sure they don't have products.")
    } finally {
      setIsLoading(false)
      setBulkDeleteModalOpen(false)
    }
  }

  // Handle item selection for bulk actions
  const toggleItemSelection = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  // Handle select all
  const toggleSelectAll = () => {
    if (selectedItems.length === filteredData.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredData.map((item) => item.id))
    }
  }

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("")
    setFilterStatus("all")
    setSortField("createdAt")
    setSortOrder("desc")
  }

  return (
    <>
      <AlertModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteColor}
        loading={isLoading}
      />

      <AlertModal
        isOpen={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
        loading={isLoading}
        title="Delete Selected Colors"
        description={`Are you sure you want to delete ${selectedItems.length} colors? This action cannot be undone.`}
      />

      <SidebarProvider>
        <div className="flex h-full">
          <div className="hidden md:block w-[240px] flex-shrink-0">
            <Sidebar variant="inset" collapsible="icon">
              <SidebarHeader>
                <div className="flex items-center justify-between px-4 py-2">
                  <h2 className="text-lg font-semibold">Colors</h2>
                  <SidebarTrigger />
                </div>
                <div className="px-2 pb-2">
                  <SidebarInput
                    placeholder="Search colors..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </SidebarHeader>

              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Views</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => setFilterStatus("all")} isActive={filterStatus === "all"}>
                          <Layers className="h-4 w-4" />
                          <span>All Colors</span>
                          <Badge variant="outline" className="ml-auto">
                            {data.length}
                          </Badge>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => setFilterStatus("light")} isActive={filterStatus === "light"}>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Light Colors</span>
                          <Badge variant="outline" className="ml-auto">
                            {lightColors}
                          </Badge>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => setFilterStatus("dark")} isActive={filterStatus === "dark"}>
                          <XCircle className="h-4 w-4" />
                          <span>Dark Colors</span>
                          <Badge variant="outline" className="ml-auto">
                            {darkColors}
                          </Badge>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup>
                  <SidebarGroupLabel>Sort By</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => handleSort("name")} isActive={sortField === "name"}>
                          <ArrowUpDown className="h-4 w-4" />
                          <span>Name</span>
                          {sortField === "name" && (
                            <Badge variant="secondary" className="ml-auto">
                              {sortOrder === "asc" ? "A-Z" : "Z-A"}
                            </Badge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => handleSort("value")} isActive={sortField === "value"}>
                          <ArrowUpDown className="h-4 w-4" />
                          <span>Value</span>
                          {sortField === "value" && (
                            <Badge variant="secondary" className="ml-auto">
                              {sortOrder === "asc" ? "A-Z" : "Z-A"}
                            </Badge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => handleSort("createdAt")} isActive={sortField === "createdAt"}>
                          <Calendar className="h-4 w-4" />
                          <span>Date Created</span>
                          {sortField === "createdAt" && (
                            <Badge variant="secondary" className="ml-auto">
                              {sortOrder === "asc" ? "Oldest" : "Newest"}
                            </Badge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup>
                  <SidebarGroupLabel>Actions</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={handleCreateColor}>
                          <PlusCircle className="h-4 w-4" />
                          <span>New Color</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={resetFilters}>
                          <RefreshCw className="h-4 w-4" />
                          <span>Reset Filters</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      {selectedItems.length > 0 && (
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            onClick={() => setBulkDeleteModalOpen(true)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete Selected ({selectedItems.length})</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>

              <SidebarFooter>
                <div className="p-4">
                  <ColorStats totalColors={totalColors} lightColors={lightColors} darkColors={darkColors} compact />
                </div>
              </SidebarFooter>
            </Sidebar>
          </div>

          <SidebarInset>
            <div className="h-full flex flex-col">
              <div className="p-4 flex items-center justify-between border-b">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold">
                    {filterStatus === "all" && "All Colors"}
                    {filterStatus === "light" && "Light Colors"}
                    {filterStatus === "dark" && "Dark Colors"}
                  </h1>
                  <Badge variant="outline" className="rounded-md">
                    {filteredData.length} {filteredData.length === 1 ? "color" : "colors"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  {selectedItems.length > 0 && (
                    <ColorBulkActions
                      selectedCount={selectedItems.length}
                      onDelete={() => setBulkDeleteModalOpen(true)}
                      onSelectAll={toggleSelectAll}
                      onClearSelection={() => setSelectedItems([])}
                      allSelected={selectedItems.length === filteredData.length}
                    />
                  )}

                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      className="rounded-r-none"
                      onClick={() => setViewMode("grid")}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      className="rounded-l-none"
                      onClick={() => setViewMode("list")}
                    >
                      <LayoutList className="h-4 w-4" />
                    </Button>
                  </div>

                  <ColorCreateButton onClick={handleCreateColor} />
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4">
                {filteredData.length === 0 ? (
                  <ColorEmptyState searchQuery={searchQuery} onReset={resetFilters} onCreate={handleCreateColor} />
                ) : (
                  <div className="h-full">
                    {viewMode === "grid" ? (
                      <ColorGrid
                        data={filteredData}
                        onSelect={handleColorSelect}
                        selectedItems={selectedItems}
                        onToggleSelect={toggleItemSelection}
                        onEdit={handleEditColor}
                        onDelete={(id) => {
                          const color = filteredData.find((c) => c.id === id)
                          if (color) {
                            setSelectedColor(color)
                            setDeleteModalOpen(true)
                          }
                        }}
                      />
                    ) : (
                      <ColorList
                        data={filteredData}
                        onSelect={handleColorSelect}
                        selectedItems={selectedItems}
                        onToggleSelect={toggleItemSelection}
                        onEdit={handleEditColor}
                        onDelete={(id) => {
                          const color = filteredData.find((c) => c.id === id)
                          if (color) {
                            setSelectedColor(color)
                            setDeleteModalOpen(true)
                          }
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </SidebarInset>
        </div>

        {selectedColor && (
          <ColorDetail
            color={selectedColor}
            onClose={() => setSelectedColor(null)}
            onEdit={() => handleEditColor(selectedColor.id)}
            onDelete={() => setDeleteModalOpen(true)}
          />
        )}
      </SidebarProvider>
    </>
  )
}
