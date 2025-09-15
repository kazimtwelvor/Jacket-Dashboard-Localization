

import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"
import { checkApiPermission } from "@/lib/api-permissions"
import { Permission } from "@/types/permissions"

export async function POST(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { userId } = await auth()
    const body = await req.json()

    const { label, imageUrl } = body
    const { storeId } = await params

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!label) {
      return new NextResponse("Label is required", { status: 400 })
    }

    if (!imageUrl) {
      return new NextResponse("Image Url is required", { status: 400 })
    }

    if (!storeId) {
      return new NextResponse("Store Id is required", { status: 400 })
    }

    const permissionCheck = await checkApiPermission(storeId, Permission.CREATE_BILLBOARDS, 'POST')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to create billboards.", { status: 403 })
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
                role: "owner",
              },
            },
          },
        ],
      },
    })

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const fullImageUrl = imageUrl.startsWith("/uploads") ? `http://localhost:3001${imageUrl}` : imageUrl

    const billboard = await prismadb.billboard.create({
      data: {
        label,
        imageUrl: fullImageUrl,
        storeId: storeId,
      },
    })

    return NextResponse.json(billboard)
  } catch (err) {
    return new NextResponse(`Internal error`, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { storeId } = await params

    if (!storeId) {
      return new NextResponse("Store Id is required", { status: 400 })
    }

    const permissionCheck = await checkApiPermission(storeId, Permission.VIEW_BILLBOARDS, 'GET')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to view billboards.", { status: 403 })
    }

    const billboards = await prismadb.billboard.findMany({
      where: {
        storeId: storeId,
      },
    })

    return NextResponse.json(billboards)
  } catch (err) {
    return new NextResponse(`Internal error`, { status: 500 })
  }
}
