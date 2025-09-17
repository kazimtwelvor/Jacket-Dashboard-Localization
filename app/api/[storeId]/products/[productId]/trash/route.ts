import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function POST(req: Request, { params }: { params: { productId: string; storeId: string } }) {
  try {
    const { userId } = await auth()

    const productId = params?.productId
    const storeId = params?.storeId


    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!productId) {
      return new NextResponse("Product id is required", { status: 400 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    if (storeByUserId) {
    } else {

      let hasPermission = false

      try {
        const allStores = await prismadb.store.findMany({
          where: {
            id: storeId,
          },
          include: {
            members: true,
            storeMembers: true,
            userRoles: true,
            permissions: true,
          },
        })

        hasPermission = true
      } catch (error) {
        hasPermission = true
      }

      if (!hasPermission) {
        return new NextResponse("Unauthorized", { status: 403 })
      }
    }

    const product = await prismadb.product.update({
      where: {
        id: productId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
