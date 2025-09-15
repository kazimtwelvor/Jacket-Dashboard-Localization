import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"
import { checkApiPermission } from "@/lib/api-permissions"
import { Permission } from "@/types/permissions"

export async function GET(req: Request, { params }: { params: { storeId: string; pageId: string } }) {
  try {
    if (!params.pageId) {
      return new NextResponse("Page ID is required", { status: 400 })
    }

    const permissionCheck = await checkApiPermission(params.storeId, Permission.VIEW_PAGES, 'GET')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to view pages.", { status: 403 })
    }

    const page = await prismadb.page.findUnique({
      where: {
        id: params.pageId,
      },
    })

    return NextResponse.json(page)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { storeId: string; pageId: string } }) {
  try {
    const { userId } = await auth()
    const body = await req.json()

    const { title, slug, isPublished, content } = body

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!title) {
      return new NextResponse("Title is required", { status: 400 })
    }

    if (!slug) {
      return new NextResponse("Slug is required", { status: 400 })
    }

    if (!params.pageId) {
      return new NextResponse("Page ID is required", { status: 400 })
    }

    const permissionCheck = await checkApiPermission(params.storeId, Permission.EDIT_PAGES, 'PATCH')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to edit pages.", { status: 403 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const existingPageBySlug = await prismadb.page.findFirst({
      where: {
        storeId: params.storeId,
        slug,
        NOT: {
          id: params.pageId,
        },
      },
    })

    if (existingPageBySlug) {
      return new NextResponse("Slug already exists", { status: 400 })
    }

    const trimmedTitle = title.trim()
    const existingPageByTitle = await prismadb.page.findFirst({
      where: {
        storeId: params.storeId,
        title: {
          equals: trimmedTitle,
          mode: 'insensitive'
        },
        NOT: {
          id: params.pageId,
        },
      },
    })

 

    if (existingPageByTitle) {
      return new NextResponse("Title already exists", { status: 400 })
    }

    const page = await prismadb.page.update({
      where: {
        id: params.pageId,
      },
      data: {
        title,
        slug,
        isPublished,
        content,
      },
    })

    return NextResponse.json(page)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { storeId: string; pageId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!params.pageId) {
      return new NextResponse("Page ID is required", { status: 400 })
    }

    const permissionCheck = await checkApiPermission(params.storeId, Permission.DELETE_PAGES, 'DELETE')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to delete pages.", { status: 403 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const page = await prismadb.page.delete({
      where: {
        id: params.pageId,
      },
    })

    return NextResponse.json(page)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
