import type React from "react"
import { format } from "date-fns"
import { auth } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb"
import { formatter } from "@/lib/utils"

import { ProductsClient } from "./components/client"

interface ProductsPageProps {
  params: Promise<{
    storeId: string
  }>
}

const ProductsPage: React.FC<ProductsPageProps> = async ({ params }) => {
  try {
    const { userId } = await auth()
    const { storeId } = await params

    if (!storeId) {
      return <div>Store ID is required</div>
    }

    if (!userId) {
      return <div>Authentication required</div>
    }

    const store = await prismadb.store.findUnique({
      where: {
        id: storeId,
      },
      select: {
        userId: true,
      },
    })
    
    const isOwner = store?.userId === userId

    const products = await prismadb.product.findMany({
      where: {
        storeId: storeId,
        isDeleted: false,
      },
      include: {
        images: {
          include: {
            image: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (products.length > 0) {
      console.log("First product from database:", {
        id: products[0].id,
        name: products[0].name,
        updatedByName: products[0].updatedByName,
        updatedAt: products[0].updatedAt,
      })
    }

    const trashedProducts = await prismadb.product.findMany({
      where: {
        storeId: storeId,
        isDeleted: true,
      },
      include: {
        images: {
          include: {
            image: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        deletedAt: "desc",
      },
    })

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      isFeatured: product.isFeatured,
      isArchived: product.isArchived,
      isPublished: product.isPublished,
      price: formatter.format(Number(product.price)),
      salePrice: product.salePrice ? formatter.format(Number(product.salePrice)) : null,
      category: product.categoryData && typeof product.categoryData === 'object' && product.categoryData !== null 
        ? `${(product.categoryData as any).material || ''} ${(product.categoryData as any).style || ''}`.trim() || "Uncategorized" 
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
      imageUrl:
        product.images && product.images.length > 0 && product.images[0].image
          ? product.images[0].image.url
          : "/placeholder.svg",
      createdAt: format(product.createdAt, "MMMM do, yyyy"),
      createdByName: product.createdByName || "Unknown",
      updatedByName: product.updatedByName || undefined,
      updatedAt: product.updatedAt ? format(product.updatedAt, "MMMM do, yyyy") : undefined,
      publishedAt: format(product.createdAt, "MMMM do, yyyy"),
      description: product.description || "",
    }))

    const formattedTrashedProducts = trashedProducts.map((product) => ({
      id: product.id,
      name: product.name,
      price: formatter.format(Number(product.price)),
      salePrice: product.salePrice ? formatter.format(Number(product.salePrice)) : null,
      category: product.categoryData && typeof product.categoryData === 'object' && product.categoryData !== null 
        ? `${(product.categoryData as any).material || ''} ${(product.categoryData as any).style || ''}`.trim() || "Uncategorized" 
        : "Uncategorized",
      sku: product.sku,
      stockStatus: product.stockStatus || "instock",
      deletedAt: product.deletedAt ? format(product.deletedAt, "MMMM do, yyyy") : "Unknown",
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
      imageUrl:
        product.images && product.images.length > 0 && product.images[0].image
          ? product.images[0].image.url
          : "/placeholder.svg",
      createdAt: format(product.createdAt, "MMMM do, yyyy"),
      createdByName: product.createdByName || "Unknown",
      updatedByName: product.updatedByName || undefined,
      updatedAt: product.updatedAt ? format(product.updatedAt, "MMMM do, yyyy") : undefined,
      publishedAt: format(product.createdAt, "MMMM do, yyyy"),
      description: product.description || "",
      isFeatured: product.isFeatured,
      isArchived: product.isArchived,
      isPublished: product.isPublished,
    }))

    const creatorCounts = formattedProducts.reduce(
      (acc, product) => {
        const creator = product.createdByName
        if (creator && creator !== "Unknown") {
          acc[creator] = (acc[creator] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    const topCreators = Object.entries(creatorCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

    while (topCreators.length < 3) {
      topCreators.push({ name: "None", count: 0 })
    }

    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <ProductsClient 
            data={formattedProducts} 
            trashedData={formattedTrashedProducts} 
            topCreators={topCreators}
            isOwner={isOwner}
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading products:", error)
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="bg-destructive/15 p-4 rounded-md">
            <h2 className="text-lg font-medium">Error loading products</h2>
            <p className="text-sm text-muted-foreground mt-2">
              {error instanceof Error ? error.message : "An unknown error occurred"}
            </p>
          </div>
        </div>
      </div>
    )
  }
}

export default ProductsPage
