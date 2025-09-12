import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()
    const { storeId } = params

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

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
    return new NextResponse(error as string, { status: 500 })
  }
}
