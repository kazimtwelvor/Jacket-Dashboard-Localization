import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const originalFilename = file.name
    const fileExt = path.extname(originalFilename).toLowerCase()

    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]
    if (!allowedExtensions.includes(fileExt)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    const uniqueFilename = `${uuidv4()}${fileExt}`

    const date = new Date()
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")

    const uploadDir = path.join(process.cwd(), "public/uploads", year.toString(), month)

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const filePath = path.join(uploadDir, uniqueFilename)
    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/${year}/${month}/${uniqueFilename}`

    return NextResponse.json({
      url: fileUrl,
      name: originalFilename,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
