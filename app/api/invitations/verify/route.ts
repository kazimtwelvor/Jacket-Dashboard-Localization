import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (!token) {
      return new NextResponse("Token is required", { status: 400 })
    }

    const invitation = await prismadb.invitation.findUnique({
      where: { token },
      include: {
        store: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!invitation) {
      return new NextResponse("Invalid invitation token", { status: 404 })
    }

    if (invitation.expires < new Date()) {
      return new NextResponse("Invitation has expired", { status: 400 })
    }

    if (invitation.status !== "PENDING") {
      return new NextResponse(`Invitation is ${invitation.status.toLowerCase()}`, { status: 400 })
    }

    return NextResponse.json({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      storeId: invitation.storeId,
      storeName: invitation.store.name,
      expires: invitation.expires,
      status: invitation.status,
    })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
