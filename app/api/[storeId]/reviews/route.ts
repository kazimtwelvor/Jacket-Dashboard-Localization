import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb"

// Allow requests from the store frontend
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()
    const { storeId } = params

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get("productId")
    const ratingParam = searchParams.get("rating")
    const rating = ratingParam ? Number.parseInt(ratingParam) : undefined

    // Build the query
    const query: any = {
      storeId,
    }

    if (productId) {
      query.productId = productId
    }

    if (rating !== undefined) {
      query.rating = rating
    }

    // Fetch reviews from database
    const reviews = await prismadb.review.findMany({
      where: query,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: true,
          },
        },
      },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.log("[REVIEWS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    console.log("Received review submission request")
    const { storeId } = params
    console.log("Store ID:", storeId)

    // Log the raw request body for debugging
    const rawBody = await req.text()
    console.log("Raw request body:", rawBody)

    // Parse the body
    let body
    try {
      body = JSON.parse(rawBody)
      console.log("Parsed body:", body)
    } catch (e) {
      console.error("Error parsing request body:", e)
      return new NextResponse("Invalid JSON in request body", { status: 400 })
    }

    const { productId, rating, comment, title, userName, email, photoUrl, isApproved = false } = body

    // Validate required fields
    if (!storeId) {
      console.log("Missing store ID")
      return new NextResponse("Store ID is required", { status: 400 })
    }

    if (!productId) {
      console.log("Missing product ID")
      return new NextResponse("Product ID is required", { status: 400 })
    }

    if (!rating || rating < 1 || rating > 5) {
      console.log("Invalid rating:", rating)
      return new NextResponse("Rating must be between 1 and 5", { status: 400 })
    }

    if (!comment) {
      console.log("Missing comment")
      return new NextResponse("Comment is required", { status: 400 })
    }

    if (!userName) {
      console.log("Missing user name")
      return new NextResponse("User name is required", { status: 400 })
    }

    // Check if store exists
    console.log("Checking if store exists")
    const store = await prismadb.store.findUnique({
      where: {
        id: storeId,
      },
    })

    if (!store) {
      console.log("Store not found")
      return new NextResponse("Store not found", { status: 404 })
    }

    // Check if product exists
    console.log("Checking if product exists")
    const product = await prismadb.product.findUnique({
      where: {
        id: productId,
      },
    })

    if (!product) {
      console.log("Product not found")
      return new NextResponse("Product not found", { status: 404 })
    }

    // For reviews coming from the store front, we don't require authentication
    console.log("Creating review")

    try {
      // Create the review
      const review = await prismadb.review.create({
        data: {
          productId,
          storeId,
          userId: "store-customer", // Use a placeholder for customer reviews
          userName: userName,
          email: email || null, // Store the email from the form
          rating,
          comment,
          title,
          photoUrl: photoUrl || null, // Store the photo URL if provided
          isApproved: isApproved ?? false,
        },
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      })

      console.log("Review created successfully:", review)
      return NextResponse.json(review)
    } catch (dbError: unknown) {
      console.error("Database error creating review:", dbError)
      // Fix the TypeScript error by checking if dbError has a message property
      const errorMessage = dbError instanceof Error ? dbError.message : "Unknown database error"
      return new NextResponse(`Database error: ${errorMessage}`, { status: 500 })
    }
  } catch (error: unknown) {
    console.error("[REVIEWS_POST] Unhandled error:", error)
    // Fix the TypeScript error by checking if error has a message property
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return new NextResponse(`Internal error: ${errorMessage}`, { status: 500 })
  }
}
