import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function GET(req: Request, { params }: { params: { storeId: string; imageId: string } }) {
  try {
    if (!params.imageId) {
      return new NextResponse("Image ID is required", { status: 400 })
    }

    const image = await prismadb.image.findUnique({
      where: {
        id: params.imageId,
      },
    })

    return NextResponse.json(image)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { storeId: string; imageId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!params.imageId) {
      return new NextResponse("Image ID is required", { status: 400 })
    }

    const body = await req.json()
    const { url, altText, title, caption, description, excludeFromSitemap } = body

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const image = await prismadb.image.update({
      where: {
        id: params.imageId,
      },
      data: {
        url,
        altText,
        title,
        caption,
        description,
        excludeFromSitemap,
      },
    })

    return NextResponse.json(image)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { storeId: string; imageId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!params.imageId) {
      return new NextResponse("Image ID is required", { status: 400 })
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

    const imageUsage = await prismadb.productImage.findFirst({
      where: {
        imageId: params.imageId,
      },
    })

    if (imageUsage) {
      return new NextResponse("Cannot delete image that is in use by products. Remove it from all products first.", {
        status: 400,
      })
    }

    const image = await prismadb.image.delete({
      where: {
        id: params.imageId,
      },
    })

    return NextResponse.json(image)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
