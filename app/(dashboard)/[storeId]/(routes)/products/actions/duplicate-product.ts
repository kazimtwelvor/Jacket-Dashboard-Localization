"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import prismadb from "@/lib/prismadb"
import { Prisma } from "@prisma/client"

// Function to generate a unique SKU
async function generateUniqueSku(baseSku: string, attempt: number = 1): Promise<string> {
  const proposedSku = `${baseSku}-${attempt}`
  
  // Check if this SKU already exists
  const existing = await prismadb.product.findFirst({
    where: { sku: proposedSku }
  })

  if (existing) {
    // If SKU exists, try the next number
    return generateUniqueSku(baseSku, attempt + 1)
  }

  return proposedSku
}

export async function duplicateProduct(productId: string, storeId: string) {
  try {
    const { userId } = await auth()

    if (!userId) {
      throw new Error("Unauthorized")
    }

    // Verify store ownership
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      throw new Error("Unauthorized")
    }

    // Get the product to duplicate
    const product = await prismadb.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        images: true,
      },
    })

    if (!product) {
      throw new Error("Product not found")
    }

    // Generate a unique SKU
    const newSku = await generateUniqueSku(product.sku || 'SKU-0001')

    // Handle JSON fields properly for Prisma
    const specificationsValue =
      product.specifications === null ? Prisma.JsonNull : (product.specifications as Prisma.InputJsonValue)

    const colorLinksValue =
      product.colorLinks === null ? Prisma.JsonNull : (product.colorLinks as Prisma.InputJsonValue)
      
    const sizeDetailsValue =
      product.sizeDetails === null ? Prisma.JsonNull : (product.sizeDetails as Prisma.InputJsonValue)
      
    const colorDetailsValue =
      product.colorDetails === null ? Prisma.JsonNull : (product.colorDetails as Prisma.InputJsonValue)

    // Create a new product with the same data
    const duplicatedProduct = await prismadb.product.create({
      data: {
        name: `${product.name} (Copy)`,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice,
        sku: newSku,
        stockStatus: product.stockStatus,
        storeId: product.storeId,
        categoryId: product.categoryId,
        sizeDetails: sizeDetailsValue,
        colorDetails: colorDetailsValue,
        material: product.material,
        style: product.style,
        gender: product.gender,
        tags: product.tags,
        specifications: specificationsValue,
        colorLinks: colorLinksValue,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
        slug: product.slug ? `${product.slug}-copy-${newSku.split('-').pop()}` : null,
        focusKeyword: product.focusKeyword,
        additionalKeywords: product.additionalKeywords,
        // noIndex: product.noIndex,
        brandName: product.brandName,
        // ratingValue: product.ratingValue,
        // reviewCount: product.reviewCount,
        // purchaseNote: product.purchaseNote,
      },
    })

    // Duplicate images by creating new ProductImage entries that reference existing Image records
    if (product.images.length > 0) {
      await prismadb.productImage.createMany({
        data: product.images.map((image, index) => ({
          productId: duplicatedProduct.id,
          imageId: image.imageId,
          isPrimary: index === 0,
          order: image.order
        })),
      })
    }

    revalidatePath(`/${storeId}/products`)
    return duplicatedProduct
  } catch (error) {
    throw new Error("Failed to duplicate product")
  }
}
