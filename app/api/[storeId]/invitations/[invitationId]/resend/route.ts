import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import crypto from "crypto"

import prismadb from "@/lib/prismadb"

export async function POST(req: Request, { params }: { params: { storeId: string; invitationId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const storeByOwner = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    })

    const storeMember = !storeByOwner
      ? await prismadb.storeMember.findFirst({
          where: {
            storeId: params.storeId,
            userId,
            role: "ADMIN",
          },
        })
      : null

    if (!storeByOwner && !storeMember) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const invitation = await prismadb.invitation.findUnique({
      where: {
        id: params.invitationId,
        storeId: params.storeId,
        status: "PENDING",
      },
    })

    if (!invitation) {
      return new NextResponse("Invitation not found", { status: 404 })
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 48) // Token expires in 48 hours

    const updatedInvitation = await prismadb.invitation.update({
      where: {
        id: params.invitationId,
      },
      data: {
        token,
        expiresAt,
      },
    })

    return NextResponse.json({
      id: updatedInvitation.id,
      email: updatedInvitation.email,
      token: updatedInvitation.token,
      expiresAt: updatedInvitation.expiresAt,
    })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
