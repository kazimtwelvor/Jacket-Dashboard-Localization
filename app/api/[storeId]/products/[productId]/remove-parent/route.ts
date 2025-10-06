import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { checkApiPermission, Permission } from "@/lib/api-permissions"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { storeId, productId } = params
    if (!storeId || !productId) {
      return NextResponse.json({ error: "Store ID and Product ID are required" }, { status: 400 })
    }

    // const permissionCheck = await checkApiPermission(storeId, Permission.MANAGE_PRODUCTS, 'PATCH')
    // if (!permissionCheck.hasPermission) {
    //   return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    // }

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
    const isStoreAdmin = storeRole === "ADMIN" || storeRole === "OWNER" || isOwner

    if (!isStoreAdmin) {
      return NextResponse.json({ error: "Only ADMIN or OWNER can remove parent products" }, { status: 403 })
    }

    const product = await db.product.findFirst({
      where: {
        id: productId,
        storeId: storeId,
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const updatedProduct = await db.product.update({
      where: {
        id: productId,
      },
      data: {
        isParentProduct: false,
        parentProductId: null,
        colorLinks: {},
        colorDetails: [],
      },
    })

    return NextResponse.json({
      success: true,
      message: "Parent product removed successfully",
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        isParentProduct: updatedProduct.isParentProduct,
        parentProductId: updatedProduct.parentProductId,
        colorLinks: updatedProduct.colorLinks,
        colorDetails: updatedProduct.colorDetails,
      },
    })
  } catch (error) {
    console.error("[REMOVE_PARENT_PRODUCT] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
