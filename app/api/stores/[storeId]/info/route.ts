import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {

  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Find the user in the database by their Clerk ID
    const dbUser = await prismadb.user.findFirst({
      where: {
        clerkId: userId,
      },
    })


    if (!dbUser) {
      return NextResponse.json([])
    }

    // Find all stores where the user is a member
    const storeUsers = await prismadb.storeUser.findMany({
      where: {
        userId: dbUser.id,
      },
      include: {
        store: true,
      },
    })


    // Log each store for debugging
    storeUsers.forEach((su, index) => {
    })

    // Format the response with consistent property names
    const memberStores = storeUsers.map((su) => ({
      id: su.store.id,
      name: su.store.name,
      role: su.role,
      joinedAt: su.createdAt.toISOString(),
      storeCreatedAt: su.store.createdAt.toISOString(),
    }))


    // Set cache headers to prevent stale data
    const headers = new Headers()
    headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    headers.set("Pragma", "no-cache")
    headers.set("Expires", "0")
    headers.set("Content-Type", "application/json")

    return new NextResponse(JSON.stringify(memberStores), {
      status: 200,
      headers,
    })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
