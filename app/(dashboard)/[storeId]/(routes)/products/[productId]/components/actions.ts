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
    console.error("Error generating SKU:", error)
    const timestamp = Date.now().toString().slice(-8)
    return `SKU-${timestamp}`
  }
}

async function logFormDataContents(formData: FormData, label: string) {
  console.log(`--- ${label} - FormData Contents ---`)
  for (const [key, value] of Array.from(formData.entries())) {
    if (typeof value === "string" && value.length > 100) {
      console.log(`${key}: ${value.substring(0, 100)}... (truncated)`)
    } else {
      console.log(`${key}: ${value}`)
    }
  }
  console.log(`--- End ${label} ---`)
}

export async function createProduct(formData: FormData) {
  try {
    console.log("--- Create Product - FormData Contents ---")
    for (const [key, value] of Array.from(formData.entries())) {
      if (typeof value === "string" && value.length > 100) {
        console.log(`${key}: ${value.substring(0, 100)}... (truncated)`)
      } else {
        console.log(`${key}: ${value}`)
      }
    }
    console.log("--- End FormData Contents ---")

    const formDataKeys = Array.from(formData.keys())
    console.log("createProduct action called with formData keys:", formDataKeys)

    let storeId = formData.get("storeId") as string
    console.log("StoreId from formData:", storeId)

    if (!storeId) {
      const urlPath = formData.get("url") as string 
      console.log("URL path from formData:", urlPath)

      if (urlPath) {
        const urlParts = urlPath.split("/")
        const potentialStoreId = urlParts.find(
          (part, index) => index === 1 && part && !["products", "settings", "api", "categories", "sizes", "colors", "billboards", "orders"].includes(part)
        );


        if (potentialStoreId) {
          console.log(`Extracted storeId from URL path: ${potentialStoreId}`)
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
    console.log("Using storeId:", storeId)

    const submitType = formData.get("submitType") as string
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    
    const submittedSlug = formData.get("slug") as string;
    let productSlugForDb = sanitizeSlug(submittedSlug); 
    productSlugForDb = generateSlugFromNameIfEmpty(productSlugForDb, name); 
    console.log("Submitted slug from form:", submittedSlug);
    console.log("Sanitized and finalized slug for DB:", productSlugForDb);


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
    console.log("Raw tags from form:", tagsJson)
    
    const relatedProductsJson = formData.get("relatedProducts") as string
    console.log("Raw relatedProducts from form:", relatedProductsJson)

    const isFeaturedValue = formData.get("isFeatured")
    const isFeatured = isFeaturedValue === "true" || String(isFeaturedValue) === "true"
    
    const isParentProductValue = formData.get("isParentProduct")
    const isParentProduct = isParentProductValue === "true" || String(isParentProductValue) === "true"
    
    const parentProductId = formData.get("parentProductId") as string || null
    
    console.log("isParentProduct debug:", {
      rawValue: isParentProductValue,
      processedValue: isParentProduct,
      typeOfRawValue: typeof isParentProductValue,
    })
    
    console.log("Final isParentProduct being saved to DB:", isParentProduct)

    console.log("isFeatured value:", {
      rawValue: isFeaturedValue,
      processedValue: isFeatured,
      typeOfRawValue: typeof isFeaturedValue,
    })

    const imagesJson = formData.get("images") as string

    let tags = []
    try {
      if (tagsJson && tagsJson.trim() !== "") {
        const parsedTags = JSON.parse(tagsJson)
        if (Array.isArray(parsedTags)) {
          tags = parsedTags
        } else {
          console.log("Tags JSON did not parse to an array, using empty array instead")
        }
      }
      console.log("Parsed tags:", tags)
    } catch (e) {
      console.log("Error parsing tags JSON:", e instanceof Error ? e.message : String(e))
      tags = []
    }
    
    let relatedProducts = []
    try {
      if (relatedProductsJson && relatedProductsJson.trim() !== "") {
        const parsedRelatedProducts = JSON.parse(relatedProductsJson)
        if (Array.isArray(parsedRelatedProducts)) {
          relatedProducts = parsedRelatedProducts
        } else {
          console.log("RelatedProducts JSON did not parse to an array, using empty array instead")
        }
      }
      console.log("Parsed relatedProducts:", relatedProducts)
    } catch (e) {
      console.log("Error parsing relatedProducts JSON:", e instanceof Error ? e.message : String(e))
      relatedProducts = []
    }

    const materialParsed = materialJson ? JSON.parse(materialJson) : []
    const styleParsed = styleJson ? JSON.parse(styleJson) : []
    const images = imagesJson ? JSON.parse(imagesJson) : []
    const seoJson = formData.get("seo") as string
    let seoData = {
      metaTitle: "",
      metaDescription: "",
      slug: "", 
      keywords: [],
      isPillarContent: false,
      noIndex: false,
      seoScore: 0,
      canonicalUrl: "",
    }

    try {
      if (seoJson) {
        const parsedSeo = JSON.parse(seoJson)
        seoData = {
          metaTitle: parsedSeo.metaTitle || name || "",
          metaDescription: parsedSeo.metaDescription || "",
          slug: parsedSeo.slug ? sanitizeSlug(parsedSeo.slug) : productSlugForDb, 
          keywords: Array.isArray(parsedSeo.keywords) ? parsedSeo.keywords : [],
          isPillarContent: !!parsedSeo.isPillarContent,
          noIndex: !!parsedSeo.noIndex,
          seoScore: parsedSeo.seoScore || 0,
          canonicalUrl: parsedSeo.canonicalUrl || "",
        }
      } else {
        
        seoData.slug = productSlugForDb;
      }
    } catch (e) {
      console.log("Error parsing SEO JSON:", e instanceof Error ? e.message : String(e))
      
      seoData.slug = productSlugForDb;
    }
    
    
    if (!seoData.slug) {
        seoData.slug = productSlugForDb;
    }


    const { metaTitle, metaDescription, keywords, noIndex } = seoData
    console.log("Extracted keywords:", keywords)
    console.log("Final SEO slug being used for seoData:", seoData.slug)


    const brandName = (formData.get("brandName") as string) || "Leather Jacket By Fineyst"
    const ratingValue = (formData.get("ratingValue") as string) || "4.5"
    const reviewCount = (formData.get("reviewCount") as string) || "0"

    console.log("Extracted brand info:", {
      brandName,
      ratingValue,
      reviewCount,
    })

    const purchaseNote = formData.get("purchaseNote") as string
    const categoryData = formData.get("categoryData") as string | null 

    let colorDetails = null
    const colorDetailsJson = formData.get("colorDetails") as string | null
    const colorIdsJson = formData.get("colorIds") as string | null

    
    const colorLinksJson = formData.get("colorLinks") as string
    console.log("Raw colorLinks from form:", colorLinksJson)

    
    const schema1Json = formData.get("schema1") as string
    const schema2Json = formData.get("schema2") as string
    const schema3Json = formData.get("schema3") as string
    const schemaJson = formData.get("schema") as string

    let combinedSchema: any = {}

    if (schemaJson && schemaJson.trim() !== "") {
      try {
        combinedSchema = JSON.parse(schemaJson)
        console.log("Using existing combined schema")
      } catch (e) {
        console.log("Error parsing existing schema JSON:", e instanceof Error ? e.message : String(e))
        combinedSchema = {}
      }
    }

    try {
      if (schema1Json && schema1Json.trim() !== "") {
        const parsedSchema1 = JSON.parse(schema1Json)
        if (parsedSchema1) {
          const schemaType = parsedSchema1.templateName || parsedSchema1["@type"] || "Product"
          combinedSchema[schemaType] = parsedSchema1
          console.log(`Added schema1 as ${schemaType} to combined schema`)
        }
      }
    } catch (e) {
      console.log("Error processing schema1 for combined schema:", e instanceof Error ? e.message : String(e))
    }

    try {
      if (schema2Json && schema2Json.trim() !== "") {
        const parsedSchema2 = JSON.parse(schema2Json)
        if (parsedSchema2) {
          const schemaType = parsedSchema2.templateName || parsedSchema2["@type"] || "FAQPage"
          combinedSchema[schemaType] = parsedSchema2
          console.log(`Added schema2 as ${schemaType} to combined schema`)
        }
      }
    } catch (e) {
      console.log("Error processing schema2 for combined schema:", e instanceof Error ? e.message : String(e))
    }

    try {
      if (schema3Json && schema3Json.trim() !== "") {
        const parsedSchema3 = JSON.parse(schema3Json)
        if (parsedSchema3) {
          const schemaType = parsedSchema3.templateName || parsedSchema3["@type"] || "HowTo"
          combinedSchema[schemaType] = parsedSchema3
          console.log(`Added schema3 as ${schemaType} to combined schema`)
        }
      }
    } catch (e) {
      console.log("Error processing schema3 for combined schema:", e instanceof Error ? e.message : String(e))
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
      console.log("Created default product schema in server action")
    }

    const schemaDataString = JSON.stringify(combinedSchema)


    let colorLinksData = {}
    let colorLinksString = "{}"

    try {
      if (colorLinksJson) {

        if (
          typeof colorLinksJson === "string" &&
          colorLinksJson.trim().startsWith("{") &&
          colorLinksJson.trim().endsWith("}")
        ) {
          try {
            const parsedData = JSON.parse(colorLinksJson)

            if (typeof parsedData === "object" && parsedData !== null) {
              colorLinksData = parsedData
              colorLinksString = colorLinksJson
              console.log("Successfully parsed colorLinks into an object")
            } else {
              console.log("Parsed colorLinks but result is not an object:", typeof parsedData)
              colorLinksData = {}
            }
          } catch (parseError) {
            console.log("Failed to parse colorLinks JSON:", parseError)
            colorLinksData = {}
          }
        } else {
          console.log("colorLinksJson is not in valid JSON format")
          colorLinksData = {}
        }
      }
    } catch (e) {
      console.log("Error processing colorLinks:", e instanceof Error ? e.message : String(e))
      colorLinksData = {}
    }

    let colorLinksToSave = colorLinksData

    console.log("Final colorLinksData structure:", JSON.stringify(colorLinksData).substring(0, 100))
    console.log("ColorLinks to save:", JSON.stringify(colorLinksToSave))

    if (colorDetailsJson) {
      try {
        colorDetails = JSON.parse(colorDetailsJson)
      } catch (e) {
        console.log("Error parsing colorDetails JSON:", e instanceof Error ? e.message : String(e))
      }
    }

    if (!colorDetails && colorIdsJson) {
      try {
        const colorIds = JSON.parse(colorIdsJson)
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

          console.log("Converted colorIds to colorDetails:", colorDetails)
        }
      } catch (e) {
        console.log("Error processing colorIds:", e instanceof Error ? e.message : String(e))
      }
    }

    const sizesJson = formData.get("sizes") as string
    let sizeIds: string[] = []

    const sizeDetailsJson = formData.get("sizeDetails") as string | null
    let sizeDetailsData = null 

    try {
      if (sizeDetailsJson) {
        sizeDetailsData = JSON.parse(sizeDetailsJson)
        console.log("Successfully parsed sizeDetails:", sizeDetailsData)
         if (Array.isArray(sizeDetailsData)) {
            sizeIds = sizeDetailsData.map(sd => sd.id).filter(Boolean);
        }
      } else {
        const sizesJsonFallback = formData.get("sizes") as string 
        if (sizesJsonFallback) {
          const parsedSizeIds = JSON.parse(sizesJsonFallback)

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

            console.log("Built sizeDetails from sizeIds (fallback):", sizeDetailsData)
          }
        }
      }
    } catch (e) {
      console.log("Error processing sizeDetails:", e instanceof Error ? e.message : String(e))
      sizeDetailsData = [] 
    }


    console.log("Parsed images", images)
    console.log("Parsed specifications:", specifications ? JSON.parse(specifications) : {})
    console.log("Parsed categories:", {
      gender,
      material: materialParsed,
      style: styleParsed,
    })
    console.log("Extracted material:", materialParsed)
    console.log("Extracted style:", styleParsed)
    console.log("Extracted size IDs:", sizeIds) 
    console.log("Extracted size details data:", sizeDetailsData)

    console.log("Parsed SEO data (object):", seoData)


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

    const productData = {
      name,
      description,
      price: isNaN(price) ? 0 : price,
      salePrice: isNaN(salePrice) ? 0 : salePrice,
      stockStatus,
      isArchived,
      isPublished: !isArchived, 
      specifications, 
      gender,
      categoryData: categoryDataObject, 
      tags: Array.isArray(tags) ? tags : [],
      relatedProducts: Array.isArray(relatedProducts) ? relatedProducts : [],
      metaTitle: seoData.metaTitle,
      metaDescription: seoData.metaDescription,
      slug: productSlugForDb, 
      keywords: Array.isArray(seoData.keywords) ? seoData.keywords : [],
      noIndex: seoData.noIndex,
      brandName: brandName || "Leather Jacket By Fineyst", 
      ratingValue: ratingValue || "4.5", 
      reviewCount: reviewCount || "0", 
      purchaseNote,
      isFeatured,
      isParentProduct,
      parentProductId,
      colorDetails, 
      sizeDetails: sizeDetailsData || [], 
      colorLinks: colorLinksToSave,
      schema: schemaDataString, 
      createdById: dbUser.id,
      createdByName: dbUser.name || "Unknown",
      createdByEmail: dbUser.email,
    }

    console.log("Keywords being saved to database:", productData.keywords)
    console.log("Final slug being saved to database:", productData.slug)
    console.log("Product data prepared:", productData)
    console.log("Brand info being saved:", {
      brandName: productData.brandName,
      ratingValue: productData.ratingValue,
      reviewCount: productData.reviewCount,
    })

    console.log("Final tags being saved to database:", productData.tags)

    const selectedColors = specifications ? JSON.parse(specifications).color || [] : []
    if (!selectedColors || selectedColors.length === 0) {
      throw new Error("At least one color must be selected before saving the product")
    }
    console.log("Color validation passed:", selectedColors)

    let cachedReviews = null
    if (cachedReviewsJson) {
      try {
        cachedReviews = JSON.parse(cachedReviewsJson)
        console.log("Parsed cached reviews:", cachedReviews)
        console.log("Number of cached reviews:", Array.isArray(cachedReviews) ? cachedReviews.length : 0)
      } catch (e) {
        console.log("Error parsing cached reviews JSON:", e instanceof Error ? e.message : String(e))
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
      console.log(`Updating existing product: ${id}`)

      try {
        const currentProduct = await prismadb.product.findUnique({
          where: { id },
          select: {
            sku: true,
            createdById: true,
            createdByName: true,
            createdByEmail: true,
            categoryData: true, 
          },
        })

        let newSkuForUpdate = currentProduct?.sku; 

        if (manualSku && manualSku.trim() !== "" && currentProduct && manualSku !== currentProduct.sku) {
          newSkuForUpdate = await generateUniqueSku(storeId, manualSku)
          console.log(`SKU changed from ${currentProduct.sku} to ${newSkuForUpdate}`)
        } else if (!currentProduct?.sku && manualSku && manualSku.trim() !== "") {
           newSkuForUpdate = await generateUniqueSku(storeId, manualSku);
           console.log(`Generated SKU for existing product (was empty): ${newSkuForUpdate}`);
        } else if (!currentProduct?.sku && (!manualSku || manualSku.trim() === "")) {
            newSkuForUpdate = await generateUniqueSku(storeId, null);
            console.log(`Auto-generated SKU for existing product (was empty): ${newSkuForUpdate}`);
        }


        const { createdById, createdByName, createdByEmail, ...dataWithoutCreator } = productData
        
        console.log('Server action - relatedProducts being updated:', dataWithoutCreator.relatedProducts)

        const product = await prismadb.product.update({
          where: {
            id,
          },
          data: {
            ...dataWithoutCreator,
            sku: newSkuForUpdate, 
            categoryData: productData.categoryData, 
            updatedById: dbUser.id,
            updatedByName: dbUser.name || "Unknown",
            updatedByEmail: dbUser.email,
          },
        })

        await prismadb.productImage.deleteMany({
            where: {
                productId: id,
            },
        });
        
        if (cachedReviews && Array.isArray(cachedReviews) && cachedReviews.length > 0) {
          try {
            console.log(`Processing ${cachedReviews.length} cached reviews for updated product ${id}`)
            
            for (let i = 0; i < cachedReviews.length; i++) {
              const review = cachedReviews[i]
              console.log(`Processing review ${i + 1} for update:`, review)
              
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
              
              console.log(`Creating review ${i + 1} with data:`, reviewData)
              
              const savedReview = await prismadb.review.create({
                data: reviewData,
              })
              
              console.log(`Successfully saved review ${i + 1}:`, savedReview.id)
            }
            console.log(`Successfully saved ${cachedReviews.length} cached reviews for updated product ${id}`)
          } catch (reviewError) {
            console.error("Error saving cached reviews during product update:", reviewError)
            console.error("Review error details:", reviewError instanceof Error ? reviewError.message : String(reviewError))
          }
        } else {
          console.log("No cached reviews to save for updated product")
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
            console.warn("Skipping invalid image data:", image);
            continue;
          }
          
          if (!imageUrl) {
            console.warn("Skipping image with empty URL");
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
        console.error("Error updating product:", error)
        throw error
      }
    } else {
      console.log("Creating new product")

      try {
        const uniqueSku = await generateUniqueSku(storeId, manualSku)
        
        const resolvedCategoryData = productData.categoryData;
        console.log('Using categoryData from productData:', resolvedCategoryData);


        const product = await prismadb.product.create({
          data: {
            ...productData,
            sku: uniqueSku, 
            storeId: storeId,
            categoryData: resolvedCategoryData,
          },
        })

        console.log(`Created new product with ID: ${product.id}`)

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
             console.warn("Skipping invalid image data for new product:", image);
            continue;
          }

          if (!imageUrl) {
            console.warn("Skipping image with empty URL for new product");
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

        console.log(`Added ${images.length} images to product ${product.id}`)
        
        // Handle cached reviews for new products
        if (cachedReviews && Array.isArray(cachedReviews) && cachedReviews.length > 0) {
          try {
            console.log(`Processing ${cachedReviews.length} cached reviews for new product ${product.id}`)
            
            for (let i = 0; i < cachedReviews.length; i++) {
              const review = cachedReviews[i]
              console.log(`Processing review ${i + 1}:`, review)
              
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
              
              console.log(`Creating review ${i + 1} with data:`, reviewData)
              
              const savedReview = await prismadb.review.create({
                data: reviewData,
              })
              
              console.log(`Successfully saved review ${i + 1}:`, savedReview.id)
            }
            console.log(`Successfully saved ${cachedReviews.length} cached reviews for new product ${product.id}`)
          } catch (reviewError) {
            console.error("Error saving cached reviews for new product:", reviewError)
            console.error("Review error details:", reviewError instanceof Error ? reviewError.message : String(reviewError))
          }
        } else {
          console.log("No cached reviews to save for new product")
        }
        
        // Handle temporary reviews for new products (legacy support)
        if (tempReviewsId) {
          try {
            console.log(`Moving temporary reviews from ${tempReviewsId} to product ${product.id}`)
            
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
            
            console.log(`Successfully moved ${updatedReviews.count} reviews to product ${product.id}`)
          } catch (reviewError) {
            console.error("Error moving temporary reviews:", reviewError)
            // Don't fail the entire product creation if review moving fails
          }
        }
      } catch (error) {
        console.error("Error creating product:", error)
        throw error
      }
    }

    revalidatePath(`/${storeId}/products`)

    // Log before returning
    console.log("createProduct completed successfully")
    return { success: true }
  } catch (error) {
    console.log("Error in createProduct action:", error instanceof Error ? error.message : String(error))
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    console.log("Server: Error creating/updating product:", errorMessage)
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
    const prompt = `Write a detailed, professional product description for an e-commerce website. The product is a ${
      productInfo.name
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
      console.log("Gemini API error:", errorData)
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
    console.log("Error generating description:", errorMessage)
    throw new Error(`Failed to generate description: ${errorMessage}`)
  }
}
