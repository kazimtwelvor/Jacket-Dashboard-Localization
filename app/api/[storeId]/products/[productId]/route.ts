import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

// Function to sync color variations across related products (bidirectional)
async function syncColorVariations(currentProductId: string, storeId: string, specifications: any) {
  try {
    if (!specifications?.color || !Array.isArray(specifications.color) || specifications.color.length === 0) {
      return
    }

    const currentColors = specifications.color
    console.log(`Syncing color variations for product ${currentProductId} with colors:`, currentColors)

    // Find all products that share ANY color with current product
    const relatedProducts = await prismadb.product.findMany({
      where: {
        storeId: storeId,
        isDeleted: false,
        id: { not: currentProductId },
        OR: currentColors.map(color => ({
          specifications: {
            path: ['color'],
            array_contains: [color]
          }
        }))
      }
    })

    console.log(`Found ${relatedProducts.length} related products to sync`)

    // Collect all unique colors from current product and all related products
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
        existingColors.forEach(color => allUniqueColors.add(color))
      } catch (error) {
        console.error(`Error parsing specs for product ${relatedProduct.id}:`, error)
      }
    }

    const finalColorArray = Array.from(allUniqueColors)
    console.log(`All unique colors to sync:`, finalColorArray)

    // Update current product with all colors
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
      console.log(`Updated current product ${currentProductId} with all colors:`, finalColorArray)
    } catch (error) {
      console.error(`Error updating current product ${currentProductId}:`, error)
    }

    // Update all related products with all colors
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

        console.log(`Updated product ${relatedProduct.id} with all colors:`, finalColorArray)
      } catch (error) {
        console.error(`Error updating product ${relatedProduct.id}:`, error)
      }
    }
  } catch (error) {
    console.error('Error in syncColorVariations:', error)
  }
}

