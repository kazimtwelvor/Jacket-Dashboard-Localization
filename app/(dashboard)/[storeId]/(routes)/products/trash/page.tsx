import type React from "react"
import { format } from "date-fns"

import prismadb from "@/lib/prismadb"
import { formatter } from "@/lib/utils"

import { TrashDataTable } from "../components/trash-data-table"
import { trashColumns } from "../components/trash-columns"

interface TrashPageProps {
  params: {
    storeId: string
  }
  searchParams: {
    status?: string
    gender?: string
    material?: string
    style?: string
    size?: string
    color?: string
    minPrice?: string
    maxPrice?: string
  }
}

const TrashPage: React.FC<TrashPageProps> = async ({ params, searchParams }) => {
  const genderFilters = searchParams.gender?.split(",") || []
  const materialFilters = searchParams.material?.split(",") || []
  const styleFilters = searchParams.style?.split(",") || []
  const sizeFilters = searchParams.size?.split(",") || []
  const colorFilters = searchParams.color?.split(",") || []
  const minPrice = searchParams.minPrice ? Number.parseFloat(searchParams.minPrice) : undefined
  const maxPrice = searchParams.maxPrice ? Number.parseFloat(searchParams.maxPrice) : undefined

  const filterConditions: any = {
    storeId: params.storeId,
    isDeleted: true, 
  }

  if (genderFilters.length > 0) {
    filterConditions.gender = { in: genderFilters }
  }

  if (sizeFilters.length > 0) {
    filterConditions.sizeId = { in: sizeFilters }
  }

  if (colorFilters.length > 0) {
    filterConditions.colorId = { in: colorFilters }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filterConditions.price = {}

    if (minPrice !== undefined) {
      filterConditions.price.gte = minPrice
    }

    if (maxPrice !== undefined) {
      filterConditions.price.lte = maxPrice
    }
  }

  const products = await prismadb.product.findMany({
    where: filterConditions,
    include: {
      category: true,
      size: true,
      color: true,
      images: true,
    },
    orderBy: {
      deletedAt: "desc",
    },
  })

  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      name: "asc",
    },
  })

  const sizes = await prismadb.size.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      name: "asc",
    },
  })

  const colors = await prismadb.color.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      name: "asc",
    },
  })

  const formattedProducts = products.map((item) => ({
    id: item.id,
    name: item.name,
    price: formatter.format(item.price),
    category: item.category.name,
    sku: item.sku,
    sizes: item.size.name,
    colors: item.color.value,
    deletedAt: item.deletedAt ? format(item.deletedAt, "MMMM do, yyyy") : "Unknown",
    imageUrl: item.images && item.images.length > 0 ? item.images[0].url : undefined,
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trash ({formattedProducts.length})</h1>
            <p className="text-muted-foreground">Manage deleted products</p>
          </div>
        </div>
        <div className="border rounded-lg">
          <TrashDataTable searchKey="name" columns={trashColumns} data={formattedProducts} />
        </div>
      </div>
    </div>
  )
}

export default TrashPage
