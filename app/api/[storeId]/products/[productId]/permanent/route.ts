import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb"

export async function DELETE(req: Request, { params }: { params: Promise<{ storeId: string; productId: string }> }) {
  try {
    const { userId } = await auth()
    const { searchParams } = new URL(req.url)
    const deleteImages = searchParams.get('deleteImages') === 'true'
    const resolvedParams = await params

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!resolvedParams.productId) {
      return new NextResponse("Product ID is required", { status: 400 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: resolvedParams.storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    if (deleteImages) {
      // Get all images associated with this product
      const productImages = await prismadb.productImage.findMany({
        where: {
          productId: resolvedParams.productId,
        },
        include: {
          image: true,
        },
      })

      // Delete physical files from frontend server
      for (const productImage of productImages) {
        try {
          const frontendUrl = process.env.FRONTEND_STORE_URL || 'localhost:3000'
          const baseUrl = frontendUrl.startsWith('http') ? frontendUrl : `http://${frontendUrl}`
          
          const response = await fetch(`${baseUrl}/api/delete-image`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageUrl: productImage.image.url })
          })
          
          if (!response.ok) {
          }
        } catch (fileError) {
        }
      }

      // Delete product-image relationships
      await prismadb.productImage.deleteMany({
        where: {
          productId: resolvedParams.productId,
        },
      })

      // Delete the images from database
      await prismadb.image.deleteMany({
        where: {
          id: {
            in: productImages.map(pi => pi.imageId),
          },
        },
      })
    } else {
      // Only delete product-image relationships, keep images
      await prismadb.productImage.deleteMany({
        where: {
          productId: resolvedParams.productId,
        },
      })
    }

    // Delete all related records first to avoid foreign key constraints
    await prismadb.$transaction(async (tx) => {
      // Delete wishlist items
      await tx.wishlistItem.deleteMany({
        where: {
          productId: resolvedParams.productId,
        },
      })

      // Delete reviews
      await tx.review.deleteMany({
        where: {
          productId: resolvedParams.productId,
        },
      })

      // Delete order items
      await tx.orderItem.deleteMany({
        where: {
          productId: resolvedParams.productId,
        },
      })

      // Finally delete the product
      await tx.product.delete({
        where: {
          id: resolvedParams.productId,
        },
      })
    })

    return NextResponse.json({ message: "Product permanently deleted" })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
