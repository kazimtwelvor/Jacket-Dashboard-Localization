"use client"

import { useState } from "react"
import React from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import toast from "react-hot-toast"

const parseHtml = (html: string) => {
  return html.replace(/<[^>]*>/g, '')
}
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Grid, List, Trash2, RotateCcw } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { AlertModal } from "@/components/modals/alert-modal"
import { ProductPreviewModal } from "../../products/components/product-preview-modal"

interface DraftClientProps {
  data: any[]
  trashedData: any[]
  userRole: string
}

export const DraftClient: React.FC<DraftClientProps> = ({ data, trashedData, userRole }) => {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewProduct, setPreviewProduct] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showAllProducts, setShowAllProducts] = useState(false)
  const itemsPerPage = 12

  const onTrash = async (product: any) => {
    try {
      setLoading(true)
      await axios.post(`/api/${params?.storeId}/products/${product.id}/trash`)
      window.location.reload()
      toast.success("Product moved to trash")
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const onRestore = async (product: any) => {
    try {
      setLoading(true)
      await axios.post(`/api/${params?.storeId}/products/${product.id}/restore`)
      window.location.reload()
      toast.success("Product restored")
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/${params?.storeId}/products/${selectedProduct.id}/permanent`)
      window.location.reload()
      toast.success("Product deleted permanently")
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
      setDeleteModalOpen(false)
      setSelectedProduct(null)
    }
  }

  return (
    <>
      <AlertModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      
      <ProductPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        product={previewProduct}
      />
      
      <div className="flex items-center justify-between">
        <Heading 
          title={`Draft Shop (${data.length} active, ${trashedData.length} trashed)`} 
          description="Preview your store like customers see it" 
        />
      </div>
      <Separator />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Products ({data.length})</TabsTrigger>
          <TabsTrigger value="trash">Trash ({trashedData.length})</TabsTrigger>
        </TabsList>
        
        <div className="flex items-center gap-2 mt-4">
          <Button
            variant={showAllProducts ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAllProducts(!showAllProducts)}
          >
            {showAllProducts ? "Show Paginated" : "Show All Products"}
          </Button>
          {showAllProducts && (
            <span className="text-sm text-muted-foreground">
              Showing all {activeTab === "all" ? data.length : trashedData.length} products
            </span>
          )}
        </div>
        
        <TabsContent value="all" className="space-y-4">
          <ProductsView 
            data={data} 
            onTrash={userRole !== 'EDITOR' ? onTrash : undefined} 
            loading={loading} 
            isTrash={false}
            userRole={userRole}
            showAllProducts={showAllProducts}
            onPreview={async (product) => {
              try {
                const response = await fetch(`/api/${params?.storeId}/products/${product.id}`)
                if (response.ok) {
                  const fullProduct = await response.json()
                  setPreviewProduct(fullProduct)
                  setPreviewModalOpen(true)
                }
              } catch (error) {
              }
            }}
          />
        </TabsContent>
        
        <TabsContent value="trash" className="space-y-4">
          <ProductsView 
            data={trashedData} 
            onRestore={onRestore}
            onDelete={(product) => {
              setSelectedProduct(product)
              setDeleteModalOpen(true)
            }}
            showAllProducts={showAllProducts}
            onPreview={async (product) => {
              try {
                const response = await fetch(`/api/${params?.storeId}/products/${product.id}`)
                if (response.ok) {
                  const fullProduct = await response.json()
                  setPreviewProduct(fullProduct)
                  setPreviewModalOpen(true)
                }
              } catch (error) {
              }
            }}
            loading={loading} 
            isTrash={true}
          />
        </TabsContent>
      </Tabs>
    </>
  )
}

interface ProductsViewProps {
  data: any[]
  onTrash?: (product: any) => void
  onRestore?: (product: any) => void
  onDelete?: (product: any) => void
  onPreview?: (product: any) => void
  loading: boolean
  isTrash: boolean
  userRole?: string
  showAllProducts?: boolean
}

const ProductsView: React.FC<ProductsViewProps> = ({ 
  data, 
  onTrash, 
  onRestore, 
  onDelete, 
  onPreview, 
  loading, 
  isTrash,
  userRole,
  showAllProducts = false
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [colorFilter, setColorFilter] = useState("all")
  const [materialFilter, setMaterialFilter] = useState("all")
  const [styleFilter, setStyleFilter] = useState("all")
  const [genderFilter, setGenderFilter] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [creatorFilter, setCreatorFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const toggleAll = () => {
    setSelectedProducts(prev => 
      prev.length === paginatedProducts.length ? [] : paginatedProducts.map(p => p.id)
    )
  }

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, colorFilter, materialFilter, styleFilter, genderFilter, priceFilter, dateFilter, creatorFilter, statusFilter])

  const handleBulkTrash = async () => {
    try {
      for (const productId of selectedProducts) {
        const product = data.find(p => p.id === productId)
        if (product) await onTrash?.(product)
      }
      setSelectedProducts([])
    } catch (error) {
    }
  }

  const handleBulkRestore = async () => {
    try {
      for (const productId of selectedProducts) {
        const product = data.find(p => p.id === productId)
        if (product) await onRestore?.(product)
      }
      setSelectedProducts([])
    } catch (error) {
    }
  }

  const handleBulkDelete = async () => {
    try {
      for (const productId of selectedProducts) {
        const product = data.find(p => p.id === productId)
        if (product) await onDelete?.(product)
      }
      setSelectedProducts([])
    } catch (error) {
    }
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(price))
  }

  const categories = Array.from(new Set(data.map(product => {
    try {
      if (product.categoryData && typeof product.categoryData === 'object') {
        const categoryData = product.categoryData as any
        return `${categoryData.material || ''} ${categoryData.style || ''}`.trim() || 'Uncategorized'
      }
      return 'Uncategorized'
    } catch {
      return 'Uncategorized'
    }
  }).filter(Boolean)))

  const colors = Array.from(new Set(data.flatMap(product => {
    try {
      if (product.colorDetails) {
        if (typeof product.colorDetails === 'string') {
          return JSON.parse(product.colorDetails).map((c: any) => c.name)
        } else if (Array.isArray(product.colorDetails)) {
          return product.colorDetails.map((c: any) => c.name)
        }
      }
      return []
    } catch {
      return []
    }
  }).filter(Boolean)))

  const materials = Array.from(new Set(data.map(product => {
    try {
      if (product.categoryData && typeof product.categoryData === 'object') {
        return (product.categoryData as any).material || null
      }
      return null
    } catch {
      return null
    }
  }).filter(Boolean)))

  const styles = Array.from(new Set(data.map(product => {
    try {
      if (product.categoryData && typeof product.categoryData === 'object') {
        return (product.categoryData as any).style || null
      }
      return null
    } catch {
      return null
    }
  }).filter(Boolean)))

  const genders = Array.from(new Set(data.map(product => product.gender).filter(Boolean)))
  const creators = Array.from(new Set(data.map(product => product.createdByName).filter(Boolean)))

  const filteredProducts = data.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const productCategory = (() => {
      try {
        if (product.categoryData && typeof product.categoryData === 'object') {
          const categoryData = product.categoryData as any
          return `${categoryData.material || ''} ${categoryData.style || ''}`.trim() || 'Uncategorized'
        }
        return 'Uncategorized'
      } catch {
        return 'Uncategorized'
      }
    })()
    
    const productColors = (() => {
      try {
        if (product.colorDetails) {
          if (typeof product.colorDetails === 'string') {
            return JSON.parse(product.colorDetails).map((c: any) => c.name)
          } else if (Array.isArray(product.colorDetails)) {
            return product.colorDetails.map((c: any) => c.name)
          }
        }
        return []
      } catch {
        return []
      }
    })()
    
    const productMaterial = (() => {
      try {
        if (product.categoryData && typeof product.categoryData === 'object') {
          return (product.categoryData as any).material || ''
        }
        return ''
      } catch {
        return ''
      }
    })()
    
    const productStyle = (() => {
      try {
        if (product.categoryData && typeof product.categoryData === 'object') {
          return (product.categoryData as any).style || ''
        }
        return ''
      } catch {
        return ''
      }
    })()
    
    const productPrice = parseFloat(product.price.replace(/[^0-9.]/g, ''))
    const productStatus = product.isArchived ? 'archived' : 'published'
    
    const matchesCategory = categoryFilter === "all" || productCategory === categoryFilter
    const matchesColor = colorFilter === "all" || productColors.includes(colorFilter)
    const matchesMaterial = materialFilter === "all" || productMaterial === materialFilter
    const matchesStyle = styleFilter === "all" || productStyle === styleFilter
    const matchesGender = genderFilter === "all" || product.gender === genderFilter
    const matchesCreator = creatorFilter === "all" || product.createdByName === creatorFilter
    const matchesStatus = statusFilter === "all" || productStatus === statusFilter
    
    const matchesPrice = (() => {
      if (priceFilter === "all") return true
      if (priceFilter === "under-50" && productPrice < 50) return true
      if (priceFilter === "50-100" && productPrice >= 50 && productPrice <= 100) return true
      if (priceFilter === "100-200" && productPrice >= 100 && productPrice <= 200) return true
      if (priceFilter === "over-200" && productPrice > 200) return true
      return false
    })()
    
    const matchesDate = (() => {
      if (dateFilter === "all") return true
      const productDate = new Date(product.createdAt)
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - productDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (dateFilter === "today" && daysDiff === 0) return true
      if (dateFilter === "week" && daysDiff <= 7) return true
      if (dateFilter === "month" && daysDiff <= 30) return true
      if (dateFilter === "year" && daysDiff <= 365) return true
      return false
    })()
    
    return matchesSearch && matchesCategory && matchesColor && matchesMaterial && 
           matchesStyle && matchesGender && matchesPrice && matchesDate && 
           matchesCreator && matchesStatus
  })

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = showAllProducts ? filteredProducts : filteredProducts.slice(startIndex, startIndex + itemsPerPage)

  return (
    <>
      {/* Product Count Display */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          Showing {paginatedProducts.length} of {filteredProducts.length} products
          {filteredProducts.length !== data.length && (
            <span> (filtered from {data.length} total)</span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0}
              onCheckedChange={toggleAll}
            />
            <span className="text-sm text-muted-foreground">
              {selectedProducts.length} selected
            </span>
          </div>
          
          {selectedProducts.length > 0 && (
            <div className="flex gap-2">
              {isTrash ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkRestore}
                    disabled={loading}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Restore Selected
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Selected
                  </Button>
                </>
              ) : (
                onTrash && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkTrash}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Trash Selected
                  </Button>
                )
              )}
            </div>
          )}
          
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category: string) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={colorFilter} onValueChange={setColorFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Colors</SelectItem>
              {colors.map((color: string) => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={materialFilter} onValueChange={setMaterialFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Material" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Materials</SelectItem>
              {materials.map((material: string) => (
                <SelectItem key={material} value={material}>
                  {material}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={styleFilter} onValueChange={setStyleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Styles</SelectItem>
              {styles.map((style: string) => (
                <SelectItem key={style} value={style}>
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              {genders.map((gender: string) => (
                <SelectItem key={gender} value={gender}>
                  {gender}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="under-50">Under $50</SelectItem>
              <SelectItem value="50-100">$50 - $100</SelectItem>
              <SelectItem value="100-200">$100 - $200</SelectItem>
              <SelectItem value="over-200">Over $200</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {creators.length > 0 && (
          <Select value={creatorFilter} onValueChange={setCreatorFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Creators" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Creators</SelectItem>
              {creators.map((creator: string) => (
                <SelectItem key={creator} value={creator}>
                  {creator}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Products Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedProducts.map((product: any) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onPreview?.(product)}>
              <div className="aspect-[3/5] relative">
                <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={() => toggleProduct(product.id)}
                    className="bg-gray-200/90 border-gray-400"
                  />
                </div>
                {product.images?.[0]?.image ? (
                  <img
                    src={product.images[0].image.url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
                {/* {product.isFeatured && (
                  <Badge className="absolute top-2 left-2">Featured</Badge>
                )} */}
                {product.isArchived && (
                  <Badge variant="secondary" className="absolute top-2 right-2">Archived</Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{parseHtml(product.name)}</h3>
                <p className="text-xs text-muted-foreground mb-2">SKU: {product.sku || 'N/A'}</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {(() => {
                        try {
                          if (product.categoryData && typeof product.categoryData === 'object') {
                            const categoryData = product.categoryData as any
                            return `${categoryData.material || ''} ${categoryData.style || ''}`.trim() || 'Uncategorized'
                          }
                          return 'Uncategorized'
                        } catch {
                          return 'Uncategorized'
                        }
                      })()
                      }
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {(() => {
                      try {
                        const sizes = product.sizeDetails ? JSON.parse(product.sizeDetails) : []
                        return sizes.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {sizes.map((s: any) => s.name).slice(0, 2).join(', ')}
                          </Badge>
                        )
                      } catch {
                        return null
                      }
                    })()}
                    {(() => {
                      try {
                        const colors = product.colorDetails ? JSON.parse(product.colorDetails) : []
                        return colors.length > 0 && (
                          <div className="flex gap-1">
                            {colors.slice(0, 2).map((color: any, idx: number) => (
                              <div
                                key={idx}
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        )
                      } catch {
                        return null
                      }
                    })()}
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedProducts.map((product: any) => (
            <Card key={product.id} className="overflow-hidden cursor-pointer" onClick={() => onPreview?.(product)}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-32 h-48 flex-shrink-0 relative">
                    <div className="absolute top-1 left-1 z-10" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() => toggleProduct(product.id)}
                        className="bg-gray-200/90 border-gray-400"
                      />
                    </div>
                    {product.images?.[0]?.image ? (
                      <img
                        src={product.images[0].image.url}
                        alt={product.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{parseHtml(product.name)}</h3>
                        <p className="text-xs text-muted-foreground mb-2">SKU: {product.sku || 'N/A'}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {(() => {
                              try {
                                if (product.categoryData && typeof product.categoryData === 'object') {
                                  const categoryData = product.categoryData as any
                                  return `${categoryData.material || ''} ${categoryData.style || ''}`.trim() || 'Uncategorized'
                                }
                                return 'Uncategorized'
                              } catch {
                                return 'Uncategorized'
                              }
                            })()
                            }
                          </Badge>
                          {(() => {
                            try {
                              const sizes = product.sizeDetails ? JSON.parse(product.sizeDetails) : []
                              return sizes.length > 0 && (
                                <Badge variant="outline">
                                  {sizes.map((s: any) => s.name).slice(0, 2).join(', ')}
                                </Badge>
                              )
                            } catch {
                              return null
                            }
                          })()}
                          {(() => {
                            try {
                              const colors = product.colorDetails ? JSON.parse(product.colorDetails) : []
                              return colors.length > 0 && (
                                <div className="flex items-center gap-1">
                                  {colors.slice(0, 2).map((color: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-1">
                                      <div
                                        className="w-3 h-3 rounded-full border border-gray-300"
                                        style={{ backgroundColor: color.value }}
                                      />
                                      <span className="text-xs text-muted-foreground">
                                        {color.name}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )
                            } catch {
                              return null
                            }
                          })()}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-xl">
                          {formatPrice(product.price)}
                        </span>
                        <div className="flex gap-1 mt-1 mb-2">
                          {product.isFeatured && (
                            <Badge className="text-xs">Featured</Badge>
                          )}
                          {product.isArchived && (
                            <Badge variant="secondary" className="text-xs">Archived</Badge>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {paginatedProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found matching your criteria.</p>
        </div>
      )}

      {/* Pagination */}
      {!showAllProducts && totalPages > 1 && (() => {
        const getVisiblePages = () => {
          const maxVisible = 5
          let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
          let end = Math.min(totalPages, start + maxVisible - 1)
          
          if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1)
          }
          
          return Array.from({ length: end - start + 1 }, (_, i) => start + i)
        }
        
        return (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {getVisiblePages().map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )
      })()}
    </>
  )
}