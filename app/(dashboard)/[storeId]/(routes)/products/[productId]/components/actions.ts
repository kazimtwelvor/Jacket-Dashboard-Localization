"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import prismadb from "@/lib/prismadb"

interface Size {
  id: string
  name: string
  value: string
}

interface Color {
  id: string
  name: string
  value: string
}

const sanitizeSlug = (slugStr: string | null | undefined): string => {
  if (!slugStr || typeof slugStr !== 'string') return "";
  return slugStr
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const generateSlugFromNameIfEmpty = (slugVal: string, nameVal: string | null | undefined): string => {
  if (slugVal && slugVal.trim() !== "") {
    return slugVal;
  }
  if (!nameVal || typeof nameVal !== 'string') return "";
  return sanitizeSlug(nameVal);
};


async function generateUniqueSku(storeId: string, manualSku: string | null): Promise<string> {
  try {
    if (manualSku && manualSku.trim() !== "") {
      const existingProduct = await prismadb.product.findFirst({
        where: {
          storeId,
          sku: manualSku,
        },
      })

      if (!existingProduct) {
        return manualSku
      }

      let counter = 1
      let uniqueSku = `${manualSku}-${counter}`

      while (true) {
        const existingWithSuffix = await prismadb.product.findFirst({
          where: {
            storeId,
            sku: uniqueSku,
          },
        })

        if (!existingWithSuffix) {
          return uniqueSku
        }

        counter++
        uniqueSku = `${manualSku}-${counter}`
      }
    }

    const store = await prismadb.store.findUnique({
      where: { id: storeId },
      select: { skuPrefix: true },
    })

    const prefix = store?.skuPrefix || "SKU"

    const products = await prismadb.product.findMany({
      where: {
        storeId,
        sku: {
          startsWith: `${prefix}-`,
        },
      },
      select: {
        sku: true,
      },
    })

    let highestNumber = 0
    const regex = new RegExp(`^${prefix}-0*(\\d+)$`)

    products.forEach((product) => {
      const match = product.sku.match(regex)
      if (match && match[1]) {
        const num = Number.parseInt(match[1], 10)
        if (num > highestNumber) {
          highestNumber = num
        }
      }
    })

    const nextNumber = highestNumber + 1
    const paddedNumber = nextNumber.toString().padStart(4, "0")
    const newSku = `${prefix}-${paddedNumber}`

    return newSku
  } catch (error) {
    const timestamp = Date.now().toString().slice(-8)
    return `SKU-${timestamp}`
  }
}



function safeJsonParse(value: string | null | undefined, fallback: any = null) {
  if (!value || typeof value !== "string") {
    return fallback
  }

  if (value.trim() === "[object Object]") {
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

export async function createProduct(formData: FormData) {
  try {

    for (const [key, value] of Array.from(formData.entries())) {
      if (typeof value === "string") {
        if (value === "[object Object]") {
        } else if (value.length > 100) {
        } else {
        }
      } else {
      }
    }

    const formDataKeys = Array.from(formData.keys())

    let storeId = formData.get("storeId") as string

    if (!storeId) {
      const urlPath = formData.get("url") as string

      if (urlPath) {
        const urlParts = urlPath.split("/")
        const potentialStoreId = urlParts.find(
          (part, index) => index === 1 && part && !["products", "settings", "api", "categories", "sizes", "colors", "billboards", "orders"].includes(part)
        );


        if (potentialStoreId) {
          storeId = potentialStoreId;
          formData.set("storeId", potentialStoreId)
        }
      }

      if (!formData.get("storeId")) {
        throw new Error("Store ID is required and could not be determined")
      }
    }
    storeId = formData.get("storeId") as string;


    const { userId } = await auth()

    if (!userId) {
      throw new Error("Unauthenticated")
    }

    const id = formData.get("id") as string | null
    const tempReviewsId = formData.get("tempReviewsId") as string | null
    const cachedReviewsJson = formData.get("cachedReviews") as string | null

    if (!storeId) {
      throw new Error("Store ID is required")
    }

    const submitType = formData.get("submitType") as string
    const name = formData.get("name") as string
    const description = formData.get("description") as string

    const submittedSlug = formData.get("slug") as string;
    let productSlugForDb = sanitizeSlug(submittedSlug);
    productSlugForDb = generateSlugFromNameIfEmpty(productSlugForDb, name);


    const regularPriceStr = formData.get("regularPrice") as string
    const price = regularPriceStr ? Number.parseFloat(regularPriceStr) : 0

    const salePriceStr = formData.get("salePrice") as string
    const salePrice = salePriceStr && salePriceStr.trim() !== "" ? Number.parseFloat(salePriceStr) : 0
    const manualSku = formData.get("sku") as string
    const stockStatus = formData.get("stockStatus") as string
    const isArchived = submitType === "draft"
    const specifications = formData.get("specifications") as string

    const materialJson = formData.get("material") as string
    const styleJson = formData.get("style") as string
    const gender = formData.get("gender") as string

    const tagsJson = formData.get("tags") as string

    const relatedProductsJson = formData.get("relatedProducts") as string
    
    const countryIdsJson = formData.get("countryIds") as string

    const isFeaturedValue = formData.get("isFeatured")
    const isFeatured = isFeaturedValue === "true" || String(isFeaturedValue) === "true"

    const isParentProductValue = formData.get("isParentProduct")
    const isParentProduct = isParentProductValue === "true" || String(isParentProductValue) === "true"

    const parentProductId = formData.get("parentProductId") as string || null
    const baseColorJson = formData.get("baseColor") as string || ""
    const baseColor = baseColorJson && baseColorJson.trim() !== "" ? JSON.parse(baseColorJson) : null


    const imagesJson = formData.get("images") as string

    let tags = []
    try {
      if (tagsJson && tagsJson.trim() !== "") {
        const parsedTags = safeJsonParse(tagsJson, [])
        if (Array.isArray(parsedTags)) {
          tags = parsedTags
        } else {
        }
      }
    } catch (e) {
      tags = []
    }

    let relatedProducts = []
    try {
      if (relatedProductsJson && relatedProductsJson.trim() !== "") {
        const parsedRelatedProducts = safeJsonParse(relatedProductsJson, [])
        if (Array.isArray(parsedRelatedProducts)) {
          relatedProducts = parsedRelatedProducts
        } else {
        }
      }
    } catch (e) {
      relatedProducts = []
    }

    let countryIds: string[] = []
    try {
      if (countryIdsJson && countryIdsJson.trim() !== "") {
        const parsedCountryIds = safeJsonParse(countryIdsJson, [])
        if (Array.isArray(parsedCountryIds)) {
          countryIds = parsedCountryIds.filter((id: any) => typeof id === 'string' && id.trim() !== '')
        }
      }
      console.log('[CREATE_PRODUCT] Country IDs:', { raw: countryIdsJson, parsed: countryIds })
    } catch (e) {
      console.error('[CREATE_PRODUCT] Error parsing countryIds:', e)
      countryIds = []
    }

    const materialParsed = safeJsonParse(materialJson, [])
    const styleParsed = safeJsonParse(styleJson, [])
    const images = safeJsonParse(imagesJson, [])
    const seoJson = formData.get("seo") as string
    let seoData = {
      metaTitle: "",
      metaDescription: "",
      slug: "",
      keywords: [],
      isPillarContent: false,
      // noIndex: false,
      seoScore: 0,
      canonicalUrl: "",
    }

    try {
      if (seoJson) {
        const parsedSeo = safeJsonParse(seoJson, {})
        seoData = {
          metaTitle: parsedSeo.metaTitle || name || "",
          metaDescription: parsedSeo.metaDescription || "",
          slug: parsedSeo.slug ? sanitizeSlug(parsedSeo.slug) : productSlugForDb,
          keywords: Array.isArray(parsedSeo.keywords) ? parsedSeo.keywords : [],
          isPillarContent: !!parsedSeo.isPillarContent,
          // noIndex: !!parsedSeo.noIndex,
          seoScore: parsedSeo.seoScore || 0,
          canonicalUrl: parsedSeo.canonicalUrl || "",
        }
      } else {

        seoData.slug = productSlugForDb;
      }
    } catch (e) {

      seoData.slug = productSlugForDb;
    }


    if (!seoData.slug) {
      seoData.slug = productSlugForDb;
    }


    const { metaTitle, metaDescription, keywords, } = seoData


    const brandName = (formData.get("brandName") as string) || "Leather Jacket By Fineyst"
    // const ratingValue = (formData.get("ratingValue") as string) || "4.5"
    // const reviewCount = (formData.get("reviewCount") as string) || "0"



    // const purchaseNote = formData.get("purchaseNote") as string
    const categoryData = formData.get("categoryData") as string | null

    let colorDetails = null
    const colorDetailsJson = formData.get("colorDetails") as string | null
    const colorIdsJson = formData.get("colorIds") as string | null


    const colorLinksJson = formData.get("colorLinks") as string


    const schema1Json = formData.get("schema1") as string
    const schema2Json = formData.get("schema2") as string
    const schema3Json = formData.get("schema3") as string
    const schemaJson = formData.get("schema") as string

    let combinedSchema: any = {}

    if (schemaJson && schemaJson.trim() !== "") {
      try {
        combinedSchema = safeJsonParse(schemaJson, {})
      } catch (e) {
        combinedSchema = {}
      }
    }

    try {
      if (schema1Json && schema1Json.trim() !== "" && schema1Json.trim() !== "[object Object]") {
        const parsedSchema1 = safeJsonParse(schema1Json, null)
        if (parsedSchema1) {
          const schemaType = parsedSchema1.templateName || parsedSchema1["@type"] || "Product"
          combinedSchema[schemaType] = parsedSchema1
        }
      }
    } catch (e) {
    }

    try {
      if (schema2Json && schema2Json.trim() !== "" && schema2Json.trim() !== "[object Object]") {
        const parsedSchema2 = safeJsonParse(schema2Json, null)
        if (parsedSchema2) {
          const schemaType = parsedSchema2.templateName || parsedSchema2["@type"] || "FAQPage"
          combinedSchema[schemaType] = parsedSchema2
        }
      }
    } catch (e) {
    }

    try {
      if (schema3Json && schema3Json.trim() !== "" && schema3Json.trim() !== "[object Object]") {
        const parsedSchema3 = safeJsonParse(schema3Json, null)
        if (parsedSchema3) {
          const schemaType = parsedSchema3.templateName || parsedSchema3["@type"] || "HowTo"
          combinedSchema[schemaType] = parsedSchema3
        }
      }
    } catch (e) {
    }

    if (Object.keys(combinedSchema).length === 0) {
      combinedSchema = {
        Product: {
          "@context": "https://schema.org",
          "@type": "Product",
          name: name || "Product",
          description: description || "",
          image: images && images.length > 0 ? (typeof images[0] === "string" ? images[0] : (images[0] as any).url || "") : "",
          offers: {
            "@type": "Offer",
            price: price || 0,
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
        },
      }
    }

    const schemaDataString = JSON.stringify(combinedSchema)


    let colorLinksData = {}
    let colorLinksString = "{}"

    try {
      if (colorLinksJson) {

        if (
          typeof colorLinksJson === "string" &&
          colorLinksJson.trim() !== "[object Object]" &&
          colorLinksJson.trim().startsWith("{") &&
          colorLinksJson.trim().endsWith("}")
        ) {
          try {
            const parsedData = safeJsonParse(colorLinksJson, {})

            if (typeof parsedData === "object" && parsedData !== null) {
              colorLinksData = parsedData
              colorLinksString = colorLinksJson
            } else {
              colorLinksData = {}
            }
          } catch (parseError) {
            colorLinksData = {}
          }
        } else {
          colorLinksData = {}
        }
      }
    } catch (e) {
      colorLinksData = {}
    }

    let colorLinksToSave = colorLinksData


    if (colorDetailsJson) {
      try {
        colorDetails = safeJsonParse(colorDetailsJson, null)
      } catch (e) {
      }
    }

    if (!colorDetails && colorIdsJson) {
      try {
        const colorIds = safeJsonParse(colorIdsJson, [])
        if (Array.isArray(colorIds) && colorIds.length > 0) {
          const colorsFromDb = await prismadb.color.findMany({
            where: {
              id: {
                in: colorIds,
              },
            },
          })

          colorDetails = colorsFromDb.map((color) => ({
            id: color.id,
            name: color.name,
            value: color.value,
          }))

        }
      } catch (e) {
      }
    }

    const sizesJson = formData.get("sizes") as string
    let sizeIds: string[] = []

    const sizeDetailsJson = formData.get("sizeDetails") as string | null
    let sizeDetailsData = null

    try {
      if (sizeDetailsJson) {
        sizeDetailsData = safeJsonParse(sizeDetailsJson, null)
        if (Array.isArray(sizeDetailsData)) {
          sizeIds = sizeDetailsData.map(sd => sd.id).filter(Boolean);
        }
      } else {
        const sizesJsonFallback = formData.get("sizes") as string
        if (sizesJsonFallback) {
          const parsedSizeIds = safeJsonParse(sizesJsonFallback, [])

          if (Array.isArray(parsedSizeIds) && parsedSizeIds.length > 0) {
            sizeIds = parsedSizeIds;
            const sizesFromDb = await prismadb.size.findMany({
              where: {
                id: {
                  in: parsedSizeIds,
                },
              },
            })

            sizeDetailsData = sizesFromDb.map((size) => ({
              id: size.id,
              name: size.name,
              value: size.value,
            }))

          }
        }
      }
    } catch (e) {
      sizeDetailsData = []
    }




    const dbUser = await prismadb.user.findUnique({
      where: {
        clerkId: userId,
      },
    })

    if (!dbUser) {
      throw new Error("User not found")
    }

    const categoryDataObject = {
      material: Array.isArray(materialParsed) && materialParsed.length > 0 ? materialParsed[0] : null,
      style: Array.isArray(styleParsed) && styleParsed.length > 0 ? styleParsed[0] : null,
      gender: gender || null
    }

    let cleanSpecifications = specifications
    if (specifications === "[object Object]") {
      cleanSpecifications = JSON.stringify({
        externalMaterial: [],
        internalMaterial: [],
        collar: [],
        closure: [],
        cuffs: [],
        pockets: [],
        color: [],
      })
    }

    const productData = {
      name,
      description,
      price: isNaN(price) ? 0 : price,
      salePrice: isNaN(salePrice) ? 0 : salePrice,
      stockStatus,
      isArchived,
      isPublished: !isArchived,
      specifications: cleanSpecifications,
      gender,
      categoryData: categoryDataObject,
      tags: Array.isArray(tags) ? tags : [],
      relatedProducts: Array.isArray(relatedProducts) ? relatedProducts : [],
      metaTitle: seoData.metaTitle,
      metaDescription: seoData.metaDescription,
      slug: productSlugForDb,
      keywords: Array.isArray(seoData.keywords) ? seoData.keywords : [],
      brandName: brandName || "Leather Jacket By Fineyst",
      isFeatured,
      isParentProduct,
      parentProductId,
      baseColor,
      colorDetails,
      sizeDetails: sizeDetailsData || [],
      colorLinks: colorLinksToSave,
      schema: schemaDataString,
      priority: 4,
      createdById: dbUser.id,
      createdByName: dbUser.name || "Unknown",
      createdByEmail: dbUser.email,
    }





    const selectedColors = colorDetails && Array.isArray(colorDetails) ? colorDetails : []

    if (!selectedColors || selectedColors.length === 0) {
      throw new Error("At least one color must be selected before saving the product")
    }

    let cachedReviews = null
    if (cachedReviewsJson) {
      try {
        cachedReviews = safeJsonParse(cachedReviewsJson, null)
      } catch (e) {
        cachedReviews = null
      }
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      const storeUser = await prismadb.storeUser.findFirst({
        where: {
          storeId: storeId,
          userId: dbUser.id,
        },
      })

      if (!storeUser || !storeUser.role || !["ADMIN", "MANAGER", "EDITOR"].includes(storeUser.role)) {
        throw new Error("Unauthorized: Store not found or you don't have permission")
      }
    }

    if (id) {

      try {
        const currentProduct = await prismadb.product.findUnique({
          where: { id },
          select: {
            sku: true,
            createdById: true,
            createdByName: true,
            createdByEmail: true,
            categoryData: true,
            priority: true,
          },
        })

        let newSkuForUpdate = currentProduct?.sku;

        if (manualSku && manualSku.trim() !== "" && currentProduct && manualSku !== currentProduct.sku) {
          newSkuForUpdate = await generateUniqueSku(storeId, manualSku)
        } else if (!currentProduct?.sku && manualSku && manualSku.trim() !== "") {
          newSkuForUpdate = await generateUniqueSku(storeId, manualSku);
        } else if (!currentProduct?.sku && (!manualSku || manualSku.trim() === "")) {
          newSkuForUpdate = await generateUniqueSku(storeId, null);
        }


        const { createdById, createdByName, createdByEmail, priority, ...dataWithoutCreator } = productData

        const priorityToUse = currentProduct?.priority !== null && currentProduct?.priority !== undefined
          ? currentProduct.priority
          : (priority || 4)

        console.log('[UPDATE_PRODUCT] Updating product with countryIds:', countryIds)
        
        // Delete existing country relations
        await prismadb.productCountry.deleteMany({
          where: { productId: id }
        })

        try {
          const product = await prismadb.product.update({
            where: {
              id,
            },
            data: {
              ...dataWithoutCreator,
              priority: priorityToUse,
              sku: newSkuForUpdate,
              categoryData: productData.categoryData,
              updatedById: dbUser.id,
              updatedByName: dbUser.name || "Unknown",
              updatedByEmail: dbUser.email,
              ...(countryIds.length > 0 && {
                productCountries: {
                  create: countryIds.map((countryId) => ({
                    countryId
                  }))
                }
              })
            },
          })
        } catch (dbError) {
          throw new Error(`Database update failed: ${dbError instanceof Error ? dbError.message : "Unknown database error"}`)
        }

        await prismadb.productImage.deleteMany({
          where: {
            productId: id,
          },
        });

        if (cachedReviews && Array.isArray(cachedReviews) && cachedReviews.length > 0) {
          try {

            for (let i = 0; i < cachedReviews.length; i++) {
              const review = cachedReviews[i]

              const reviewData = {
                storeId: storeId,
                productId: id,
                userId: `ai-generated-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
                userName: review.customerName || review.userName || 'Anonymous Customer',
                rating: Math.max(1, Math.min(5, Number(review.rating) || 5)),
                comment: review.text || review.comment || 'Great product!',
                title: review.title || null,
                isApproved: false,
                createdAt: review.date ? new Date(review.date) : new Date(),
              }


              const savedReview = await prismadb.review.create({
                data: reviewData,
              })

            }
          } catch (reviewError) {
          }
        } else {
        }

        for (const image of images) {
          let imageUrl = ""
          let imageMetadata = {}

          if (typeof image === "string") {
            imageUrl = image
          } else if (typeof image === "object" && image !== null && (image as any).url) {
            imageUrl = (image as any).url
            imageMetadata = {
              altText: (image as any).altText || null,
              title: (image as any).title || null,
              caption: (image as any).caption || null,
              description: (image as any).description || null,
              excludeFromSitemap: (image as any).excludeFromSitemap || false,
            }
          } else {
            continue;
          }

          if (!imageUrl) {
            continue;
          }

          let dbImage = await prismadb.image.findFirst({ where: { url: imageUrl } });
          if (dbImage) {
            dbImage = await prismadb.image.update({ where: { id: dbImage.id }, data: { ...imageMetadata } });
          } else {
            dbImage = await prismadb.image.create({ data: { url: imageUrl, ...imageMetadata } });
          }

          await prismadb.productImage.create({
            data: {
              productId: id,
              imageId: dbImage.id,
            },
          })
        }
      } catch (error) {
        throw error
      }
    } else {

      try {
        const uniqueSku = await generateUniqueSku(storeId, manualSku)

        const resolvedCategoryData = productData.categoryData;


        console.log('[CREATE_PRODUCT] Creating product with countryIds:', countryIds)
        
        const product = await prismadb.product.create({
          data: {
            ...productData,
            sku: uniqueSku,
            storeId: storeId,
            categoryData: resolvedCategoryData,
            ...(countryIds.length > 0 && {
              productCountries: {
                create: countryIds.map((countryId) => ({
                  countryId
                }))
              }
            })
          },
        })
        
        console.log('[CREATE_PRODUCT] Product created with ID:', product.id)


        for (const image of images) {
          let imageUrl = ""
          let imageMetadata = {}

          if (typeof image === "string") {
            imageUrl = image
          } else if (typeof image === "object" && image !== null && (image as any).url) {
            imageUrl = (image as any).url
            imageMetadata = {
              altText: (image as any).altText || null,
              title: (image as any).title || null,
              caption: (image as any).caption || null,
              description: (image as any).description || null,
              excludeFromSitemap: (image as any).excludeFromSitemap || false,
            }
          } else {
            continue;
          }

          if (!imageUrl) {
            continue;
          }

          // Find or create the image
          let dbImage = await prismadb.image.findFirst({ where: { url: imageUrl } }); // Changed from findUnique
          if (!dbImage) {
            dbImage = await prismadb.image.create({ data: { url: imageUrl, ...imageMetadata } });
          } else {
            // Optionally update metadata if it changed (though for new product, this image might be new to this product)
            dbImage = await prismadb.image.update({ where: { id: dbImage.id }, data: { ...imageMetadata } });
          }

          // Then create the product-image relationship
          await prismadb.productImage.create({
            data: {
              productId: product.id,
              imageId: dbImage.id,
            },
          })
        }


        // Handle cached reviews for new products
        if (cachedReviews && Array.isArray(cachedReviews) && cachedReviews.length > 0) {
          try {

            for (let i = 0; i < cachedReviews.length; i++) {
              const review = cachedReviews[i]

              const reviewData = {
                storeId: storeId,
                productId: product.id,
                userId: `ai-generated-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
                userName: review.customerName || review.userName || 'Anonymous Customer',
                rating: Math.max(1, Math.min(5, Number(review.rating) || 5)),
                comment: review.text || review.comment || 'Great product!',
                title: review.title || null,
                isApproved: false,
                createdAt: review.date ? new Date(review.date) : new Date(),
              }


              const savedReview = await prismadb.review.create({
                data: reviewData,
              })

            }
          } catch (reviewError) {
          }
        } else {
        }

        // Handle temporary reviews for new products (legacy support)
        if (tempReviewsId) {
          try {

            // Update all temporary reviews to use the actual product ID
            const updatedReviews = await prismadb.review.updateMany({
              where: {
                productId: tempReviewsId,
                storeId: storeId,
              },
              data: {
                productId: product.id,
              },
            })

          } catch (reviewError) {
            // Don't fail the entire product creation if review moving fails
          }
        }
      } catch (error) {
        throw error
      }
    }

    revalidatePath(`/${storeId}/products`)

    // Log before returning
    return { success: true }
  } catch (error) {

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    // Return a JSON error response instead of throwing, or ensure the client can handle thrown errors from server actions.
    // For now, re-throwing to match existing pattern, but this might need adjustment based on client-side error handling.
    throw new Error(`Failed to save product: ${errorMessage}`)
  }
}

// Function to format markdown to HTML
function formatMarkdownToHTML(markdown: string): string {
  // Replace bold text
  let formatted = markdown.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

  // Replace italic text
  formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>")

  // Replace headers
  formatted = formatted.replace(/^### (.*?)$/gm, "<h3>$1</h3>")
  formatted = formatted.replace(/^## (.*?)$/gm, "<h2>$2</h2>")
  formatted = formatted.replace(/^# (.*?)$/gm, "<h1>$1</h1>")

  // Replace bullet points
  formatted = formatted.replace(/^\* (.*?)$/gm, "<li>$1</li>")

  // Wrap bullet points in ul tags
  if (formatted.includes("<li>")) {
    formatted = formatted.replace(/(<li>.*?<\/li>)+/g, "<ul>$&</ul>")
  }

  // Replace line breaks with <br> tags
  formatted = formatted.replace(/\n\n/g, "<br><br>")

  return formatted
}

// Function to clean markdown for plain text display
function cleanMarkdownForPlainText(markdown: string): string {
  // Replace headers with plain text + line breaks
  let cleaned = markdown.replace(/^### (.*?)$/gm, "$1\n")
  cleaned = cleaned.replace(/^## (.*?)$/gm, "$1\n")
  cleaned = cleaned.replace(/^# (.*?)$/gm, "$1\n")

  // Replace bold and italic markers
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, "$1")
  cleaned = cleaned.replace(/\*(.*?)\*/g, "$1")

  // Format bullet points
  cleaned = cleaned.replace(/^\* (.*?)$/gm, "• $1")

  // Add spacing for readability
  cleaned = cleaned.replace(/\n\n/g, "\n\n")

  // Add section breaks for "Key Features" and similar sections
  cleaned = cleaned.replace(/^(Key Features:|Benefits:|Specifications:)/gm, "\n\n$1\n")

  return cleaned
}

export async function generateDescription(productInfo: {
  name: string
  specifications: {
    externalMaterial: string[]
    internalMaterial: string[]
    collar: string[]
    closure: string[]
    cuffs: string[]
    pockets: string[]
    color: string[]
  }
}) {
  try {
    // Check if GEMINI_API_KEY is available
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set")
    }

    // Create a detailed prompt based on product specifications
    const prompt = `Write a detailed, professional product description for an e-commerce website. The product is a ${productInfo.name
      } with the following specifications:
  ${productInfo.specifications.externalMaterial.length > 0 ? `External Material: ${productInfo.specifications.externalMaterial.join(", ")}` : ""}
  ${productInfo.specifications.internalMaterial.length > 0 ? `Internal Material: ${productInfo.specifications.internalMaterial.join(", ")}` : ""}
  ${productInfo.specifications.collar.length > 0 ? `Collar: ${productInfo.specifications.collar.join(", ")}` : ""}
  ${productInfo.specifications.closure.length > 0 ? `Closure: ${productInfo.specifications.closure.join(", ")}` : ""}
  ${productInfo.specifications.cuffs.length > 0 ? `Cuffs: ${productInfo.specifications.cuffs.join(", ")}` : ""}
  ${productInfo.specifications.pockets.length > 0 ? `Pockets: ${productInfo.specifications.pockets.join(", ")}` : ""}
  ${productInfo.specifications.color.length > 0 ? `Color: ${productInfo.specifications.color.join(", ")}` : ""}
  
  The description should be engaging, highlight the key features, and be around 200-300 words. Focus on the quality, style, and practical benefits of the product. Include SEO-friendly content that would appeal to potential buyers.
  
  Format the description with proper paragraphs and include a "Key Features" section at the end with bullet points.
  
  Important: I will be displaying this in a plain text section at the end with bullet points.

Important: I will be displaying this in a plain text field, so don't use markdown formatting that requires special rendering. Instead of using ** for bold, just make the text ALL CAPS for emphasis. Use plain bullet points (•) instead of markdown bullets.`

    // Call the Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`API call failed: ${response.statusText}`)
    }

    const data = await response.json()

    // Extract the generated text from the response
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      throw new Error("Unexpected API response format")
    }

    // Get the raw text from Gemini
    const rawText = data.candidates[0].content.parts[0].text

    // Clean and format the text for plain text display
    const formattedText = cleanMarkdownForPlainText(rawText)

    return formattedText
  } catch (error) {
    // Fix the error handling to properly handle null or undefined errors
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    throw new Error(`Failed to generate description: ${errorMessage}`)
  }
}
