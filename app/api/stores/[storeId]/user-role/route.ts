import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()
    const { searchParams } = new URL(req.url)
    const requestedUserId = searchParams.get("userId")

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (requestedUserId && requestedUserId !== userId) {
      const currentUserStore = await prismadb.storeUser.findFirst({
        where: {
          userId,
          storeId: params.storeId,
        },
      })

      if (!currentUserStore || (currentUserStore.role !== "ADMIN" && currentUserStore.role !== "SUPER_ADMIN")) {
        return new NextResponse("Unauthorized to view other user roles", { status: 403 })
      }
    }

    const storeUser = await prismadb.storeUser.findFirst({
      where: {
        userId: requestedUserId || userId,
        storeId: params.storeId,
      },
    })

    if (!storeUser) {
      return NextResponse.json({ role: null })
    }

    return NextResponse.json({ role: storeUser.role })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
