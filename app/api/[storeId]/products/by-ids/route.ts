import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { storeId } = params
    const body = await req.json()
    const { ids } = body
    
    console.log('[PRODUCTS_BY_IDS_POST] Request:', { storeId, ids })

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new NextResponse("Product IDs are required", { status: 400 })
    }

    const products = await prismadb.product.findMany({
      where: {
        id: { in: ids },
        storeId: storeId,
        isDeleted: false,
      },
      include: {
        images: {
          include: {
            image: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    })

    // Format the response
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      images: product.images.map(img => img.image.url),
      regularPrice: product.price.toString(),
      salePrice: product.salePrice ? product.salePrice.toString() : null,
      sizes: product.sizeDetails ? 
        (typeof product.sizeDetails === 'string' ? 
          JSON.parse(product.sizeDetails) : 
          product.sizeDetails
        ) : [],
    }))

    console.log('[PRODUCTS_BY_IDS_POST] Response:', formattedProducts.length, 'products found')
    
    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error("[PRODUCTS_BY_IDS]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}