import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

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

    // Create view record
    const view = await prismadb.categoryView.create({
      data: {
        categoryId: categoryId,
        storeId: storeId,
        userAgent: userAgent || null,
        ipAddress: ipAddress || null,
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
