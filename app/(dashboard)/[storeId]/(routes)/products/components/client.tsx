"use client"

import type React from "react"

import { Plus, Package, List, Filter, Search, X, CheckCircle, Upload, RefreshCw, Download, FileText, File, Upload as UploadIcon } from "lucide-react"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
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
import { TrashDataTable } from "./trash-data-table"

interface ProductsClientProps {
  storeId: string
  isOwner?: boolean
  isAdmin?: boolean
  initialCounts: {
    published: number
    archived: number
    trash: number
  }
}

export const ProductsClient: React.FC<ProductsClientProps> = ({ storeId, isOwner = false, isAdmin = false, initialCounts }) => {

  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("published")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<number | "all">(20)
  const [isBulkPublishing, setIsBulkPublishing] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<ProductColumn[]>([])
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [updateExisting, setUpdateExisting] = useState(false)
  const [validateOnly, setValidateOnly] = useState(false)

  const [products, setProducts] = useState<ProductColumn[]>([])
  const [trashedProducts, setTrashedProducts] = useState<TrashProductColumn[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNextPage: false,
    hasPreviousPage: false
  })
  const [counts, setCounts] = useState(initialCounts)

  const allCount = counts.published + counts.archived
  const publishedCount = counts.published
  const archivedCount = counts.archived
  const trashCount = counts.trash

  const totalValue = products.reduce((sum, product) => {
    const price = Number.parseFloat(product.price.replace(/[^0-9.-]+/g, ""))
    return sum + price
  }, 0)

  const averagePrice = products.length > 0 ? totalValue / products.length : 0

  const fetchProducts = async (page: number = 1, status: string = activeTab, search?: string) => {
    try {
      setLoading(true)

      const limit = typeof itemsPerPage === "number" ? itemsPerPage : 1000
      let apiUrl = `/api/${storeId}/products?page=${page}&limit=${limit}&admin=true`

      if (search) {
        apiUrl += `&search=${encodeURIComponent(search)}`
      }

      if (status === "trash") {
        apiUrl += '&trash=true'
      } else {
        apiUrl += `&status=${status}`
      }

      const response = await fetch(apiUrl)
      if (response.ok) {
        const result = await response.json()

        const formattedProducts = result.products.map((product: any) => ({
          id: product.id,
          name: product.name,
          isFeatured: product.isFeatured,
          isArchived: product.isArchived,
          isPublished: product.isPublished,
          price: product.price,
          salePrice: product.salePrice,
          category: product.categoryData && typeof product.categoryData === 'object' && product.categoryData !== null
            ? `${product.categoryData.material || ''} ${product.categoryData.style || ''}`.trim() || "Uncategorized"
            : "Uncategorized",
          sku: product.sku,
          stockStatus: product.stockStatus || "instock",
          sizes: product.sizeDetails
            ? JSON.parse(JSON.stringify(product.sizeDetails))
              .map((size: any) => size.name)
              .join(", ")
            : "N/A",
          colors: product.colorDetails
            ? JSON.parse(JSON.stringify(product.colorDetails))
              .map((color: any) => color.name)
              .join(", ")
            : "N/A",
          imageUrl: product.images && product.images.length > 0 ? product.images[0].url : "/placeholder.svg",
          createdAt: new Date(product.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          createdByName: product.createdByName || "Unknown",
          updatedByName: product.updatedByName || undefined,
          updatedAt: product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : undefined,
          publishedAt: new Date(product.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          description: product.description || "",
        }))

        if (status === "trash") {
          setTrashedProducts(formattedProducts)
        } else {
          setProducts(formattedProducts)
        }

        setPagination({
          currentPage: result.pagination.currentPage,
          totalPages: result.pagination.totalPages,
          totalProducts: result.pagination.totalProducts,
          hasNextPage: result.pagination.hasNextPage,
          hasPreviousPage: result.pagination.hasPreviousPage
        })

        setCounts(prev => ({
          ...prev,
          [status === "trash" ? "trash" : status]: result.pagination.totalProducts
        }))
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true)
      try {
        await fetchProducts(1, "published")
      } catch (error) {
        console.error('Error loading initial data:', error)
      } finally {
        setInitialLoading(false)
      }
    }

    loadInitialData()
  }, [storeId])

  useEffect(() => {
    if (!initialLoading) {
      setCurrentPage(1)
      fetchProducts(1, activeTab)
    }
  }, [activeTab])

  useEffect(() => {
    if (!initialLoading) {
      fetchProducts(currentPage, activeTab)
    }
  }, [currentPage, itemsPerPage])

  const searchProducts = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setIsSearchActive(false)
      fetchProducts(currentPage, activeTab)
      return
    }

    setIsSearching(true)
    try {
      const isTrashSearch = activeTab === "trash"
      let apiUrl = `/api/${storeId}/products?search=${encodeURIComponent(searchQuery)}&admin=true`

      if (isTrashSearch) {
        apiUrl += '&trash=true'
      } else {
        apiUrl += `&status=${activeTab}`
      }

      const response = await fetch(apiUrl)
      if (response.ok) {
        const result = await response.json()
        const formattedResults = result.products.map((product: any) => ({
          id: product.id,
          name: product.name,
          isFeatured: product.isFeatured,
          isArchived: product.isArchived,
          isPublished: product.isPublished,
          price: product.price,
          salePrice: product.salePrice,
          category: product.categoryData && typeof product.categoryData === 'object' && product.categoryData !== null
            ? `${product.categoryData.material || ''} ${product.categoryData.style || ''}`.trim() || "Uncategorized"
            : "Uncategorized",
          sku: product.sku,
          stockStatus: product.stockStatus || "instock",
          sizes: product.sizeDetails
            ? JSON.parse(JSON.stringify(product.sizeDetails))
              .map((size: any) => size.name)
              .join(", ")
            : "N/A",
          colors: product.colorDetails
            ? JSON.parse(JSON.stringify(product.colorDetails))
              .map((color: any) => color.name)
              .join(", ")
            : "N/A",
          imageUrl: product.images && product.images.length > 0 ? product.images[0].url : "/placeholder.svg",
          createdAt: new Date(product.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          createdByName: product.createdByName || "Unknown",
          updatedByName: product.updatedByName || undefined,
          updatedAt: product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : undefined,
          publishedAt: new Date(product.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          description: product.description || "",
          ...(isTrashSearch && product.deletedAt ? {
            deletedAt: new Date(product.deletedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          } : {}),
        }))
        console.log(`Setting search results for ${isTrashSearch ? 'trash' : 'regular'} search:`, formattedResults.length, 'products')
        setSearchResults(formattedResults)
        setIsSearchActive(true)
      } else {
        console.error('Search failed:', response.statusText)
        setSearchResults([])
        setIsSearchActive(false)
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
      setIsSearchActive(false)
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    setSearchResults([])
    setIsSearchActive(false)
  }, [activeTab])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchProducts(searchTerm)
      } else {
        console.log('Clearing search results - no search term')
        setSearchResults([])
        setIsSearchActive(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, storeId, activeTab])

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
      toast.error(error instanceof Error ? error.message : "Failed to bulk publish products")
    } finally {
      setIsBulkPublishing(false)
    }
  }

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      setIsExporting(true)
      toast.loading(`Preparing ${format.toUpperCase()} export...`)

      const response = await fetch(`/api/${storeId}/products/export?format=${format}`)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `Failed to export ${format.toUpperCase()}`)
      }

      // Create download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      const filename = `products-export-${new Date().toISOString().split('T')[0]}.${format}`
      link.download = filename

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.dismiss()
      toast.success(`Products exported successfully as ${format.toUpperCase()}`)
    } catch (error) {
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : `Failed to export ${format.toUpperCase()}`)
    } finally {
      setIsExporting(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const fileName = file.name.toLowerCase()
      if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx')) {
        toast.error('Please select a CSV or XLSX file')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to import')
      return
    }

    try {
      setIsImporting(true)
      toast.loading('Importing products...')

      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('updateExisting', updateExisting.toString())
      formData.append('validateOnly', validateOnly.toString())

      const response = await fetch(`/api/${storeId}/products/import-v2`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Import failed')
      }

      toast.dismiss()

      if (validateOnly) {
        toast.success(`Validation complete. ${result.validRows} valid rows, ${result.errors?.length || 0} errors found.`)
        if (result.errors && result.errors.length > 0) {
          console.log('Validation errors:', result.errors)
        }
      } else {
        toast.success(result.message || 'Products imported successfully')
        router.refresh()
      }

      // Reset form
      setSelectedFile(null)
      setUpdateExisting(false)
      setValidateOnly(false)
      setImportDialogOpen(false)
    } catch (error) {
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : 'Import failed')
    } finally {
      setIsImporting(false)
    }
  }

  const downloadTemplate = (format: 'csv' | 'xlsx') => {
    const link = document.createElement('a')
    link.href = `/import-templates/products-import-template.${format}`
    link.download = `products-import-template.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleItemsPerPageChange = (value: string) => {
    if (value === "all") {
      setItemsPerPage("all")
    } else {
      setItemsPerPage(Number(value))
    }
    setCurrentPage(1)
  }

  const getFilteredProductsForTab = () => {
    if (isSearchActive || searchTerm.trim()) {
      console.log(`Using API search results for ${activeTab} tab:`, searchResults.length, 'products (search term: "${searchTerm}")')
      return searchResults
    }

    if (activeTab === "trash") {
      return trashedProducts as ProductColumn[]
    } else {
      return products
    }
  }

  const filteredProducts = getFilteredProductsForTab()

  const totalItems = isSearchActive ? filteredProducts.length : pagination.totalProducts
  const currentDisplayProducts = filteredProducts
  const displayTotalPages = isSearchActive ? Math.ceil(filteredProducts.length / (typeof itemsPerPage === "number" ? itemsPerPage : 20)) : pagination.totalPages
  const displayStartIndex = isSearchActive ? 0 : (pagination.currentPage - 1) * (typeof itemsPerPage === "number" ? itemsPerPage : 20)
  const displayEndIndex = isSearchActive ? filteredProducts.length : Math.min(displayStartIndex + (typeof itemsPerPage === "number" ? itemsPerPage : 20), totalItems)
  const showPaginationControls = !isSearchActive && displayTotalPages > 1



  const renderPagination = () => {
    if (totalItems === 0 && activeTab !== "trash") {
      return null
    }


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
        {totalItems > 0 && (
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
              {displayTotalPages > 5 && currentPage < displayTotalPages - 2 && <PaginationEllipsis />}
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
          {totalItems > 0 ? (
            <>
              Showing {displayStartIndex + 1} to {Math.min(displayEndIndex, totalItems)} of {totalItems} {activeTab === "trash" ? "deleted products" : "products"}
            </>
          ) : (
            "No products found"
          )}
        </div>
      </div>
    )
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-sm text-muted-foreground">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>


      <Card className="border-none shadow-md">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Products</CardTitle>
              <CardDescription>Manage your store products</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {(isOwner || isAdmin) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={isExporting || products.length === 0}
                      className="border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950 hover:border-purple-300 dark:hover:border-purple-700 text-purple-700 dark:text-purple-300"
                    >
                      {isExporting ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport('csv')} disabled={isExporting}>
                      <FileText className="mr-2 h-4 w-4" />
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('xlsx')} disabled={isExporting}>
                      <File className="mr-2 h-4 w-4" />
                      Export as XLSX
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {(isOwner || isAdmin) && (
                <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={isImporting}
                      className="border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950 hover:border-green-300 dark:hover:border-green-700 text-green-700 dark:text-green-300"
                    >
                      {isImporting ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <UploadIcon className="mr-2 h-4 w-4" />
                          Import
                        </>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Import Products</DialogTitle>
                      <DialogDescription>
                        Upload a CSV or XLSX file to import products. Download a template to see the required format.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="file">Select File</Label>
                        <Input
                          id="file"
                          type="file"
                          accept=".csv,.xlsx"
                          onChange={handleFileSelect}
                          disabled={isImporting}
                        />
                        {selectedFile && (
                          <p className="text-sm text-muted-foreground">
                            Selected: {selectedFile.name}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="updateExisting"
                            checked={updateExisting}
                            onCheckedChange={(checked) => setUpdateExisting(checked === true)}
                            disabled={isImporting}
                          />
                          <Label htmlFor="updateExisting" className="text-sm">
                            Update existing products (by SKU)
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="validateOnly"
                            checked={validateOnly}
                            onCheckedChange={(checked) => setValidateOnly(checked === true)}
                            disabled={isImporting}
                          />
                          <Label htmlFor="validateOnly" className="text-sm">
                            Validate only (don't import)
                          </Label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Download Template</Label>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadTemplate('csv')}
                            disabled={isImporting}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            CSV
                          </Button>
                          {/* <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = '/import-templates/products-import-template-simple.csv'
                            link.download = 'products-import-template-simple.csv'
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                          }}
                          disabled={isImporting}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          CSV (Simple)
                        </Button> */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadTemplate('xlsx')}
                            disabled={isImporting}
                          >
                            <File className="mr-2 h-4 w-4" />
                            XLSX
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Use "CSV (Simple)" for basic imports, "CSV (Full)" or "XLSX" for advanced features
                        </p>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setImportDialogOpen(false)}
                        disabled={isImporting}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleImport}
                        disabled={!selectedFile || isImporting}
                      >
                        {validateOnly ? 'Validate' : 'Import'} Products
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              {isOwner && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleBulkPublish}
                        disabled={isBulkPublishing}
                        variant="outline"
                        className="border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950 hover:border-green-300 dark:hover:border-green-700 text-green-700 dark:text-green-300"
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
                      placeholder="Search by name, SKU, category, creator, dates, prices, status..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      className="pl-9 w-full"
                      aria-label="Search products"
                    />
                  </div>
                  <div className="flex gap-1">
                    {searchTerm && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => { setSearchTerm(""); setSearchResults([]); setIsSearchActive(false); setCurrentPage(1); }}
                              aria-label="Clear search"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Clear search</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              )}
            </div>

            <TabsContent value="published" className="space-y-4">
              {isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Searching products...</p>
                  </div>
                </div>
              ) : (
                <EnhancedProductList products={currentDisplayProducts} storeId={storeId} searchTerm={searchTerm} />
              )}
              {renderPagination()}
            </TabsContent>

            <TabsContent value="archived" className="space-y-4">
              {isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Searching products...</p>
                  </div>
                </div>
              ) : (
                <EnhancedProductList products={currentDisplayProducts} storeId={storeId} searchTerm={searchTerm} />
              )}
              {renderPagination()}
            </TabsContent>

            <TabsContent value="trash" className="space-y-4">
              {trashedProducts.length === 0 ? (
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

                  <div className="flex items-center w-full gap-2 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search trash by name, SKU, category, creator, dates..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="pl-9 w-full"
                        aria-label="Search trash products"
                      />
                    </div>
                    <div className="flex gap-1">
                      {searchTerm && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => { setSearchTerm(""); setSearchResults([]); setIsSearchActive(false); setCurrentPage(1); }}
                                aria-label="Clear search"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Clear search</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>

                  {isSearching ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Searching trash...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <TrashDataTable columns={trashColumns} data={currentDisplayProducts as TrashProductColumn[]} />
                      {renderPagination()}
                    </>
                  )}
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
