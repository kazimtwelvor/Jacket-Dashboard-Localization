import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"
import { checkApiPermission } from "@/lib/api-permissions"
import { Permission } from "@/types/permissions"

async function syncColorVariations(currentProductId: string, storeId: string, specifications: any) {
  try {
    if (!specifications?.color || !Array.isArray(specifications.color) || specifications.color.length === 0) {
      return
    }

    const currentColors = specifications.color

    const relatedProducts = await prismadb.product.findMany({
      where: {
        storeId: storeId,
        isDeleted: false,
        id: { not: currentProductId },
        OR: currentColors.map((color: string) => ({
          specifications: {
            path: ['color'],
            array_contains: [color]
          }
        }))
      }
    })


    const allUniqueColors = new Set(currentColors)
    
    for (const relatedProduct of relatedProducts) {
      try {
        let existingSpecs = {}
        if (relatedProduct.specifications) {
          existingSpecs = typeof relatedProduct.specifications === 'string' 
            ? JSON.parse(relatedProduct.specifications) 
            : relatedProduct.specifications
        }
        const existingColors = existingSpecs.color || []
        existingColors.forEach((color: string) => allUniqueColors.add(color))
      } catch (error) {
      }
    }

    const finalColorArray = Array.from(allUniqueColors)

    try {
      const currentSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications
      const updatedCurrentSpecs = {
        ...currentSpecs,
        color: finalColorArray
      }

      await prismadb.product.update({
        where: { id: currentProductId },
        data: {
          specifications: updatedCurrentSpecs
        }
      })
    } catch (error) {
    }

    for (const relatedProduct of relatedProducts) {
      try {
        let existingSpecs = {}
        if (relatedProduct.specifications) {
          existingSpecs = typeof relatedProduct.specifications === 'string' 
            ? JSON.parse(relatedProduct.specifications) 
            : relatedProduct.specifications
        }

        const updatedSpecs = {
          ...existingSpecs,
          color: finalColorArray
        }

        await prismadb.product.update({
          where: { id: relatedProduct.id },
          data: {
            specifications: updatedSpecs
          }
        })

      } catch (error) {
      }
    }
  } catch (error) {
  }
}

