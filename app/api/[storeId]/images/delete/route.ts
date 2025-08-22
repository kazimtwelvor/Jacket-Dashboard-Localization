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

    // Extract the image path from the URL
    const urlObj = new URL(imageUrl, "http://localhost")
    const urlPath = urlObj.pathname

    // Find the image in the database
    const image = await prismadb.image.findFirst({
      where: {
        url: urlPath,
      },
      include: {
        productImages: true,
      },
    })

    // Check if the image is used by any products
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

    // Delete the image from the database if it exists
    if (image) {
      await prismadb.image.delete({
        where: {
          id: image.id,
        },
      })
    }

    // Try to delete the physical file
    try {
      const filePath = path.join(process.cwd(), "public", urlPath)
      console.log(`Attempting to delete file at: ${filePath}`)

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        console.log(`Successfully deleted file: ${filePath}`)
      } else {
        console.log(`File not found: ${filePath}`)
      }
    } catch (fileError) {
      console.error("Error deleting file:", fileError)
      // Continue even if file deletion fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[IMAGE_DELETE]", error)
    return new NextResponse(`Internal error: ${error.message}`, { status: 500 })
  }
}