// Update the GET method to include image metadata
export async function GET(req: Request, { params }: { params: { productId: string } }) {
  try {
    const { productId } = params
    if (!productId) {
      return new NextResponse("Product id is required", { status: 400 })
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

    // Serialize Decimal fields
    if (product) {
      // Format the images to include the URL and metadata
      const formattedImages = product.images.map((productImage) => ({
        id: productImage.imageId,
        url: productImage.image.url,
        // Include image metadata
        altText: productImage.image.altText || "",
        title: productImage.image.title || "",
        caption: productImage.image.caption || "",
        description: productImage.image.description || "",
        excludeFromSitemap: productImage.image.excludeFromSitemap || false,
      }))

      // Parse JSON fields safely
      let sizeDetails = []
      let colorDetails = []
      let colorLinks = {}
      let specifications = {}
      // Handle schema data
      let schemaData = null

      if (product.schema) {
        try {
          schemaData = typeof product.schema === "string" ? JSON.parse(product.schema) : product.schema
          console.log("API GET - Parsed schema data:", schemaData)
        } catch (schemaError) {
          console.error("Error parsing schema data:", schemaError)
          schemaData = null
        }
      }

      try {
        if (product.sizeDetails) {
          sizeDetails = typeof product.sizeDetails === "string" ? JSON.parse(product.sizeDetails) : product.sizeDetails
          console.log("API GET - Parsed sizeDetails:", sizeDetails)
        }

        if (product.colorDetails) {
          colorDetails =
            typeof product.colorDetails === "string" ? JSON.parse(product.colorDetails) : product.colorDetails
          console.log("API GET - Parsed colorDetails:", colorDetails)
        }

        // CRITICAL FIX: Ensure colorLinks is properly extracted and parsed
        try {
          if (product.colorLinks) {
            // Log the raw value first
            console.log("API GET - Raw colorLinks type:", typeof product.colorLinks)
            console.log("API GET - Raw colorLinks value:", product.colorLinks)

            // If it's a string, try to parse it
            if (typeof product.colorLinks === "string") {
              try {
                // First, check if it's the problematic "[object Object]" string
                if (product.colorLinks === "[object Object]") {
                  console.log("API GET - Found '[object Object]' string, using empty object")
                  colorLinks = {}
                } else {
                  colorLinks = JSON.parse(product.colorLinks)
                  console.log("API GET - Parsed colorLinks from string:", colorLinks)
                }
              } catch (parseError) {
                console.error("Error parsing colorLinks string:", parseError)
                // Try parsing it again (handles double-stringified JSON)
                try {
                  colorLinks = JSON.parse(JSON.parse(product.colorLinks))
                  console.log("API GET - Parsed double-stringified colorLinks:", colorLinks)
                } catch (doubleParseError) {
                  console.error("Error parsing double-stringified colorLinks:", doubleParseError)
                  colorLinks = {}
                }
              }
            }
            // If it's already an object, use it directly
            else if (typeof product.colorLinks === "object" && product.colorLinks !== null) {
              colorLinks = product.colorLinks
              console.log("API GET - Using colorLinks object directly:", colorLinks)
            }
          } else {
            console.log("API GET - No colorLinks found in product")
            colorLinks = {}
          }
        } catch (error) {
          console.error("Error processing colorLinks:", error)
          colorLinks = {}
        }

        if (product.specifications) {
          specifications =
            typeof product.specifications === "string" ? JSON.parse(product.specifications) : product.specifications
        }
      } catch (error) {
        console.error("Error parsing JSON fields:", error)
      }

      const serializedProduct = {
        ...product,
        price: product.price.toString(),
        originalPrice: product.originalPrice.toString(),
        salePrice: product.salePrice ? product.salePrice.toString() : null,
        images: formattedImages,
        // Ensure sizeDetails and colorDetails are properly included
        sizeDetails: sizeDetails,
        colorDetails: colorDetails,
        // Ensure colorLinks is properly included
        colorLinks: colorLinks,
        // Ensure specifications is properly included
        specifications: specifications,
        // Include schema data
        schema: schemaData,
        // Properly handle keywords field
        keywords: Array.isArray(product.keywords)
          ? product.keywords
          : typeof product.keywords === "string"
            ? JSON.parse(product.keywords)
            : [],
        // Fetch complete related products data
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

      console.log("API GET - Returning product with images:", formattedImages)
      console.log("API GET - relatedProducts from DB:", product.relatedProducts)
      console.log("API GET - relatedProducts in response:", serializedProduct.relatedProducts)
      return NextResponse.json(serializedProduct)
    }

    return NextResponse.json(product)
  } catch (error) {
    console.log("[PRODUCT_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// Update the PATCH method to handle image metadata
export async function PATCH(req: Request, { params }: { params: { storeId: string; productId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    const { productId, storeId } = params

    const body = await req.json()

    const {
      name,
      price,
      categoryData,
      colorDetails, // Using colorDetails instead of colorIds
      sizeDetails, // Using sizeDetails instead of sizeIds
      images,
      isPublished,
      isArchived,
      isFeatured,
      status,
      // Basic fields
      sku,
      stockStatus,
      description,
      salePrice,
      originalPrice,
      isDiscounted,
      // Arrays and objects
      specifications,
      tags,
      gender,
      colorLinks,
      // SEO fields
      metaTitle,
      metaDescription,
      slug,
      keywords, // Use a single keywords array instead of focusKeyword and additionalKeywords
      noIndex,
      brandName,
      ratingValue,
      reviewCount,
      schema1, // Add schema field
      schema2,
      schema3,
      // Additional fields
      purchaseNote,
      // Product classification
      productType,
      // Virtual/downloadable
      isVirtual,
      isDownloadable,
      // Review fields
      tempReviewsId,
      cachedReviews,
      // Related products
      relatedProducts,
    } = body

    // Debug categoryData
    console.log("PATCH - categoryData received:", categoryData)
    console.log("PATCH - categoryData type:", typeof categoryData)

    // Extract the user information
    const user = await prismadb.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, name: true, email: true },
    })

    if (!productId) {
      return new NextResponse("Product id is required", { status: 400 })
    }

    // Validate required fields
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

    // Ensure arrays and objects are properly formatted
    const tagsArray = Array.isArray(tags) ? tags : []
    const keywordsArray = Array.isArray(keywords) ? keywords : [] // Handle keywords array

    // Process JSON fields
    const specificationsObject = typeof specifications === "object" ? specifications : {}

    // Process colorLinks with validation but preserve full URLs
    let colorLinksObject = {}
    try {
      console.log("Processing colorLinks in PATCH:", colorLinks)

      if (typeof colorLinks === "string") {
        try {
          colorLinksObject = JSON.parse(colorLinks)
          console.log("Parsed colorLinks from string:", colorLinksObject)
        } catch (parseError) {
          console.error("Error parsing colorLinks string:", parseError)
          // Try parsing it again (handles double-stringified JSON)
          try {
            colorLinksObject = JSON.parse(JSON.parse(colorLinks))
            console.log("Parsed double-stringified colorLinks:", colorLinksObject)
          } catch (doubleParseError) {
            console.error("Error parsing double-stringified colorLinks:", doubleParseError)
            colorLinksObject = {}
          }
        }
      } else if (typeof colorLinks === "object" && colorLinks !== null) {
        colorLinksObject = colorLinks
        console.log("Using colorLinks object directly:", colorLinksObject)
      }
    } catch (e) {
      console.log("Error processing colorLinks:", e)
      colorLinksObject = {}
    }

    // Ensure colorLinks is stored as a proper JSON string in the database
    const colorLinksForDb = typeof colorLinksObject === "object" ? JSON.stringify(colorLinksObject) : "{}"

    // Process schema data to ensure it's stored as a proper JSON string
    const schemaForDb = null

    // Before sending to the database, combine the schemas if they exist
    let schemaData = undefined
    if (body.schema) {
      schemaData = body.schema
    } else if (body.schema1 || body.schema2 || body.schema3) {
      // For backward compatibility, combine individual schemas
      const combinedSchema = {}

      try {
        if (body.schema1) {
          const parsed = typeof body.schema1 === "string" ? JSON.parse(body.schema1) : body.schema1
          const schemaType = parsed["@type"] || "Product"
          combinedSchema[schemaType] = parsed
        }

        if (body.schema2) {
          const parsed = typeof body.schema2 === "string" ? JSON.parse(body.schema2) : body.schema2
          const schemaType = parsed["@type"] || "FAQPage"
          combinedSchema[schemaType] = parsed
        }

        if (body.schema3) {
          const parsed = typeof body.schema3 === "string" ? JSON.parse(body.schema3) : body.schema3
          const schemaType = parsed["@type"] || "HowTo"
          combinedSchema[schemaType] = parsed
        }

        schemaData = Object.keys(combinedSchema).length > 0 ? JSON.stringify(combinedSchema) : undefined
      } catch (e) {
        console.error("Error combining schemas:", e)
      }
    }

    // Update the product with direct arrays
    const product = await prismadb.product.update({
      where: {
        id: productId,
      },
      data: {
        name,
        price,
        categoryData,
        colorDetails, // Use colorDetails directly
        sizeDetails, // Use sizeDetails directly
        isFeatured: isFeatured === true || isFeatured === "true",
        isArchived: isArchived === true || isArchived === "true",
        isPublished: isPublished === true || isPublished === "true",
        // Basic fields
        sku,
        stockStatus,
        description,
        salePrice,
        originalPrice,
        isDiscounted: isDiscounted === true || isDiscounted === "true",
        // Arrays
        tags: tagsArray,
        // JSON fields
        specifications: specificationsObject,
        colorLinks: colorLinksForDb, // Use the properly formatted colorLinks
        schema: schemaData,
        // Text fields
        gender,
        // SEO fields
        metaTitle,
        metaDescription,
        slug,
        keywords: keywordsArray, // Use the keywords array
        noIndex: noIndex === true || noIndex === "true",
        brandName,
        ratingValue,
        reviewCount,
        purchaseNote,
        // Product classification
        productType,
        // Virtual/downloadable
        isVirtual: isVirtual === true || isVirtual === "true",
        isDownloadable: isDownloadable === true || isDownloadable === "true",
        // Related products
        relatedProducts: Array.isArray(relatedProducts) ? relatedProducts : [],
        // Related products
        relatedProducts: Array.isArray(relatedProducts) ? relatedProducts : [],
        // Add updater information
        updatedById: user?.id || null,
        updatedByName: user?.name || "Unknown",
        updatedByEmail: user?.email || null,
      },
    })

    // Update images if provided
    if (images && images.length > 0) {
      // Delete existing product-image relationships
      await prismadb.productImage.deleteMany({
        where: {
          productId: productId,
        },
      })

      // Add new images and create relationships
      for (const image of images) {
        console.log("Processing image for update:", image)

        // Create or update the image with metadata
        let imageRecord

        // Check if the image already exists in the database
        const existingImage = await prismadb.image.findFirst({
          where: {
            url: image.url,
          },
        })

        if (existingImage) {
          // Update existing image with metadata
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
          console.log("Updated existing image:", imageRecord.id)
        } else {
          // Create new image with metadata
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
          console.log("Created new image:", imageRecord.id)
        }

        // Create the product-image relationship
        await prismadb.productImage.create({
          data: {
            productId: productId,
            imageId: imageRecord.id,
          },
        })
      }
    }

    // Handle cached reviews if they exist - Enhanced logic for editing products
    console.log('PATCH API - Full body keys:', Object.keys(body))
    console.log('PATCH API - Review data received:', { 
      tempReviewsId, 
      cachedReviews: cachedReviews ? 'present' : 'missing', 
      cachedReviewsLength: Array.isArray(cachedReviews) ? cachedReviews.length : 'not array',
      cachedReviewsType: typeof cachedReviews,
      cachedReviewsValue: cachedReviews
    })
    
    // Handle cached reviews if they exist - Same as POST route
    if (cachedReviews && Array.isArray(cachedReviews) && cachedReviews.length > 0) {
      try {
        console.log(`PATCH API - Attempting to save ${cachedReviews.length} cached reviews for product ${productId}`)
        // Save cached reviews to database
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
        console.log(`PATCH API - Successfully saved ${cachedReviews.length} cached reviews for updated product ${productId}`)
      } catch (reviewError) {
        console.error("PATCH API - Error saving cached reviews during update:", reviewError)
      }
    } else {
      console.log('PATCH API - No cached reviews to save or invalid format')
      console.log('PATCH API - cachedReviews check failed:', {
        exists: !!cachedReviews,
        isArray: Array.isArray(cachedReviews),
        hasLength: cachedReviews && Array.isArray(cachedReviews) ? cachedReviews.length > 0 : false
      })
    }

    // Fetch the updated product with reviews to return
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

    // Sync color variations with related products
    await syncColorVariations(productId, storeId, specificationsObject)

    // Serialize Decimal objects to strings before returning
    const serializedProduct = {
      ...updatedProductWithReviews,
      price: updatedProductWithReviews.price.toString(),
      originalPrice: updatedProductWithReviews.originalPrice.toString(),
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
    
    console.log(`PATCH API - Returning updated product with ${serializedProduct.reviews.length} reviews`)

    return NextResponse.json(serializedProduct)
  } catch (err) {
    console.log("[PRODUCT_PATCH]", err)
    return new NextResponse("Internal error", { status: 500 })
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

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Instead of hard deleting, mark as deleted
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
    console.log("[PRODUCT_DELETE]", err)
    return new NextResponse("Internal error", { status: 500 })
  }
}
