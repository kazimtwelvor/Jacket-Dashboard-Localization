import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()
    const { storeId } = params

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    // Check if user is store owner
    const store = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    const isOwner = !!store

    // Check if user is a member and get their role
    const member = await prismadb.member.findFirst({
      where: {
        storeId,
        user: {
          clerkId: userId,
        },
      },
    })

    return NextResponse.json({
      isOwner,
      role: member?.role || null,
    })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}