import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

// CORS headers for tracking endpoints
function corsHeaders() {
  // Temporarily use wildcard for debugging - should be restricted in production
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
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = await auth()
    const { storeId, productId } = params

    const body = await req.json()
    const { userAgent, ipAddress, referrer } = body

    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    ipAddress || 
                    'unknown'

    const product = await prismadb.product.findFirst({
      where: {
        id: productId,
        storeId: storeId,
        isDeleted: false,
        isPublished: true
      }
    })

    if (!product) {
      return new NextResponse("Product not found", { status: 404 })
    }

    // Check if this IP has already viewed this product recently (within last 24 hours)
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    const existingView = await prismadb.productView.findFirst({
      where: {
        productId: productId,
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

    const view = await prismadb.productView.create({
      data: {
        productId: productId,
        storeId: storeId,
        userAgent: userAgent || null,
        ipAddress: clientIP,
        referrer: referrer || null
      }
    })

    await prismadb.product.update({
      where: { id: productId },
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
    console.error('Error tracking product view:', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    const { storeId, productId } = params

    const product = await prismadb.product.findFirst({
      where: {
        id: productId,
        storeId: storeId
      },
      select: {
        id: true,
        name: true,
        viewCount: true
      }
    })

    if (!product) {
      return new NextResponse("Product not found", { status: 404 })
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentViews = await prismadb.productView.findMany({
      where: {
        productId: productId,
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
      product: {
        id: product.id,
        name: product.name,
        viewCount: product.viewCount
      },
      recentViews: recentViews,
      totalRecentViews: recentViews.length
    })

  } catch (error) {
    console.error('Error fetching product view data:', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
