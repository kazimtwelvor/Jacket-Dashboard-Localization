import type React from "react"
import { format } from "date-fns"
import { auth } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb"
import { formatter } from "@/lib/utils"
import { checkRole } from "@/utils/roles"

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
    const isAdmin = await checkRole("admin")

    const [publishedCount, archivedCount, trashedCount] = await Promise.all([
      prismadb.product.count({
        where: {
          storeId: storeId,
          isDeleted: false,
          isPublished: true,
          isArchived: false,
        },
      }),
      prismadb.product.count({
        where: {
          storeId: storeId,
          isDeleted: false,
          isArchived: true,
        },
      }),
      prismadb.product.count({
        where: {
          storeId: storeId,
          isDeleted: true,
        },
      }),
    ])

    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <ProductsClient 
            storeId={storeId}
            isOwner={isOwner}
            isAdmin={isAdmin}
            initialCounts={{
              published: publishedCount,
              archived: archivedCount,
              trash: trashedCount,
            }}
          />
        </div>
      </div>
    )
  } catch (error) {
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