export async function GET(req: Request, { params }: { params: { storeId: string; productId: string } }) {
  try {
    const { storeId, productId } = params
    if (!productId) {
      return new NextResponse("Product id is required", { status: 400 })
    }

    const permissionCheck = await checkApiPermission(storeId, Permission.VIEW_PRODUCTS, 'GET')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to view products.", { status: 403 })
    }

    const product = await prismadb.product.findUnique({
      where: {
        id: productId,
        isDeleted: false,
      },
      include: {
        images: {
          include: {
            image: {
              select: {
                id: true,
                url: true,
                altText: true,
                title: true,
                caption: true,
                description: true,
                excludeFromSitemap: true,
              },
            },
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
    })

    if (product) {
      const formattedImages = product.images.map((productImage) => ({
        id: productImage.imageId,
        url: productImage.image.url,
        altText: productImage.image.altText || "",
        title: productImage.image.title || "",
        caption: productImage.image.caption || "",
        description: productImage.image.description || "",
        excludeFromSitemap: productImage.image.excludeFromSitemap || false,
      }))

      let sizeDetails = []
      let colorDetails = []
      let colorLinks = {}
      let specifications = {}
      let schemaData = null

      if (product.schema) {
        try {
          schemaData = typeof product.schema === "string" ? JSON.parse(product.schema) : product.schema
        } catch (schemaError) {
          schemaData = null
        }
      }

      try {
        if (product.sizeDetails) {
          sizeDetails = typeof product.sizeDetails === "string" ? JSON.parse(product.sizeDetails) : product.sizeDetails
        }

        if (product.colorDetails) {
          colorDetails =
            typeof product.colorDetails === "string" ? JSON.parse(product.colorDetails) : product.colorDetails
        }

        try {
          if (product.colorLinks) {

            if (typeof product.colorLinks === "string") {
              try {
                if (product.colorLinks === "[object Object]") {
                  colorLinks = {}
                } else {
                  colorLinks = JSON.parse(product.colorLinks)
                }
              } catch (parseError) {
                try {
                  colorLinks = JSON.parse(JSON.parse(product.colorLinks))
                } catch (doubleParseError) {
                  colorLinks = {}
                }
              }
            }
            else if (typeof product.colorLinks === "object" && product.colorLinks !== null) {
              colorLinks = product.colorLinks
            }
          } else {
            colorLinks = {}
          }
        } catch (error) {
          colorLinks = {}
        }

        if (product.specifications) {
          specifications =
            typeof product.specifications === "string" ? JSON.parse(product.specifications) : product.specifications
        }
      } catch (error) {
      }

      const serializedProduct = {
        ...product,
        price: product.price.toString(),
        // originalPrice: product.originalPrice.toString(),
        salePrice: product.salePrice ? product.salePrice.toString() : null,
        images: formattedImages,
        sizeDetails: sizeDetails,
        colorDetails: colorDetails,
        colorLinks: colorLinks,
        specifications: specifications,
        schema: schemaData,
        keywords: Array.isArray(product.keywords)
          ? product.keywords
          : typeof product.keywords === "string"
            ? JSON.parse(product.keywords)
            : [],
        relatedProducts: Array.isArray(product.relatedProducts) && product.relatedProducts.length > 0
          ? await Promise.all(
              product.relatedProducts.map(async (relatedId: string) => {
                const relatedProduct = await prismadb.product.findUnique({
                  where: { id: relatedId },
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                    images: {
                      take: 1,
                      include: {
                        image: {
                          select: { url: true }
                        }
                      }
                    }
                  }
                })
                return relatedProduct ? {
                  id: relatedProduct.id,
                  name: relatedProduct.name,
                  sku: relatedProduct.sku,
                  imageUrl: relatedProduct.images[0]?.image?.url || null
                } : null
              })
            ).then(results => results.filter(Boolean))
          : [],
        // Include reviews
        reviews: product.reviews.map((review) => ({
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

      return NextResponse.json(serializedProduct)
    }

    return NextResponse.json(product)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { storeId: string; productId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    const { productId, storeId } = params

    const permissionCheck = await checkApiPermission(storeId, Permission.EDIT_PRODUCTS, 'PATCH')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to edit products.", { status: 403 })
    }

    const body = await req.json()

    const {
      name,
      price,
      categoryData,
      colorDetails, 
      sizeDetails, 
      images,
      isPublished,
      isArchived,
      isFeatured,
      sku,
      stockStatus,
      description,
      salePrice,
      isDiscounted,
      specifications,
      tags,
      gender,
      colorLinks,
      metaTitle,
      metaDescription,
      slug,
      keywords, 
      brandName,
      cachedReviews,
      relatedProducts,
    } = body


    const user = await prismadb.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, name: true, email: true },
    })

    if (!productId) {
      return new NextResponse("Product id is required", { status: 400 })
    }

    if (!colorDetails || !Array.isArray(colorDetails) || colorDetails.length === 0) {
      return new NextResponse("At least one color is required", { status: 400 })
    }

    if (!sizeDetails || !Array.isArray(sizeDetails) || sizeDetails.length === 0) {
      return new NextResponse("At least one size is required", { status: 400 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const tagsArray = Array.isArray(tags) ? tags : []
    const keywordsArray = Array.isArray(keywords) ? keywords : [] // Handle keywords array

    // Safe JSON parsing helper
    const safeJsonParse = (value: any, fallback: any = {}) => {
      if (typeof value === "object" && value !== null) {
        return value
      }
      if (typeof value === "string") {
        if (value === "[object Object]") {
          return fallback
        }
        if (value.trim() === "") {
          return fallback
        }
        try {
          return JSON.parse(value)
        } catch (error) {
          return fallback
        }
      }
      return fallback
    }

    const specificationsObject = safeJsonParse(specifications, {})

    let colorLinksObject = {}
    try {
      if (typeof colorLinks === "string") {
        if (colorLinks === "[object Object]") {
          colorLinksObject = {}
        } else {
          try {
            colorLinksObject = JSON.parse(colorLinks)
          } catch (parseError) {
            try {
              colorLinksObject = JSON.parse(JSON.parse(colorLinks))
            } catch (doubleParseError) {
              colorLinksObject = {}
            }
          }
        }
      } else if (typeof colorLinks === "object" && colorLinks !== null) {
        colorLinksObject = colorLinks
      }
    } catch (e) {
      colorLinksObject = {}
    }

    const colorLinksForDb = typeof colorLinksObject === "object" ? JSON.stringify(colorLinksObject) : "{}"


      let schemaData = undefined
    if (body.schema) {
      schemaData = body.schema
    } else if (body.schema1 || body.schema2 || body.schema3) {
      const combinedSchema = {}

      try {
        if (body.schema1 && body.schema1 !== "[object Object]") {
          const parsed = safeJsonParse(body.schema1, null)
          if (parsed) {
            const schemaType = parsed["@type"] || "Product"
            combinedSchema[schemaType] = parsed
          }
        }

        if (body.schema2 && body.schema2 !== "[object Object]") {
          const parsed = safeJsonParse(body.schema2, null)
          if (parsed) {
            const schemaType = parsed["@type"] || "FAQPage"
            combinedSchema[schemaType] = parsed
          }
        }

        if (body.schema3 && body.schema3 !== "[object Object]") {
          const parsed = safeJsonParse(body.schema3, null)
          if (parsed) {
            const schemaType = parsed["@type"] || "HowTo"
            combinedSchema[schemaType] = parsed
          }
        }

        schemaData = Object.keys(combinedSchema).length > 0 ? JSON.stringify(combinedSchema) : undefined
      } catch (e) {
      }
    }

   
    try {
      const product = await prismadb.product.update({
        where: {
          id: productId,
        },
        data: {
          name,
          price,
          categoryData,
          colorDetails, 
          sizeDetails, 
          isFeatured: isFeatured === true || isFeatured === "true",
          isArchived: isArchived === true || isArchived === "true",
          isPublished: isPublished === true || isPublished === "true",
          sku,
          stockStatus,
          description,
          salePrice,
          isDiscounted: isDiscounted === true || isDiscounted === "true",
          tags: tagsArray,
          specifications: specificationsObject,
          colorLinks: colorLinksForDb, 
          schema: schemaData,
          gender,
          metaTitle,
          metaDescription,
          slug,
          keywords: keywordsArray,
          brandName,
          relatedProducts: Array.isArray(relatedProducts) ? relatedProducts : [],
          updatedById: user?.id || null,
          updatedByName: user?.name || "Unknown",
          updatedByEmail: user?.email || null,
        },
      })
    } catch (dbError) {
      throw new Error(`Database update failed: ${dbError instanceof Error ? dbError.message : "Unknown database error"}`)
    }

    if (images && images.length > 0) {
      await prismadb.productImage.deleteMany({
        where: {
          productId: productId,
        },
      })

      for (const image of images) {

        let imageRecord

        const existingImage = await prismadb.image.findFirst({
          where: {
            url: image.url,
          },
        })

        if (existingImage) {
          imageRecord = await prismadb.image.update({
            where: {
              id: existingImage.id,
            },
            data: {
              url: image.url,
              altText: image.altText || null,
              title: image.title || null,
              caption: image.caption || null,
              description: image.description || null,
              excludeFromSitemap: image.excludeFromSitemap || false,
            },
          })
        } else {
          imageRecord = await prismadb.image.create({
            data: {
              url: image.url,
              altText: image.altText || null,
              title: image.title || null,
              caption: image.caption || null,
              description: image.description || null,
              excludeFromSitemap: image.excludeFromSitemap || false,
            },
          })
        }

        await prismadb.productImage.create({
          data: {
            productId: productId,
            imageId: imageRecord.id,
          },
        })
      }
    }


    
    if (cachedReviews && Array.isArray(cachedReviews) && cachedReviews.length > 0) {
      try {
        for (const review of cachedReviews) {
          await prismadb.review.create({
            data: {
              storeId: storeId,
              productId: productId,
              userId: `ai-generated-${Date.now()}-${Math.random()}`,
              userName: review.customerName || review.userName || 'Anonymous',
              rating: review.rating,
              comment: review.text || review.comment,
              title: review.title || null,
              isApproved: false,
              createdAt: new Date(review.date || new Date()),
            },
          })
        }
      } catch (reviewError) {
      }
    } else {

    }

    const updatedProductWithReviews = await prismadb.product.findUnique({
      where: { id: productId },
      include: {
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
        },
      },
    })
    
    if (!updatedProductWithReviews) {
      return new NextResponse("Product not found after update", { status: 404 })
    }

    await syncColorVariations(productId, storeId, specificationsObject)

    const serializedProduct = {
      ...updatedProductWithReviews,
      price: updatedProductWithReviews.price.toString(),
      salePrice: updatedProductWithReviews.salePrice ? updatedProductWithReviews.salePrice.toString() : null,
      reviews: updatedProductWithReviews.reviews.map((review) => ({
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
    

    return NextResponse.json(serializedProduct)
  } catch (err) {
    
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
    
    return new NextResponse(`Internal error: ${errorMessage}`, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { productId: string; storeId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!params.productId) {
      return new NextResponse("Product ID is required", { status: 400 })
    }

    const permissionCheck = await checkApiPermission(params.storeId, Permission.DELETE_PRODUCTS, 'DELETE')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to delete products.", { status: 403 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const product = await prismadb.product.update({
      where: {
        id: params.productId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    })

    return NextResponse.json(product)
  } catch (err) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
