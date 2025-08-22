import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { storeId } = params
    const { searchParams } = new URL(req.url)

    // Pagination parameters
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "28")
    const skip = (page - 1) * limit

    // Check if this is an admin request
    const isAdmin = searchParams.get("admin") === "true"
    
    // Build the base where clause
    const baseWhereClause = {
      storeId: storeId,
      isDeleted: false,
      // For admin requests, show all products; for public, only published
      ...(isAdmin ? {} : { isPublished: true, isArchived: false }),
    }

    // Get filter parameters
    const colors = searchParams.get("colors")
    const materials = searchParams.get("materials")
    const styles = searchParams.get("styles")
    const genders = searchParams.get("genders")
    
    console.log("Requested filters:", { colors, materials, styles, genders })
    
    // Get all products with full data
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
    
    console.log(`Retrieved ${allProducts.length} published products before additional filtering`)
    
    // Filter products manually based on the query parameters
    let filteredProducts = [...allProducts]
    
    // Filter by colors if specified
    if (colors) {
      const colorsList = colors.toLowerCase().split(',')
      filteredProducts = filteredProducts.filter(product => {
        // Skip products without colorDetails
        if (!product.colorDetails) return false
        
        // Parse colorDetails if it's a string
        let colorData = product.colorDetails
        if (typeof colorData === 'string') {
          try {
            colorData = JSON.parse(colorData)
          } catch (e) {
            return false
          }
        }
        
        // Check if any color matches
        if (Array.isArray(colorData)) {
          return colorData.some(color => 
            color && color.name && colorsList.includes(color.name.toLowerCase())
          )
        }
        
        return false
      })
      
      console.log(`After color filtering: ${filteredProducts.length} products`)
    }
    
    // Filter by materials if specified
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
      
      console.log(`After material filtering: ${filteredProducts.length} products`)
    }
    
    // Filter by styles if specified
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
      
      console.log(`After style filtering: ${filteredProducts.length} products`)
    }
    
    // Filter by genders if specified
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
      
      console.log(`After gender filtering: ${filteredProducts.length} products`)
    }
    
    // Apply pagination
    const totalProducts = filteredProducts.length
    const paginatedProducts = filteredProducts.slice(skip, skip + limit)
    
    // Format the response with full product data
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

    // Calculate pagination info
    const totalPages = Math.ceil(totalProducts / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return NextResponse.json({
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
    console.error(`[PRODUCTS_GET] Error:`, err)
    return new NextResponse(`Internal error: ${err.message}`, { status: 500 })
  }
}