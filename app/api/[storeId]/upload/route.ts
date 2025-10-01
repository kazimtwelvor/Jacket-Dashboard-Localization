import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-File-Name, X-Store-Id",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400",
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400, headers: corsHeaders })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const originalFilename = file.name
    const fileExt = path.extname(originalFilename).toLowerCase()

    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]
    if (!allowedExtensions.includes(fileExt)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400, headers: corsHeaders })
    }

    const date = new Date()
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")

    const uploadDir = path.join(process.cwd(), "public/uploads", year.toString(), month)

    const sanitizedFilename = originalFilename
      .replace(/[^a-zA-Z0-9.-]/g, '-') 
      .replace(/\s+/g, '-') // Replace spaces with hypehen
      .toLowerCase()
    
    let finalFilename = sanitizedFilename
    let counter = 1
    
    // Check if file already exists and add counter if needed
    while (existsSync(path.join(uploadDir, finalFilename))) {
      const nameWithoutExt = path.parse(sanitizedFilename).name
      const ext = path.parse(sanitizedFilename).ext
      finalFilename = `${nameWithoutExt}_${counter}${ext}`
      counter++
    }

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const filePath = path.join(uploadDir, finalFilename)
    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/${year}/${month}/${finalFilename}`

    return NextResponse.json({
      url: fileUrl,
      name: originalFilename,
      size: file.size,
      type: file.type,
    }, { headers: corsHeaders })
  } catch (error) {
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500, headers: corsHeaders })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
