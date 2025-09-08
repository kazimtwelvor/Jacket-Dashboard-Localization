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

    const dbUser = await prismadb.user.findFirst({
      where: {
        clerkId: userId,
      },
    })


    if (!dbUser) {
      return NextResponse.json([])
    }

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


    storeUsers.forEach((su, index) => {
  
    })

    const memberStores = storeUsers.map((su) => ({
      id: su.store.id,
      name: su.store.name,
      role: su.role,
    }))


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
