import prismadb from "@/lib/prismadb"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { checkApiPermission } from "@/lib/api-permissions"
import { Permission } from "@/types/permissions"

export async function GET(req: Request, { params }: { params: Promise<{ storeId: string; categoryId: string }> }) {
  try {
    const { storeId, categoryId } = await params
    if (!categoryId) {
      return new NextResponse("Category id is required", { status: 400 })
    }

    const permissionCheck = await checkApiPermission(storeId, Permission.VIEW_CATEGORIES, 'GET')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to view categories.", { status: 403 })
    }

    const category = await prismadb.category.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        billboard: true,
      },
    })

    return NextResponse.json(category)
  } catch (err) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ storeId: string; categoryId: string }> }) {
  try {
    const { userId } = await auth()
    const body = await req.json()

    const { name, billboardId, type, slug, imageUrl, categoryContent, isBest } = body
    const { storeId, categoryId } = await params

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    if (!slug) {
      return new NextResponse("Slug is required", { status: 400 })
    }

    if (!type || !["material", "style", "gender", "regular"].includes(type)) {
      return new NextResponse("Valid type is required (material, style, gender, or regular)", { status: 400 })
    }

    const permissionCheck = await checkApiPermission(storeId, Permission.EDIT_CATEGORIES, 'PATCH')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to edit categories.", { status: 403 })
    }

    if (!categoryId) {
      return new NextResponse("Category id is required", { status: 400 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      const user = await prismadb.user.findUnique({
        where: { clerkId: userId },
      })

      if (!user) {
        return new NextResponse("Unauthorized", { status: 403 })
      }

      const storeUser = await prismadb.storeUser.findFirst({
        where: {
          userId: user.id,
          storeId: storeId,
          role: { in: ["ADMIN", "EDITOR"] },
        },
      })

      if (!storeUser) {
        return new NextResponse("Unauthorized - Insufficient permissions", { status: 403 })
      }
    }

    const category = await prismadb.category.updateMany({
      where: {
        id: categoryId,
      },
      data: {
        name,
        slug,
        billboardId,
        type,
        imageUrl,
        categoryContent: categoryContent ? JSON.parse(categoryContent) : null,
        isBest: isBest || false,
      },
    })

    return NextResponse.json(category)
  } catch (err) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ storeId: string; categoryId: string }> }) {
  try {
    const { userId } = await auth()
    const { storeId, categoryId } = await params

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!categoryId) {
      return new NextResponse("Category id is required", { status: 400 })
    }

    const permissionCheck = await checkApiPermission(storeId, Permission.DELETE_CATEGORIES, 'DELETE')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to delete categories.", { status: 403 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      const user = await prismadb.user.findUnique({
        where: { clerkId: userId },
      })

      if (!user) {
        return new NextResponse("Unauthorized", { status: 403 })
      }

      const storeUser = await prismadb.storeUser.findFirst({
        where: {
          userId: user.id,
          storeId: storeId,
          role: { in: ["ADMIN", "EDITOR"] },
        },
      })

      if (!storeUser) {
        return new NextResponse("Unauthorized - Insufficient permissions", { status: 403 })
      }
    }

    const category = await prismadb.category.deleteMany({
      where: {
        id: categoryId,
      },
    })

    return NextResponse.json(category)
  } catch (err) {
    return new NextResponse("Internal error", { status: 500 })
  }
}