import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get("slug")
    const productId = searchParams.get("productId")

    if (!slug) {
      return NextResponse.json(
        { error: "Slug parameter is required" },
        { status: 400 }
      )
    }

    if (!params.storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      )
    }

    const existingProduct = await prismadb.product.findFirst({
      where: {
        slug: slug,
        storeId: params.storeId,
        id: {
          not: productId || undefined, 
        },
        isDeleted: false,
      },
    })

    return NextResponse.json({
      isUnique: !existingProduct,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}