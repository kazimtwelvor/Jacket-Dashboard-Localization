"use server"

import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function getProductReviews(storeId: string, productId: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error("Unauthenticated")
    }

    const reviews = await prismadb.review.findMany({
      where: {
        storeId: storeId,
        productId: productId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      success: true,
      reviews: reviews.map(review => ({
        id: review.id,
        text: review.comment,
        customerName: review.userName,
        rating: review.rating,
        date: review.createdAt.toISOString(),
      })),
    }
  } catch (error) {
    return {
      success: false,
      reviews: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}