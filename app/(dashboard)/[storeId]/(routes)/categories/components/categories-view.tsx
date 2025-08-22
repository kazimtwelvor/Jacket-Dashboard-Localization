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
  Tag,
  PlusCircle,
  Layers,
  LayoutList,
  ArrowUpDown,
  RefreshCw,
  CheckCircle2,
  XCircle,
  CircleSlash,
  Calendar,
  Trash2,
} from "lucide-react"
import { CategoryList } from "./category-list"
import { CategoryGrid } from "./category-grid"
import { CategoryDetail } from "./category-detail"
import { CategoryStats } from "./category-stats"
import { CategoryBulkActions } from "./category-bulk-actions"
import { CategoryEmptyState } from "./category-empty-state"
import { CategoryCreateButton } from "./category-create-button"
import { Badge } from "@/components/ui/badge"
import { AlertModal } from "@/components/modals/alert-modal"
import { toast } from "react-hot-toast"
import axios from "axios"
import type { CategoryColumn } from "../types"

interface CategoriesViewProps {
  data: CategoryColumn[]
}

export const CategoriesView = ({ data }: CategoriesViewProps) => {
  const router = useRouter()
  const params = useParams()

  // State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filteredData, setFilteredData] = useState<CategoryColumn[]>(data)
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryColumn | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sortField, setSortField] = useState<"name" | "productCount" | "createdAt">("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive" | "with-products" | "without-products"
  >("all")
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false)

  // Calculate stats
  const totalCategories = filteredData.length
  const totalProducts = filteredData.reduce((sum, category) => sum + category.productCount, 0)
  const categoriesWithProducts = filteredData.filter((category) => category.productCount > 0).length
  const emptyCategories = filteredData.filter((category) => category.productCount === 0).length
  const activeCategories = filteredData.filter((category) => category.isActive !== false).length
  const inactiveCategories = filteredData.filter((category) => category.isActive === false).length

  // Filter data based on status
  useEffect(() => {
    let result = [...data]

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (category) =>
          category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (category.billboardLabel && category.billboardLabel.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Apply status filter
    if (filterStatus === "active") {
      result = result.filter((category) => category.isActive !== false)
    } else if (filterStatus === "inactive") {
      result = result.filter((category) => category.isActive === false)
    } else if (filterStatus === "with-products") {
      result = result.filter((category) => category.productCount > 0)
    } else if (filterStatus === "without-products") {
      result = result.filter((category) => category.productCount === 0)
    }

    // Apply sort
    result = result.sort((a, b) => {
      if (sortField === "name") {
        return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      } else if (sortField === "productCount") {
        return sortOrder === "asc" ? a.productCount - b.productCount : b.productCount - a.productCount
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
  const handleSort = (field: "name" | "productCount" | "createdAt") => {
    const newOrder = field === sortField && sortOrder === "asc" ? "desc" : "asc"
    setSortField(field)
    setSortOrder(newOrder)
  }

  // Handle category selection
  const handleCategorySelect = (category: CategoryColumn) => {
    setSelectedCategory(category)
  }

  // Handle category creation
  const handleCreateCategory = () => {
    router.push(`/${params.storeId}/categories/new`)
  }

  // Handle category edit
  const handleEditCategory = (id: string) => {
    router.push(`/${params.storeId}/categories/${id}`)
  }

  // Handle category delete
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return

    try {
      setIsLoading(true)
      await axios.delete(`/api/${params.storeId}/categories/${selectedCategory.id}`)
      router.refresh()
      toast.success("Category deleted successfully.")
      setSelectedCategory(null)
    } catch (error) {
      toast.error("Make sure you removed all products using this category first.")
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
      await Promise.all(selectedItems.map((id) => axios.delete(`/api/${params.storeId}/categories/${id}`)))
      router.refresh()
      toast.success(`${selectedItems.length} categories deleted successfully.`)
      setSelectedItems([])
    } catch (error) {
      toast.error("Failed to delete some categories. Make sure they don't have products.")
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
        onConfirm={handleDeleteCategory}
        loading={isLoading}
      />

      <AlertModal
        isOpen={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
        loading={isLoading}
        title="Delete Selected Categories"
        description={`Are you sure you want to delete ${selectedItems.length} categories? This action cannot be undone.`}
      />

      <SidebarProvider>
        <div className="flex h-full">
          <div className="hidden md:block w-[240px] flex-shrink-0">
            <Sidebar variant="inset" collapsible="icon">
              <SidebarHeader>
                <div className="flex items-center justify-between px-4 py-2">
                  <h2 className="text-lg font-semibold">Categories</h2>
                  <SidebarTrigger />
                </div>
                <div className="px-2 pb-2">
                  <SidebarInput
                    placeholder="Search categories..."
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
                          <span>All Categories</span>
                          <Badge variant="outline" className="ml-auto">
                            {data.length}
                          </Badge>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={() => setFilterStatus("active")}
                          isActive={filterStatus === "active"}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Active</span>
                          <Badge variant="outline" className="ml-auto">
                            {activeCategories}
                          </Badge>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={() => setFilterStatus("inactive")}
                          isActive={filterStatus === "inactive"}
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Inactive</span>
                          <Badge variant="outline" className="ml-auto">
                            {inactiveCategories}
                          </Badge>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={() => setFilterStatus("with-products")}
                          isActive={filterStatus === "with-products"}
                        >
                          <Tag className="h-4 w-4" />
                          <span>With Products</span>
                          <Badge variant="outline" className="ml-auto">
                            {categoriesWithProducts}
                          </Badge>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={() => setFilterStatus("without-products")}
                          isActive={filterStatus === "without-products"}
                        >
                          <CircleSlash className="h-4 w-4" />
                          <span>Empty Categories</span>
                          <Badge variant="outline" className="ml-auto">
                            {emptyCategories}
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
                        <SidebarMenuButton
                          onClick={() => handleSort("productCount")}
                          isActive={sortField === "productCount"}
                        >
                          <ArrowUpDown className="h-4 w-4" />
                          <span>Product Count</span>
                          {sortField === "productCount" && (
                            <Badge variant="secondary" className="ml-auto">
                              {sortOrder === "asc" ? "Low-High" : "High-Low"}
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
                        <SidebarMenuButton onClick={handleCreateCategory}>
                          <PlusCircle className="h-4 w-4" />
                          <span>New Category</span>
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
                  <CategoryStats
                    totalCategories={totalCategories}
                    totalProducts={totalProducts}
                    categoriesWithProducts={categoriesWithProducts}
                    emptyCategories={emptyCategories}
                    compact
                  />
                </div>
              </SidebarFooter>
            </Sidebar>
          </div>

          <SidebarInset>
            <div className="h-full flex flex-col">
              <div className="p-4 flex items-center justify-between border-b">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold">
                    {filterStatus === "all" && "All Categories"}
                    {filterStatus === "active" && "Active Categories"}
                    {filterStatus === "inactive" && "Inactive Categories"}
                    {filterStatus === "with-products" && "Categories with Products"}
                    {filterStatus === "without-products" && "Empty Categories"}
                  </h1>
                  <Badge variant="outline" className="rounded-md">
                    {filteredData.length} {filteredData.length === 1 ? "category" : "categories"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  {selectedItems.length > 0 && (
                    <CategoryBulkActions
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

                  <CategoryCreateButton onClick={handleCreateCategory} />
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4">
                {filteredData.length === 0 ? (
                  <CategoryEmptyState
                    searchQuery={searchQuery}
                    onReset={resetFilters}
                    onCreate={handleCreateCategory}
                  />
                ) : (
                  <div className="h-full">
                    {viewMode === "grid" ? (
                      <CategoryGrid
                        data={filteredData}
                        onSelect={handleCategorySelect}
                        selectedItems={selectedItems}
                        onToggleSelect={toggleItemSelection}
                        onEdit={handleEditCategory}
                        onDelete={(id) => {
                          const category = filteredData.find((c) => c.id === id)
                          if (category) {
                            setSelectedCategory(category)
                            setDeleteModalOpen(true)
                          }
                        }}
                      />
                    ) : (
                      <CategoryList
                        data={filteredData}
                        onSelect={handleCategorySelect}
                        selectedItems={selectedItems}
                        onToggleSelect={toggleItemSelection}
                        onEdit={handleEditCategory}
                        onDelete={(id) => {
                          const category = filteredData.find((c) => c.id === id)
                          if (category) {
                            setSelectedCategory(category)
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

        {selectedCategory && (
          <CategoryDetail
            category={selectedCategory}
            onClose={() => setSelectedCategory(null)}
            onEdit={() => handleEditCategory(selectedCategory.id)}
            onDelete={() => setDeleteModalOpen(true)}
          />
        )}
      </SidebarProvider>
    </>
  )
}
