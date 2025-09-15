import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"
import { checkApiPermission } from "@/lib/api-permissions"
import { Permission } from "@/types/permissions"

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()
    const body = await req.json()

    const { title, slug, isPublished, content }: {
      title: string;
      slug: string;
      isPublished?: boolean;
      content?: string;
    } = body


    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!title) {
      return new NextResponse("Title is required", { status: 400 })
    }

    if (!slug) {
      return new NextResponse("Slug is required", { status: 400 })
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    const permissionCheck = await checkApiPermission(params.storeId, Permission.CREATE_PAGES, 'POST')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to create pages.", { status: 403 })
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
      },
    })

  

    if (existingPageByTitle) {
      return new NextResponse("Title already exists", { status: 400 })
    }

    const page = await prismadb.page.create({
      data: {
        title,
        slug,
        isPublished: isPublished || false,
        content: content || "",
        storeId: params.storeId,
      },
    })

    return NextResponse.json(page)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    const permissionCheck = await checkApiPermission(params.storeId, Permission.VIEW_PAGES, 'GET')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to view pages.", { status: 403 })
    }

    const pages = await prismadb.page.findMany({
      where: {
        storeId: params.storeId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(pages)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
