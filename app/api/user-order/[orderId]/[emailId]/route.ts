import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string; emailId: string }> }
) {
  try {
    const resolvedParams = await params

    if (!resolvedParams.orderId) {
      return new NextResponse("Order ID is required", { status: 400 })
    }

    if (!resolvedParams.emailId) {
      return new NextResponse("Email ID is required", { status: 400 })
    }

    const order = await prismadb.order.findFirst({
      where: {
        id: resolvedParams.orderId,
        customerEmail: resolvedParams.emailId,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        store: true,
        user: true,
      },
    })

    if (!order) {
      return new NextResponse("Order not found", { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.log("[USER_ORDER_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}