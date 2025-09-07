import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb"

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

    const query: any = {
      storeId,
    }

    if (productId) {
      query.productId = productId
    }

    if (rating !== undefined) {
      query.rating = rating
    }

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
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { storeId } = params

    const rawBody = await req.text()

    let body
    try {
      body = JSON.parse(rawBody)
    } catch (e) {
      return new NextResponse("Invalid JSON in request body", { status: 400 })
    }

    const { productId, rating, comment, title, userName, email, photoUrl, isApproved = false } = body

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    if (!productId) {
      return new NextResponse("Product ID is required", { status: 400 })
    }

    if (!rating || rating < 1 || rating > 5) {
      return new NextResponse("Rating must be between 1 and 5", { status: 400 })
    }

    if (!comment) {
      return new NextResponse("Comment is required", { status: 400 })
    }

    if (!userName) {
      return new NextResponse("User name is required", { status: 400 })
    }

    const store = await prismadb.store.findUnique({
      where: {
        id: storeId,
      },
    })

    if (!store) {
      return new NextResponse("Store not found", { status: 404 })
    }

    const product = await prismadb.product.findUnique({
      where: {
        id: productId,
      },
    })

    if (!product) {
      return new NextResponse("Product not found", { status: 404 })
    }


    try {
      const review = await prismadb.review.create({
        data: {
          productId,
          storeId,
          userId: "store-customer", 
          userName: userName,
          email: email || null, 
          rating,
          comment,
          title,
          photoUrl: photoUrl || null, 
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

      return NextResponse.json(review)
    } catch (dbError: unknown) {
      const errorMessage = dbError instanceof Error ? dbError.message : "Unknown database error"
      return new NextResponse(`Database error: ${errorMessage}`, { status: 500 })
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return new NextResponse(`Internal error: ${errorMessage}`, { status: 500 })
  }
}
