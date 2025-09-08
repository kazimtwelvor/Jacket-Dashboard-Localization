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
      return new NextResponse(JSON.stringify({ error: "Unauthorized", userId: null }), { status: 401 })
    }

    // Find the user in the database by their Clerk ID
    const dbUser = await prismadb.user.findFirst({
      where: {
        clerkId: userId,
      },
    })

    if (!dbUser) {
      return new NextResponse(
        JSON.stringify({
          error: "User not found",
          clerkId: userId,
          message: "User with this Clerk ID was not found in the database",
        }),
        { status: 404 },
      )
    }

    // Get all store memberships with raw query results
    const storeUsers = await prismadb.storeUser.findMany({
      where: {
        userId: dbUser.id,
      },
      include: {
        store: true,
        user: {
          select: {
            id: true,
            email: true,
            clerkId: true,
          },
        },
      },
    })

    // Format the response with detailed information
    const diagnosticData = {
      requestInfo: {
        timestamp: new Date().toISOString(),
        clerkUserId: userId,
      },
      userInfo: {
        dbUserId: dbUser.id,
        clerkId: dbUser.clerkId,
        email: dbUser.email,
      },
      memberStores: storeUsers.map((su) => ({
        storeId: su.storeId,
        storeName: su.store.name,
        role: su.role,
        userId: su.userId,
        membershipId: su.id,
        createdAt: su.createdAt,
        updatedAt: su.updatedAt,
        storeDetails: su.store,
      })),
      rawResults: storeUsers,
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
    return new NextResponse(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }),
      { status: 500 },
    )
  }
}
