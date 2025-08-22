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

    // Check if the SKU already exists in this store
    const existingProduct = await prismadb.product.findFirst({
      where: {
        storeId,
        sku,
      },
    })

    if (existingProduct) {
      // SKU exists, generate a unique alternative
      // Get the store's SKU prefix
      const store = await prismadb.store.findUnique({
        where: { id: storeId },
        select: { skuPrefix: true },
      })

      // Use the store's prefix or default to "SKU" if not set
      const prefix = store?.skuPrefix || "SKU"

      // Try to use the provided SKU with a suffix
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
    console.error("[CHECK_SKU]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
