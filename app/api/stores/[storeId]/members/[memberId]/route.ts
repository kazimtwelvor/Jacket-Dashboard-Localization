import prismadb from "@/lib/prismadb"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { checkRole } from "@/utils/roles"

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

export async function DELETE(req: Request, { params }: { params: { storeId: string; memberId: string } }) {
  try {
    const { userId } = await auth()
    const { storeId, memberId } = params

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }


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

    const member = await prismadb.storeMember.findUnique({
      where: {
        id: memberId,
      },
    })

    if (!member) {
      return new NextResponse("Member not found", { status: 404 })
    }

    if (member.role === "manager") {
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
