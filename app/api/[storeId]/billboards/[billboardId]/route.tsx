

import prismadb from "@/lib/prismadb"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { checkApiPermission } from "@/lib/api-permissions"
import { Permission } from "@/types/permissions"

export async function GET(req: Request, { params }: { params: Promise<{ storeId: string; billboardId: string }> }) {
  try {
    const { storeId, billboardId } = await params
    if (!billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 })
    }

    const permissionCheck = await checkApiPermission(storeId, Permission.VIEW_BILLBOARDS, 'GET')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to view billboards.", { status: 403 })
    }

    const billboard = await prismadb.billboard.findUnique({
      where: {
        id: billboardId,
      },
    })

    return NextResponse.json(billboard)
  } catch (err) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ storeId: string; billboardId: string }> }) {
  try {
    const { userId } = await auth()
    const body = await req.json()

    const { storeId, billboardId } = await params

    const { label, imageUrl } = body

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!label) {
      return new NextResponse("Label is required", { status: 400 })
    }

    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 })
    }

    if (!billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 })
    }

    const permissionCheck = await checkApiPermission(storeId, Permission.EDIT_BILLBOARDS, 'PATCH')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to edit billboards.", { status: 403 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        OR: [
          { userId },
          {
            members: {
              some: {
                user: {
                  clerkId: userId,
                },
              },
            },
          },
        ],
      },
    })

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const billboard = await prismadb.billboard.updateMany({
      where: {
        id: billboardId,
      },
      data: {
        label,
        imageUrl,
      },
    })

    return NextResponse.json(billboard)
  } catch (err) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ storeId: string; billboardId: string }> }) {
  try {
    const { userId } = await auth()
    const { billboardId, storeId } = await params

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 })
    }

    const permissionCheck = await checkApiPermission(storeId, Permission.DELETE_BILLBOARDS, 'DELETE')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to delete billboards.", { status: 403 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        OR: [
          { userId },
          {
            members: {
              some: {
                user: {
                  clerkId: userId,
                },
              },
            },
          },
        ],
      },
    })

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const billboard = await prismadb.billboard.deleteMany({
      where: {
        id: billboardId,
      },
    })

    return NextResponse.json(billboard)
  } catch (err) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
