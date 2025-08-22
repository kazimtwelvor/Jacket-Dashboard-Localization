import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
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

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
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
    console.log("[PAGES_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
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
    console.log("[PAGES_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
