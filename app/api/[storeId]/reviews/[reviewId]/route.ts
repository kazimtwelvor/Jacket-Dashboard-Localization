import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; reviewId: string } }
) {
  try {
    const { userId } = await auth()
    const body = await req.json()
    const { isApproved } = body

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!params.reviewId) {
      return new NextResponse("Review ID is required", { status: 400 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 })
    }

    const review = await prismadb.review.update({
      where: {
        id: params.reviewId,
      },
      data: {
        isApproved,
      },
    })

    return NextResponse.json(review)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; reviewId: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!params.reviewId) {
      return new NextResponse("Review ID is required", { status: 400 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 })
    }

    const review = await prismadb.review.delete({
      where: {
        id: params.reviewId,
      },
    })

    return NextResponse.json(review)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}