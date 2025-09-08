import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()
    const { searchParams } = new URL(req.url)
    const sku = searchParams.get("sku")
    const storeId = params.storeId

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    if (!sku) {
      return new NextResponse("SKU is required", { status: 400 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const existingProduct = await prismadb.product.findFirst({
      where: {
        storeId: storeId,
        sku: sku,
      },
    })

    let uniqueSku = sku
    const isUnique = !existingProduct
    if (existingProduct) {
      const similarSkus = await prismadb.product.findMany({
        where: {
          storeId: storeId,
          sku: {
            startsWith: `${sku}-`,
          },
        },
        select: {
          sku: true,
        },
      })

      let maxSuffix = 0
      for (const product of similarSkus) {
        if (product.sku) {
          const suffixMatch = product.sku.match(new RegExp(`^${sku.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-([0-9]+)$`))
          if (suffixMatch && suffixMatch[1]) {
            const suffix = Number.parseInt(suffixMatch[1], 10)
            if (!isNaN(suffix) && suffix > maxSuffix) {
              maxSuffix = suffix
            }
          }
        }
      }

      uniqueSku = `${sku}-${maxSuffix + 1}`
    }

    return NextResponse.json({
      isUnique,
      uniqueSku,
    })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
