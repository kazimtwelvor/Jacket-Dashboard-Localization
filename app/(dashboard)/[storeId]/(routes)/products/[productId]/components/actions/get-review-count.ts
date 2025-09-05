"use server"

import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function getReviewCount(storeId: string, productId?: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error("Unauthenticated")
    }


    const totalReviews = await prismadb.review.count({
      where: {
        storeId: storeId,
      },
    })

    let productReviews = 0
    if (productId && productId !== "new") {
      productReviews = await prismadb.review.count({
        where: {
          storeId: storeId,
          productId: productId,
        },
      })
    }

    const sampleReviews = await prismadb.review.findMany({
      where: {
        storeId: storeId,
        ...(productId && productId !== "new" ? { productId: productId } : {}),
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
    })
    return {
      success: true,
      totalReviews,
      productReviews,
      sampleReviews: sampleReviews.map(r => ({
        id: r.id,
        productName: r.product.name,
        userName: r.userName,
        rating: r.rating,
        comment: r.comment.substring(0, 100) + (r.comment.length > 100 ? "..." : ""),
        isApproved: r.isApproved,
        createdAt: r.createdAt.toISOString(),
      })),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      totalReviews: 0,
      productReviews: 0,
      sampleReviews: [],
    }
  }
}