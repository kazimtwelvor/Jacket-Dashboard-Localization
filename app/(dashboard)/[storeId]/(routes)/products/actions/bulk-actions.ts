"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import prismadb from "@/lib/prismadb"

export async function bulkDeleteProducts(productIds: string[], storeId: string) {
  try {
    const { userId } = await auth()

    if (!userId) {
      throw new Error("Unauthenticated")
    }

    if (!productIds || productIds.length === 0) {
      throw new Error("No products selected")
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

    // Get product-image relationships first
    const productImages = await prismadb.productImage.findMany({
      where: {
        productId: {
          in: productIds,
        },
      },
      select: {
        imageId: true,
      },
    })

    // Delete product-image relationships
    await prismadb.productImage.deleteMany({
      where: {
        productId: {
          in: productIds,
        },
      },
    })

    // Delete orphaned images
    await prismadb.image.deleteMany({
      where: {
        id: {
          in: productImages.map(pi => pi.imageId),
        },
      },
    })

    // Delete the products
    await prismadb.product.deleteMany({
      where: {
        id: {
          in: productIds,
        },
        storeId: storeId,
      },
    })

    revalidatePath(`/${storeId}/products`)
    return { success: true }
  } catch (error) {
    console.error("[BULK_DELETE_PRODUCTS]", error)
    throw new Error("Failed to delete products")
  }
}

export async function bulkUpdateProducts(productIds: string[], storeId: string, data: { [key: string]: any }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      throw new Error("Unauthenticated")
    }

    if (!productIds || productIds.length === 0) {
      throw new Error("No products selected")
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

    // Update multiple products
    await prismadb.product.updateMany({
      where: {
        id: {
          in: productIds,
        },
        storeId: storeId,
      },
      data,
    })

    revalidatePath(`/${storeId}/products`)
    return { success: true }
  } catch (error) {
    console.error("[BULK_UPDATE_PRODUCTS]", error)
    throw new Error("Failed to update products")
  }
}

export async function bulkDuplicateProducts(productIds: string[], storeId: string) {
  try {
    const { userId } = await auth()

    if (!userId) {
      throw new Error("Unauthenticated")
    }

    if (!productIds || productIds.length === 0) {
      throw new Error("No products selected")
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

    // Get all products to duplicate
    const products = await prismadb.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        storeId: storeId,
      },
      include: {
        images: {
          include: {
            image: true,
          },
        },
      },
    })

    // Duplicate each product
    for (const product of products) {
      // Create a new product with the same data
      const newProduct = await prismadb.product.create({
        data: {
          name: `${product.name} (Copy)`,
          price: product.price,
          description: product.description,
          categoryId: product.categoryId,
          colorDetails: product.colorIds,
          sizeDetails: product.sizeIds,
          isFeatured: product.isFeatured,
          isArchived: product.isArchived,
          isPublished: false, // Always create as draft
          storeId: product.storeId,
          sku: `${product.sku}-copy-${Date.now()}`,
          // Add any other fields your product model has
        },
      })

      // Duplicate all images and their relationships
      for (const productImage of product.images) {
        // Create a new image
        const newImage = await prismadb.image.create({
          data: {
            url: productImage.image.url,
          },
        })

        // Create the product-image relationship
        await prismadb.productImage.create({
          data: {
            productId: newProduct.id,
            imageId: newImage.id,
            order: productImage.order,
            isPrimary: productImage.isPrimary,
          },
        })
      }
    }

    revalidatePath(`/${storeId}/products`)
    return { success: true }
  } catch (error) {
    console.error("[BULK_DUPLICATE_PRODUCTS]", error)
    throw new Error("Failed to duplicate products")
  }
}
