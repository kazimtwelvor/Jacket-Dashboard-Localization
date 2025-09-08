import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()
    const { searchParams } = new URL(req.url)
    const sku = searchParams.get("sku")

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!sku) {
      return new NextResponse("SKU is required", { status: 400 })
    }

    const storeId = params.storeId

    const existingProduct = await prismadb.product.findFirst({
      where: {
        storeId,
        sku,
      },
    })

    if (existingProduct) {
      const store = await prismadb.store.findUnique({
        where: { id: storeId },
        select: { skuPrefix: true },
      })

      const prefix = store?.skuPrefix || "SKU"

      let counter = 1
      let uniqueSku = `${sku}-${counter}`

      while (true) {
        const existingWithSuffix = await prismadb.product.findFirst({
          where: {
            storeId,
            sku: uniqueSku,
          },
        })

        if (!existingWithSuffix) {
          break
        }

        counter++
        uniqueSku = `${sku}-${counter}`
      }

      return NextResponse.json({
        isUnique: false,
        uniqueSku,
      })
    }

    return NextResponse.json({
      isUnique: true,
      uniqueSku: sku,
    })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
