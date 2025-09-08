import prismadb from "@/lib/prismadb"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { checkRole } from "@/utils/roles"

// PATCH to update a member's role
export async function PATCH(req: Request, { params }: { params: { storeId: string; memberId: string } }) {
  try {
    const { userId } = await auth()
    const { storeId, memberId } = params
    const body = await req.json()
    const { role } = body

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!role) {
      return new NextResponse("Role is required", { status: 400 })
    }

    // Check if user is a manager of the store or an admin
    const isAdmin = await checkRole("admin")
    const isManager = await prismadb.storeMember.findFirst({
      where: {
        storeId,
        userId,
        role: "manager",
      },
    })

    if (!isAdmin && !isManager) {
      return new NextResponse("Only store managers or admins can update member roles", { status: 403 })
    }

    // Update member role
    const member = await prismadb.storeMember.update({
      where: {
        id: memberId,
        storeId,
      },
      data: {
        role,
      },
    })

    return NextResponse.json(member)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

// DELETE to remove a member from a store
export async function DELETE(req: Request, { params }: { params: { storeId: string; memberId: string } }) {
  try {
    const { userId } = await auth()
    const { storeId, memberId } = params

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }


    // Check if user is a manager of the store or an admin
    const isAdmin = await checkRole("admin")
    const isManager = await prismadb.storeMember.findFirst({
      where: {
        storeId,
        userId,
        role: "manager",
      },
    })

    if (!isAdmin && !isManager) {
      return new NextResponse("Only store managers or admins can remove members", { status: 403 })
    }

    // Get the member to check if they're the last manager
    const member = await prismadb.storeMember.findUnique({
      where: {
        id: memberId,
      },
    })

    if (!member) {
      return new NextResponse("Member not found", { status: 404 })
    }

    if (member.role === "manager") {
      // Count managers to ensure we're not removing the last one
      const managerCount = await prismadb.storeMember.count({
        where: {
          storeId,
          role: "manager",
        },
      })

      if (managerCount <= 1) {
        return new NextResponse("Cannot remove the last manager of a store", { status: 400 })
      }
    }

    // Remove member
    await prismadb.storeMember.delete({
      where: {
        id: memberId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
