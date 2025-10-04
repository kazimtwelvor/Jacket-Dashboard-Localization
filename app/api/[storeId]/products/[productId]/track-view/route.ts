import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function POST(
  req: NextRequest,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = await auth()
    const { storeId, productId } = params

    const body = await req.json()
    const { userAgent, ipAddress, referrer } = body

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

    const view = await prismadb.productView.create({
      data: {
        productId: productId,
        storeId: storeId,
        userAgent: userAgent || null,
        ipAddress: ipAddress || null,
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
