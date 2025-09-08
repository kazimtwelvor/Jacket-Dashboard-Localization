

import prismadb from "@/lib/prismadb"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> | { storeId: string } }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { storeId } = resolvedParams

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 })
    }

    const store = await prismadb.store.findUnique({
      where: {
        id: storeId,
      },
      select: {
        id: true,
        name: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        skuPrefix: true,
        url: true, // Make sure url is included
      },
    })

    return NextResponse.json(store)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ storeId: string }> | { storeId: string } }) {
  try {
    const { userId } = await auth()

    const resolvedParams = params instanceof Promise ? await params : params
    const { storeId } = resolvedParams

    const body = await req.json()

    const { name, skuPrefix, url } = body

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 })
    }

    const store = await prismadb.store.updateMany({
      where: {
        id: storeId,
        userId,
      },
      data: {
        name,
        ...(skuPrefix !== undefined && { skuPrefix }),
        ...(url !== undefined && { url }),
      },
    })

    return NextResponse.json(store)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ storeId: string }> | { storeId: string } }) {
  try {
    const { userId } = await auth()

    const resolvedParams = params instanceof Promise ? await params : params
    const { storeId } = resolvedParams

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 })
    }

    const store = await prismadb.store.deleteMany({
      where: {
        id: storeId,
        userId,
      },
    })

    return NextResponse.json(store)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
