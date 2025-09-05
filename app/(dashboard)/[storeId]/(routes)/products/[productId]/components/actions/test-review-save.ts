"use server"

import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function testReviewSave(storeId: string, productId: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error("Unauthenticated")
    }


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


    const savedReview = await prismadb.review.findUnique({
      where: {
        id: testReview.id,
      },
    })

    if (savedReview) {
      
      await prismadb.review.delete({
        where: {
          id: testReview.id,
        },
      })
      
      
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
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}