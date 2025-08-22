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
    console.log("[STORE_MEMBER_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// DELETE to remove a member from a store
export async function DELETE(req: Request, { params }: { params: { storeId: string; memberId: string } }) {
  try {
    console.log("[MEMBER_DELETE] Starting member deletion process...")
    const { userId } = await auth()
    const { storeId, memberId } = params

    if (!userId) {
      console.log("[MEMBER_DELETE] Unauthorized - no user ID")
      return new NextResponse("Unauthorized", { status: 401 })
    }

    console.log(
      `[MEMBER_DELETE] Checking permissions for user ${userId} to delete member ${memberId} from store ${storeId}`,
    )

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
      console.log("[MEMBER_DELETE] Permission denied - user is not a manager or admin")
      return new NextResponse("Only store managers or admins can remove members", { status: 403 })
    }

    // Get the member to check if they're the last manager
    console.log(`[MEMBER_DELETE] Fetching member ${memberId} details`)
    const member = await prismadb.storeMember.findUnique({
      where: {
        id: memberId,
      },
    })

    if (!member) {
      console.log(`[MEMBER_DELETE] Member ${memberId} not found`)
      return new NextResponse("Member not found", { status: 404 })
    }

    if (member.role === "manager") {
      // Count managers to ensure we're not removing the last one
      console.log("[MEMBER_DELETE] Member is a manager, checking if they're the last manager")
      const managerCount = await prismadb.storeMember.count({
        where: {
          storeId,
          role: "manager",
        },
      })

      if (managerCount <= 1) {
        console.log("[MEMBER_DELETE] Cannot remove last manager")
        return new NextResponse("Cannot remove the last manager of a store", { status: 400 })
      }
    }

    // Remove member
    console.log(`[MEMBER_DELETE] Deleting member ${memberId}`)
    await prismadb.storeMember.delete({
      where: {
        id: memberId,
      },
    })

    console.log(`[MEMBER_DELETE] Successfully deleted member ${memberId}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.log("[MEMBER_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
