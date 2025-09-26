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

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401, headers: corsHeaders })
    }

    const permissionCheck = await checkApiPermission(storeId, Permission.CREATE_CATEGORIES, 'POST')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to create category pages.", { status: 403, headers: corsHeaders })
    }

    const {
      name,
      slug,
      apiSlug,
      description,
      imageUrl,
      bannerImageUrl,
      materials,
      styles,
      colors,
      genders,
      collars,
      cuffs,
      closures,
      pockets,
      isBest,
      seoTitle,
      seoDescription,
      focusKeyword,
      supportingKeywords,
      categoryContent,
      status,
      isPublished,
    } = body



    if (!name) {
      return new NextResponse("Name is required", { status: 400, headers: corsHeaders })
    }

    if (!slug) {
      return new NextResponse("Slug is required", { status: 400, headers: corsHeaders })
    }

    const existingCategoryPageBySlug = await prismadb.categoryPage.findFirst({
      where: {
        storeId: storeId,
        slug,
      },
    })

    if (existingCategoryPageBySlug) {
      return new NextResponse("Slug already exists", { status: 400, headers: corsHeaders })
    }

    const trimmedName = name.trim()
    const existingCategoryPageByName = await prismadb.categoryPage.findFirst({
      where: {
        storeId: storeId,
        name: {
          equals: trimmedName,
          mode: 'insensitive'
        },
      },
    })



    if (existingCategoryPageByName) {
      return new NextResponse("Name already exists", { status: 400, headers: corsHeaders })
    }

    const finalImageUrl = imageUrl || "";

    const categoryPage = await prismadb.categoryPage.create({
      data: {
        name,
        slug,
        apiSlug: apiSlug || "",
        description: description || "",
        imageUrl: finalImageUrl,
        bannerImageUrl: bannerImageUrl || "",
        materials: materials || [],
        styles: styles || [],
        colors: colors || [],
        genders: genders || [],
        collars: collars || [],
        cuffs: cuffs || [],
        closures: closures || [],
        pockets: pockets || [],
        isBest: isBest || false,
        seoTitle: seoTitle || "",
        seoDescription: seoDescription || "",
        focusKeyword: focusKeyword || "",
        supportingKeywords: supportingKeywords || [],
        categoryContent: categoryContent || null,
        status: (status === "PUBLISHED" || status === "DRAFT") ? status : "DRAFT",
        isPublished: status === "PUBLISHED" || isPublished === true,
        publishedAt: (status === "PUBLISHED" || isPublished === true) ? new Date() : null,
        storeId: storeId,
      },
    })

    const responseData = {
      ...categoryPage,
      currentCategory: {
        categoryId: categoryPage.id,
        categoryName: categoryPage.name,
        imageUrl: categoryPage.imageUrl || ""
      }
    }

    return NextResponse.json(responseData, { headers: corsHeaders })
  } catch (error: any) {
    return new NextResponse(`Internal error: ${error.message}`, { status: 500, headers: corsHeaders })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { storeId } = params;
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get("slug")
    const forTemplate = searchParams.get("forTemplate") === "true"
    const isBest = searchParams.get("isBest")

    let whereClause: any = {
      storeId: storeId,
    }

    if (slug) {
      whereClause.slug = slug
    }
    if (isBest === "true") {
      whereClause.isBest = true
    } else if (isBest === "false") {
      whereClause.isBest = { not: true }
    }

    const status = searchParams.get("status")
    const includeAll = searchParams.get("includeAll") === "true"

    if (!includeAll) {
      whereClause.status = "PUBLISHED"
    } else if (status && (status === "DRAFT" || status === "PUBLISHED")) {
      whereClause.status = status
    }
    const categoryPages = await prismadb.categoryPage.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    })

    const getProductCount = async (categoryPage: any) => {
      try {

        const allProducts = await prismadb.product.findMany({
          where: {
            storeId: storeId,
            isDeleted: false,
            isPublished: true
          },
          select: {
            id: true,
            categoryData: true,
            specifications: true,
            baseColor: true
          }
        })


        let filteredProducts = allProducts

        if (categoryPage.materials && categoryPage.materials.length > 0) {
          const beforeCount = filteredProducts.length
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
          console.log(`After material filter: ${filteredProducts.length} products (was ${beforeCount})`)
        }

        if (categoryPage.styles && categoryPage.styles.length > 0) {
          const beforeCount = filteredProducts.length
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
          console.log(`After style filter: ${filteredProducts.length} products (was ${beforeCount})`)
        }

        if (categoryPage.genders && categoryPage.genders.length > 0) {
          const beforeCount = filteredProducts.length
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
          console.log(`After gender filter: ${filteredProducts.length} products (was ${beforeCount})`)
        }

        if (categoryPage.colors && categoryPage.colors.length > 0) {
          const beforeCount = filteredProducts.length
          filteredProducts = filteredProducts.filter(product => {
            if (!product.baseColor) return false

            let baseColorData = product.baseColor
            if (typeof baseColorData === 'string') {
              try {
                baseColorData = JSON.parse(baseColorData)
              } catch (e) {
                return false
              }
            }

            if (baseColorData && typeof baseColorData === 'object' && baseColorData !== null && 'name' in baseColorData) {
              const colorName = (baseColorData as any).name
              return typeof colorName === 'string' && 
                     categoryPage.colors.some((categoryColor: string) => 
                       colorName.toLowerCase() === categoryColor.toLowerCase()
                     )
            }
            return false
          })
          console.log(`After color filter: ${filteredProducts.length} products (was ${beforeCount})`)
        }

        console.log(`Final count for ${categoryPage.name}: ${filteredProducts.length} products`)
        return filteredProducts.length
      } catch (error) {
        console.error('Error counting products for category:', error)
        return 0
      }
    }

    const responseData = await Promise.all(
      categoryPages.map(async (page) => {
        const productCount = await getProductCount(page)
        return {
          ...page,
          productCount,
          currentCategory: {
            categoryId: page.id,
            categoryName: page.name,
            imageUrl: page.imageUrl || ""
          }
        }
      })
    )

    if (forTemplate) {
      const filteredData = responseData.filter(item => {
        const name = item.name.toLowerCase();
        if (["cotton", "polyester", "wool", "silk", "linen", "denim", "leather", "cashmere", "nylon", "spandex"].includes(name)) {
          return false;
        }
        if (["bomber", "puffer", "varsity", "letterman", "biker", "aviator", "quilted", "blazer", "cropped", "long coat", "casual", "formal"].includes(name)) {
          return false;
        }
        if (["men", "women", "unisex", "boys", "girls"].includes(name)) {
          return false;
        }
        return true;
      });

      return NextResponse.json(filteredData, { headers: corsHeaders });
    }

    return NextResponse.json(responseData, { headers: corsHeaders })
  } catch (error: any) {
    return new NextResponse("Internal error", { status: 500, headers: corsHeaders })
  }
}