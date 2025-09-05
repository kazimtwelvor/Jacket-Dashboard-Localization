import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb"

export async function DELETE(req: Request, { params }: { params: { storeId: string; invitationId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if store exists and user has access
    const storeByOwner = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    })

    // If not owner, check if user is an admin member
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

    // Check if invitation exists
    const invitation = await prismadb.invitation.findUnique({
      where: {
        id: params.invitationId,
        storeId: params.storeId,
      },
    })

    if (!invitation) {
      return new NextResponse("Invitation not found", { status: 404 })
    }

    // Delete the invitation
    await prismadb.invitation.delete({
      where: {
        id: params.invitationId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
