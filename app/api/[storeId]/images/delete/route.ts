import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"
import fs from "fs"
import path from "path"

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    const body = await req.json()
    const { imageUrl } = body

    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 })
    }

    const urlObj = new URL(imageUrl, "http://localhost")
    const urlPath = urlObj.pathname

    const image = await prismadb.image.findFirst({
      where: {
        url: urlPath,
      },
      include: {
        productImages: true,
      },
    })

    if (image && image.productImages.length > 0) {
      return NextResponse.json(
        {
          error: "image_in_use",
          message: "Cannot delete image as it is used by other products",
          products: image.productImages.length,
        },
        { status: 400 },
      )
    }

    if (image) {
      await prismadb.image.delete({
        where: {
          id: image.id,
        },
      })
    }

    try {
      const filePath = path.join(process.cwd(), "public", urlPath)

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      } else {
      }
    } catch (fileError) {
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return new NextResponse(`Internal error: ${error.message}`, { status: 500 })
  }
}
