import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb"

// POST - Duplicate multiple products
export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()
    const { storeId } = params
    const body = await req.json()

    const { ids } = body

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new NextResponse("Product IDs are required", { status: 400 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    console.log(`[PRODUCTS_BULK_DUPLICATE] Duplicating ${ids.length} products`)

    // Get all products to duplicate
    const products = await prismadb.product.findMany({
      where: {
        id: {
          in: ids,
        },
        storeId: storeId,
      },
      include: {
        images: true,
      },
    })

    console.log(`[PRODUCTS_BULK_DUPLICATE] Found ${products.length} products to duplicate`)

    // Duplicate each product
    const duplicatedProducts = []

    for (const product of products) {
      try {
        console.log(`[PRODUCTS_BULK_DUPLICATE] Duplicating product: ${product.id}`)

        // Create a new product with the same data
        const newProduct = await prismadb.product.create({
          data: {
            storeId: product.storeId,
            name: `${product.name} (Copy)`,
            price: product.price,
            categoryId: product.categoryId || undefined,
            colorId: product.colorDetails || undefined,
            sizeId: product.sizeDetails || undefined,
            isFeatured: product.isFeatured || false,
            isArchived: false,
            isPublished: false,
            // Only include fields that are not null
            ...(product.description ? { description: product.description } : {}),
            ...(product.sku ? { sku: `${product.sku}-copy` } : {}),
          },
        })

        console.log(`[PRODUCTS_BULK_DUPLICATE] Created new product: ${newProduct.id}`)
        duplicatedProducts.push(newProduct)

        // Duplicate all images
        if (product.images && product.images.length > 0) {
          console.log(`[PRODUCTS_BULK_DUPLICATE] Duplicating ${product.images.length} images`)

          for (const image of product.images) {
            await prismadb.image.create({
              data: {
                url: image.url,
                productId: newProduct.id,
              },
            })
          }
        }
      } catch (error) {
        console.error(
          `[PRODUCTS_BULK_DUPLICATE] Error duplicating product ${product.id}:`,
          error instanceof Error ? error.message : "Unknown error",
        )
      }
    }

    console.log(`[PRODUCTS_BULK_DUPLICATE] Successfully duplicated ${duplicatedProducts.length} products`)
    return NextResponse.json({
      success: true,
      count: duplicatedProducts.length,
      products: duplicatedProducts,
    })
  } catch (error) {
    console.error("[PRODUCTS_BULK_DUPLICATE] Error:", error instanceof Error ? error.message : "Unknown error")
    return new NextResponse("Internal error", { status: 500 })
  }
}
