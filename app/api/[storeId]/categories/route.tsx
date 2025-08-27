import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()
    const body = await req.json()
    const { storeId } = params

    const { name, billboardId, type, slug, imageUrl, categoryContent, isBest } = body

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    if (!slug) {
      return new NextResponse("Slug is required", { status: 400 })
    }

    if (!type || !["material", "style", "gender", "regular"].includes(type)) {
      return new NextResponse("Valid type is required (material, style, gender, or regular)", { status: 400 })
    }

    if (!storeId) {
      return new NextResponse("Store Id is required", { status: 400 })
    }

    // Check if user is the store owner
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    // If not store owner, check if user has Admin or Editor role
    if (!storeByUserId) {
      // Find user by clerk ID
      const user = await prismadb.user.findUnique({
        where: { clerkId: userId },
      })

      if (!user) {
        return new NextResponse("Unauthorized", { status: 403 })
      }

      // Check if user has store access with Admin or Editor role
      const storeUser = await prismadb.storeUser.findFirst({
        where: {
          userId: user.id,
          storeId: storeId,
          role: { in: ["ADMIN", "EDITOR"] },
        },
      })

      if (!storeUser) {
        return new NextResponse("Unauthorized - Insufficient permissions", { status: 403 })
      }
    }

    const category = await prismadb.category.create({
      data: {
        name,
        slug,
        billboardId,
        type,
        imageUrl,
        categoryContent: categoryContent ? JSON.parse(categoryContent) : null,
        isBest: isBest || false,
        storeId: storeId,
      },
    })

    return NextResponse.json(category, { headers: corsHeaders })
  } catch (err) {
    console.log(`[CATEGORIES_POST] ${err}`)
    return new NextResponse(`Internal error`, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { storeId } = params
    const { searchParams } = new URL(req.url)
    const forTemplate = searchParams.get("forTemplate") === "true"
    const isBest = searchParams.get("isBest")

    if (!storeId) {
      return new NextResponse("Store Id is required", { status: 400 })
    }

    if (forTemplate) {
      // For templates, return category pages instead of regular categories
      const categoryPages = await prismadb.categoryPage.findMany({
        where: {
          storeId: storeId,
        },
      })
      
      // Format them to match the expected structure
      const formattedCategoryPages = categoryPages.map(page => ({
        categoryId: page.id,
        categoryName: page.name,
        imageUrl: page.imageUrl || ""
      }))
      
      return NextResponse.json(formattedCategoryPages, { headers: corsHeaders })
    } else {
      // Build where clause for filtering
      const whereClause: any = {
        storeId: storeId,
      }
      
      // Add isBest filter if provided
      if (isBest === "true") {
        whereClause.isBest = true
      } else if (isBest === "false") {
        whereClause.isBest = { not: true }
      }
      
      // Regular category listing
      const categories = await prismadb.category.findMany({
        where: whereClause,
      })
      
      return NextResponse.json(categories, { headers: corsHeaders })
    }
  } catch (err) {
    console.log(`[CATEGORIES_GET] ${err}`)
    return new NextResponse(`Internal error`, { status: 500 })
  }
}