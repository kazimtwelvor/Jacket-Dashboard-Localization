import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

// Force dynamic rendering and disable caching
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

export async function GET(req: Request, { params }: { params: { storeId: string } }) {

  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
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


    if (!store) {
      return new NextResponse("Store not found", { status: 404 })
    }

    // Check if user is the owner
    const isOwner = store.userId === userId

    let role = "Owner"

    if (!isOwner) {
      // Check if user is a member
      const storeMember = await prismadb.storeUser.findFirst({
        where: {
          storeId: params.storeId,
          userId: dbUser.id,
        },
      })


      if (!storeMember) {
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


    return new NextResponse(JSON.stringify(storeWithRole), {
      status: 200,
      headers,
    })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
