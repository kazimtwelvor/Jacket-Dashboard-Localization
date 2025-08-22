import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

// Force dynamic rendering and disable caching
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  console.log(`📥 [StoreDirectInfo] API called for storeId: ${params.storeId}`)

  try {
    const { userId } = await auth()
    console.log("👤 [StoreDirectInfo] Auth userId:", userId)

    if (!userId) {
      console.error("🚫 [StoreDirectInfo] Unauthorized: No userId")
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.storeId) {
      console.error("❓ [StoreDirectInfo] Store ID is required")
      return new NextResponse("Store ID is required", { status: 400 })
    }

    // Find the user in the database by their Clerk ID
    const dbUser = await prismadb.user.findFirst({
      where: {
        clerkId: userId,
      },
    })

    console.log("👤 [StoreDirectInfo] Database user:", dbUser?.id)

    if (!dbUser) {
      console.error("❓ [StoreDirectInfo] User not found in database with Clerk ID:", userId)
      return new NextResponse("User not found", { status: 404 })
    }

    // Find the store with explicit selection
    const store = await prismadb.store.findUnique({
      where: {
        id: params.storeId,
      },
      select: {
        id: true,
        name: true,
        userId: true,
      },
    })

    console.log("🏪 [StoreDirectInfo] Store found:", store)

    if (!store) {
      console.error("❓ [StoreDirectInfo] Store not found with ID:", params.storeId)
      return new NextResponse("Store not found", { status: 404 })
    }

    // Check if user is the owner
    const isOwner = store.userId === userId
    console.log("👑 [StoreDirectInfo] Is owner:", isOwner)

    let role = "Owner"

    if (!isOwner) {
      // Check if user is a member
      const storeMember = await prismadb.storeUser.findFirst({
        where: {
          storeId: params.storeId,
          userId: dbUser.id,
        },
      })

      console.log("👥 [StoreDirectInfo] Store member:", storeMember)

      if (!storeMember) {
        console.error("🚫 [StoreDirectInfo] User is not a member of this store")
        return new NextResponse("Unauthorized", { status: 403 })
      }

      role = storeMember.role
    }

    // Create response object with role information
    const storeWithRole = {
      id: store.id,
      name: store.name,
      role: role,
    }

    // Set cache headers to prevent stale data
    const headers = new Headers()
    headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    headers.set("Pragma", "no-cache")
    headers.set("Expires", "0")
    headers.set("Content-Type", "application/json")

    console.log("📤 [StoreDirectInfo] Returning store:", storeWithRole)

    return new NextResponse(JSON.stringify(storeWithRole), {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error(`❌ [StoreDirectInfo] Error: ${error}`)
    return new NextResponse("Internal error", { status: 500 })
  }
}
