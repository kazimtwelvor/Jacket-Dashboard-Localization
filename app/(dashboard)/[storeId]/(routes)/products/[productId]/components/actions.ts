

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

// Helper function to sanitize a slug string
const sanitizeSlug = (slugStr: string | null | undefined): string => {
  if (!slugStr || typeof slugStr !== 'string') return "";
  return slugStr
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove non-alphanumeric characters except spaces and hyphens
    .trim()                   // Trim leading/trailing spaces
    .replace(/\s+/g, "-")    // Replace spaces with hyphens
    .replace(/-+/g, "-");   // Replace multiple hyphens with a single hyphen
};

// Helper function to generate a slug from name if the provided slug is empty
const generateSlugFromNameIfEmpty = (slugVal: string, nameVal: string | null | undefined): string => {
    if (slugVal && slugVal.trim() !== "") {
        return slugVal; // Already have a good slug
    }
    if (!nameVal || typeof nameVal !== 'string') return ""; // Cannot generate from name
    return sanitizeSlug(nameVal); // Generate from name
};


// Helper function to generate unique SKU with sequential numbering
async function generateUniqueSku(storeId: string, manualSku: string | null): Promise<string> {
  try {
    // If a manual SKU was provided, check if it's unique
    if (manualSku && manualSku.trim() !== "") {
      const existingProduct = await prismadb.product.findFirst({
        where: {
          storeId,
          sku: manualSku,
        },
      })

      if (!existingProduct) {
        return manualSku // If unique, use the manual SKU
      }

      // If not unique, append a suffix to make it unique
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

    // If no manual SKU or it's empty, generate an automatic one
    // Get the store's SKU prefix
    const store = await prismadb.store.findUnique({
      where: { id: storeId },
      select: { skuPrefix: true },
    })

    // Use the store's prefix or default to "SKU" if not set
    const prefix = store?.skuPrefix || "SKU"

    // Find the highest existing SKU number for this prefix
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

    // Extract numbers from existing SKUs
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

    // Generate the next number with padding
    const nextNumber = highestNumber + 1
    const paddedNumber = nextNumber.toString().padStart(4, "0")
    const newSku = `${prefix}-${paddedNumber}`

    return newSku
  } catch (error) {
    console.error("Error generating SKU:", error)
    // Fallback to timestamp-based SKU in case of errors
    const timestamp = Date.now().toString().slice(-8)
    return `SKU-${timestamp}`
  }
}

// Add this debug function at the top of the file, after the imports
async function logFormDataContents(formData: FormData, label: string) {
  console.log(`--- ${label} - FormData Contents ---`)
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && value.length > 100) {
      console.log(`${key}: ${value.substring(0, 100)}... (truncated)`)
    } else {
      console.log(`${key}: ${value}`)
    }
  }
  console.log(`--- End ${label} ---`)
}

