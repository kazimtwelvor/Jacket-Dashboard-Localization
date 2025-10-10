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
    const limit = Number.parseInt(searchParams.get("limit") || "10000")
    const skip = (page - 1) * limit
    const isAdmin = searchParams.get("admin") === "true"
    const colors = searchParams.get("colors")
    const materials = searchParams.get("materials")
    const styles = searchParams.get("styles")
    const genders = searchParams.get("genders")
    const collars = searchParams.get("collars")
    const closures = searchParams.get("closures")
    const cuffs = searchParams.get("cuffs")
    const pockets = searchParams.get("pockets")
    const search = searchParams.get("search")
    const trash = searchParams.get("trash") === "true"
    const status = searchParams.get("status")

    let baseWhereClause: any = {
      storeId: storeId,
      ...(trash ? { isDeleted: true } : { isDeleted: false }),
    }

    if (!trash && status) {
      switch (status.toLowerCase()) {
        case "published":
          baseWhereClause.isPublished = true
          baseWhereClause.isArchived = false
          break
        case "archived":
          baseWhereClause.isArchived = true
          break
        case "all":
          break
        default:
          if (!isAdmin) {
            baseWhereClause.isPublished = true
            baseWhereClause.isArchived = false
          }
      }
    } else if (!trash && !isAdmin) {
      baseWhereClause.isPublished = true
      baseWhereClause.isArchived = false
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
      orderBy: [
        {
          priority: { sort: "asc", nulls: "last" },
        },
        {
          viewCount: "desc", 
        },
        {
          isFeatured: "desc", 
        },
        // {
        //   createdAt: "desc", 
        // },
      ]
    })


    let filteredProducts = [...allProducts]

    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim()
      filteredProducts = filteredProducts.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(searchLower)
        const skuMatch = product.sku?.toLowerCase().includes(searchLower) || false
        // const descriptionMatch = product.description?.toLowerCase().includes(searchLower) || false

        const createdByNameMatch = product.createdByName?.toLowerCase().includes(searchLower) || false
        const updatedByNameMatch = product.updatedByName?.toLowerCase().includes(searchLower) || false

        // const priceMatch = product.price.toString().includes(searchLower)
        // const salePriceMatch = product.salePrice?.toString().includes(searchLower) || false

        // const stockStatusMatch = product.stockStatus?.toLowerCase().includes(searchLower) || false

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

        // let colorsMatch = false
        // if (product.colorDetails) {
        //   let colorData = product.colorDetails
        //   if (typeof colorData === 'string') {
        //     try {
        //       colorData = JSON.parse(colorData)
        //     } catch (e) {
        //     }
        //   }
        //   if (Array.isArray(colorData)) {
        //     colorsMatch = colorData.some(color =>
        //       color && typeof color === 'object' && color !== null && 'name' in color &&
        //       typeof color.name === 'string' && color.name.toLowerCase().includes(searchLower)
        //     )
        //   }
        // }

        // let sizesMatch = false
        // if (product.sizeDetails) {
        //   let sizeData = product.sizeDetails
        //   if (typeof sizeData === 'string') {
        //     try {
        //       sizeData = JSON.parse(sizeData)
        //     } catch (e) {
        //     }
        //   }
        //   if (Array.isArray(sizeData)) {
        //     sizesMatch = sizeData.some(size =>
        //       size && typeof size === 'object' && size !== null && 'name' in size &&
        //       typeof size.name === 'string' && size.name.toLowerCase().includes(searchLower)
        //     )
        //   }
        // }

        // const statusMatch =
        //   (product.isPublished && 'published'.includes(searchLower)) ||
        //   (product.isArchived && 'archived'.includes(searchLower)) ||
        //   (product.isFeatured && 'featured'.includes(searchLower))

        // const deletedAtMatch = trash && product.deletedAt ?
        //   new Date(product.deletedAt).toLocaleDateString('en-US', {
        //     year: 'numeric',
        //     month: 'long',
        //     day: 'numeric'
        //   }).toLowerCase().includes(searchLower) : false

        return (
          nameMatch ||
          skuMatch ||
          // descriptionMatch ||
          createdByNameMatch ||
          updatedByNameMatch ||
          // priceMatch ||
          // salePriceMatch ||
          // stockStatusMatch ||
          categoryMatch
          // colorsMatch ||
          // sizesMatch ||
          // statusMatch ||
          // deletedAtMatch
        )
      })
    }


    if (colors) {
      const colorsList = colors.toLowerCase().split(',')
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
          return typeof baseColorData.name === 'string' && colorsList.includes(baseColorData.name.toLowerCase())
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

    if (collars) {
      const collarsList = collars.toLowerCase().split(',')
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

        const productCollars = (specifications as any).collar
        if (!productCollars || !Array.isArray(productCollars)) return false

        return productCollars.some((collarValue: string) => 
          collarsList.includes(collarValue.toLowerCase())
        )
      })
    }

    if (closures) {
      const closuresList = closures.toLowerCase().split(',')
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

        const productClosures = (specifications as any).closure
        if (!productClosures || !Array.isArray(productClosures)) return false

        return productClosures.some((closureValue: string) => 
          closuresList.includes(closureValue.toLowerCase())
        )
      })
    }

    if (cuffs) {
      const cuffsList = cuffs.toLowerCase().split(',')
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

        const productCuffs = (specifications as any).cuffs
        if (!productCuffs || !Array.isArray(productCuffs)) return false

        return productCuffs.some((cuffValue: string) => 
          cuffsList.includes(cuffValue.toLowerCase())
        )
      })
    }

    if (pockets) {
      const pocketsList = pockets.toLowerCase().split(',')
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

        const productPockets = (specifications as any).pockets
        if (!productPockets || !Array.isArray(productPockets)) return false

        return productPockets.some((pocketValue: string) => 
          pocketsList.includes(pocketValue.toLowerCase())
        )
      })
    }

    const totalProducts = filteredProducts.length
    const paginatedProducts = filteredProducts.slice(skip, skip + limit)

    const serializedProducts = paginatedProducts.map(product => {
      let colorDetails = []
      if (product.colorDetails) {
        try {
          colorDetails = typeof product.colorDetails === 'string'
            ? JSON.parse(product.colorDetails)
            : product.colorDetails
        } catch (e) {
          colorDetails = []
        }
      }

      let baseColor = null
      if (product.baseColor) {
        try {
          baseColor = typeof product.baseColor === 'string'
            ? JSON.parse(product.baseColor)
            : product.baseColor
        } catch (e) {
          baseColor = null
        }
      }

      let combinedColorDetails = []

      if (baseColor && baseColor.id) {
        combinedColorDetails.push(baseColor)
      }

      if (Array.isArray(colorDetails)) {
        colorDetails.forEach(color => {
          if (color && color.id && (!baseColor || color.id !== baseColor.id)) {
            combinedColorDetails.push(color)
          }
        })
      }

      return {
        ...product,
        price: product.price.toString(),
        // originalPrice: product.originalPrice ? product.originalPrice.toString() : "0",
        salePrice: product.salePrice ? product.salePrice.toString() : null,
        baseColor: baseColor,
        colorDetails: combinedColorDetails,
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
      }
    })

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