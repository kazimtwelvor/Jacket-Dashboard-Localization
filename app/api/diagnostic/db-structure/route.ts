import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

// Force dynamic rendering and disable caching
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
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
      return new NextResponse("User not found", { status: 404 })
    }

    // Get all stores where user is owner
    const ownedStores = await prismadb.store.findMany({
      where: {
        userId: dbUser.id,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    })

    // Get all store memberships
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
          },
        },
      },
    })

    // Format the response
    const diagnosticData = {
      user: {
        id: dbUser.id,
        clerkId: dbUser.clerkId,
        email: dbUser.email,
      },
      ownedStores: ownedStores.map((store) => ({
        id: store.id,
        name: store.name,
        createdAt: store.createdAt,
      })),
      memberStores: storeUsers.map((su) => ({
        id: su.store.id,
        name: su.store.name,
        role: su.role,
        storeCreatedAt: su.store.createdAt,
        membershipCreatedAt: su.createdAt,
      })),
    }

    // Set cache headers to prevent stale data
    const headers = new Headers()
    headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    headers.set("Pragma", "no-cache")
    headers.set("Expires", "0")
    headers.set("Content-Type", "application/json")

    return new NextResponse(JSON.stringify(diagnosticData), {
      status: 200,
      headers,
    })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
