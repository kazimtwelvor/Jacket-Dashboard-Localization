import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function POST(
  req: NextRequest,
  { params }: { params: { storeId: string; categoryPageId: string } }
) {
  try {
    const { userId } = await auth()
    const { storeId, categoryPageId } = params

    const body = await req.json()
    const { userAgent, ipAddress, referrer } = body

    const categoryPage = await prismadb.categoryPage.findFirst({
      where: {
        id: categoryPageId,
        storeId: storeId,
        isPublished: true
      }
    })

    if (!categoryPage) {
      return new NextResponse("Category page not found", { status: 404 })
    }

    const view = await prismadb.categoryPageView.create({
      data: {
        categoryPageId: categoryPageId,
        storeId: storeId,
        userAgent: userAgent || null,
        ipAddress: ipAddress || null,
        referrer: referrer || null
      }
    })

    await prismadb.categoryPage.update({
      where: { id: categoryPageId },
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
    console.error('Error tracking category page view:', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string; categoryPageId: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    const { storeId, categoryPageId } = params

    const categoryPage = await prismadb.categoryPage.findFirst({
      where: {
        id: categoryPageId,
        storeId: storeId
      },
      select: {
        id: true,
        name: true,
        viewCount: true
      }
    })

    if (!categoryPage) {
      return new NextResponse("Category page not found", { status: 404 })
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentViews = await prismadb.categoryPageView.findMany({
      where: {
        categoryPageId: categoryPageId,
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
      categoryPage: {
        id: categoryPage.id,
        name: categoryPage.name,
        viewCount: categoryPage.viewCount
      },
      recentViews: recentViews,
      totalRecentViews: recentViews.length
    })

  } catch (error) {
    console.error('Error fetching category page view data:', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
