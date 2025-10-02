import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"
import { checkApiPermission } from "@/lib/api-permissions"
import { Permission } from "@/types/permissions"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { storeId } = params;
    const { userId } = await auth()
    const body = await req.json()
    const { categoryPageIds } = body

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401, headers: corsHeaders })
    }

    const permissionCheck = await checkApiPermission(storeId, Permission.VIEW_CATEGORIES, 'POST')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to read category pages.", { status: 403, headers: corsHeaders })
    }

    if (!categoryPageIds || !Array.isArray(categoryPageIds)) {
      return new NextResponse("Category page IDs array is required", { status: 400, headers: corsHeaders })
    }

    const categoryPageIdArray = categoryPageIds

    // Get category pages
    const categoryPages = await prismadb.categoryPage.findMany({
      where: {
        id: {
          in: categoryPageIdArray
        },
        storeId: storeId,
      },
    })

    // Fetch all products once to avoid multiple database connections
    const allProducts = await prismadb.product.findMany({
      where: {
        storeId: storeId,
        isDeleted: false,
        isPublished: true
      },
      select: {
        id: true,
        categoryData: true,
        specifications: true
      }
    })

    const getProductCount = (categoryPage: any, products: any[]) => {
      try {
        let filteredProducts = products

        if (categoryPage.materials && categoryPage.materials.length > 0) {
          filteredProducts = filteredProducts.filter(product => {
            if (!product.categoryData) return false

            let categoryData = product.categoryData
            if (typeof categoryData === 'string') {
              try {
                categoryData = JSON.parse(categoryData)
              } catch (e) {
                return false
              }
            }

            const productMaterial = (categoryData as any).material
            if (!productMaterial) return false

            return categoryPage.materials.includes(productMaterial.toString())
          })
        }

        if (categoryPage.styles && categoryPage.styles.length > 0) {
          filteredProducts = filteredProducts.filter(product => {
            if (!product.categoryData) return false

            let categoryData = product.categoryData
            if (typeof categoryData === 'string') {
              try {
                categoryData = JSON.parse(categoryData)
              } catch (e) {
                return false
              }
            }

            const productStyle = (categoryData as any).style
            if (!productStyle) return false

            return categoryPage.styles.includes(productStyle.toString())
          })
        }

        if (categoryPage.genders && categoryPage.genders.length > 0) {
          filteredProducts = filteredProducts.filter(product => {
            if (!product.categoryData) return false

            let categoryData = product.categoryData
            if (typeof categoryData === 'string') {
              try {
                categoryData = JSON.parse(categoryData)
              } catch (e) {
                return false
              }
            }

            const productGender = (categoryData as any).gender
            if (!productGender) return false

            return categoryPage.genders.includes(productGender.toString())
          })
        }

        if (categoryPage.colors && categoryPage.colors.length > 0) {
          filteredProducts = filteredProducts.filter(product => {
            if (!product.specifications) return false

            let specifications = product.specifications
            if (typeof specifications === 'string') {
              try {
                specifications = JSON.parse(specifications)
              } catch (e) {
                return false
              }
            }

            const productColors = (specifications as any).color
            if (!productColors || !Array.isArray(productColors)) return false

            return categoryPage.colors.some((categoryColor: string) =>
              productColors.includes(categoryColor)
            )
          })
        }

        return filteredProducts.length
      } catch (error) {
        console.error('Error counting products for category:', error)
        return 0
      }
    }

    // Process all category pages using the same product data (no database calls)
    const productCounts = categoryPages.map(page => ({
      id: page.id,
      productCount: getProductCount(page, allProducts)
    }))

    return NextResponse.json(productCounts, { headers: corsHeaders })
  } catch (error: any) {
    return new NextResponse(`Internal error: ${error.message}`, { status: 500, headers: corsHeaders })
  }
}
