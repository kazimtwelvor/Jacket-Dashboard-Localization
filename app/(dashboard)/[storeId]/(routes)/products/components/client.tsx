// Client component for managing products in the admin dashboard
"use client"

import type React from "react"

import { Plus, Package, BarChart3, List, Filter, Search, RefreshCw, CheckCircle, Users, Upload } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { ApiList } from "@/components/ui/api-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import type { ProductColumn } from "../types"
import { type TrashProductColumn, trashColumns } from "./trash-columns"
import { EnhancedProductList } from "./enhanced-product-list"
import { DataTable } from "@/components/ui/data-table"
import { TrashDataTable } from "./trash-data-table"

interface ProductsClientProps {
  data: ProductColumn[]
  trashedData: TrashProductColumn[]
  topCreators: { name: string; count: number }[]
  isOwner?: boolean
}

export const ProductsClient: React.FC<ProductsClientProps> = ({ data, trashedData, topCreators, isOwner = false }) => {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("published")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<number | "all">(20)
  const [isBulkPublishing, setIsBulkPublishing] = useState(false)



  // Filter products based on status
  const publishedProducts = data.filter((product) => product.isPublished && !product.isArchived)
  const archivedProducts = data.filter((product) => product.isArchived)

  // Count for each status
  const allCount = data.length
  const publishedCount = publishedProducts.length
  const archivedCount = archivedProducts.length
  const trashCount = trashedData.length

  // Calculate statistics
  const totalValue = data.reduce((sum, product) => {
    const price = Number.parseFloat(product.price.replace(/[^0-9.-]+/g, ""))
    return sum + price
  }, 0)

  const averagePrice = allCount > 0 ? totalValue / allCount : 0

  const storeId = params?.storeId as string

  // Bulk publish handler
  const handleBulkPublish = async () => {
    if (!isOwner) {
      toast.error("Only store owners can bulk publish products")
      return
    }

    try {
      setIsBulkPublishing(true)
      
      const response = await fetch(`/api/${storeId}/products/bulk-publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(errorData || "Failed to bulk publish products")
      }

      const result = await response.json()
      toast.success(result.message || `Successfully published ${result.count || 0} products`)
      router.refresh()
    } catch (error) {
      console.error("Error bulk publishing products:", error)
      toast.error(error instanceof Error ? error.message : "Failed to bulk publish products")
    } finally {
      setIsBulkPublishing(false)
    }
  }

  const handleItemsPerPageChange = (value: string) => {
    if (value === "all") {
      setItemsPerPage("all")
    } else {
      setItemsPerPage(Number(value))
    }
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  // Filter products based on search term and active tab
  const getFilteredProductsForTab = () => {
    let listToFilter: ProductColumn[] | TrashProductColumn[] = []
    if (activeTab === "published") {
      listToFilter = publishedProducts
    } else if (activeTab === "archived") {
      listToFilter = archivedProducts
    } else if (activeTab === "trash") {
      listToFilter = trashedData // Trash tab uses DataTable, not this pagination logic
    }
    return listToFilter.filter(
      (product) => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    ) as ProductColumn[] // Cast assuming trash will be handled separately by DataTable
  }

  const filteredProducts = getFilteredProductsForTab()

  // Pagination logic
  const totalItems = filteredProducts.length
  let currentDisplayProducts: ProductColumn[]
  let displayTotalPages: number
  let displayStartIndex: number = 0
  let displayEndIndex: number = 0
  let showPaginationControls: boolean

  if (itemsPerPage === "all") {
    currentDisplayProducts = filteredProducts
    displayTotalPages = 1
    displayStartIndex = 0
    displayEndIndex = totalItems
    showPaginationControls = false
  } else {
    const numericItemsPerPage = Number(itemsPerPage)
    displayTotalPages = totalItems > 0 ? Math.ceil(totalItems / numericItemsPerPage) : 1
    
    // Adjust currentPage if it's out of bounds
    const safeCurrentPage = Math.min(currentPage, displayTotalPages) || 1;
    if (currentPage !== safeCurrentPage) {
        setCurrentPage(safeCurrentPage); // This might cause an extra render, can be optimized if needed
    }

    displayStartIndex = (safeCurrentPage - 1) * numericItemsPerPage
    displayEndIndex = displayStartIndex + numericItemsPerPage
    currentDisplayProducts = filteredProducts.slice(displayStartIndex, displayEndIndex)
    showPaginationControls = displayTotalPages > 1
  }
  
   useEffect(() => {
    if (itemsPerPage !== "all") {
        const numericItemsPerPage = Number(itemsPerPage);
        const newTotalPages = totalItems > 0 ? Math.ceil(totalItems / numericItemsPerPage) : 1;
        if (currentPage > newTotalPages) {
            setCurrentPage(newTotalPages);
        }
    }
  }, [totalItems, itemsPerPage, currentPage]);


  const renderPagination = () => {
    if (totalItems === 0 && activeTab !== "trash") { // Don't show pagination if no items, except for trash tab DataTable
        return <div className="text-center py-4 text-sm text-muted-foreground">No products found.</div>;
    }
    if (activeTab === "trash") return null; // DataTable in trash handles its own pagination

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Items per page:</span>
          <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder={itemsPerPage.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="all">Show All</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {showPaginationControls && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  aria-disabled={currentPage === 1}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, displayTotalPages) }, (_, i) => {
                // Logic to show pages around current page or start/end
                let pageNumber: number;
                if (displayTotalPages <= 5) {
                    pageNumber = i + 1;
                } else {
                    if (currentPage <= 3) {
                        pageNumber = i + 1;
                    } else if (currentPage >= displayTotalPages - 2) {
                        pageNumber = displayTotalPages - 4 + i;
                    } else {
                        pageNumber = currentPage - 2 + i;
                    }
                }
                if (pageNumber > 0 && pageNumber <= displayTotalPages) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNumber)}
                        isActive={currentPage === pageNumber}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                return null;
              })}
              {displayTotalPages > 5 && currentPage < displayTotalPages -2 && <PaginationEllipsis />}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, displayTotalPages))}
                  className={currentPage === displayTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  aria-disabled={currentPage === displayTotalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
        <div className="text-sm text-muted-foreground order-first sm:order-last">
          Showing {totalItems > 0 ? displayStartIndex + 1 : 0}-{Math.min(displayEndIndex, totalItems)} of {totalItems}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{allCount}</div>
              <Package className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{publishedCount}</div>
              <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30 border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">Top Creators</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-3">
            {topCreators && topCreators.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="text-lg font-bold truncate">{topCreators[0].name}</div>
                    <div className="text-xs text-muted-foreground">{topCreators[0].count} products</div>
                  </div>
                  <Users className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                </div>
                {topCreators.length > 1 && (
                  <div className="pt-1 border-t border-amber-200 dark:border-amber-800/50">
                    <div className="grid grid-cols-2 gap-2">
                      {topCreators.slice(1, 3).map((creator, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400 text-[10px] font-medium">
                            {index + 2}
                          </div>
                          <div className="flex flex-col">
                            <div className="text-xs font-medium truncate">{creator.name}</div>
                            <div className="text-[10px] text-muted-foreground">{creator.count} products</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between h-full">
                <div className="text-sm text-muted-foreground">No creators found</div>
                <Users className="h-5 w-5 text-amber-500/50 dark:text-amber-400/50" />
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400">Average Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">${averagePrice.toFixed(2)}</div>
              <BarChart3 className="h-5 w-5 text-purple-500 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <Card className="border-none shadow-md">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Products</CardTitle>
              <CardDescription>Manage your store products</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isOwner && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleBulkPublish}
                        disabled={isBulkPublishing}
                        variant="outline"
                        className="border-green-200 hover:bg-green-50 hover:border-green-300 text-green-700"
                      >
                        {isBulkPublishing ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Publishing...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Bulk Publish
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Publish all unpublished draft products (Owner only)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Button
                onClick={() => router.push(`/${storeId}/products/new`)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Add New
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(newTab) => { setActiveTab(newTab); setCurrentPage(1); }} className="w-full">
            <div className="flex flex-col items-start gap-4 mb-6">
              <TabsList className="grid grid-cols-2 sm:grid-cols-3 w-auto">
                <TabsTrigger value="published" className="flex justify-center sm:justify-between px-4">
                  <span>Published</span>
                  <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">
                    {publishedCount}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="archived" className="flex justify-center sm:justify-between px-4">
                  <span>Archived</span>
                  <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">
                    {archivedCount}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="trash" className="flex justify-center sm:justify-between px-4">
                  <span>Trash</span>
                  {trashCount > 0 && (
                    <Badge variant="destructive" className="ml-2 hidden sm:inline-flex">
                      {trashCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {activeTab !== "trash" && (
                <div className="flex items-center w-full gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products by name, SKU, category or creator..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      className="pl-9 w-full"
                      aria-label="Search products"
                    />
                  </div>
                  <div className="flex gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => router.refresh()} aria-label="Refresh list">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Refresh list</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              )}
            </div>

            <TabsContent value="published" className="space-y-4">
              <EnhancedProductList products={currentDisplayProducts} storeId={storeId} searchTerm={searchTerm} />
              {renderPagination()}
            </TabsContent>

            <TabsContent value="archived" className="space-y-4">
              <EnhancedProductList products={currentDisplayProducts} storeId={storeId} searchTerm={searchTerm} />
              {renderPagination()}
            </TabsContent>

            <TabsContent value="trash" className="space-y-4">
              {trashedData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-gray-950 rounded-lg shadow-sm border">
                  <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">Trash is empty</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Items you delete will appear here for 30 days before being permanently removed.
                  </p>
                </div>
              ) : (
                <>
                  <div className="rounded-md bg-amber-50 p-4 dark:bg-amber-950/50 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-amber-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">Attention</h3>
                        <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                          <p>
                            Items in trash will be automatically deleted after 30 days. You can restore items or delete
                            them permanently.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <TrashDataTable columns={trashColumns} data={trashedData} />
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {activeTab !== "trash" && (
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold">API</CardTitle>
            <CardDescription>API Calls for Products</CardDescription>
          </CardHeader>
          <CardContent>
            <ApiList entityName="products" entityIdName="productId" />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
