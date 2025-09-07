import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// Function to recursively get all image files from a directory
async function getImagesFromDirectory(dir: string, baseUrl = ""): Promise<any[]> {
  try {
    const files = fs.readdirSync(dir)
    let images: any[] = []

    for (const file of files) {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
        // Recursively get images from subdirectories
        const subDirImages = await getImagesFromDirectory(filePath, baseUrl ? `${baseUrl}/${file}` : file)
        images = [...images, ...subDirImages]
      } else {
        // Check if file is an image
        const ext = path.extname(file).toLowerCase()
        if ([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(ext)) {
          const urlPath = baseUrl ? `${baseUrl}/${file}` : file
          const publicUrl = `/uploads/${urlPath}`

          images.push({
            name: file,
            url: publicUrl,
            path: urlPath,
            size: stat.size,
            lastModified: stat.mtime,
          })
        }
      }
    }

    return images
  } catch (error) {
    return []
  }
}

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const uploadsDir = path.join(process.cwd(), "public/uploads")

    // Check if uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      return NextResponse.json({ images: [] })
    }

    // Get all images from the uploads directory and its subdirectories
    const images = await getImagesFromDirectory(uploadsDir)

    // Sort images by last modified date (newest first)
    images.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())

    return NextResponse.json({ images })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 })
  }
}
