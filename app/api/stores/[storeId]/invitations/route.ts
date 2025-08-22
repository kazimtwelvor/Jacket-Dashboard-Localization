import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = auth()
    const { storeId } = params

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    // Check if user has permission to view invitations
    const storeUser = await db.storeUser.findFirst({
      where: {
        storeId,
        userId,
        role: {
          in: ["OWNER", "ADMIN", "MANAGER"],
        },
      },
    })

    if (!storeUser) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const invitations = await db.invitation.findMany({
      where: {
        storeId,
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(invitations)
  } catch (error) {
    console.log("[INVITATIONS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
