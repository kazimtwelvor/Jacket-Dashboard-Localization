import { type NextRequest, NextResponse } from "next/server"
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

export async function GET(req: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const { userId } = await auth()

    // if (!userId) {
    //   return new NextResponse("Unauthorized", { status: 401 })
    // }

    // const dbUser = await prismadb.user.findFirst({
    //   where: {
    //     clerkId: userId,
    //   },
    // })

    // if (!dbUser) {
    //   return new NextResponse("User not found", { status: 404 })
    // }

    const order = await prismadb.order.findFirst({
      where: {
        id: params.orderId,
        // userId: dbUser.id,
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return new NextResponse("Order not found", { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
