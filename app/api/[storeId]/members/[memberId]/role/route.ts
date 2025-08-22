import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function PATCH(req: Request, { params }: { params: { storeId: string; memberId: string } }) {
  try {
    const { userId } = await auth()
    const body = await req.json()
    const { role } = body

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    if (!params.memberId) {
      return new NextResponse("Member ID is required", { status: 400 })
    }

    if (!role) {
      return new NextResponse("Role is required", { status: 400 })
    }

    // Check if user has permission to update member roles
    const store = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    })

    if (!store) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Get the member to update
    const memberToUpdate = await prismadb.storeUser.findUnique({
      where: {
        id: params.memberId,
      },
    })

    if (!memberToUpdate) {
      return new NextResponse("Member not found", { status: 404 })
    }

    // Don't allow changing the role of the store owner
    if (memberToUpdate.userId === store.userId) {
      return new NextResponse("Cannot change the role of the store owner", { status: 403 })
    }

    // Update the member's role
    const updatedMember = await prismadb.storeUser.update({
      where: {
        id: params.memberId,
      },
      data: {
        role,
      },
    })

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.log("[MEMBER_ROLE_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