// Modify the beginning of the createProduct function to add more debugging
export async function createProduct(formData: FormData) {
  try {
    // Log all form data for debugging
    console.log("--- Create Product - FormData Contents ---")
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value.length > 100) {
        console.log(`${key}: ${value.substring(0, 100)}... (truncated)`)
      } else {
        console.log(`${key}: ${value}`)
      }
    }
    console.log("--- End FormData Contents ---")

    const formDataKeys = Array.from(formData.keys())
    console.log("createProduct action called with formData keys:", formDataKeys)

    // Extract and log storeId specifically
    let storeId = formData.get("storeId") as string
    console.log("StoreId from formData:", storeId)

    if (!storeId) {
      // Try to extract from URL if not directly provided
      const urlPath = formData.get("url") as string // Expecting pathname
      console.log("URL path from formData:", urlPath)

      if (urlPath) {
        const urlParts = urlPath.split("/")
        // Example: /0cll7xt077j7/products/new -> storeId should be 0cll7xt077j7
        // Find the first part after the initial '/' that is not 'products', 'settings', etc. and is a valid ID format
        const potentialStoreId = urlParts.find(
          (part, index) => index === 1 && part && !["products", "settings", "api", "categories", "sizes", "colors", "billboards", "orders"].includes(part)
        );


        if (potentialStoreId) {
          console.log(`Extracted storeId from URL path: ${potentialStoreId}`)
          storeId = potentialStoreId;
          formData.set("storeId", potentialStoreId) // Update formData if necessary
        }
      }

      // Check again after potential extraction
      if (!formData.get("storeId")) {
        throw new Error("Store ID is required and could not be determined")
      }
    }
     storeId = formData.get("storeId") as string; // Ensure storeId is correctly assigned


    // Extract data from FormData
    const { userId } = await auth()

    if (!userId) {
      throw new Error("Unauthenticated")
    }

    // Extract data from FormData
    const id = formData.get("id") as string | null
    const tempReviewsId = formData.get("tempReviewsId") as string | null
    const cachedReviewsJson = formData.get("cachedReviews") as string | null
    
    if (!storeId) { // Double check storeId after all attempts
      throw new Error("Store ID is required")
    }
    console.log("Using storeId:", storeId)

    const submitType = formData.get("submitType") as string
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    
    // Slug handling
    const submittedSlug = formData.get("slug") as string;
    let productSlugForDb = sanitizeSlug(submittedSlug); // Sanitize submitted slug first
    productSlugForDb = generateSlugFromNameIfEmpty(productSlugForDb, name); // Generate from name if empty
    console.log("Submitted slug from form:", submittedSlug);
    console.log("Sanitized and finalized slug for DB:", productSlugForDb);


    // Fix price parsing
    const regularPriceStr = formData.get("regularPrice") as string
    const price = regularPriceStr ? Number.parseFloat(regularPriceStr) : 0

    const salePriceStr = formData.get("salePrice") as string
    // Fix: Use 0 instead of null for salePrice if it's empty or invalid
    const salePrice = salePriceStr && salePriceStr.trim() !== "" ? Number.parseFloat(salePriceStr) : 0

    // Get the SKU from form data - might be empty for auto-generation
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

    // Properly handle isFeatured value, default to false if not provided or invalid
    // Using String() to ensure we're comparing strings, as formData.get() returns strings
    const isFeaturedValue = formData.get("isFeatured")
    const isFeatured = isFeaturedValue === "true" || String(isFeaturedValue) === "true"
    
    // Handle isParentProduct value
    const isParentProductValue = formData.get("isParentProduct")
    const isParentProduct = isParentProductValue === "true" || String(isParentProductValue) === "true"
    
    // Handle parentProductId value
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

    // Parse JSON strings with better error handling
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

    // Parse JSON strings
    const materialParsed = materialJson ? JSON.parse(materialJson) : []
    const styleParsed = styleJson ? JSON.parse(styleJson) : []
    const images = imagesJson ? JSON.parse(imagesJson) : []

    // Parse SEO data directly from the seo JSON string
    const seoJson = formData.get("seo") as string
    let seoData = {
      metaTitle: "",
      metaDescription: "",
      slug: "", // This will be updated with productSlugForDb
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
          slug: parsedSeo.slug ? sanitizeSlug(parsedSeo.slug) : productSlugForDb, // Use sanitized SEO slug or fall back to main product slug
          keywords: Array.isArray(parsedSeo.keywords) ? parsedSeo.keywords : [],
          isPillarContent: !!parsedSeo.isPillarContent,
          noIndex: !!parsedSeo.noIndex,
          seoScore: parsedSeo.seoScore || 0,
          canonicalUrl: parsedSeo.canonicalUrl || "",
        }
      } else {
         // If no seoJson, ensure seoData.slug is populated with the main product slug
        seoData.slug = productSlugForDb;
      }
    } catch (e) {
      console.log("Error parsing SEO JSON:", e instanceof Error ? e.message : String(e))
      // If there's an error parsing SEO JSON, still use the productSlugForDb
      seoData.slug = productSlugForDb;
    }
    
    // Ensure seoData.slug is productSlugForDb if it ended up empty
    if (!seoData.slug) {
        seoData.slug = productSlugForDb;
    }


    const { metaTitle, metaDescription, keywords, noIndex } = seoData
    console.log("Extracted keywords:", keywords)
    console.log("Final SEO slug being used for seoData:", seoData.slug)


    // Extract brandName, ratingValue, and reviewCount with default values
    const brandName = (formData.get("brandName") as string) || "Leather Jacket By Fineyst"
    const ratingValue = (formData.get("ratingValue") as string) || "4.5"
    const reviewCount = (formData.get("reviewCount") as string) || "0"

    console.log("Extracted brand info:", {
      brandName,
      ratingValue,
      reviewCount,
    })

    const purchaseNote = formData.get("purchaseNote") as string
    const categoryData = formData.get("categoryData") as string | null // Can be null or empty string

    // Handle colorDetails instead of colorIds
    let colorDetails = null
    const colorDetailsJson = formData.get("colorDetails") as string | null
    const colorIdsJson = formData.get("colorIds") as string | null

    // Find this section where formData values are extracted
    const colorLinksJson = formData.get("colorLinks") as string
    console.log("Raw colorLinks from form:", colorLinksJson)

    // Extract schema data
    const schema1Json = formData.get("schema1") as string
    const schema2Json = formData.get("schema2") as string
    const schema3Json = formData.get("schema3") as string
    const schemaJson = formData.get("schema") as string

    // Create a combined schema object
    let combinedSchema = {}

    // First check if we have a combined schema already
    if (schemaJson && schemaJson.trim() !== "") {
      try {
        combinedSchema = JSON.parse(schemaJson)
        console.log("Using existing combined schema")
      } catch (e) {
        console.log("Error parsing existing schema JSON:", e instanceof Error ? e.message : String(e))
        combinedSchema = {}
      }
    }

    // Process all schemas regardless of whether we have a combined schema
    // Process schema1 (Product schema - always required)
    try {
      if (schema1Json && schema1Json.trim() !== "") {
        const parsedSchema1 = JSON.parse(schema1Json)
        if (parsedSchema1) {
          // Use templateName if available, or @type, or default to "Product"
          const schemaType = parsedSchema1.templateName || parsedSchema1["@type"] || "Product"
          combinedSchema[schemaType] = parsedSchema1
          console.log(`Added schema1 as ${schemaType} to combined schema`)
        }
      }
    } catch (e) {
      console.log("Error processing schema1 for combined schema:", e instanceof Error ? e.message : String(e))
    }

    // Process schema2
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

    // Process schema3
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

    // If still no schema data, create a default product schema
    if (Object.keys(combinedSchema).length === 0) {
      // Create a default product schema
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

    // Convert to string
    const schemaDataString = JSON.stringify(combinedSchema)
    console.log("Final schema data:", schemaDataString.substring(0, 100) + "...")
    console.log("Number of schemas in combined schema:", Object.keys(combinedSchema).length)


    // Process color links with extra safety checks
    let colorLinksData = {}
    let colorLinksString = "{}"

    try {
      if (colorLinksJson) {
        // Log the exact value for debugging
        console.log(`Raw colorLinks value type: ${typeof colorLinksJson}`)
        console.log(`Raw colorLinks value: ${colorLinksJson.substring(0, 100)}...`)

        // Only try to parse if it looks like valid JSON
        if (
          typeof colorLinksJson === "string" &&
          colorLinksJson.trim().startsWith("{") &&
          colorLinksJson.trim().endsWith("}")
        ) {
          try {
            const parsedData = JSON.parse(colorLinksJson)

            // Ensure it's an object
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

    // Save color links for all products (both parent and child)
    let colorLinksToSave = colorLinksData

    // Log the final structure for verification
    console.log("Final colorLinksData structure:", JSON.stringify(colorLinksData).substring(0, 100))
    console.log("ColorLinks to save:", JSON.stringify(colorLinksToSave))

    // First try to get colorDetails if it exists
    if (colorDetailsJson) {
      try {
        colorDetails = JSON.parse(colorDetailsJson)
      } catch (e) {
        console.log("Error parsing colorDetails JSON:", e instanceof Error ? e.message : String(e))
      }
    }

    // If colorDetails is still null but we have colorIds, fetch the color details from the database
    if (!colorDetails && colorIdsJson) {
      try {
        const colorIds = JSON.parse(colorIdsJson)
        if (Array.isArray(colorIds) && colorIds.length > 0) {
          // Fetch color details from the database
          const colorsFromDb = await prismadb.color.findMany({
            where: {
              id: {
                in: colorIds,
              },
            },
          })

          // Format the colors into the expected colorDetails format
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

    // Parse sizes array - IMPORTANT: Extract only the IDs
    const sizesJson = formData.get("sizes") as string
    let sizeIds: string[] = []
    // let sizeDetails = null // sizeDetails is now the primary way

    // Add this improved section for processing sizeDetails
    const sizeDetailsJson = formData.get("sizeDetails") as string | null
    let sizeDetailsData = null // Renamed to avoid conflict with sizeDetails variable above

    try {
      if (sizeDetailsJson) {
        // If we have a JSON string, parse it
        sizeDetailsData = JSON.parse(sizeDetailsJson)
        console.log("Successfully parsed sizeDetails:", sizeDetailsData)
         if (Array.isArray(sizeDetailsData)) {
            sizeIds = sizeDetailsData.map(sd => sd.id).filter(Boolean);
        }
      } else {
        // If no sizeDetails provided directly, try to build it from sizeIds (old way)
        const sizesJsonFallback = formData.get("sizes") as string // sizes field should contain array of IDs
        if (sizesJsonFallback) {
          const parsedSizeIds = JSON.parse(sizesJsonFallback)

          if (Array.isArray(parsedSizeIds) && parsedSizeIds.length > 0) {
             sizeIds = parsedSizeIds;
            // Fetch size details from the database
            const sizesFromDb = await prismadb.size.findMany({
              where: {
                id: {
                  in: parsedSizeIds,
                },
              },
            })

            // Format the sizes into the expected sizeDetails format
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
      sizeDetailsData = [] // Default to empty array instead of null
    }


    // Log the parsed data for debugging
    console.log("Parsed images", images)
    console.log("Parsed specifications:", specifications ? JSON.parse(specifications) : {})
    console.log("Parsed categories:", {
      gender,
      material: materialParsed,
      style: styleParsed,
    })
    console.log("Extracted material:", materialParsed)
    console.log("Extracted style:", styleParsed)
    console.log("Extracted size IDs:", sizeIds) // sizeIds might be redundant if sizeDetailsData is primary
    console.log("Extracted size details data:", sizeDetailsData)

    console.log("Parsed SEO data (object):", seoData)


    // Find the user in the database by their Clerk ID
    const dbUser = await prismadb.user.findUnique({
      where: {
        clerkId: userId,
      },
    })

    if (!dbUser) {
      throw new Error("User not found")
    }

    // Create categoryData object from individual fields
    const categoryDataObject = {
      material: Array.isArray(materialParsed) && materialParsed.length > 0 ? materialParsed[0] : null,
      style: Array.isArray(styleParsed) && styleParsed.length > 0 ? styleParsed[0] : null,
      gender: gender || null
    }

    // Find the productData object and add/update this line:
    const productData = {
      name,
      description,
      price: isNaN(price) ? 0 : price,
      salePrice: isNaN(salePrice) ? 0 : salePrice,
      stockStatus,
      isArchived,
      isPublished: !isArchived, // When isArchived is true (draft), isPublished should be false
      specifications, // This is a string already
      gender,
      categoryData: categoryDataObject, // Add the categoryData object
      tags: Array.isArray(tags) ? tags : [],
      relatedProducts: Array.isArray(relatedProducts) ? relatedProducts : [],
      metaTitle: seoData.metaTitle,
      metaDescription: seoData.metaDescription,
      slug: productSlugForDb, // Use the definitive product slug
      keywords: Array.isArray(seoData.keywords) ? seoData.keywords : [],
      noIndex: seoData.noIndex,
      brandName: brandName || "Leather Jacket By Fineyst", // Ensure default value
      ratingValue: ratingValue || "4.5", // Ensure default value
      reviewCount: reviewCount || "0", // Ensure default value
      purchaseNote,
      isFeatured,
      isParentProduct,
      parentProductId,
      colorDetails, // This should be the parsed object or from DB
      sizeDetails: sizeDetailsData || [], // Ensure this is never null
      colorLinks: colorLinksToSave,
      schema: schemaDataString, // Use the stringified combined schema
      // Add creator information
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

    // Validate that at least one color is selected
    const selectedColors = specifications ? JSON.parse(specifications).color || [] : []
    if (!selectedColors || selectedColors.length === 0) {
      throw new Error("At least one color must be selected before saving the product")
    }
    console.log("Color validation passed:", selectedColors)

    // Parse cached reviews if they exist
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

    // Check if user is the store owner
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    })

    // If not the owner, check if they are a member with appropriate permissions
    if (!storeByUserId) {
      const storeUser = await prismadb.storeUser.findFirst({
        where: {
          storeId: storeId,
          userId: dbUser.id,
        },
      })

      // Check if user has appropriate role (ADMIN, MANAGER, or EDITOR can manage products)
      if (!storeUser || !storeUser.role || !["ADMIN", "MANAGER", "EDITOR"].includes(storeUser.role)) {
        throw new Error("Unauthorized: Store not found or you don't have permission")
      }
    }

    // If this is an update to an existing product
    if (id) {
      console.log(`Updating existing product: ${id}`)

      try {
        // First, get the current product to check if SKU is being changed
        const currentProduct = await prismadb.product.findUnique({
          where: { id },
          select: {
            sku: true,
            // Also fetch the creator information to preserve it
            createdById: true,
            createdByName: true,
            createdByEmail: true,
            categoryData: true, // Fetch current categoryData
          },
        })

        let newSkuForUpdate = currentProduct?.sku; // Default to current SKU

        // If the user provided a new SKU and it's different from the current one, validate it
        if (manualSku && manualSku.trim() !== "" && currentProduct && manualSku !== currentProduct.sku) {
          // Check if the new SKU is unique
          newSkuForUpdate = await generateUniqueSku(storeId, manualSku)
          console.log(`SKU changed from ${currentProduct.sku} to ${newSkuForUpdate}`)
        } else if (!currentProduct?.sku && manualSku && manualSku.trim() !== "") {
           // Product exists but has no SKU, and manual SKU is provided
           newSkuForUpdate = await generateUniqueSku(storeId, manualSku);
           console.log(`Generated SKU for existing product (was empty): ${newSkuForUpdate}`);
        } else if (!currentProduct?.sku && (!manualSku || manualSku.trim() === "")) {
            // Product exists, has no SKU, and no manual SKU provided (auto-generate)
            newSkuForUpdate = await generateUniqueSku(storeId, null);
            console.log(`Auto-generated SKU for existing product (was empty): ${newSkuForUpdate}`);
        }


        // For updates, remove creator information from productData and only include updater information
        // This ensures we don't overwrite who originally created the product
        const { createdById, createdByName, createdByEmail, ...dataWithoutCreator } = productData
        
        console.log('Server action - relatedProducts being updated:', dataWithoutCreator.relatedProducts)

        // Update the product with all data except creator information
        const product = await prismadb.product.update({
          where: {
            id,
          },
          data: {
            ...dataWithoutCreator,
            sku: newSkuForUpdate, // Set the determined SKU
            // Use categoryData from productData which was built from form fields
            categoryData: productData.categoryData, 
            // Add updater information
            updatedById: dbUser.id,
            updatedByName: dbUser.name || "Unknown",
            updatedByEmail: dbUser.email,
          },
        })

        // Delete existing product-image relationships first
        await prismadb.productImage.deleteMany({
            where: {
                productId: id,
            },
        });
        
        // Then, find and delete orphaned images (images not associated with any other product)
        // This step is complex and needs careful implementation to avoid deleting shared images if that's a feature.
        // For now, assuming images are not shared between products.
        // A more robust solution would involve checking if an image is used by other products before deleting.
        // For simplicity, we'll just delete images associated with this product via ProductImage then the Image itself if its URL matches one from `images`
        
        // Handle cached reviews for updated products - Same as new products
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

        // Create new images and product-image relationships
        for (const image of images) { // 'images' is from formData, parsed into an array of objects
          let imageUrl = ""
          let imageMetadata = {}

          if (typeof image === "string") { // Should not happen if frontend sends objects
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

          // Find or create the image
          let dbImage = await prismadb.image.findFirst({ where: { url: imageUrl } }); // Changed from findUnique
          if (dbImage) {
            // Optionally update metadata if it changed
             dbImage = await prismadb.image.update({ where: { id: dbImage.id }, data: { ...imageMetadata } });
          } else {
            dbImage = await prismadb.image.create({ data: { url: imageUrl, ...imageMetadata } });
          }

          // Create the product-image relationship
          await prismadb.productImage.create({
            data: {
              productId: id,
              imageId: dbImage.id,
            },
          })
        }
      } catch (error) {
        // Handle other errors
        console.error("Error updating product:", error)
        throw error
      }
    } else {
      console.log("Creating new product")

      try {
        // Generate a unique SKU for the new product - use manual SKU if provided
        const uniqueSku = await generateUniqueSku(storeId, manualSku)
        
        // Use the categoryData from productData which was built from form fields
        const resolvedCategoryData = productData.categoryData;
        console.log('Using categoryData from productData:', resolvedCategoryData);


        // Create new product
        const product = await prismadb.product.create({
          data: {
            ...productData,
            sku: uniqueSku, // Use the generated SKU
            storeId: storeId,
            categoryData: resolvedCategoryData,
          },
        })

        console.log(`Created new product with ID: ${product.id}`)

        // Create new images and product-image relationships
        for (const image of images) { // 'images' is from formData
          let imageUrl = ""
          let imageMetadata = {}

           if (typeof image === "string") { // Should not happen
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
