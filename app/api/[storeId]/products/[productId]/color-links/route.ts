import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"
import prismadb from "@/lib/prismadb"

const updateColorLinksSchema = z.object({
  colorLinks: z.record(z.string(), z.string()).optional(),
  colorDetails: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      value: z.string(),
    })
  ).optional(),
  parentProductId: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
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

    const body = await request.json()
    const validatedData = updateColorLinksSchema.parse(body)

    // Verify the store exists and user has access
    // const store = await prismadb.store.findFirst({
    //   where: {
    //     id: storeId,
    //     userId,
    //   },
    // })

    // if (!store) {
    //   return NextResponse.json({ error: "Store not found" }, { status: 404 })
    // }

    // Verify the product exists and belongs to the store
    const product = await prismadb.product.findFirst({
      where: {
        id: productId,
        storeId,
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Update the product with color links, color details, and parent product ID
    const updatedProduct = await prismadb.product.update({
      where: {
        id: productId,
      },
      data: {
        ...(validatedData.colorLinks && { colorLinks: validatedData.colorLinks }),
        ...(validatedData.colorDetails && { colorDetails: validatedData.colorDetails }),
        ...(validatedData.parentProductId !== undefined && { parentProductId: validatedData.parentProductId }),
      },
    })

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    })

  } catch (error) {
    console.error("Error updating color links:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
