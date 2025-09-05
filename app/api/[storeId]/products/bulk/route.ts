import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb"

export async function PATCH(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()
    const { storeId } = params
    const body = await req.json()

    const { ids, data } = body

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new NextResponse("Product IDs are required", { status: 400 })
    }

    if (!data || Object.keys(data).length === 0) {
      return new NextResponse("Data is required", { status: 400 })
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


    const updateData: any = {}

    if (data.isFeatured !== undefined) {
      updateData.isFeatured = data.isFeatured === true || data.isFeatured === "true"
    }

    if (data.isArchived !== undefined) {
      updateData.isArchived = data.isArchived === true || data.isArchived === "true"
    }

    if (data.isPublished !== undefined) {
      updateData.isPublished = data.isPublished === true || data.isPublished === "true"
    }

    if (data.isDiscounted !== undefined) {
      updateData.isDiscounted = data.isDiscounted === true || data.isDiscounted === "true"
    }

    if (data.name) updateData.name = data.name
    if (data.categoryId) updateData.categoryId = data.categoryId
    if (data.colorDetails) updateData.colorDetails = data.colorDetails
    if (data.sizeDetails) updateData.sizeDetails = data.sizeDetails
    if (data.sku) updateData.sku = data.sku
    if (data.stockStatus) updateData.stockStatus = data.stockStatus
    if (data.description) updateData.description = data.description
    if (data.material) updateData.material = data.material
    if (data.style) updateData.style = data.style
    if (data.tags) updateData.tags = data.tags

    if (data.price) updateData.price = Number.parseFloat(data.price)
    if (data.salePrice) updateData.salePrice = Number.parseFloat(data.salePrice)
    if (data.originalPrice) updateData.originalPrice = Number.parseFloat(data.originalPrice)

    if (data.specifications) {
      updateData.specifications =
        typeof data.specifications === "object" ? data.specifications : JSON.parse(data.specifications || "{}")
    }

    if (data.colorLinks) {
      updateData.colorLinks =
        typeof data.colorLinks === "object" ? data.colorLinks : JSON.parse(data.colorLinks || "{}")
    }

    if (data.downloadFiles) {
      updateData.downloadFiles =
        typeof data.downloadFiles === "object" ? data.downloadFiles : JSON.parse(data.downloadFiles || "{}")
    }

    // Update multiple products
    const updatedProducts = await prismadb.product.updateMany({
      where: {
        id: {
          in: ids,
        },
        storeId: storeId,
      },
      data: updateData,
    })


    return NextResponse.json({ success: true, count: updatedProducts.count })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

// DELETE - Delete multiple products
export async function DELETE(req: Request, { params }: { params: { storeId: string } }) {
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

    await prismadb.image.deleteMany({
      where: {
        productId: {
          in: ids,
        },
      },
    })

    const deletedProducts = await prismadb.product.deleteMany({
      where: {
        id: {
          in: ids,
        },
        storeId: storeId,
      },
    })

    return NextResponse.json(deletedProducts)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
