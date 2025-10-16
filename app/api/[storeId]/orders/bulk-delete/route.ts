import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

export async function DELETE(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { userId } = await auth()
    const { storeId } = await params
    const { orderIds } = await req.json()

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return new NextResponse("Order IDs are required", { status: 400 })
    }

    // Check if user is store owner
    const store = await db.store.findFirst({
      where: {
        id: storeId,
        userId: userId, // Use Clerk userId directly
      },
    })

    if (!store) {
      return new NextResponse("Unauthorized - Only store owners can bulk delete orders", { status: 403 })
    }

    // Delete order items first
    await db.orderItem.deleteMany({
      where: {
        orderId: {
          in: orderIds,
        },
      },
    })

    // Delete orders
    const deletedOrders = await db.order.deleteMany({
      where: {
        id: {
          in: orderIds,
        },
        storeId,
      },
    })

    return NextResponse.json({ 
      message: `${deletedOrders.count} orders deleted successfully`,
      deletedCount: deletedOrders.count 
    })
  } catch (error) {
    console.error("[ORDERS_BULK_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}