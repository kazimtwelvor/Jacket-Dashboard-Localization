import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

export async function DELETE(req: Request, { params }: { params: { storeId: string; invitationId: string } }) {
  try {
    const { userId } = await auth()
    const { storeId, invitationId } = params

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    const storeUser = await db.storeUser.findFirst({
      where: {
        storeId,
        userId,
        role: {
          in: ["OWNER", "ADMIN"],
        },
      },
    })

    if (!storeUser) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const invitation = await db.invitation.findFirst({
      where: {
        id: invitationId,
        storeId,
      },
    })

    if (!invitation) {
      return new NextResponse("Invitation not found", { status: 404 })
    }

    await db.invitation.update({
      where: { id: invitationId },
      data: { status: "CANCELLED" },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { storeId: string; invitationId: string } }) {
  try {
    const { userId } = await auth()
    const { storeId, invitationId } = params
    const body = await req.json()

    const { role, permissions } = body

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    const storeUser = await db.storeUser.findFirst({
      where: {
        storeId,
        userId,
        role: {
          in: ["OWNER", "ADMIN"],
        },
      },
    })

    if (!storeUser) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const invitation = await db.invitation.findFirst({
      where: {
        id: invitationId,
        storeId,
        status: "PENDING",
      },
    })

    if (!invitation) {
      return new NextResponse("Invitation not found or already processed", { status: 404 })
    }

    const updatedInvitation = await db.invitation.update({
      where: { id: invitationId },
      data: {
        role: role || invitation.role,
        permissions: permissions || invitation.permissions,
      },
    })

    return NextResponse.json(updatedInvitation)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
