"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Edit,
  Copy,
  Trash,
  Eye,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Tag,
  Package,
  Clock,
  Calendar,
} from "lucide-react"
import { toast } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertModal } from "@/components/modals/alert-modal"
import { ProductPreviewModal } from "./product-preview-modal"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { duplicateProduct } from "../actions/duplicate-product"
import { bulkDeleteProducts, bulkUpdateProducts } from "../actions/bulk-actions"
import type { ProductColumn } from "../types"

interface EnhancedProductListProps {
  products: ProductColumn[]
  storeId: string
  onSelectItems?: (ids: string[]) => void
  searchTerm?: string
}

export const EnhancedProductList = ({ products, storeId, onSelectItems, searchTerm: externalSearchTerm }: EnhancedProductListProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [isBulkDuplicating, setIsBulkDuplicating] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Use external search term if provided, otherwise use internal search term
  const activeSearchTerm = externalSearchTerm !== undefined ? externalSearchTerm : searchTerm
  const [sortField, setSortField] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)
  const [previewProduct, setPreviewProduct] = useState<ProductColumn | null>(null)
  const [expandedProductData, setExpandedProductData] = useState<{[key: string]: any}>({})
  const router = useRouter()

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
      product.createdByName?.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
      product.updatedByName?.toLowerCase().includes(activeSearchTerm.toLowerCase()),
  )

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortField === "price") {
      const priceA = Number.parseFloat(a.price.replace(/[^0-9.-]+/g, ""))
      const priceB = Number.parseFloat(b.price.replace(/[^0-9.-]+/g, ""))
      return sortDirection === "asc" ? priceA - priceB : priceB - priceA
    }
    if (sortField === "sku") {
      const skuA = a.sku || ""
      const skuB = b.sku || ""
      return sortDirection === "asc" ? skuA.localeCompare(skuB) : skuB.localeCompare(skuA)
    }

    const valueA = a[sortField as keyof ProductColumn] || ""
    const valueB = b[sortField as keyof ProductColumn] || ""

    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortDirection === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
    }

    return 0
  })

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const onEdit = (id: string) => {
    router.push(`/${storeId}/products/${id}`)
  }

  const onPreview = async (id: string) => {
    try {
      const response = await fetch(`/api/${storeId}/products/${id}`)
      if (response.ok) {
        const fullProduct = await response.json()
        setPreviewProduct(fullProduct)
      }
    } catch (error) {
      console.error('Error fetching product details:', error)
    }
  }

  const fetchProductDetails = async (id: string) => {
    if (expandedProductData[id]) return expandedProductData[id]
    try {
      const response = await fetch(`/api/${storeId}/products/${id}`)
      if (response.ok) {
        const fullProduct = await response.json()
        setExpandedProductData(prev => ({ ...prev, [id]: fullProduct }))
        return fullProduct
      }
    } catch (error) {
      console.error('Error fetching product details:', error)
    }
    return null
  }

  const onDuplicate = async (id: string) => {
    try {
      setLoading(true)
      await duplicateProduct(id, storeId)
      router.refresh()
      toast.success("Product duplicated successfully")
    } catch (error) {
      toast.error("Failed to duplicate product")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    if (!productToDelete) return

    try {
      setLoading(true)
      const response = await fetch(`/api/${storeId}/products/${productToDelete}/trash`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to move product to trash")
      }

      router.refresh()
      toast.success("Product moved to trash")
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
      setOpen(false)
      setProductToDelete(null)
    }
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === sortedProducts.length) {
      setSelectedItems([])
      onSelectItems?.([])
    } else {
      const allIds = sortedProducts.map((product) => product.id)
      setSelectedItems(allIds)
      onSelectItems?.(allIds)
    }
  }

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) => {
      const newSelection = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      onSelectItems?.(newSelection)
      return newSelection
    })
  }

  const toggleExpandProduct = async (id: string) => {
    if (expandedProduct === id) {
      setExpandedProduct(null)
    } else {
      setExpandedProduct(id)
      await fetchProductDetails(id)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one product")
      return
    }

    try {
      setIsBulkDeleting(true)
      await bulkDeleteProducts(selectedItems, storeId)
      toast.success(`${selectedItems.length} products moved to trash`)
      router.refresh()
      setSelectedItems([])
      onSelectItems?.([])
    } catch (error) {
      console.error("Error deleting products:", error)
      toast.error("Failed to delete products")
    } finally {
      setIsBulkDeleting(false)
      setShowBulkDeleteConfirm(false)
    }
  }

  const handleBulkDuplicate = async () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one product")
      return
    }

    try {
      setIsBulkDuplicating(true)
      for (const productId of selectedItems) {
        await duplicateProduct(productId, storeId)
      }
      toast.success(`${selectedItems.length} products duplicated successfully`)
      router.refresh()
      setSelectedItems([])
      onSelectItems?.([])
    } catch (error) {
      console.error("Error duplicating products:", error)
      toast.error("Failed to duplicate products")
    } finally {
      setIsBulkDuplicating(false)
    }
  }

  const refreshList = () => {
    router.refresh()
    toast.success("Product list refreshed")
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-950 rounded-lg shadow-sm border">
        <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
          <Package className="h-6 w-6 text-gray-500 dark:text-gray-400" />
        </div>
        <h3 className="mt-4 text-lg font-medium">No products found</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Get started by creating a new product or try changing your filters.
        </p>
        <Button onClick={() => router.push(`/${storeId}/products/new`)} className="mt-4">
          Add New Product
        </Button>
      </div>
    )
  }

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
      <AlertModal 
        isOpen={showBulkDeleteConfirm} 
        onClose={() => setShowBulkDeleteConfirm(false)} 
        onConfirm={handleBulkDelete} 
        loading={isBulkDeleting}
      />
      {previewProduct && (
        <ProductPreviewModal 
          isOpen={!!previewProduct} 
          onClose={() => setPreviewProduct(null)} 
          product={previewProduct}
        />
      )}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          {externalSearchTerm === undefined && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name, SKU, category or creator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
          )}
          <div className={`flex gap-2 ${externalSearchTerm !== undefined ? 'w-full justify-end' : ''}`}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={refreshList}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh list</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => {}}>All Products</DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>Published Only</DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>Draft Only</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => {}}>All Categories</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => router.push(`/${storeId}/products/new`)}>Add New</Button>
          </div>
        </div>

        {selectedItems.length > 0 && (
          <div className="bg-muted/30 p-2 rounded-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox checked={selectedItems.length === sortedProducts.length} onCheckedChange={toggleSelectAll} />
              <span className="text-sm font-medium">{selectedItems.length} selected</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push(`/${storeId}/products/bulk-edit`)}>
                <Tag className="h-3.5 w-3.5 mr-2" />
                Bulk Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBulkDuplicate}
                disabled={isBulkDuplicating}
              >
                <Copy className="h-3.5 w-3.5 mr-2" />
                {isBulkDuplicating ? "Duplicating..." : "Duplicate"}
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setShowBulkDeleteConfirm(true)}
                disabled={isBulkDeleting}
              >
                <Trash className="h-3.5 w-3.5 mr-2" />
                {isBulkDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border overflow-hidden">
          <div className="grid grid-cols-12 gap-2 p-4 bg-muted/30 border-b text-sm font-medium">
            <div className="col-span-1 flex items-center">
              <Checkbox
                checked={selectedItems.length === sortedProducts.length && sortedProducts.length > 0}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all"
              />
            </div>

            <div className="col-span-4 flex items-center gap-2">
              <button
                onClick={() => handleSort("name")}
                className="flex items-center hover:text-primary transition-colors"
              >
                Product
                {sortField === "name" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </button>
            </div>

            <div className="col-span-1 flex items-center gap-2">
              <button
                onClick={() => handleSort("sku")}
                className="flex items-center hover:text-primary transition-colors"
              >
                SKU
                {sortField === "sku" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </button>
            </div>

            <div className="col-span-1 hidden md:flex items-center gap-2">
              <button
                onClick={() => handleSort("category")}
                className="flex items-center hover:text-primary transition-colors"
              >
                Category
                {sortField === "category" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </button>
            </div>

            <div className="col-span-1 hidden lg:flex items-center gap-2">
              <button
                onClick={() => handleSort("createdByName")}
                className="flex items-center hover:text-primary transition-colors"
              >
                Created By
                {sortField === "createdByName" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </button>
            </div>

            <div className="col-span-1 hidden lg:flex items-center gap-2">
              <button
                onClick={() => handleSort("updatedByName")}
                className="flex items-center hover:text-primary transition-colors"
              >
                Updated By
                {sortField === "updatedByName" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </button>
            </div>

            <div className="col-span-1 hidden xl:flex items-center gap-2">
              <button
                onClick={() => handleSort("publishedAt")}
                className="flex items-center hover:text-primary transition-colors"
              >
                Published
                {sortField === "publishedAt" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </button>
            </div>

            <div className="col-span-1 hidden xl:flex items-center gap-2">
              <button
                onClick={() => handleSort("createdAt")}
                className="flex items-center hover:text-primary transition-colors"
              >
                Created At
                {sortField === "createdAt" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-1 h-4 w-4" />
                  ))}
              </button>
            </div>

            <div className="flex items-center justify-end col-span-6 md:col-span-5 lg:col-span-3 xl:col-span-1">Actions</div>
          </div>

          <div className="divide-y">
            {sortedProducts.map((product) => (
              <div key={product.id} className="hover:bg-muted/20 transition-colors">
                <div className="grid grid-cols-12 gap-2 p-4 items-center">
                  <div className="col-span-1 flex items-center">
                    <Checkbox
                      checked={selectedItems.includes(product.id)}
                      onCheckedChange={() => toggleSelectItem(product.id)}
                      aria-label={`Select ${product.name}`}
                    />
                  </div>

                  <div className="col-span-4 flex items-center gap-3">
                    <div className="relative h-16 w-12 overflow-hidden bg-muted flex-shrink-0">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{product.name}</div>
                    </div>
                  </div>

                  <div className="col-span-1 flex items-center">
                    <span className="text-sm truncate">{product.sku || "N/A"}</span>
                  </div>

                  <div className="col-span-1 hidden md:flex items-center">
                    <Badge variant="outline" className="bg-muted/30">
                      {product.category || "Uncategorized"}
                    </Badge>
                  </div>

                  <div className="col-span-1 hidden lg:flex items-center">
                    <span className="text-sm truncate">{product.createdByName || "System"}</span>
                  </div>

                  <div className="col-span-1 hidden lg:flex items-center">
                    <span className="text-sm truncate">{product.updatedByName || "Not updated"}</span>
                  </div>

                  <div className="col-span-1 hidden xl:flex items-center">
                    {product.isPublished ? (
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        <span className="text-sm">{product.publishedAt || "Unknown"}</span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-300">
                        Draft
                      </Badge>
                    )}
                  </div>

                  <div className="col-span-1 hidden xl:flex items-center">
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span className="text-sm">{product.createdAt || "Unknown"}</span>
                    </div>
                  </div>

                  <div className="col-span-6 md:col-span-5 lg:col-span-3 xl:col-span-1 flex items-center justify-end gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => onEdit(product.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onPreview(product.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDuplicate(product.id)} disabled={loading}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setProductToDelete(product.id)
                            setOpen(true)
                          }}
                          className="text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleExpandProduct(product.id)}
                      className="ml-1"
                    >
                      {expandedProduct === product.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {expandedProduct === product.id && (() => {
                  const fullProduct = expandedProductData[product.id] || product
                  return (
                    <div className="bg-muted/10 p-4">
                      <div className="flex gap-4 text-sm">
                        <div className="flex-shrink-0">
                          <div className="relative w-64 h-96 overflow-hidden bg-muted">
                            <Image
                              src={product.imageUrl || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Product Details</h4>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Specifications:</span>
                                <div className="text-right">
                                  {fullProduct.specifications ? (
                                    Object.entries(fullProduct.specifications).map(([key, value]) => (
                                      <div key={key} className="text-sm">
                                        <span className="font-medium">{key}:</span> {Array.isArray(value) ? value.join(', ') : value}
                                      </div>
                                    ))
                                  ) : "N/A"}
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Material:</span>
                                <span>{fullProduct.categoryData?.material || "N/A"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Style:</span>
                                <span>{fullProduct.categoryData?.style || "N/A"}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Inventory</h4>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">SKU:</span>
                                <span>{product.sku || "N/A"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Price:</span>
                                <span>{product.price}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Stock:</span>
                                {product.stockStatus === "instock" ? (
                                  <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-300">
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    In Stock
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-300">
                                    <XCircle className="mr-1 h-3 w-3" />
                                    Out of Stock
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">History</h4>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Created:</span>
                                <div className="flex items-center">
                                  <span className="mr-1">{product.createdByName || "System"}</span>
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span className="ml-1 text-xs text-muted-foreground">{product.createdAt}</span>
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Updated:</span>
                                <div className="flex items-center">
                                  <span className="mr-1">{product.updatedByName || "Not updated"}</span>
                                  {product.updatedAt && (
                                    <>
                                      <Clock className="h-3 w-3 text-muted-foreground" />
                                      <span className="ml-1 text-xs text-muted-foreground">{product.updatedAt}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="md:col-span-3 mt-4">
                            <h4 className="font-medium mb-2">Quick Actions</h4>
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" variant="outline" onClick={() => onEdit(product.id)}>
                                <Edit className="mr-2 h-3.5 w-3.5" />
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => onPreview(product.id)}>
                                <Eye className="mr-2 h-3.5 w-3.5" />
                                Preview
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => onDuplicate(product.id)}>
                                <Copy className="mr-2 h-3.5 w-3.5" />
                                Duplicate
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            ))}
          </div>
        </div>

        {sortedProducts.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Showing {sortedProducts.length} of {products.length} products
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}