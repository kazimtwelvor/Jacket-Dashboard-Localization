import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb"

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


    const duplicatedProducts = []

    for (const product of products) {
      try {
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
            ...(product.description ? { description: product.description } : {}),
            ...(product.sku ? { sku: `${product.sku}-copy` } : {}),
          },
        })

        duplicatedProducts.push(newProduct)

        if (product.images && product.images.length > 0) {

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
      }
    }

    return NextResponse.json({
      success: true,
      count: duplicatedProducts.length,
      products: duplicatedProducts,
    })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
