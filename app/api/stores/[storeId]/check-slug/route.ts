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

    const countryId = searchParams.get("countryId")

    const productsWithSameSlug = await prismadb.product.findMany({
      where: {
        slug: slug,
        storeId: params.storeId,
        id: {
          not: productId || undefined, // Exclude current product when editing
        },
        isDeleted: false,
      },
      include: {
        productCountries: true
      }
    })

    if (productsWithSameSlug.length === 0) {
      return NextResponse.json({
        isUnique: true,
      })
    }

    for (const product of productsWithSameSlug) {
      const existingCountryIds = product.productCountries.map(pc => pc.countryId)
      
      if (existingCountryIds.length === 0 || !countryId) {
        return NextResponse.json({
          isUnique: false,
          message: "A product with this slug already exists for this country"
        })
      }
      
      if (existingCountryIds.includes(countryId)) {
        return NextResponse.json({
          isUnique: false,
          message: "A product with this slug already exists for the selected country"
        })
      }
    }

    return NextResponse.json({
      isUnique: true,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}