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

export async function GET(req: NextRequest) {
  try {
    const { userId } = await  auth()
    const { searchParams } = new URL(req.url)
    const storeId = searchParams.get("storeId")

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Find the user in our database
    const dbUser = await prismadb.user.findFirst({
      where: {
        clerkId: userId,
      },
    })

    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Get all orders for this user
    const orders = await prismadb.order.findMany({
      where: {
        userId: dbUser.id,
        ...(storeId && { storeId }),
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
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
