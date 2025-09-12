import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { storeId } = params
    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
    })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const store = await db.store.findFirst({
      where: {
        id: storeId,
        userId: dbUser.id,
      },
    })

    const isOwner = !!store

    const storeUser = await db.storeUser.findFirst({
      where: {
        storeId: storeId,
        userId: dbUser.id,
      },
    })

    const storeRole = storeUser?.role || null
    const isStoreAdmin = storeRole === "ADMIN" || isOwner


    return NextResponse.json(
      {
        isStoreAdmin,
        userId: dbUser.id,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    )
  } catch (error) {
    console.error("[STORE_ADMIN_CHECK] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
