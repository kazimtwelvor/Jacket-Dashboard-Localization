import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"
import { corsHeaders, handleCors, withCors } from "@/lib/cors"

export async function OPTIONS() {
  return handleCors()
}

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { storeId } = params
    const { searchParams } = new URL(req.url)

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "28")
    const skip = (page - 1) * limit

    const isAdmin = searchParams.get("admin") === "true"
    
    const baseWhereClause = {
      storeId: storeId,
      isDeleted: false,
      ...(isAdmin ? {} : { isPublished: true, isArchived: false }),
    }

    const colors = searchParams.get("colors")
    const materials = searchParams.get("materials")
    const styles = searchParams.get("styles")
    const genders = searchParams.get("genders")
    
    
    const allProducts = await prismadb.product.findMany({
      where: baseWhereClause,
      include: {
        images: {
          include: {
            image: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        reviews: {
          where: {
            isApproved: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      }
    })
    
    
    let filteredProducts = [...allProducts]
    
    if (colors) {
      const colorsList = colors.toLowerCase().split(',')
      filteredProducts = filteredProducts.filter(product => {
        if (!product.colorDetails) return false
        
        let colorData = product.colorDetails
        if (typeof colorData === 'string') {
          try {
            colorData = JSON.parse(colorData)
          } catch (e) {
            return false
          }
        }
        
        if (Array.isArray(colorData)) {
          return colorData.some(color => 
            color && color.name && colorsList.includes(color.name.toLowerCase())
          )
        }
        
        return false
      })
      
    }
    
    if (materials) {
      const materialsList = materials.toLowerCase().split(',')
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
        
        const productMaterial = categoryData.material
        if (!productMaterial) return false
        
        return materialsList.includes(productMaterial.toLowerCase())
      })
      
    }
    
    if (styles) {
      const stylesList = styles.toLowerCase().split(',')
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
        
        const productStyle = categoryData.style
        if (!productStyle) return false
        
        return stylesList.includes(productStyle.toLowerCase())
      })
      
    }
    
    if (genders) {
      const gendersList = genders.toLowerCase().split(',')
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
        
        const productGender = categoryData.gender
        if (!productGender) return false
        
        return gendersList.includes(productGender.toLowerCase())
      })
      
    }
    
    const totalProducts = filteredProducts.length
    const paginatedProducts = filteredProducts.slice(skip, skip + limit)
    
    const serializedProducts = paginatedProducts.map(product => ({
      ...product,
      price: product.price.toString(),
      originalPrice: product.originalPrice ? product.originalPrice.toString() : "0",
      salePrice: product.salePrice ? product.salePrice.toString() : null,
      images: product.images.map(productImage => ({
        id: productImage.imageId,
        url: productImage.image.url,
      })),
      schema: product.schema ? JSON.parse(product.schema) : null,
      reviews: product.reviews.map(review => ({
        id: review.id,
        userId: review.userId,
        userName: review.userName,
        email: review.email,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        photoUrl: review.photoUrl,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      })),
    }))

    const totalPages = Math.ceil(totalProducts / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return withCors({
      products: serializedProducts,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalProducts: totalProducts,
        productsPerPage: limit,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
      }
    })
  } catch (err) {
    return new NextResponse(`Internal error: ${err.message}`, { status: 500, headers: corsHeaders })
  }
}