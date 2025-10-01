import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth()
    const { storeId } = params
    const { searchParams } = new URL(req.url)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
    }

    const user = await prismadb.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const store = user.clerkId ? await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId: user.clerkId
      }
    }) : null

    const storeUser = await prismadb.storeUser.findFirst({
      where: {
        userId: user.id,
        storeId: storeId,
        OR: [
          { isOwner: true },
          { role: 'ADMIN' },
          { role: 'EDITOR' }
        ]
      }
    })

    if (!store && !storeUser) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const categoryFilter = searchParams.get('category') || 'all'
    const colorFilter = searchParams.get('color') || 'all'

    const materialFilter = searchParams.get('material') || 'all'
    const styleFilter = searchParams.get('style') || 'all'
    const genderFilter = searchParams.get('gender') || 'all'
    const dateFilter = searchParams.get('date') || 'all'
    const creatorFilter = searchParams.get('creator') || 'all'
    const priceMin = parseFloat(searchParams.get('priceMin') || '0')
    const priceMax = parseFloat(searchParams.get('priceMax') || '999999')
    const status = searchParams.get('status') || 'all'
    const type = searchParams.get('type') || 'products'
    
    const offset = (page - 1) * limit

    const whereClause: any = {
      storeId: storeId,
      isDeleted: type === 'trashed' ? true : false,
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (priceMin > 0 || priceMax < 999999) {
      whereClause.price = {
        gte: priceMin,
        lte: priceMax
      }
    }

    if (categoryFilter !== 'all') {
      const categoryParts = categoryFilter.split(' ')
      if (categoryParts.length > 1) {
        whereClause.AND = [
          {
            categoryData: {
              path: ['material'],
              string_contains: categoryParts[0]
            }
          },
          {
            categoryData: {
              path: ['style'],
              string_contains: categoryParts[1]
            }
          }
        ]
      } else {
        whereClause.OR = [
          {
            categoryData: {
              path: ['material'],
              string_contains: categoryFilter
            }
          },
          {
            categoryData: {
              path: ['style'],
              string_contains: categoryFilter
            }
          }
        ]
      }
    }

    if (colorFilter !== 'all') {
      whereClause.colorDetails = {
        array_contains: [{ name: colorFilter }]
      }
      
    }

    if (materialFilter !== 'all' || styleFilter !== 'all') {
      const categoryConditions = []

      if (materialFilter !== 'all') {
        categoryConditions.push({
          categoryData: {
            path: ['material'],
            string_contains: materialFilter
          }
        })
      }

      if (styleFilter !== 'all') {
        categoryConditions.push({
          categoryData: {
            path: ['style'],
            string_contains: styleFilter
          }
        })
      }

      if (categoryConditions.length > 0) {
        if (categoryConditions.length === 1) {
          Object.assign(whereClause, categoryConditions[0])
        } else {
          whereClause.AND = whereClause.AND ? [...whereClause.AND, ...categoryConditions] : categoryConditions
        }
      }
    }

    if (genderFilter !== 'all') {
      whereClause.gender = genderFilter
    }

    if (creatorFilter !== 'all') {
      whereClause.createdByName = creatorFilter
    }

    if (dateFilter !== 'all') {
      const now = new Date()
      let startDate: Date

      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(0)
      }

      whereClause.createdAt = {
        gte: startDate
      }
    }

    if (status !== 'all') {
      if (status === 'published') {
        whereClause.isPublished = true
        whereClause.isArchived = false
      } else if (status === 'archived') {
        whereClause.isArchived = true
      } else if (status === 'featured') {
        whereClause.isFeatured = true
      }
    }

    const [products, totalCount] = await Promise.all([
      prismadb.product.findMany({
        where: whereClause,
        include: {
          images: {
            include: {
              image: true,
            },
            orderBy: {
              order: 'asc'
            },
            take: 1
          },
        },
        orderBy: type === 'trashed'
          ? { deletedAt: 'desc' }
          : [
              { isBest: 'desc' },
              { createdAt: 'desc' }
            ],
        skip: offset,
        take: limit,
      }),
      prismadb.product.count({
        where: whereClause,
      })
    ])

    const serializedProducts = products.map(product => ({
      ...product,
      price: product.price.toString(),
      salePrice: product.salePrice ? product.salePrice.toString() : null,
    }))

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      products: serializedProducts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })

  } catch (error) {
    console.error("[DRAFT_PRODUCTS_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
