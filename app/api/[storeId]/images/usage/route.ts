import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

// Get usage statistics for images
export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { storeId } = params
    const { searchParams } = new URL(req.url)
    const imageId = searchParams.get("imageId")

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    if (imageId) {
      // Get products using a specific image
      const productImages = await prismadb.productImage.findMany({
        where: {
          imageId: imageId,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
      })

      return NextResponse.json({
        count: productImages.length,
        products: productImages.map((pi) => pi.product),
      })
    } else {
      // Get usage counts for all images
      const imageCounts = await prismadb.$queryRaw`
        SELECT i.id, i.url, COUNT(pi.imageId) as usageCount
        FROM "Image" i
        LEFT JOIN "ProductImage" pi ON i.id = pi.imageId
        WHERE i."storeId" = ${storeId}
        GROUP BY i.id, i.url
        ORDER BY usageCount DESC
      `

      return NextResponse.json(imageCounts)
    }
  } catch (error) {
    console.log("[IMAGE_USAGE_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
