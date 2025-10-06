import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    const { storeId } = params
    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "30"
    const limit = parseInt(searchParams.get("limit") || "10")

    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - parseInt(period))

    // Get top products by views
    const topProducts = await prismadb.product.findMany({
      where: {
        storeId: storeId,
        isDeleted: false,
        isPublished: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        viewCount: true,
        images: {
          take: 1,
          include: {
            image: {
              select: {
                url: true
              }
            }
          },
          orderBy: {
            order: "asc"
          }
        }
      },
      orderBy: {
        viewCount: 'desc'
      },
      take: limit
    })

    // Get top categories by views
    const topCategories = await prismadb.category.findMany({
      where: {
        storeId: storeId
      },
      select: {
        id: true,
        name: true,
        slug: true,
        viewCount: true,
        imageUrl: true
      },
      orderBy: {
        viewCount: 'desc'
      },
      take: limit
    })

    // Get top category pages by views
    const topCategoryPages = await prismadb.categoryPage.findMany({
      where: {
        storeId: storeId,
        isPublished: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        viewCount: true,
        imageUrl: true
      },
      orderBy: {
        viewCount: 'desc'
      },
      take: limit
    })

    // Get recent view activity
    const recentProductViews = await prismadb.productView.findMany({
      where: {
        storeId: storeId,
        viewedAt: {
          gte: daysAgo
        }
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        viewedAt: 'desc'
      },
      take: 50
    })

    const recentCategoryViews = await prismadb.categoryView.findMany({
      where: {
        storeId: storeId,
        viewedAt: {
          gte: daysAgo
        }
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        viewedAt: 'desc'
      },
      take: 50
    })

    const recentCategoryPageViews = await prismadb.categoryPageView.findMany({
      where: {
        storeId: storeId,
        viewedAt: {
          gte: daysAgo
        }
      },
      include: {
        categoryPage: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        viewedAt: 'desc'
      },
      take: 50
    })

    // Calculate total views for the period
    const totalProductViews = await prismadb.productView.count({
      where: {
        storeId: storeId,
        viewedAt: {
          gte: daysAgo
        }
      }
    })

    const totalCategoryViews = await prismadb.categoryView.count({
      where: {
        storeId: storeId,
        viewedAt: {
          gte: daysAgo
        }
      }
    })

    const totalCategoryPageViews = await prismadb.categoryPageView.count({
      where: {
        storeId: storeId,
        viewedAt: {
          gte: daysAgo
        }
      }
    })

    return NextResponse.json({
      period: `${period} days`,
      summary: {
        totalViews: totalProductViews + totalCategoryViews + totalCategoryPageViews,
        productViews: totalProductViews,
        categoryViews: totalCategoryViews,
        categoryPageViews: totalCategoryPageViews
      },
      topProducts: topProducts.map(product => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        viewCount: product.viewCount,
        imageUrl: product.images[0]?.image?.url || null
      })),
      topCategories: topCategories,
      topCategoryPages: topCategoryPages,
      recentActivity: {
        productViews: recentProductViews,
        categoryViews: recentCategoryViews,
        categoryPageViews: recentCategoryPageViews
      }
    })

  } catch (error) {
    console.error('Error fetching view analytics:', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
