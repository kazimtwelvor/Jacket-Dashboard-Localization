import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function GET(req: Request, { params }: { params: { pageId: string } }) {
  try {
    if (!params.pageId) {
      return new NextResponse("Page ID is required", { status: 400 })
    }

    const page = await prismadb.page.findUnique({
      where: {
        id: params.pageId,
      },
    })

    return NextResponse.json(page)
  } catch (error) {
    console.log("[PAGE_GET]", error)
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

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 })
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
    console.log("[PAGE_PATCH]", error)
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
    console.log("[PAGE_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
