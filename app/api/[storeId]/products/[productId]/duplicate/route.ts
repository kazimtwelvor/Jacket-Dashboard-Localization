
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { Prisma } from "@prisma/client"

import prismadb from "@/lib/prismadb"

export async function POST(req: Request, { params }: { params: { storeId: string; productId: string } }) {
  try {
    const { userId } = await auth()
    // Fix 1: Await params before destructuring
    const storeId = params.storeId
    const productId = params.productId

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    if (!productId) {
      return new NextResponse("Product ID is required", { status: 400 })
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

    // Updated: Use explicit select to avoid referencing removed fields
    const originalProduct = await prismadb.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        name: true,
        price: true,
        salePrice: true,
        sku: true,
        description: true,
        isFeatured: true,
        isArchived: true,
        isPublished: true,
        storeId: true,
        categoryId: true,
        colorDetails: true,
        sizeDetails: true,
        material: true,
        style: true,
        tags: true,
        gender: true,
        specifications: true,
        metaTitle: true,
        metaDescription: true,
        slug: true,
        focusKeyword: true,
        additionalKeywords: true,
        // noIndex: true,
        brandName: true,
        // ratingValue: true,
        // reviewCount: true,
        // purchaseNote: true,
        images: {
          select: {
            image: {
              select: {
                url: true,
              },
            },
          },
        },
      },
    })

    if (!originalProduct) {
      return new NextResponse("Product not found", { status: 404 })
    }

    // Handle JSON fields properly
    const colorDetailsValue =
      originalProduct.colorDetails === null ? Prisma.JsonNull : (originalProduct.colorDetails as Prisma.InputJsonValue)

    const sizeDetailsValue =
      originalProduct.sizeDetails === null ? Prisma.JsonNull : (originalProduct.sizeDetails as Prisma.InputJsonValue)

    const specificationsValue =
      originalProduct.specifications === null
        ? Prisma.JsonNull
        : (originalProduct.specifications as Prisma.InputJsonValue)

    // Create a duplicate product with a copy suffix
    const duplicatedProduct = await prismadb.product.create({
      data: {
        name: `${originalProduct.name} (Copy)`,
        price: originalProduct.price,
        salePrice: originalProduct.salePrice,
        sku: originalProduct.sku ? `${originalProduct.sku}-1` : "",
        description: originalProduct.description,
        isFeatured: originalProduct.isFeatured,
        isArchived: originalProduct.isArchived,
        isPublished: originalProduct.isPublished,
        isDeleted: false,
        storeId: storeId,
        // Connect the same category if it exists
        categoryId: originalProduct.categoryId,
        // Use the new colorDetails and sizeDetails fields
        colorDetails: colorDetailsValue,
        sizeDetails: sizeDetailsValue,
        // Copy other fields
        material: originalProduct.material || [],
        style: originalProduct.style || [],
        tags: originalProduct.tags || [],
        gender: originalProduct.gender,
        specifications: specificationsValue,
        metaTitle: originalProduct.metaTitle,
        metaDescription: originalProduct.metaDescription,
        slug: originalProduct.slug ? `${originalProduct.slug}-copy` : null,
        focusKeyword: originalProduct.focusKeyword,
        additionalKeywords: originalProduct.additionalKeywords || [],
        // noIndex: originalProduct.noIndex,
        brandName: originalProduct.brandName,
        // ratingValue: originalProduct.ratingValue,
        // reviewCount: originalProduct.reviewCount,
        // purchaseNote: originalProduct.purchaseNote,
      },
    })

    // Duplicate the images
    if (originalProduct.images.length > 0) {
      await prismadb.image.createMany({
        data: originalProduct.images.map((image) => ({
          productId: duplicatedProduct.id,
          url: image.image.url,
        })),
      })
    }

    return NextResponse.json(duplicatedProduct)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
