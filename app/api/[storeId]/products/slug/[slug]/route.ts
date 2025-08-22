import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

export async function GET(req: Request, { params }: { params: { storeId: string; slug: string } }) {
  try {
    if (!params.slug) {
      return new NextResponse("Slug is required", { status: 400 })
    }

    const product = await prismadb.product.findFirst({
      where: {
        slug: params.slug,
        storeId: params.storeId,
      },
      include: {
        images: true,
        category: true,
        size: true,
        color: true,
        sizes: true,
        colors: true,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.log("[PRODUCT_SLUG_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
