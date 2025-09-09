"use client"
import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import type React from "react"
import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Plus, CheckCircle, XCircle, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { ApiList } from "@/components/ui/api-list"
import { DataTable } from "@/components/ui/data-table"
import type { ProductColumn } from "../types"
import { columns } from "./columns"
import { type TrashProductColumn, trashColumns } from "./trash-columns"
import { FilterSidebar } from "./filter/filter-sidebar"
import { ActiveFilters } from "./filter/active-filters"
interface ProductsClientProps {
  data: ProductColumn[] | TrashProductColumn[]
  categories: any[]
  sizes: any[]
  colors: any[]
  isTrash?: boolean
  products: ProductColumn[]
  categoriesOld: { id: string; name: string }[]
  sizesOld: { id: string; name: string }[]
  colorsOld: { id: string; name: string; value: string }[]
  // productTypes: { id: string; name: string }[]
  stockStatuses: { id: string; name: string }[]
  seoStatuses: { id: string; name: string }[]
  storeId: string
  stats: {
    total: number
    published: number
    draft: number
    archived: number
    trash: number
  }
  pagination: {
    currentPage: number
    totalPages: number
    perPage: number
    totalItems: number
  }
  view?: string
  currentTab: string
}

export const ProductsClient: React.FC<ProductsClientProps> = ({
  data,
  categories,
  sizes,
  colors,
  isTrash = false,
  products,
  // productTypes,
  storeId,
  stats,
  pagination,
  view = "table",
  currentTab,
}) => {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState(searchParams?.get("search") || "")
  const [sortColumn, setSortColumn] = useState(searchParams?.get("sort") || "createdAt")
  const [sortOrder, setSortOrder] = useState(searchParams?.get("order") || "desc")
  const [categoryFilter, setCategoryFilter] = useState(searchParams?.get("category") || "")
  // const [productTypeFilter, setProductTypeFilter] = useState(searchParams?.get("productType") || "")
  const [stockStatusFilter, setStockStatusFilter] = useState(searchParams?.get("stockStatus") || "")
  const [seoStatusFilter, setSeoStatusFilter] = useState(searchParams?.get("seoStatus") || "")
  const [filterOpen, setFilterOpen] = useState(false)
  const [urlUpdated, setUrlUpdated] = useState(false)
  const [frontendUrl, setFrontendUrl] = useState<string | null>(null)

  useEffect(() => {
    const getFrontendUrl = async () => {
      try {
        const response = await fetch("/api/config/frontend-url")
        if (response.ok) {
          const { url } = await response.json()
          setFrontendUrl(url)
        } else {
        }
      } catch (error) {
      }
    }

    getFrontendUrl()
  }, [])

  useEffect(() => {
    if (urlUpdated) return

    const params = new URLSearchParams(searchParams?.toString() || "")

    if (searchTerm) params.set("search", searchTerm)
    else params.delete("search")

    if (sortColumn !== "createdAt") params.set("sort", sortColumn)
    else params.delete("sort")

    if (sortOrder !== "desc") params.set("order", sortOrder)
    else params.delete("order")

    if (categoryFilter) params.set("category", categoryFilter)
    else params.delete("category")

    // if (productTypeFilter) params.set("productType", productTypeFilter)
    // else params.delete("productType")

    if (stockStatusFilter) params.set("stockStatus", stockStatusFilter)
    else params.delete("stockStatus")

    if (seoStatusFilter) params.set("seoStatus", seoStatusFilter)
    else params.delete("seoStatus")

    if (currentTab !== "active") params.set("tab", currentTab)
    else params.delete("tab")

    if (view !== "table") params.set("view", view)
    else params.delete("view")

    const newUrl = `/${storeId}/products?${params.toString()}`
    router.push(newUrl)
  }, [
    searchTerm,
    sortColumn,
    sortOrder,
    categoryFilter,
    // productTypeFilter,
    stockStatusFilter,
    seoStatusFilter,
    currentTab,
    view,
    router,
    searchParams,
    storeId,
    urlUpdated,
  ])

  useEffect(() => {
    setUrlUpdated(true)
    setSearchTerm(searchParams?.get("search") || "")
    setSortColumn(searchParams?.get("sort") || "createdAt")
    setSortOrder(searchParams?.get("order") || "desc")
    setCategoryFilter(searchParams?.get("category") || "")
    // setProductTypeFilter(searchParams?.get("productType") || "")
    setStockStatusFilter(searchParams?.get("stockStatus") || "")
    setSeoStatusFilter(searchParams?.get("seoStatus") || "")

    const timer = setTimeout(() => setUrlUpdated(false), 100)
    return () => clearTimeout(timer)
  }, [searchParams])

  const handleTabChange = (value: string) => {
    const current = new URLSearchParams(searchParams?.toString() || "")
    current.set("tab", value)
    current.delete("page")

    const search = current.toString()
    const query = search ? `?${search}` : ""
    router.push(`/${storeId}/products${query}`)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortOrder("desc")
    }
  }

  const handleRefresh = () => {
    router.refresh()
    toast({
      title: "Refreshed",
      description: "Product list has been refreshed.",
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map((p) => p.id))
    } else {
      setSelectedProducts([])
    }
  }

  const handleSelectProduct = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, id])
    } else {
      setSelectedProducts((prev) => prev.filter((productId) => productId !== id))
    }
  }

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return null
    return sortOrder === "asc" ? "↑" : "↓"
  }

  const getSeoScoreColor = (score: number) => {
    if (score >= 70) return "bg-emerald-500"
    if (score >= 40) return "bg-amber-500"
    return "bg-destructive"
  }

  const renderSeoScore = (score: number) => {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">SEO Score {score}%</span>
        </div>
        <Progress value={score} className={`h-1.5 ${getSeoScoreColor(score)}`} />
      </div>
    )
  }

  const renderStockStatus = (status: string) => {
    if (status === "instock") {
      return (
        <Badge variant="outline" className="bg-emerald-500 text-white border-emerald-500">
          <CheckCircle className="h-3.5 w-3.5 mr-1" />
          In Stock
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-muted">
        <XCircle className="h-3.5 w-3.5 mr-1" />
        Out of Stock
      </Badge>
    )
  }

  const onMoveToTrash = async (productId: string) => {
    try {
      const response = await fetch(`/api/${storeId}/products/${productId}/trash`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to move product to trash")
      }

      router.refresh()
      toast({
        title: "Success",
        description: "Product moved to trash successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const onPreview = (productId: string) => {
    const hardcodedUrl = "http://192.168.100.114:3001"

    const previewUrl = `${hardcodedUrl}/product/${productId}`
    window.open(previewUrl, "_blank")

  }

  const onDuplicate = async (productId: string) => {
    try {
      const response = await fetch(`/api/${storeId}/products/${productId}/duplicate`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to duplicate product")
      }

      router.refresh()
      toast({
        title: "Success",
        description: "Product duplicated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateProductStatus = async (productId: string, data: any) => {
    try {
      if (data.isPublished === false && data.isArchived === undefined) {
        data.isArchived = false
      }

      const response = await fetch(`/api/${storeId}/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update product status")
      }

      router.refresh()
      toast({
        title: "Success",
        description: "Product status updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Products (${data.length})`} description="Manage products for your store" />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setFilterOpen(true)} className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button onClick={() => router.push(`/${params.storeId}/products/new`)}>
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Button>
        </div>
      </div>

      <Separator />

      <ActiveFilters categories={categories} sizes={sizes} colors={colors} />

      <FilterSidebar
        categories={categories}
        sizes={sizes}
        colors={colors}
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
      />

      <DataTable searchKey="name" columns={isTrash ? trashColumns : columns} data={data} />

      <Heading title="API" description="API Calls for Products" />
      <Separator />
      <ApiList entityName="products" entityIdName="productId" />
    </>
  )
}

