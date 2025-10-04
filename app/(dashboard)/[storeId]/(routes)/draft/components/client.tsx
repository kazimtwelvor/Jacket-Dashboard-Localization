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
import { X, Grid, List, Trash2, RotateCcw, Search, Edit, Star } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { AlertModal } from "@/components/modals/alert-modal"
import { ProductPreviewModal } from "../../products/components/product-preview-modal"

interface DraftClientProps {
  storeId: string
  userRole: string
}

export const DraftClient: React.FC<DraftClientProps> = ({ storeId, userRole }) => {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewProduct, setPreviewProduct] = useState<any>(null)

  // API-driven state
  const [products, setProducts] = useState<any[]>([])
  const [trashedProducts, setTrashedProducts] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [trashedPage, setTrashedPage] = useState(1)
  const [pagination, setPagination] = useState<any>({})
  const [trashedPagination, setTrashedPagination] = useState<any>({})

  // Store complete dropdown options (never filtered)
  const [allCategories, setAllCategories] = useState<string[]>([])
  const [allColors, setAllColors] = useState<string[]>([])
  const [allMaterials, setAllMaterials] = useState<string[]>([])
  const [allStyles, setAllStyles] = useState<string[]>([])
  const [allGenders, setAllGenders] = useState<string[]>([])
  const [dropdownOptionsLoaded, setDropdownOptionsLoaded] = useState(false)

  // Filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [colorFilter, setColorFilter] = useState("all")
  const [materialFilter, setMaterialFilter] = useState("all")
  // const [priceFilter, setPriceFilter] = useState("all") // Commented out for now
  const [statusFilter, setStatusFilter] = useState("all")
  const [styleFilter, setStyleFilter] = useState("all")
  const [genderFilter, setGenderFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [creatorFilter, setCreatorFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [showAllProducts, setShowAllProducts] = useState(false)
  const itemsPerPage = 12

  // Fetch products from API
  const fetchProducts = async (page: number = 1, type: 'products' | 'trashed' = 'products') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        type: type,
        search: searchTerm,
        category: categoryFilter,
        color: colorFilter,
        material: materialFilter,
        style: styleFilter,
        gender: genderFilter,
        date: dateFilter,
        creator: creatorFilter,
        status: statusFilter,
        priority: priorityFilter,
      })

      // Price filter commented out for now
      // if (priceFilter !== 'all') {
      //   const [min, max] = priceFilter.split('-')
      //   if (min) params.append('priceMin', min)
      //   if (max) params.append('priceMax', max)
      // }

      const url = `/api/${storeId}/draft-products?${params}`
      console.log(`Fetching ${type}:`, url.toString())

      const response = await axios.get(url)
      const { products: fetchedProducts, pagination: fetchedPagination } = response.data

      console.log(`Fetched ${fetchedProducts.length} ${type} products, total: ${fetchedPagination.totalCount}`)

      if (type === 'products') {
        setProducts(fetchedProducts)
        setPagination(fetchedPagination)
      } else {
        setTrashedProducts(fetchedProducts)
        setTrashedPagination(fetchedPagination)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  // Initial load of both products and trash products
  React.useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true)
      try {
        // Load both products and trash products initially
        await Promise.all([
          fetchProducts(1, 'products'),
          fetchProducts(1, 'trashed')
        ])
      } catch (error) {
        console.error('Error loading initial data:', error)
      } finally {
        setInitialLoading(false)
      }
    }

    loadInitialData()
  }, [storeId])

  // Load initial data and refetch when filters change
  React.useEffect(() => {
    if (!initialLoading) {
      fetchProducts(currentPage, 'products')
    }
  }, [currentPage, searchTerm, categoryFilter, colorFilter, materialFilter, /* priceFilter, */ statusFilter, styleFilter, genderFilter, dateFilter, creatorFilter, priorityFilter, storeId])

  React.useEffect(() => {
    if (activeTab === 'trash' && !initialLoading) {
      fetchProducts(trashedPage, 'trashed')
    }
  }, [trashedPage, activeTab, searchTerm, categoryFilter, colorFilter, materialFilter, /* priceFilter, */ statusFilter, styleFilter, genderFilter, dateFilter, creatorFilter, priorityFilter, storeId])

  // Fetch all dropdown options once on component mount
  const fetchDropdownOptions = async () => {
    if (dropdownOptionsLoaded) return

    try {
      const response = await axios.get(`/api/${storeId}/filter-options`)
      const options = response.data

      setAllCategories(options.categories || [])
      setAllColors(options.colors || [])
      setAllMaterials(options.materials || [])
      setAllStyles(options.styles || [])
      setAllGenders(options.genders || [])
      setDropdownOptionsLoaded(true)

    } catch (error) {
      console.error('Error fetching dropdown options:', error)
    }
  }

  // Load dropdown options on mount
  React.useEffect(() => {
    fetchDropdownOptions()
  }, [storeId])

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

  const onEdit = (product: any) => {
    router.push(`/${params?.storeId}/products/${product.id}`)
  }

  const onSetPriority = async (product: any, priority: number | null) => {
    try {
      setLoading(true)
      await axios.post(`/api/${params?.storeId}/products/priority`, {
        productId: product.id,
        priority: priority
      })
      
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === product.id ? { ...p, priority: priority } : p
        )
      )
      
      toast.success(`Product priority ${priority ? `set to ${priority}` : 'removed'}`)
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  // Get current data and use static dropdown options 
  const currentData = activeTab === 'all' ? products : trashedProducts
  const dropdownCategories = dropdownOptionsLoaded ? allCategories : []
  const dropdownColors = dropdownOptionsLoaded ? allColors : []
  const dropdownMaterials = dropdownOptionsLoaded ? allMaterials : []
  const dropdownStyles = dropdownOptionsLoaded ? allStyles : []
  const dropdownGenders = dropdownOptionsLoaded ? allGenders : []

  const clearAllFilters = () => {
    setSearchTerm("")
    setCategoryFilter("all")
    setColorFilter("all")
    setMaterialFilter("all")
    setStatusFilter("all")
    setStyleFilter("all")
    setGenderFilter("all")
    setDateFilter("all")
    setCreatorFilter("all")
    setPriorityFilter("all")
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
          title={`Draft Shop (${pagination.totalCount || 0} active, ${trashedPagination.totalCount || 0} trashed)`}
          description="Preview your store like customers see it"
        />
      </div>
      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Products ({pagination.totalCount || 0})</TabsTrigger>
          <TabsTrigger value="trash">Trash ({trashedPagination.totalCount || 0})</TabsTrigger>
        </TabsList>

        <div className="flex items-center justify-between mt-4">
          {/* <div className="flex items-center gap-2">
          <Button
            variant={showAllProducts ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAllProducts(!showAllProducts)}
          >
            {showAllProducts ? "Show Paginated" : "Show All Products"}
          </Button>
          {showAllProducts && (
            <span className="text-sm text-muted-foreground">
              Showing all {activeTab === "all" ? pagination.totalCount || 0 : trashedPagination.totalCount || 0} products
            </span>
          )}
          </div>
           */}
          {/* <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button> */}
        </div>

        <TabsContent value="all" className="space-y-4">
          <ProductsView
            data={products}
            onTrash={userRole !== 'EDITOR' ? onTrash : undefined}
            onEdit={onEdit}
            onSetPriority={(userRole === 'ADMIN' || userRole === 'OWNER') ? onSetPriority : undefined}
            loading={loading}
            isTrash={false}
            userRole={userRole}
            showAllProducts={showAllProducts}
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            colorFilter={colorFilter}
            onColorChange={setColorFilter}
            materialFilter={materialFilter}
            onMaterialChange={setMaterialFilter}
            // priceFilter={priceFilter}
            // onPriceChange={setPriceFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            styleFilter={styleFilter}
            onStyleChange={setStyleFilter}
            genderFilter={genderFilter}
            onGenderChange={setGenderFilter}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
            creatorFilter={creatorFilter}
            onCreatorChange={setCreatorFilter}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
            staticCategories={dropdownCategories}
            staticColors={dropdownColors}
            staticMaterials={dropdownMaterials}
            staticStyles={dropdownStyles}
            staticGenders={dropdownGenders}
            onClearFilters={clearAllFilters}
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
            data={trashedProducts}
            onRestore={onRestore}
            onDelete={(product) => {
              setSelectedProduct(product)
              setDeleteModalOpen(true)
            }}
            onEdit={undefined} 
            showAllProducts={showAllProducts}
            pagination={trashedPagination}
            currentPage={trashedPage}
            onPageChange={setTrashedPage}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            colorFilter={colorFilter}
            onColorChange={setColorFilter}
            materialFilter={materialFilter}
            onMaterialChange={setMaterialFilter}
            // priceFilter={priceFilter}
            // onPriceChange={setPriceFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            styleFilter={styleFilter}
            onStyleChange={setStyleFilter}
            genderFilter={genderFilter}
            onGenderChange={setGenderFilter}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
            creatorFilter={creatorFilter}
            onCreatorChange={setCreatorFilter}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
            staticCategories={dropdownCategories}
            staticColors={dropdownColors}
            staticMaterials={dropdownMaterials}
            staticStyles={dropdownStyles}
            staticGenders={dropdownGenders}
            onClearFilters={clearAllFilters}
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
  onEdit?: (product: any) => void
  onSetPriority?: (product: any, priority: number | null) => void
  loading: boolean
  isTrash?: boolean
  userRole?: string
  showAllProducts?: boolean
  pagination?: any
  currentPage?: number
  onPageChange?: (page: number) => void
  searchTerm?: string
  onSearchChange?: (term: string) => void
  categoryFilter?: string
  onCategoryChange?: (category: string) => void
  colorFilter?: string
  onColorChange?: (color: string) => void
  materialFilter?: string
  onMaterialChange?: (material: string) => void
  // priceFilter?: string
  // onPriceChange?: (price: string) => void
  statusFilter?: string
  onStatusChange?: (status: string) => void
  styleFilter?: string
  onStyleChange?: (style: string) => void
  genderFilter?: string
  onGenderChange?: (gender: string) => void
  dateFilter?: string
  onDateChange?: (date: string) => void
  creatorFilter?: string
  onCreatorChange?: (creator: string) => void
  priorityFilter?: string
  onPriorityChange?: (priority: string) => void
  staticCategories?: string[]
  staticColors?: string[]
  staticMaterials?: string[]
  staticStyles?: string[]
  staticGenders?: string[]
  onClearFilters?: () => void
}

