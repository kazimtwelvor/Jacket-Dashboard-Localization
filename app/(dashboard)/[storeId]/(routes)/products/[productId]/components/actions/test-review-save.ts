"use server"

import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function testReviewSave(storeId: string, productId: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error("Unauthenticated")
    }

    console.log("Testing review save for:", { storeId, productId })

    const product = await prismadb.product.findFirst({
      where: {
        id: productId,
        storeId: storeId,
      },
    })

    if (!product) {
      throw new Error("Product not found")
    }

    console.log("Product found:", product.name)

    const testReview = await prismadb.review.create({
      data: {
        storeId: storeId,
        productId: productId,
        userId: `test-${Date.now()}`,
        userName: "Test Customer",
        rating: 5,
        comment: "This is a test review to verify the database connection.",
        title: "Test Review",
        isApproved: true,
        createdAt: new Date(),
      },
    })

    console.log("Test review created successfully:", testReview.id)

    const savedReview = await prismadb.review.findUnique({
      where: {
        id: testReview.id,
      },
    })

    if (savedReview) {
      console.log("Review verified in database:", savedReview.id)
      
      await prismadb.review.delete({
        where: {
          id: testReview.id,
        },
      })
      
      console.log("Test review cleaned up")
      
      return {
        success: true,
        message: "Review save test passed successfully",
      }
    } else {
      return {
        success: false,
        message: "Review was not found in database after creation",
      }
    }
  } catch (error) {
    console.error("Test review save error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}