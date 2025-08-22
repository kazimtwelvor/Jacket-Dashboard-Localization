/**
 * Schema Generator Utility
 *
 * This utility generates structured data (JSON-LD) for products based on their data
 * and optional admin overrides.
 */

interface SchemaGeneratorOptions {
  // Product data
  name: string
  description: string
  price: string
  salePrice?: string
  sku: string
  stockStatus: string
  brandName: string
  ratingValue?: string
  reviewCount?: string
  images: string[]
  mainImage?: string
  slug?: string

  // Schema configuration
  useAutoSchema?: boolean
  schemaTemplate?: string
  customSchema?: string

  // Additional data based on template
  material?: string[]
  color?: string[]
  gender?: string
  author?: string
  publisher?: string
  isbn?: string
  numberOfPages?: string
  applicationCategory?: string
  operatingSystem?: string
}

export function generateProductSchema(options: SchemaGeneratorOptions): string {
  // If using custom schema and it exists, return it
  if (!options.useAutoSchema && options.customSchema) {
    try {
      // Validate that it's proper JSON
      JSON.parse(options.customSchema)
      return options.customSchema
    } catch (e) {
      console.error("Invalid custom schema JSON:", e)
      // Fall back to auto-generated schema
    }
  }

  // Get the base URL
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""

  const productUrl = options.slug
    ? `${baseUrl}/products/${options.slug}`
    : `${baseUrl}/products/${options.name?.toLowerCase().replace(/\s+/g, "-") || "product"}`

  // Generate auto schema
  const baseSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: options.name || "Product Name",
    description: options.description || "Product Description",
    sku: options.sku || "",
    image: [options.mainImage, ...(Array.isArray(options.images) ? options.images : [])].filter(Boolean),
    brand: {
      "@type": "Brand",
      name: options.brandName || "Brand Name",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: options.price || "0",
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
      availability:
        options.stockStatus === "instock"
          ? "https://schema.org/InStock"
          : options.stockStatus === "onbackorder"
            ? "https://schema.org/BackOrder"
            : "https://schema.org/OutOfStock",
      url: productUrl,
    },
  }

  // Add sale price if available
  if (options.salePrice && Number.parseFloat(options.salePrice) > 0) {
    baseSchema.offers = {
      ...baseSchema.offers,
      price: options.salePrice,
      priceSpecification: {
        "@type": "PriceSpecification",
        price: options.salePrice,
        priceCurrency: "USD",
      },
    }
  }

  // Add ratings if available
  if (
    options.ratingValue &&
    options.reviewCount &&
    Number.parseFloat(options.ratingValue) > 0 &&
    Number.parseInt(options.reviewCount) > 0
  ) {
    baseSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: options.ratingValue,
      reviewCount: options.reviewCount,
    }
  }

  // Apply template-specific properties
  let templateSchema = { ...baseSchema }

  switch (options.schemaTemplate) {
    case "clothing":
      templateSchema = {
        ...templateSchema,
        category: "Clothing",
        material: options.material || [],
        color: options.color || [],
      }
      break
    case "electronics":
      templateSchema = {
        ...templateSchema,
        category: "Electronics",
        model: options.sku,
      }
      break
    case "book":
      templateSchema = {
        ...templateSchema,
        "@type": "Book",
        author: {
          "@type": "Person",
          name: options.author || "Author Name",
        },
        publisher: {
          "@type": "Organization",
          name: options.publisher || options.brandName || "Publisher Name",
        },
        isbn: options.isbn || options.sku,
        numberOfPages: options.numberOfPages || "100",
      }
      break
    case "food":
      templateSchema = {
        ...templateSchema,
        category: "Food",
        nutrition: {
          "@type": "NutritionInformation",
          servingSize: "100g",
        },
      }
      break
    case "software":
      templateSchema = {
        ...templateSchema,
        "@type": "SoftwareApplication",
        applicationCategory: options.applicationCategory || "Application",
        operatingSystem: options.operatingSystem || "Web Browser",
      }
      break
  }

  return JSON.stringify(templateSchema, null, 2)
}

/**
 * Utility function to extract schema data from product form
 */
export function extractSchemaDataFromForm(formData: any): SchemaGeneratorOptions {
  return {
    name: formData.name || "",
    description: formData.description || "",
    price: formData.regularPrice || "0",
    salePrice: formData.salePrice || "",
    sku: formData.sku || "",
    stockStatus: formData.stockStatus || "instock",
    brandName: formData.brandName || "",
    ratingValue: formData.ratingValue || "",
    reviewCount: formData.reviewCount || "",
    images: formData.images || [],
    mainImage: formData.mainImage || "",
    slug: formData.seo?.slug || "",
    useAutoSchema: formData.seo?.useAutoSchema !== false,
    schemaTemplate: formData.seo?.schemaTemplate || "default",
    customSchema: formData.schema || "",
    material: formData.specifications?.externalMaterial || [],
    color: formData.specifications?.color || [],
    gender: formData.categories?.gender || "",
  }
}

/**
 * Utility function to inject schema into HTML
 */
export function injectSchemaIntoHtml(html: string, schema: string): string {
  // Remove any existing schema
  const cleanedHtml = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "")

  // Add new schema before closing head tag
  return cleanedHtml.replace("</head>", `<script type="application/ld+json">${schema}</script></head>`)
}
