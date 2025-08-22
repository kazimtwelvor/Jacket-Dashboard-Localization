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
import { SizeList } from "./size-list"
import { SizeGrid } from "./size-grid"
import { SizeDetail } from "./size-detail"
import { SizeStats } from "./size-stats"
import { SizeBulkActions } from "./size-bulk-actions"
import { SizeEmptyState } from "./size-empty-state"
import { SizeCreateButton } from "./size-create-button"
import { Badge } from "@/components/ui/badge"
import { AlertModal } from "@/components/modals/alert-modal"
import { toast } from "react-hot-toast"
import axios from "axios"
import type { SizeColumn } from "./columns"

interface SizesViewProps {
  data: SizeColumn[]
}

export const SizesView = ({ data }: SizesViewProps) => {
  const router = useRouter()
  const params = useParams()

  // State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filteredData, setFilteredData] = useState<SizeColumn[]>(data)
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedSize, setSelectedSize] = useState<SizeColumn | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sortField, setSortField] = useState<"name" | "value" | "createdAt">("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterStatus, setFilterStatus] = useState<"all" | "common" | "special">("all")
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false)

  // Calculate stats
  const totalSizes = filteredData.length
  const commonSizes = filteredData.filter((size) =>
    ["S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL"].includes(size.value),
  ).length
  const specialSizes = totalSizes - commonSizes

  // Filter data based on status
  useEffect(() => {
    let result = [...data]

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (size) =>
          size.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          size.value.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply status filter
    if (filterStatus === "common") {
      result = result.filter((size) => ["S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL"].includes(size.value))
    } else if (filterStatus === "special") {
      result = result.filter((size) => !["S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL"].includes(size.value))
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

  // Handle size selection
  const handleSizeSelect = (size: SizeColumn) => {
    setSelectedSize(size)
  }

  // Handle size creation
  const handleCreateSize = () => {
    router.push(`/${params.storeId}/sizes/new`)
  }

  // Handle size edit
  const handleEditSize = (id: string) => {
    router.push(`/${params.storeId}/sizes/${id}`)
  }

  // Handle size delete
  const handleDeleteSize = async () => {
    if (!selectedSize) return

    try {
      setIsLoading(true)
      await axios.delete(`/api/${params.storeId}/sizes/${selectedSize.id}`)
      router.refresh()
      toast.success("Size deleted successfully.")
      setSelectedSize(null)
    } catch (error) {
      toast.error("Make sure you removed all products using this size first.")
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
      await Promise.all(selectedItems.map((id) => axios.delete(`/api/${params.storeId}/sizes/${id}`)))
      router.refresh()
      toast.success(`${selectedItems.length} sizes deleted successfully.`)
      setSelectedItems([])
    } catch (error) {
      toast.error("Failed to delete some sizes. Make sure they don't have products.")
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
        onConfirm={handleDeleteSize}
        loading={isLoading}
      />

      <AlertModal
        isOpen={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
        loading={isLoading}
        title="Delete Selected Sizes"
        description={`Are you sure you want to delete ${selectedItems.length} sizes? This action cannot be undone.`}
      />

      <SidebarProvider>
        <div className="flex h-full">
          <div className="hidden md:block w-[240px] flex-shrink-0">
            <Sidebar variant="inset" collapsible="icon">
              <SidebarHeader>
                <div className="flex items-center justify-between px-4 py-2">
                  <h2 className="text-lg font-semibold">Sizes</h2>
                  <SidebarTrigger />
                </div>
                <div className="px-2 pb-2">
                  <SidebarInput
                    placeholder="Search sizes..."
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
                          <span>All Sizes</span>
                          <Badge variant="outline" className="ml-auto">
                            {data.length}
                          </Badge>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={() => setFilterStatus("common")}
                          isActive={filterStatus === "common"}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Common Sizes</span>
                          <Badge variant="outline" className="ml-auto">
                            {commonSizes}
                          </Badge>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={() => setFilterStatus("special")}
                          isActive={filterStatus === "special"}
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Special Sizes</span>
                          <Badge variant="outline" className="ml-auto">
                            {specialSizes}
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
                        <SidebarMenuButton onClick={handleCreateSize}>
                          <PlusCircle className="h-4 w-4" />
                          <span>New Size</span>
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
                  <SizeStats totalSizes={totalSizes} commonSizes={commonSizes} specialSizes={specialSizes} compact />
                </div>
              </SidebarFooter>
            </Sidebar>
          </div>

          <SidebarInset>
            <div className="h-full flex flex-col">
              <div className="p-4 flex items-center justify-between border-b">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold">
                    {filterStatus === "all" && "All Sizes"}
                    {filterStatus === "common" && "Common Sizes"}
                    {filterStatus === "special" && "Special Sizes"}
                  </h1>
                  <Badge variant="outline" className="rounded-md">
                    {filteredData.length} {filteredData.length === 1 ? "size" : "sizes"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  {selectedItems.length > 0 && (
                    <SizeBulkActions
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

                  <SizeCreateButton onClick={handleCreateSize} />
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4">
                {filteredData.length === 0 ? (
                  <SizeEmptyState searchQuery={searchQuery} onReset={resetFilters} onCreate={handleCreateSize} />
                ) : (
                  <div className="h-full">
                    {viewMode === "grid" ? (
                      <SizeGrid
                        data={filteredData}
                        onSelect={handleSizeSelect}
                        selectedItems={selectedItems}
                        onToggleSelect={toggleItemSelection}
                        onEdit={handleEditSize}
                        onDelete={(id) => {
                          const size = filteredData.find((c) => c.id === id)
                          if (size) {
                            setSelectedSize(size)
                            setDeleteModalOpen(true)
                          }
                        }}
                      />
                    ) : (
                      <SizeList
                        data={filteredData}
                        onSelect={handleSizeSelect}
                        selectedItems={selectedItems}
                        onToggleSelect={toggleItemSelection}
                        onEdit={handleEditSize}
                        onDelete={(id) => {
                          const size = filteredData.find((c) => c.id === id)
                          if (size) {
                            setSelectedSize(size)
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

        {selectedSize && (
          <SizeDetail
            size={selectedSize}
            onClose={() => setSelectedSize(null)}
            onEdit={() => handleEditSize(selectedSize.id)}
            onDelete={() => setDeleteModalOpen(true)}
          />
        )}
      </SidebarProvider>
    </>
  )
}
