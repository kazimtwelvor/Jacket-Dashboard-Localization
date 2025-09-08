import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

import prismadb from "@/lib/prismadb"

export async function POST(req: Request, { params }: { params: { storeId: string; productId: string } }) {
  return handleRestore(req, params);
}

export async function PATCH(req: Request, { params }: { params: { storeId: string; productId: string } }) {
  return handleRestore(req, params);
}

async function handleRestore(req: Request, params: { storeId: string; productId: string }) {
  try {
    const storeId = params.storeId
    const productId = params.productId


    const { userId } = await auth()

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


    const storeWithMembers = await prismadb.store
      .findUnique({
        where: { id: storeId },
        include: {
          members: true,
          storeMembers: true,
          userRoles: true,
        },
      })
      .catch((e) => {
        return null
      })


    let hasPermission = false

    if (storeByUserId) {
      hasPermission = true
    } else {
      try {

        hasPermission = true
      } catch (error) {
      }
    }

    if (!hasPermission) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const product = await prismadb.product.update({
      where: {
        id: productId,
      },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
