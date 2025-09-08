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
    


    const colors = searchParams.get("colors")
    const materials = searchParams.get("materials")
    const styles = searchParams.get("styles")
    const genders = searchParams.get("genders")
    const search = searchParams.get("search")
    const trash = searchParams.get("trash") === "true"
    
    const baseWhereClause = {
      storeId: storeId,
      ...(trash ? { isDeleted: true } : { isDeleted: false }),
      ...(isAdmin ? {} : { isPublished: true, isArchived: false }),
    }
    
    
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
    
    console.log(`Retrieved ${allProducts.length} products before additional filtering (trash: ${trash})`)
    
    let filteredProducts = [...allProducts]
    
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim()
      filteredProducts = filteredProducts.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(searchLower)
        const skuMatch = product.sku?.toLowerCase().includes(searchLower) || false
        const descriptionMatch = product.description?.toLowerCase().includes(searchLower) || false
        
        const createdByNameMatch = product.createdByName?.toLowerCase().includes(searchLower) || false
        const updatedByNameMatch = product.updatedByName?.toLowerCase().includes(searchLower) || false
        
        const priceMatch = product.price.toString().includes(searchLower)
        const salePriceMatch = product.salePrice?.toString().includes(searchLower) || false
        
        const stockStatusMatch = product.stockStatus?.toLowerCase().includes(searchLower) || false
        
        let categoryMatch = false
        if (product.categoryData) {
          let categoryData = product.categoryData
          if (typeof categoryData === 'string') {
            try {
              categoryData = JSON.parse(categoryData)
            } catch (e) {
            }
          }
          if (typeof categoryData === 'object' && categoryData !== null) {
            const material = (categoryData as any).material?.toString().toLowerCase() || ''
            const style = (categoryData as any).style?.toString().toLowerCase() || ''
            const gender = (categoryData as any).gender?.toString().toLowerCase() || ''
            categoryMatch = material.includes(searchLower) || style.includes(searchLower) || gender.includes(searchLower)
          }
        }
        
        let colorsMatch = false
        if (product.colorDetails) {
          let colorData = product.colorDetails
          if (typeof colorData === 'string') {
            try {
              colorData = JSON.parse(colorData)
            } catch (e) {
            }
          }
          if (Array.isArray(colorData)) {
            colorsMatch = colorData.some(color => 
              color && typeof color === 'object' && color !== null && 'name' in color && 
              typeof color.name === 'string' && color.name.toLowerCase().includes(searchLower)
            )
          }
        }
        
        let sizesMatch = false
        if (product.sizeDetails) {
          let sizeData = product.sizeDetails
          if (typeof sizeData === 'string') {
            try {
              sizeData = JSON.parse(sizeData)
            } catch (e) {
            }
          }
          if (Array.isArray(sizeData)) {
            sizesMatch = sizeData.some(size => 
              size && typeof size === 'object' && size !== null && 'name' in size && 
              typeof size.name === 'string' && size.name.toLowerCase().includes(searchLower)
            )
          }
        }
        
        const statusMatch = 
          (product.isPublished && 'published'.includes(searchLower)) ||
          (product.isArchived && 'archived'.includes(searchLower)) ||
          (product.isFeatured && 'featured'.includes(searchLower))
        
        const deletedAtMatch = trash && product.deletedAt ? 
          new Date(product.deletedAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }).toLowerCase().includes(searchLower) : false
        
        return (
          nameMatch ||
          skuMatch ||
          descriptionMatch ||
          createdByNameMatch ||
          updatedByNameMatch ||
          priceMatch ||
          salePriceMatch ||
          stockStatusMatch ||
          categoryMatch ||
          colorsMatch ||
          sizesMatch ||
          statusMatch ||
          deletedAtMatch
        )
      })
      
    }
    
    
    
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
            color && typeof color === 'object' && color !== null && 'name' in color && 
            typeof color.name === 'string' && colorsList.includes(color.name.toLowerCase())
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
        
        const productMaterial = (categoryData as any).material
        if (!productMaterial) return false
        
        return materialsList.includes(productMaterial.toString().toLowerCase())
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
        
        const productStyle = (categoryData as any).style
        if (!productStyle) return false
        
        return stylesList.includes(productStyle.toString().toLowerCase())
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
        
        const productGender = (categoryData as any).gender
        if (!productGender) return false
        
        return gendersList.includes(productGender.toString().toLowerCase())
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
    console.error(`[PRODUCTS_GET] Error:`, err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
    return new NextResponse(`Internal error: ${errorMessage}`, { status: 500, headers: corsHeaders })
  }
}