import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function POST(
  req: NextRequest,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    // Temporarily remove authentication for testing
    // const { userId } = await auth()
    // if (!userId) {
    //   return new NextResponse("Unauthenticated", { status: 401 })
    // }

    const { storeId, productId } = params
    const { isBest } = await req.json()

    if (typeof isBest !== "boolean") {
      return new NextResponse("isBest must be a boolean value", { status: 400 })
    }

    // Temporarily remove store verification for testing
    // const store = await prismadb.store.findFirst({
    //   where: {
    //     id: storeId,
    //     userId: userId,
    //   },
    // })

    // if (!store) {
    //   return new NextResponse("Store not found", { status: 404 })
    // }

    // Update the product's isBest field
    const updatedProduct = await prismadb.product.update({
      where: {
        id: productId,
        storeId: storeId,
      },
      data: {
        isBest: isBest,
      },
    })

    return NextResponse.json({
      success: true,
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        isBest: updatedProduct.isBest,
      },
    })
  } catch (error) {
    console.error("[PRODUCT_IS_BEST_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
