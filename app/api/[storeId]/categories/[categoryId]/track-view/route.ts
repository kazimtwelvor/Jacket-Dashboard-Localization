import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
    'Access-Control-Max-Age': '86400',
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(),
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: { storeId: string; categoryId: string } }
) {
  try {
    const { userId } = await auth()
    const { storeId, categoryId } = params

    // Get request data
    const body = await req.json()
    const { userAgent, ipAddress, referrer } = body

    // Get client IP from request headers
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    ipAddress || 
                    'unknown'

    // Verify the category exists and belongs to the store
    const category = await prismadb.category.findFirst({
      where: {
        id: categoryId,
        storeId: storeId
      }
    })

    if (!category) {
      return new NextResponse("Category not found", { status: 404 })
    }

    // Check if this IP has already viewed this category recently (within last 24 hours)
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    const existingView = await prismadb.categoryView.findFirst({
      where: {
        categoryId: categoryId,
        storeId: storeId,
        ipAddress: clientIP,
        viewedAt: {
          gte: twentyFourHoursAgo
        }
      }
    })

    if (existingView) {
      return NextResponse.json({
        success: false,
        message: "View already recorded for this IP within 24 hours",
        duplicate: true
      }, {
        headers: corsHeaders()
      })
    }

    // Create view record
    const view = await prismadb.categoryView.create({
      data: {
        categoryId: categoryId,
        storeId: storeId,
        userAgent: userAgent || null,
        ipAddress: clientIP,
        referrer: referrer || null
      }
    })

    // Update category view count
    await prismadb.category.update({
      where: { id: categoryId },
      data: {
        viewCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      viewId: view.id,
      message: "View tracked successfully"
    }, {
      headers: corsHeaders()
    })

  } catch (error) {
    console.error('Error tracking category view:', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string; categoryId: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    const { storeId, categoryId } = params

    // Get view count for the category
    const category = await prismadb.category.findFirst({
      where: {
        id: categoryId,
        storeId: storeId
      },
      select: {
        id: true,
        name: true,
        viewCount: true
      }
    })

    if (!category) {
      return new NextResponse("Category not found", { status: 404 })
    }

    // Get recent views (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentViews = await prismadb.categoryView.findMany({
      where: {
        categoryId: categoryId,
        storeId: storeId,
        viewedAt: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        viewedAt: 'desc'
      },
      take: 100,
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        referrer: true,
        viewedAt: true
      }
    })

    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
        viewCount: category.viewCount
      },
      recentViews: recentViews,
      totalRecentViews: recentViews.length
    })

  } catch (error) {
    console.error('Error fetching category view data:', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
