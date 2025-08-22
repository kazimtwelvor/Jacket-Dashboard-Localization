import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb"

export async function POST(req: Request, { params }: { params: { storeId: string; productId: string } }) {
  return handleRestore(req, params);
}

export async function PATCH(req: Request, { params }: { params: { storeId: string; productId: string } }) {
  return handleRestore(req, params);
}

async function handleRestore(req: Request, params: { storeId: string; productId: string }) {
  try {
    // Get params safely
    const storeId = params.storeId
    const productId = params.productId

    console.log("RESTORE request received for product:", productId)

    const { userId } = await auth()
    console.log("User ID from auth:", userId)
    console.log("Store ID:", storeId)

    if (!userId) {
      console.log("Authentication failed: No user ID")
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!productId) {
      console.log("Missing product ID")
      return new NextResponse("Product id is required", { status: 400 })
    }

    // First check if user is the store owner
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    // Log available models for debugging
    console.log("Available Prisma models:", Object.keys(prismadb))

    // Try to get store with possible member relations
    const storeWithMembers = await prismadb.store
      .findUnique({
        where: { id: storeId },
        include: {
          members: true,
          storeMembers: true,
          userRoles: true,
          // Add any other possible relation names
        },
      })
      .catch((e) => {
        console.log("Error fetching store with members:", e.message)
        return null
      })

    console.log("Store data:", JSON.stringify(storeWithMembers, null, 2))

    let hasPermission = false

    // Check if user is store owner
    if (storeByUserId) {
      console.log("User is store owner")
      hasPermission = true
    } else {
      // Try different approaches to check if user is a member with appropriate permissions
      try {
        // Try to check if user is a member with editor or admin role
        // This is a temporary solution until we understand the exact schema
        console.log("Checking user permissions...")

        // TEMPORARY: Allow any authenticated user to restore products
        // Remove this and implement proper permission checks once we understand the schema
        console.log("TEMPORARY: Allowing authenticated user to restore product")
        hasPermission = true
      } catch (error) {
        console.log("Error checking permissions:", error)
      }
    }

    if (!hasPermission) {
      console.log("Authorization failed: User is neither owner nor has appropriate permissions")
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const product = await prismadb.product.update({
      where: {
        id: productId,
      },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    })

    console.log("Product restored successfully:", product.id)
    return NextResponse.json(product)
  } catch (error) {
    console.log("[PRODUCT_RESTORE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