const ProductsView: React.FC<ProductsViewProps> = ({
  data,
  onTrash,
  onRestore,
  onDelete,
  onPreview,
  onEdit,
  onSetPriority,
  loading,
  isTrash = false,
  userRole,
  showAllProducts = false,
  pagination,
  currentPage = 1,
  onPageChange,
  searchTerm = "",
  onSearchChange,
  categoryFilter = "all",
  onCategoryChange,
  colorFilter = "all",
  onColorChange,
  materialFilter = "all",
  onMaterialChange,
  // priceFilter = "all",
  // onPriceChange,
  statusFilter = "all",
  onStatusChange,
  styleFilter = "all",
  onStyleChange,
  genderFilter = "all",
  onGenderChange,
  dateFilter = "all",
  onDateChange,
  creatorFilter = "all",
  onCreatorChange,
  priorityFilter = "all",
  onPriorityChange,
  staticCategories = [],
  staticColors = [],
  staticMaterials = [],
  staticStyles = [],
  staticGenders = [],
  onClearFilters
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
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
      prev.length === data.length ? [] : data.map(p => p.id)
    )
  }

  React.useEffect(() => {
    onPageChange?.(1)
  }, [searchTerm, categoryFilter, colorFilter, materialFilter, styleFilter, genderFilter, /* priceFilter, */ dateFilter, creatorFilter, priorityFilter, statusFilter])

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

  // Use static dropdown options if available, otherwise fall back to computed ones
  const categories = staticCategories.length > 0 ? staticCategories : Array.from(new Set(data.map(product => {
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

  const colors = staticColors.length > 0 ? staticColors : Array.from(new Set(data.flatMap(product => {
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

  const materials = staticMaterials.length > 0 ? staticMaterials : Array.from(new Set(data.map(product => {
    try {
      if (product.categoryData && typeof product.categoryData === 'object') {
        return (product.categoryData as any).material || null
      }
      return null
    } catch {
      return null
    }
  }).filter(Boolean)))

  const styles = staticStyles.length > 0 ? staticStyles : Array.from(new Set(data.map(product => {
    try {
      if (product.categoryData && typeof product.categoryData === 'object') {
        return (product.categoryData as any).style || null
      }
      return null
    } catch {
      return null
    }
  }).filter(Boolean)))

  const genders = staticGenders.length > 0 ? staticGenders : Array.from(new Set(data.map(product => product.gender).filter(Boolean)))
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

    // Price filter commented out for now
    const matchesPrice = true // Always return true since price filter is disabled
    // const matchesPrice = (() => {
    //   if (priceFilter === "all") return true
    //   if (priceFilter === "under-50" && productPrice < 50) return true
    //   if (priceFilter === "50-100" && productPrice >= 50 && productPrice <= 100) return true
    //   if (priceFilter === "100-200" && productPrice >= 100 && productPrice <= 200) return true
    //   if (priceFilter === "over-200" && productPrice > 200) return true
    //   return false
    // })()

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

  const totalPages = pagination?.totalPages || 1
  const paginatedProducts = data

  return (
    <>
      {/* Product Count Display */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          Showing {data.length} of {pagination?.totalCount || 0} products
          {pagination && pagination.page > 1 && (
            <span> (Page {pagination.page} of {pagination.totalPages})</span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedProducts.length === data.length && data.length > 0}
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
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          <Select value={categoryFilter} onValueChange={onCategoryChange}>
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

          <Select value={colorFilter} onValueChange={onColorChange}>
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

          <Select value={materialFilter} onValueChange={onMaterialChange}>
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

          <Select value={styleFilter} onValueChange={onStyleChange}>
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

          <Select value={genderFilter} onValueChange={onGenderChange}>
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

          {/* Price filter commented out for now */}
          {/* <Select value={priceFilter} onValueChange={onPriceChange}>
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
          </Select> */}

          <Select value={dateFilter} onValueChange={onDateChange}>
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

          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={onPriorityChange}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="none">No Priority</SelectItem>
              {Array.from({ length: parseInt(process.env.PRODUCT_PRIORITY_LEVELS || "5") }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  Priority {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          {creators.length > 0 && (
            <Select value={creatorFilter} onValueChange={onCreatorChange}>
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
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Products Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.map((product: any) => (
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
                {product.priority && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    P{product.priority}
                  </Badge>
                )}
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

                <div className="flex gap-2 mt-3">
                  <Select
                    value={product.priority ? product.priority.toString() : 'none'}
                    onValueChange={(value) => {
                      const priority = value === 'none' ? null : parseInt(value)
                      onSetPriority?.(product, priority)
                    }}
                  >
                    <SelectTrigger className="flex-1 text-xs h-8">
                      <SelectValue placeholder="No Priority" />
                    </SelectTrigger>
                    <SelectContent onClick={(e) => e.stopPropagation()}>
                      <SelectItem value="none">No Priority</SelectItem>
                      {Array.from({ length: parseInt(process.env.PRODUCT_PRIORITY_LEVELS || "5") }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          Priority {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {onEdit && userRole !== 'VIEWER' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(product)
                      }}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onPreview?.(product)
                    }}
                    className="flex-1"
                  >
                    Preview
                  </Button>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((product: any) => (
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
                          {product.priority && (
                            <Badge className="text-xs bg-yellow-500 hover:bg-yellow-600">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              P{product.priority}
                            </Badge>
                          )}
                          {product.isFeatured && (
                            <Badge className="text-xs">Featured</Badge>
                          )}
                          {product.isArchived && (
                            <Badge variant="secondary" className="text-xs">Archived</Badge>
                          )}
                        </div>

                        <div className="flex gap-2 mt-2">
                          <Select
                            value={product.priority ? product.priority.toString() : 'none'}
                            onValueChange={(value) => {
                              const priority = value === 'none' ? null : parseInt(value)
                              onSetPriority?.(product, priority)
                            }}
                          >
                            <SelectTrigger className="flex-1 text-xs h-8">
                              <SelectValue placeholder="No Priority" />
                            </SelectTrigger>
                            <SelectContent onClick={(e) => e.stopPropagation()}>
                              <SelectItem value="none">No Priority</SelectItem>
                              {Array.from({ length: parseInt(process.env.PRODUCT_PRIORITY_LEVELS || "5") }, (_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                  Priority {i + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {onEdit && userRole !== 'VIEWER' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onEdit(product)
                              }}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onPreview?.(product)
                            }}
                          >
                            Preview
                          </Button>
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
              onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            {getVisiblePages().map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange?.(page)}
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(Math.min(pagination?.totalPages || 1, currentPage + 1))}
              disabled={currentPage === (pagination?.totalPages || 1)}
            >
              Next
            </Button>
          </div>
        )
      })()}
    </>
  )
}