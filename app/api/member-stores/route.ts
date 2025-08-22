import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  console.log("Member stores API called")

  try {
    const { userId } = await auth()
    console.log("Auth userId:", userId)

    if (!userId) {
      console.error("Unauthorized: No userId")
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Find the user in the database by their Clerk ID
    const dbUser = await prismadb.user.findFirst({
      where: {
        clerkId: userId,
      },
    })

    console.log("Database user:", dbUser?.id)

    if (!dbUser) {
      console.error("User not found in database with Clerk ID:", userId)
      return NextResponse.json([])
    }

    // Find all stores where the user is a member
    const storeUsers = await prismadb.storeUser.findMany({
      where: {
        userId: dbUser.id,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    })

    console.log(`Found ${storeUsers.length} store memberships for user ${dbUser.id}`)

    // Log each store for debugging
    storeUsers.forEach((su, index) => {
      console.log(`Store ${index + 1}:`, {
        storeId: su.store.id,
        storeName: su.store.name,
        role: su.role,
        userId: su.userId,
      })
    })

    // Format the response with consistent property names
    const memberStores = storeUsers.map((su) => ({
      id: su.store.id,
      name: su.store.name,
      role: su.role,
      joinedAt: su.createdAt.toISOString(),
      storeCreatedAt: su.store.createdAt.toISOString(),
    }))

    console.log("Returning member stores:", memberStores)

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
    console.error("Error in member-stores API:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
