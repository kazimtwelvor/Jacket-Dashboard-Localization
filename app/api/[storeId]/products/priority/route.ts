import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"
import { z } from "zod"

const prioritySchema = z.object({
  productId: z.string().min(1),
  priority: z.number().int().min(1).max(parseInt(process.env.PRODUCT_PRIORITY_LEVELS || "5"))
})

export async function POST(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { productId, priority } = prioritySchema.parse(body)

    // Verify the product belongs to the store
    const product = await prismadb.product.findFirst({
      where: {
        id: productId,
        storeId: params.storeId
      }
    })

    if (!product) {
      return new NextResponse("Product not found", { status: 404 })
    }

    // Update the product priority
    const updatedProduct = await prismadb.product.update({
      where: { id: productId },
      data: { priority },
      select: {
        id: true,
        name: true,
        priority: true
      }
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("[PRODUCT_PRIORITY_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(req: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const priority = searchParams.get("priority")

    let whereClause: any = {
      storeId: params.storeId,
      isDeleted: false
    }

    if (priority) {
      whereClause.priority = parseInt(priority)
    }

    const products = await prismadb.product.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        priority: true,
        isPublished: true
      },
      orderBy: [
        { priority: "asc" },
        { createdAt: "desc" }
      ]
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("[PRODUCT_PRIORITY_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

