


"use client"

import type React from "react"

import { useCallback, useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type Subscription, type FieldError, type FieldErrorsImpl } from "react-hook-form"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createProduct } from "./actions"
import { useToast } from "@/hooks/use-toast"

import { CompletionChecklist } from "./sections/completion-checklist"
import { SeoScoreIndicator } from "./sections/seo-score-indicator"
import { GeneralTab } from "./tabs/general-tab"
import { SeoTab } from "./tabs/seo-tab"
import { formSchema, type ProductFormValues } from "./product-form-schema"
import { useFormattedSpecifications } from "./hooks/use-formatted-specifications"
import type { Product, Category, Size, Color } from "../../types"
import axios from "axios"
import { useStoreName } from "./store-name-provider"
import { Modal } from "@/components/ui/modal"

export interface ProductFormProps {
  initialData: Product | null
  colors: Color[]
  sizes: Size[]
  categories: Category[]
}

// Find the organizeCategoriesByType function and replace it with this improved version
// Around line 70-100

const organizeCategoriesByType = (categories: Category[]) => {
  const genderCategories: Category[] = []
  const materialCategories: Category[] = []
  const styleCategories: Category[] = []

  // Log the raw categories for debugging
  console.log("Raw categories from database:", categories)

  categories.forEach((category) => {
    // Check if the category has a type property
    if (category.type) {
      // If the category has an explicit type, use it
      if (category.type.toLowerCase() === "gender") {
        genderCategories.push(category)
      } else if (category.type.toLowerCase() === "material") {
        materialCategories.push(category)
      } else if (category.type.toLowerCase() === "style") {
        styleCategories.push(category)
      }
    } else {
      // Fallback to name-based categorization if type is not available
      const name = category.name.toLowerCase()
      if (
        name === "men" ||
        name === "women" ||
        name === "unisex" ||
        name === "boys" ||
        name === "girls" ||
        name.includes("gender")
      ) {
        genderCategories.push(category)
      } else if (
        name.includes("leather") ||
        name.includes("cotton") ||
        name.includes("wool") ||
        name.includes("denim") ||
        name.includes("suede") ||
        name.includes("fleece") ||
        name.includes("polyester") ||
        name.includes("nylon") ||
        name.includes("material")
      ) {
        materialCategories.push(category)
      } else if (
        name.includes("bomber") ||
        name.includes("puffer") ||
        name.includes("varsity") ||
        name.includes("biker") ||
        name.includes("blazer") ||
        name.includes("casual") ||
        name.includes("formal") ||
        name.includes("sporty") ||
        name.includes("style")
      ) {
        styleCategories.push(category)
      }
    }
  })

  // Log the organized categories for debugging
  console.log("Organized categories:", {
    genderCategories: genderCategories.map((c) => c.name),
    materialCategories: materialCategories.map((c) => c.name),
    styleCategories: styleCategories.map((c) => c.name),
  })

  return { genderCategories, materialCategories, styleCategories }
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, colors, sizes, categories }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [submitType, setSubmitType] = useState<"draft" | "publish" | null>(null)
  const [activeTab, setActiveTab] = useState("general")
  const formRef = useRef<HTMLFormElement>(null)
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const { storeName } = useStoreName()

  // Removed warning modal state variables

  // Add debounce timer refs for name and description updates
  const nameTimerRef = useRef<number | null>(null)
  const descriptionTimerRef = useRef<number | null>(null)

  // Log the initialData to see what we're working with
  useEffect(() => {
    if (initialData) {
      console.log("Initial Data:", initialData)
      console.log("Initial colorLinks:", initialData.colorLinks)
      console.log("Initial images with metadata:", initialData.images)
      console.log("Initial relatedProducts:", initialData.relatedProducts)
      console.log("Initial relatedProducts:", initialData.relatedProducts)
    }
  }, [initialData])

  // Replace the extractSizeIds function with extractSizeDetails
  const extractSizeDetails = () => {
    if (initialData && initialData.sizeDetails) {
      // Log the raw sizeDetails for debugging
      console.log("Raw sizeDetails from initialData:", initialData.sizeDetails)

      // Handle different formats of sizeDetails
      if (Array.isArray(initialData.sizeDetails)) {
        return initialData.sizeDetails
      } else if (typeof initialData.sizeDetails === "object" && initialData.sizeDetails !== null) {
        return Object.values(initialData.sizeDetails)
      } else if (typeof initialData.sizeDetails === "string") {
        try {
          const parsed = JSON.parse(initialData.sizeDetails)
          return Array.isArray(parsed) ? parsed : Object.values(parsed)
        } catch (e) {
          console.error("Error parsing sizeDetails string:", e)
          return []
        }
      }
    }
    return []
  }

  // Update the processColorLinks function to better handle different data formats:

  // Process colorLinks from initialData - FIXED to prevent hydration errors
  const processColorLinks = () => {
    if (!initialData) {
      console.log("No initial data available for color links")
      return {}
    }

    console.log("Raw initialData.colorLinks:", initialData.colorLinks)
    console.log("Raw initialData.colorLinks type:", typeof initialData.colorLinks)

    try {
      // If it's already an object, return it directly
      if (typeof initialData.colorLinks === "object" && initialData.colorLinks !== null) {
        console.log("colorLinks is already an object:", initialData.colorLinks)
        return initialData.colorLinks
      }

      // If it's a string, try to parse it
      if (typeof initialData.colorLinks === "string") {
        // Check if the string is "[object Object]" which is not valid JSON
        if (initialData.colorLinks === "[object Object]") {
          console.log("Found '[object Object]' string, returning empty object")
          return {}
        }

        try {
          const parsed = JSON.parse(initialData.colorLinks)
          console.log("Parsed colorLinks from string:", parsed)
          return parsed
        } catch (parseError) {
          console.error("Error parsing colorLinks string:", parseError)

          // Try parsing it again (handles double-stringified JSON)
          try {
            const doubleStringified = JSON.parse(JSON.parse(initialData.colorLinks))
            console.log("Parsed double-stringified colorLinks:", doubleStringified)
            return doubleStringified
          } catch (doubleParseError) {
            console.error("Error parsing double-stringified colorLinks:", doubleParseError)
            return {}
          }
        }
      }
    } catch (error) {
      console.error("Error processing colorLinks:", error)
    }

    return {}
  }

  // Find the parsedInitialData section (around line 300-400) and add this code to properly extract schemas:

  // Update the schema extraction in parsedInitialData
  const parsedInitialData = initialData
    ? {
        // Main image is the first image
        mainImage: initialData.images.length > 0 ? initialData.images[0].url : "",
        // Main image metadata
        mainImageMetadata:
          initialData.images.length > 0
            ? {
                altText: initialData.images[0].altText || "",
                title: initialData.images[0].title || "",
                caption: initialData.images[0].caption || "",
                description: initialData.images[0].description || "",
                excludeFromSitemap: initialData.images[0].excludeFromSitemap || false,
              }
            : null,
        // Gallery images are all images after the first one
        images: initialData.images.length > 1 ? initialData.images.slice(1).map((img) => img.url) : [],
        // Gallery images metadata
        imagesMetadata:
          initialData.images.length > 1
            ? initialData.images.slice(1).map((img) => ({
                altText: img.altText || "",
                title: img.title || "",
                caption: img.caption || "",
                description: img.description || "",
                excludeFromSitemap: img.excludeFromSitemap || false,
              }))
            : [],
        name: initialData.name,
        slug: initialData.slug || "",
        description: initialData.description || "",
        specifications: initialData.specifications
          ? typeof initialData.specifications === "string"
            ? JSON.parse(initialData.specifications)
            : initialData.specifications
          : {
              externalMaterial: [],
              internalMaterial: [],
              collar: [],
              closure: [],
              cuffs: [],
              pockets: [],
              color: [],
            },
        status: initialData.isArchived === true ? "draft" : "published",
        regularPrice: initialData.price.toString(),
        salePrice: initialData.salePrice ? initialData.salePrice.toString() : "",
        sku: initialData.sku || "",
        stockStatus: initialData.stockStatus || "instock",
        isFeatured: initialData.isFeatured || false,
        brandName: initialData.brandName || "Leather Jacket By Fineyst",
        ratingValue: initialData.ratingValue || "4.5",
        reviewCount: initialData.reviewCount || "0",
        categories: {
          gender: initialData.gender || "",
          material: (() => {
            // Try to get material from categoryData first, then fallback to direct material field
            if (initialData.categoryData && typeof initialData.categoryData === 'object') {
              const categoryData = initialData.categoryData as any
              if (categoryData.material) {
                return Array.isArray(categoryData.material) ? categoryData.material : [categoryData.material]
              }
            }
            return Array.isArray(initialData.material) ? initialData.material : []
          })(),
          style: (() => {
            // Try to get style from categoryData first, then fallback to direct style field
            if (initialData.categoryData && typeof initialData.categoryData === 'object') {
              const categoryData = initialData.categoryData as any
              if (categoryData.style) {
                return Array.isArray(categoryData.style) ? categoryData.style : [categoryData.style]
              }
            }
            return Array.isArray(initialData.style) ? initialData.style : []
          })(),
          variationColors: initialData.specifications
            ? (typeof initialData.specifications === "string"
                ? JSON.parse(initialData.specifications)
                : initialData.specifications
              ).color || []
            : [],
          sizes: initialData.sizeDetails
            ? Array.isArray(initialData.sizeDetails)
              ? initialData.sizeDetails.map((size) => (typeof size === "object" ? (size as any).id : size))
              : typeof initialData.sizeDetails === "object" && initialData.sizeDetails !== null
                ? Object.values(initialData.sizeDetails).map((size) => (typeof size === "object" ? (size as any).id : size))
                : typeof initialData.sizeDetails === "string"
                  ? (() => {
                      try {
                        const parsed = JSON.parse(initialData.sizeDetails)
                        return Array.isArray(parsed)
                          ? parsed.map((size) => (typeof size === "object" ? (size as any).id : size))
                          : Object.values(parsed).map((size) => (typeof size === "object" ? (size as any).id : size))
                      } catch (e) {
                        console.error("Error parsing sizeDetails string in parsedInitialData:", e)
                        return []
                      }
                    })()
                  : []
            : [],
          // Process colorLinks properly
          colorVariationLinks: processColorLinks(),
        },
        tags: initialData.tags || [],
        purchaseNote: initialData.purchaseNote || "",
        relatedProducts: Array.isArray(initialData.relatedProducts) ? initialData.relatedProducts : [],
        
        // Debug log for relatedProducts
        ...(console.log('DEBUG - initialData.relatedProducts:', initialData.relatedProducts) || {}),
        menuOrder: initialData.menuOrder?.toString() || "0",
        reviews: true,
        seo: {
          metaTitle: initialData.metaTitle || "",
          metaDescription: initialData.metaDescription || "",
          slug: initialData.slug || "", // Initialize seo.slug from product slug
          // Properly handle keywords from different possible sources
          keywords: Array.isArray(initialData.keywords)
            ? initialData.keywords
            : initialData.focusKeyword
              ? [initialData.focusKeyword, ...(initialData.additionalKeywords || [])]
              : initialData.additionalKeywords || [],
          isPillarContent: false,
          noIndex: initialData.noIndex || false, // Ensure this defaults to false
          seoScore: 0,
          canonicalUrl: "",
          structuredData: true, // Always set to true
        },
        // Extract individual schemas from the combined schema
        schema: initialData.schema || "",
        tempReviewsId: "", // Always empty for existing products
        schema1: (() => {
          try {
            if (initialData.schema) {
              const schemaObj =
                typeof initialData.schema === "string" ? JSON.parse(initialData.schema) : initialData.schema
              // Look for Product schema first
              if (schemaObj.Product) {
                return JSON.stringify(schemaObj.Product, null, 2)
              }

              // If no Product schema, look for any schema with @type = Product
              for (const key in schemaObj) {
                if (schemaObj[key]["@type"] === "Product") {
                  return JSON.stringify(schemaObj[key], null, 2)
                }
              }

              // If still no match, use the first schema as primary
              if (Object.keys(schemaObj).length > 0) {
                const firstKey = Object.keys(schemaObj)[0]
                return JSON.stringify(schemaObj[firstKey], null, 2)
              }
            }
            return ""
          } catch (e) {
            console.error("Error extracting schema1:", e)
            return ""
          }
        })(),
        schema2: (() => {
          try {
            if (initialData.schema) {
              const schemaObj =
                typeof initialData.schema === "string" ? JSON.parse(initialData.schema) : initialData.schema

              // Look for FAQPage schema first
              if (schemaObj.FAQPage) {
                return JSON.stringify(schemaObj.FAQPage, null, 2)
              }

              // If no FAQPage schema, look for any schema with @type = FAQPage
              for (const key in schemaObj) {
                if (schemaObj[key]["@type"] === "FAQPage") {
                  return JSON.stringify(schemaObj[key], null, 2)
                }
              }

              // If we have more than one schema, use the second one
              const keys = Object.keys(schemaObj)
              if (keys.length > 1) {
                return JSON.stringify(schemaObj[keys[1]], null, 2)
              }
            }
            return ""
          } catch (e) {
            console.error("Error extracting schema2:", e)
            return ""
          }
        })(),
        schema3: (() => {
          try {
            if (initialData.schema) {
              const schemaObj =
                typeof initialData.schema === "string" ? JSON.parse(initialData.schema) : initialData.schema

              // Look for BreadcrumbList or HowTo schema first
              if (schemaObj.BreadcrumbList) {
                return JSON.stringify(schemaObj.BreadcrumbList, null, 2)
              }
              if (schemaObj.HowTo) {
                return JSON.stringify(schemaObj.HowTo, null, 2)
              }

              // Look for any schema with @type = BreadcrumbList or HowTo
              for (const key in schemaObj) {
                if (schemaObj[key]["@type"] === "BreadcrumbList" || schemaObj[key]["@type"] === "HowTo") {
                  return JSON.stringify(schemaObj[key], null, 2)
                }
              }

              // If we have more than two schemas, use the third one
              const keys = Object.keys(schemaObj)
              if (keys.length > 2) {
                return JSON.stringify(schemaObj[keys[2]], null, 2)
              }
            }
            return ""
          } catch (e) {
            console.error("Error extracting schema3:", e)
            return ""
          }
        })(),
      }
    : {
        // Default values when there's no initialData
        mainImage: "", // Initialize with empty string
        mainImageMetadata: null,
        images: [], // Initialize with empty array
        imagesMetadata: [],
        name: "",
        slug: "", // Initialize top-level slug as empty
        description: "",
        specifications: {
          externalMaterial: [],
          internalMaterial: [],
          collar: [],
          closure: [],
          cuffs: [],
          pockets: [],
          color: [],
        },
        status: "published",
        regularPrice: "",
        salePrice: "",
        sku: "",
        stockStatus: "instock",
        brandName: "Leather Jacket By Fineyst",
        ratingValue: "4.5",
        reviewCount: "0",
        categories: {
          gender: "",
          material: [],
          style: [],
          variationColors: [],
          colorVariationLinks: {},
          sizes: [], // Initialize with empty array
        },
        tags: [],
        purchaseNote: "",
        relatedProducts: [],
        
        // Debug log for new product
        ...(console.log('DEBUG - New product, no relatedProducts') || {}),
        menuOrder: "0",
        reviews: true,
        seo: {
          metaTitle: "",
          metaDescription: "",
          slug: "", // Initialize seo.slug as empty
          keywords: [],
          isPillarContent: false,
          noIndex: false, // Ensure this defaults to false for new products
          seoScore: 0,
          canonicalUrl: "",
          structuredData: true,
          indexPage: true, // Add this for clarity
        },
        schema: "",
        schema1: "",
        schema2: "",
        schema3: "",
        tempReviewsId: "",
      }

  // Add this after the parsedInitialData definition to log the extracted schemas
  useEffect(() => {
    if (initialData && initialData.schema) {
      console.log("Schema data loaded from database:", initialData.schema)
      console.log(
        "Extracted schema1:",
        parsedInitialData.schema1 ? parsedInitialData.schema1.substring(0, 100) + "..." : "none",
      )
      console.log(
        "Extracted schema2:",
        parsedInitialData.schema2 ? parsedInitialData.schema2.substring(0, 100) + "..." : "none",
      )
      console.log(
        "Extracted schema3:",
        parsedInitialData.schema3 ? parsedInitialData.schema3.substring(0, 100) + "..." : "none",
      )
    }
  }, [initialData, parsedInitialData])

  // Log the parsed initial data
  useEffect(() => {
    console.log("Parsed Initial Data:", parsedInitialData)
    console.log("Parsed colorVariationLinks:", parsedInitialData.categories?.colorVariationLinks)
    console.log("Parsed mainImageMetadata:", parsedInitialData.mainImageMetadata)
    console.log("Parsed imagesMetadata:", parsedInitialData.imagesMetadata)
  }, [parsedInitialData])

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: parsedInitialData,
    mode: "onChange", // Add this to validate on change
  })

  // Add this useEffect after the form initialization (around line 430)
  // After this line: mode: "onChange", // Add this to validate on change

  // Log the form values after initialization
  useEffect(() => {
    console.log("Form Values after initialization:", form.getValues())
    console.log("Form colorVariationLinks:", form.getValues("categories.colorVariationLinks"))
    console.log("Form mainImageMetadata:", form.getValues("mainImageMetadata"))
    console.log("Form imagesMetadata:", form.getValues("imagesMetadata"))

    // Add this to debug color links specifically
    const colorLinks = form.getValues("categories.colorVariationLinks")
    console.log("Color links type:", typeof colorLinks)
    console.log("Color links keys:", colorLinks ? Object.keys(colorLinks) : "no keys")
    console.log("Color links values:", colorLinks ? Object.values(colorLinks) : "no values")

    // Check if we have selected colors and if they match with color links
    const selectedColors = form.getValues("specifications.color") || []
    console.log("Selected colors:", selectedColors)
    if (selectedColors.length > 0 && colorLinks) {
      selectedColors.forEach((color) => {
        console.log(`Color ${color} link:`, colorLinks[color])
      })
    }
  }, [form])

  // Debug keywords data
  useEffect(() => {
    if (initialData) {
      console.log("Keywords data:", {
        rawKeywords: initialData.keywords,
        keywordsType: typeof initialData.keywords,
        isArray: Array.isArray(initialData.keywords),
        parsedKeywords: form.getValues("seo.keywords"),
        focusKeyword: initialData.focusKeyword,
        additionalKeywords: initialData.additionalKeywords,
      })

      // If keywords is a string, try to parse it
      if (typeof initialData.keywords === "string" && initialData.keywords.trim() !== "") {
        try {
          const parsedKeywords = JSON.parse(initialData.keywords)
          console.log("Parsed keywords from string:", parsedKeywords)

          // Update the form with parsed keywords if needed
          if (
            Array.isArray(parsedKeywords) &&
            (!form.getValues("seo.keywords") || form.getValues("seo.keywords").length === 0)
          ) {
            form.setValue("seo.keywords", parsedKeywords)
          }
        } catch (e) {
          console.error("Error parsing keywords string:", e)
        }
      }
    }
  }, [initialData, form])

  useEffect(() => {
    if (initialData) {
      console.log("Keywords data:", {
        rawKeywords: initialData.keywords,
        parsedKeywords: form.getValues("seo.keywords"),
        keywordsType: typeof initialData.keywords,
        isArray: Array.isArray(initialData.keywords),
      })
    }
  }, [initialData, form])

  // After the form initialization (around line 400), add this code to set default schema values
  useEffect(() => {
    // Check if schema1 is empty but we have product data
    if (!form.getValues("schema1")) {
      // Generate a basic product schema
      const productName = form.getValues("name") || "Product"
      const productDescription = form.getValues("description") || ""
      const productImage = form.getValues("mainImage") || ""
      const productPrice = form.getValues("regularPrice") || "0"

      const defaultSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: productName,
        description: productDescription,
        image: productImage,
        offers: {
          "@type": "Offer",
          price: productPrice,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        templateName: "Product",
      }

      // Set the schema values directly in the form
      const schemaString = JSON.stringify(defaultSchema)
      form.setValue("schema1", schemaString, { shouldDirty: false })

      // Also set the combined schema
      const combinedSchema = { Product: defaultSchema }
      form.setValue("schema", JSON.stringify(combinedSchema), { shouldDirty: false })

      console.log("Default product schema created and set in form:", schemaString.substring(0, 100) + "...")
    }
  }, [form])

  // Log the form values after initialization
  useEffect(() => {
    console.log("Form Values after initialization:", form.getValues())
    console.log("Form colorVariationLinks:", form.getValues("categories.colorVariationLinks"))

    // Add this to debug color links specifically
    const colorLinks = form.getValues("categories.colorVariationLinks")
    console.log("Color links type:", typeof colorLinks)
    console.log("Color links keys:", colorLinks ? Object.keys(colorLinks) : "no keys")
    console.log("Color links values:", colorLinks ? Object.values(colorLinks) : "no values")

    // Check if we have selected colors and if they match with color links
    const selectedColors = form.getValues("specifications.color") || []
    console.log("Selected colors:", selectedColors)
    if (selectedColors.length > 0 && colorLinks) {
      selectedColors.forEach((color) => {
        console.log(`Color ${color} link:`, colorLinks[color])
      })
    }
  }, [form])

  // Removed form change tracking

  // Removed form submission tracking

  // Removed beforeunload event handler

  // Removed navigation handler with warning modal

  // Removed save as draft and exit handler

  // Removed discard changes handler

  // Removed router method overrides and popstate handling

  // Organize categories by type
  const categorizedCategories = organizeCategoriesByType(categories)

  // Ensure material and style are always arrays
  useEffect(() => {
    // Ensure categories object exists
    const categoriesData = form.getValues("categories")
    if (!categoriesData) {
      form.setValue("categories", {
        gender: "",
        material: [],
        style: [],
        variationColors: [],
        colorVariationLinks: {},
        sizes: [],
      })
    }

    // Ensure material array exists
    const material = form.getValues("categories.material")
    if (!material || !Array.isArray(material)) {
      form.setValue("categories.material", [], { shouldValidate: false })
    }

    // Ensure style array exists
    const style = form.getValues("categories.style")
    if (!style || !Array.isArray(style)) {
      form.setValue("categories.style", [], { shouldValidate: false })
    }

    // Ensure sizes array exists
    const currentSizes = form.getValues("categories.sizes")
    if (!currentSizes || !Array.isArray(currentSizes)) {
      form.setValue("categories.sizes", [], { shouldValidate: false })
    }

    // Ensure colorVariationLinks object exists
    const colorVariationLinks = form.getValues("categories.colorVariationLinks")
    if (!colorVariationLinks || typeof colorVariationLinks !== "object") {
      form.setValue("categories.colorVariationLinks", {}, { shouldValidate: false })
    }

    // Log the current values for debugging
    console.log("Form initialized with:", {
      categories: form.getValues("categories"),
      material: form.getValues("categories.material"),
      style: form.getValues("categories.style"),
      sizes: form.getValues("categories.sizes"),
      colorVariationLinks: form.getValues("categories.colorVariationLinks"),
    })
  }, [form])

  // Function to update meta title based on product name
  const updateMetaTitle = () => {
    const currentFormValues = form.getValues();
    const currentProductName = currentFormValues.name;
    const currentMetaTitle = currentFormValues.seo.metaTitle;
    const currentTopLevelSlug = currentFormValues.slug;
    const currentSeoSlug = currentFormValues.seo.slug;

    if (currentProductName) {
      // Update meta title if empty
      if (!currentMetaTitle || currentMetaTitle === "") {
        form.setValue("seo.metaTitle", currentProductName, { shouldDirty: true });
      }

      // Update top-level slug and seo.slug if they are empty
      if (!currentTopLevelSlug || currentTopLevelSlug === "") {
        const generatedSlug = currentProductName
          .toLowerCase()
          .replace(/[^\w\s-]/g, "") // Remove non-alphanumeric, keep spaces and hyphens
          .trim()                   // Trim leading/trailing spaces
          .replace(/\s+/g, "-")    // Replace spaces with hyphens
          .replace(/-+/g, "-");   // Replace multiple hyphens with a single hyphen
        
        form.setValue("slug", generatedSlug, { shouldDirty: true });
        
        // Also update seo.slug if it's empty, to keep them in sync initially
        if (!currentSeoSlug || currentSeoSlug === "") {
          form.setValue("seo.slug", generatedSlug, { shouldDirty: true });
        }
      }
    }
  }


  // Function to update meta description based on product description
  const updateMetaDescription = () => {
    const currentDescription = form.getValues("description")
    const currentMetaDescription = form.getValues("seo.metaDescription")

    if (currentDescription && (!currentMetaDescription || currentMetaDescription === "")) {
      const truncatedDescription =
        currentDescription.length > 160 ? currentDescription.substring(0, 157) + "..." : currentDescription

      form.setValue("seo.metaDescription", truncatedDescription, { shouldDirty: false })
    }
  }

  // Register field watchers with debounce
  useEffect(() => {
    let nameSubscription: Subscription | undefined;
    let descriptionSubscription: Subscription | undefined;
    // Register for name field
    nameSubscription = form.watch((value, { name: fieldName, type }) => {
      if (fieldName === "name" || fieldName === undefined) {
        // Clear any existing timer
        if (nameTimerRef.current) {
          clearTimeout(nameTimerRef.current)
        }

        // Set a new timer to update after typing stops
        nameTimerRef.current = window.setTimeout(() => {
          updateMetaTitle()
        }, 500) // 500ms debounce
      }
    })

    // Register for description field
    descriptionSubscription = form.watch((value, { name: fieldName, type }) => {
      if (fieldName === "description" || fieldName === undefined) {
        // Clear any existing timer
        if (descriptionTimerRef.current) {
          clearTimeout(descriptionTimerRef.current)
        }

        // Set a new timer to update after typing stops
        descriptionTimerRef.current = window.setTimeout(() => {
          updateMetaDescription()
        }, 500) // 500ms debounce
      }
    })

    // Set initial values if they exist but SEO fields are empty
    updateMetaTitle()
    updateMetaDescription()

    // Cleanup function
    return () => {
      nameSubscription?.unsubscribe()
      descriptionSubscription?.unsubscribe()

      if (nameTimerRef.current) {
        clearTimeout(nameTimerRef.current)
      }

      if (descriptionTimerRef.current) {
        clearTimeout(descriptionTimerRef.current)
      }
    }
  }, [form])

  /// Effect to handle form submission when submitType changes
  useEffect(() => {
    if (submitType) {
      const handleSubmission = async () => {
        try {
          // Validate required fields before proceeding
          const values = form.getValues()

          // Check if all required fields are filled
          const validationErrors = validateRequiredFields(values)

          if (validationErrors.length > 0) {
            // Show toast with validation errors
            toast({
              title: "Validation Error",
              description: (
                <div className="space-y-2">
                  <p>Please fix the following errors:</p>
                  <ul className="list-disc pl-4">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error.message}</li>
                    ))}
                  </ul>
                </div>
              ),
              variant: "destructive",
            })

            // Switch to the appropriate tab based on the first error
            switchToTabWithError(validationErrors[0].field)

            // Reset submit type
            setSubmitType(null)
            return
          }

          await submitProductForm(values, submitType)
        } catch (error) {
          console.error("Form submission error:", error)
        } finally {
          setSubmitType(null)
        }
      }

      handleSubmission()
    }
  }, [submitType, form, toast])

  const { getFormattedSpecifications } = useFormattedSpecifications(form)

  // Function to validate all required fields
  const validateRequiredFields = (values: ProductFormValues) => {
    const errors: Array<{ field: string; message: string }> = []

    // Check Main Product Image
    if (!values.mainImage || values.mainImage.trim() === "") {
      errors.push({
        field: "mainImage",
        message: "Main product image is required",
      })
    }

    // Check Product Name
    if (!values.name || values.name.trim() === "") {
      errors.push({
        field: "name",
        message: "Product name is required",
      })
    }

    // Check Product Price
    if (!values.regularPrice || values.regularPrice.trim() === "") {
      errors.push({
        field: "regularPrice",
        message: "Product price is required",
      })
    }

    // Check SKU
    if (!values.sku || values.sku.includes("-") || values.sku.endsWith("-")) {
      errors.push({
        field: "sku",
        message: "SKU number is required",
      })
    }

    // Check Gender
    if (!values.categories?.gender || values.categories.gender.trim() === "") {
      errors.push({
        field: "categories.gender",
        message: "Gender is required",
      })
    }

    // Check Colors (in specifications)
    if (!values.specifications?.color || values.specifications.color.length === 0) {
      errors.push({
        field: "specifications.color",
        message: "At least one color is required",
      })
    }

    // Check Categories (Material and Style)
    if (!values.categories?.material || values.categories.material.length === 0) {
      errors.push({
        field: "categories.material",
        message: "At least one material category is required",
      })
    }

    if (!values.categories?.style || values.categories.style.length === 0) {
      errors.push({
        field: "categories.style",
        message: "At least one style category is required",
      })
    }

    // Check Available Sizes
    if (!values.categories?.sizes || values.categories.sizes.length === 0) {
      errors.push({
        field: "categories.sizes",
        message: "At least one size is required",
      })
    }

    return errors
  }

  // Function to switch to the appropriate tab based on the error field
  const switchToTabWithError = (fieldName: string) => {
    if (fieldName.startsWith("seo.")) {
      setActiveTab("seo")
    } else {
      setActiveTab("general")
    }
  }

  // Modify the handlePublish function to ensure sizeDetails are included
  // Replace the entire handlePublish function with this improved version:

  const handlePublish = async () => {
    console.log("Publish button clicked - Direct submission approach")
    setIsUploading(true)

    try {
      // Get the current form values
      const formValues = form.getValues()
      console.log("Current form values:", formValues)

      // Create FormData directly
      const formData = new FormData()

      // Add basic product info
      formData.append("url", window.location.pathname)

      // Add product ID if we're editing an existing product
      if (initialData) {
        formData.append("id", initialData.id)
        formData.append("storeId", initialData.storeId)
      }

      // Ensure storeId is included
      const storeId = params.storeId?.toString() || window.location.pathname.split("/")[1]
      formData.append("storeId", storeId)
      console.log("Using storeId:", storeId)

      // Set submit type to publish
      formData.append("submitType", "publish")

      // Add all required fields directly
      formData.append("name", formValues.name || "")
      formData.append("slug", formValues.slug || "") // Use the top-level slug
      formData.append("description", formValues.description || "")
      formData.append("regularPrice", formValues.regularPrice || "0")
      formData.append("salePrice", formValues.salePrice || "0")
      formData.append("sku", formValues.sku || "")
      formData.append("stockStatus", formValues.stockStatus || "instock")
      formData.append("isFeatured", formValues.isFeatured ? "true" : "false")

      // Add specifications
      if (formValues.specifications) {
        formData.append("specifications", JSON.stringify(formValues.specifications))
      }

      // Add tags
      if (formValues.tags && Array.isArray(formValues.tags)) {
        formData.append("tags", JSON.stringify(formValues.tags))
        console.log("Tags being added to form:", formValues.tags)
      }
      
      // Add related products
      if (formValues.relatedProducts && Array.isArray(formValues.relatedProducts)) {
        formData.append("relatedProducts", JSON.stringify(formValues.relatedProducts))
        console.log("Related products being added to form:", formValues.relatedProducts)
      }

      // Add categories
      if (formValues.categories) {
        formData.append("gender", formValues.categories.gender || "")
        formData.append("material", JSON.stringify(formValues.categories.material || []))
        formData.append("style", JSON.stringify(formValues.categories.style || []))
        formData.append("sizes", JSON.stringify(formValues.categories.sizes || []))
      }

      // Add size details
      try {
        const selectedSizeIds = formValues.categories?.sizes || []
        if (selectedSizeIds.length > 0) {
          const sizeDetailsArray = selectedSizeIds
            .map((sizeId) => {
              const sizeObj = sizes.find((s) => s.id === sizeId)
              return sizeObj
                ? {
                    id: sizeObj.id,
                    name: sizeObj.name,
                    value: sizeObj.value || sizeObj.name,
                  }
                : null
            })
            .filter(Boolean)

          console.log("Size details being added to form:", sizeDetailsArray)
          formData.append("sizeDetails", JSON.stringify(sizeDetailsArray))
        } else {
          formData.append("sizeDetails", "[]")
        }
      } catch (error) {
        console.error("Error adding size details:", error)
        formData.append("sizeDetails", "[]")
      }

      // Add SEO data - ensure seo.slug is also consistent or handled by backend
      if (formValues.seo) {
         const seoData = { ...formValues.seo };
         // If formValues.slug is present, it should be the authority for seo.slug as well
         if (formValues.slug) {
            seoData.slug = formValues.slug;
         }
        formData.append("seo", JSON.stringify(seoData))
      }


      // Prepare images with metadata
      const mainImage = formValues.mainImage
        ? {
            url: formValues.mainImage,
            altText: formValues.mainImageMetadata?.altText || "",
            title: formValues.mainImageMetadata?.title || "",
            caption: formValues.mainImageMetadata?.caption || "",
            description: formValues.mainImageMetadata?.description || "",
            excludeFromSitemap: formValues.mainImageMetadata?.excludeFromSitemap || false,
          }
        : null

      const galleryImages = formValues.images.map((url, index) => ({
        url,
        altText:
          formValues.imagesMetadata && formValues.imagesMetadata[index]
            ? formValues.imagesMetadata[index].altText || ""
            : "",
        title:
          formValues.imagesMetadata && formValues.imagesMetadata[index]
            ? formValues.imagesMetadata[index].title || ""
            : "",
        caption:
          formValues.imagesMetadata && formValues.imagesMetadata[index]
            ? formValues.imagesMetadata[index].caption || ""
            : "",
        description:
          formValues.imagesMetadata && formValues.imagesMetadata[index]
            ? formValues.imagesMetadata[index].description || ""
            : "",
        excludeFromSitemap:
          formValues.imagesMetadata && formValues.imagesMetadata[index]
            ? formValues.imagesMetadata[index].excludeFromSitemap || false
            : false,
      }))

      // Combine all images with their metadata
      const allImages = mainImage ? [mainImage, ...galleryImages] : galleryImages
      formData.append("images", JSON.stringify(allImages))

      // Add schema data
      const schema =
        formValues.schema ||
        JSON.stringify({
          Product: {
            "@context": "https://schema.org",
            "@type": "Product",
            name: formValues.name || "Product",
            description: formValues.description || "",
            image: formValues.mainImage || "",
            offers: {
              "@type": "Offer",
              price: formValues.regularPrice || "0",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
          },
        })
      formData.append("schema", schema)

      // Add color data
      const selectedColors = formValues.specifications?.color || []
      const selectedColorIds = colors.filter((color) => selectedColors.includes(color.name)).map((color) => color.id)
      formData.append("colorIds", JSON.stringify(selectedColorIds))

      // Add color links
      const colorLinks = formValues.categories?.colorVariationLinks || {}
      formData.append("colorLinks", JSON.stringify(colorLinks))
      
      // Add temporary reviews ID and cached reviews if present
      if (formValues.tempReviewsId) {
        formData.append("tempReviewsId", formValues.tempReviewsId)
        console.log("Added tempReviewsId to publish formData:", formValues.tempReviewsId)
      }
      if (formValues.cachedReviews && Array.isArray(formValues.cachedReviews) && formValues.cachedReviews.length > 0) {
        formData.append("cachedReviews", JSON.stringify(formValues.cachedReviews))
        console.log("Added cachedReviews to publish formData:", formValues.cachedReviews.length, "reviews")
      }

      // Log the formData entries for debugging
      console.log("FormData entries:")
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${typeof value === "string" ? value.substring(0, 50) : "[complex value]"}...`)
      }

      // Call the server action directly
      console.log("Calling createProduct server action...")
      const result = await createProduct(formData)
      console.log("Form submission result:", result)

      // Clear cached reviews from localStorage after successful publish
      const productId = initialData?.id || "new"
      localStorage.removeItem(`cachedReviews_${productId}`)
      if (productId === "new") {
        localStorage.removeItem(`cachedReviews_new`)
      }

      toast({
        title: "Success!",
        description: "Product has been published successfully.",
      })

      // Navigate to products page
      window.location.href = `/${storeId}/products`
    } catch (err: unknown) {
      console.error("Error publishing product:", err)
      let message = "Something went wrong. Please try again.";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      } else if (err && typeof (err as any).message === 'string') {
        message = (err as any).message;
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Also replace the handleSaveDraft function with a direct implementation
  const handleSaveDraft = async () => {
    console.log("Save Draft clicked - Direct submission approach")
    setIsUploading(true)

    try {
      // Get the current form values
      const formValues = form.getValues()
      console.log("Current form values for draft:", formValues)

      // Create FormData directly
      const formData = new FormData()

      // Add basic product info
      formData.append("url", window.location.pathname)

      // Add product ID if we're editing an existing product
      if (initialData) {
        formData.append("id", initialData.id)
        formData.append("storeId", initialData.storeId)
      }

      // Ensure storeId is included
      const storeId = params.storeId?.toString() || window.location.pathname.split("/")[1]
      formData.append("storeId", storeId)
      console.log("Using storeId for draft:", storeId)

      // Set submit type to draft
      formData.append("submitType", "draft")

      // Add all required fields directly
      formData.append("name", formValues.name || "")
      formData.append("slug", formValues.slug || "") // Use the top-level slug
      formData.append("description", formValues.description || "")
      formData.append("regularPrice", formValues.regularPrice || "0")
      formData.append("salePrice", formValues.salePrice || "0")
      formData.append("sku", formValues.sku || "")
      formData.append("stockStatus", formValues.stockStatus || "instock")
      formData.append("isFeatured", formValues.isFeatured ? "true" : "false")

      // Add specifications
      if (formValues.specifications) {
        formData.append("specifications", JSON.stringify(formValues.specifications))
      }

      // Add tags
      if (formValues.tags && Array.isArray(formValues.tags)) {
        formData.append("tags", JSON.stringify(formValues.tags))
        console.log("Tags being added to draft form:", formValues.tags)
      }
      
      // Add related products
      if (formValues.relatedProducts && Array.isArray(formValues.relatedProducts)) {
        formData.append("relatedProducts", JSON.stringify(formValues.relatedProducts))
        console.log("Related products being added to draft form:", formValues.relatedProducts)
      }

      // Add categories
      if (formValues.categories) {
        formData.append("gender", formValues.categories.gender || "")
        formData.append("material", JSON.stringify(formValues.categories.material || []))
        formData.append("style", JSON.stringify(formValues.categories.style || []))
        formData.append("sizes", JSON.stringify(formValues.categories.sizes || []))
      }

      // Add size details
      try {
        const selectedSizeIds = formValues.categories?.sizes || []
        if (selectedSizeIds.length > 0) {
          const sizeDetailsArray = selectedSizeIds
            .map((sizeId) => {
              const sizeObj = sizes.find((s) => s.id === sizeId)
              return sizeObj
                ? {
                    id: sizeObj.id,
                    name: sizeObj.name,
                    value: sizeObj.value || sizeObj.name,
                  }
                : null
            })
            .filter(Boolean)

          console.log("Size details being added to draft form:", sizeDetailsArray)
          formData.append("sizeDetails", JSON.stringify(sizeDetailsArray))
        } else {
          formData.append("sizeDetails", "[]")
        }
      } catch (error) {
        console.error("Error adding size details to draft:", error)
        formData.append("sizeDetails", "[]")
      }

      // Add SEO data
      if (formValues.seo) {
        const seoData = { ...formValues.seo };
        if (formValues.slug) {
           seoData.slug = formValues.slug;
        }
        formData.append("seo", JSON.stringify(seoData))
      }


      // Prepare images with metadata
      const mainImage = formValues.mainImage
        ? {
            url: formValues.mainImage,
            altText: formValues.mainImageMetadata?.altText || "",
            title: formValues.mainImageMetadata?.title || "",
            caption: formValues.mainImageMetadata?.caption || "",
            description: formValues.mainImageMetadata?.description || "",
            excludeFromSitemap: formValues.mainImageMetadata?.excludeFromSitemap || false,
          }
        : null

      const galleryImages = formValues.images.map((url, index) => ({
        url,
        altText:
          formValues.imagesMetadata && formValues.imagesMetadata[index]
            ? formValues.imagesMetadata[index].altText || ""
            : "",
        title:
          formValues.imagesMetadata && formValues.imagesMetadata[index]
            ? formValues.imagesMetadata[index].title || ""
            : "",
        caption:
          formValues.imagesMetadata && formValues.imagesMetadata[index]
            ? formValues.imagesMetadata[index].caption || ""
            : "",
        description:
          formValues.imagesMetadata && formValues.imagesMetadata[index]
            ? formValues.imagesMetadata[index].description || ""
            : "",
        excludeFromSitemap:
          formValues.imagesMetadata && formValues.imagesMetadata[index]
            ? formValues.imagesMetadata[index].excludeFromSitemap || false
            : false,
      }))

      // Combine all images with their metadata
      const allImages = mainImage ? [mainImage, ...galleryImages] : galleryImages
      formData.append("images", JSON.stringify(allImages))

      // Add schema data
      const schema =
        formValues.schema ||
        JSON.stringify({
          Product: {
            "@context": "https://schema.org",
            "@type": "Product",
            name: formValues.name || "Product",
            description: formValues.description || "",
            image: formValues.mainImage || "",
            offers: {
              "@type": "Offer",
              price: formValues.regularPrice || "0",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
          },
        })
      formData.append("schema", schema)

      // Add color data
      const selectedColors = formValues.specifications?.color || []
      const selectedColorIds = colors.filter((color) => selectedColors.includes(color.name)).map((color) => color.id)
      formData.append("colorIds", JSON.stringify(selectedColorIds))

      // Add color links
      const colorLinks = formValues.categories?.colorVariationLinks || {}
      formData.append("colorLinks", JSON.stringify(colorLinks))
      
      // Add temporary reviews ID and cached reviews if present
      if (formValues.tempReviewsId) {
        formData.append("tempReviewsId", formValues.tempReviewsId)
        console.log("Added tempReviewsId to draft formData:", formValues.tempReviewsId)
      }
      if (formValues.cachedReviews && Array.isArray(formValues.cachedReviews) && formValues.cachedReviews.length > 0) {
        formData.append("cachedReviews", JSON.stringify(formValues.cachedReviews))
        console.log("Added cachedReviews to draft formData:", formValues.cachedReviews.length, "reviews")
      }

      // Log the formData entries for draft
      console.log("FormData entries for draft:")
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${typeof value === "string" ? value.substring(0, 50) : "[complex value]"}...`)
      }

      // Call the server action directly
      console.log("Calling createProduct server action for draft...")
      const result = await createProduct(formData)
      console.log("Draft submission result:", result)

      // Clear cached reviews from localStorage after successful draft save
      const productId = initialData?.id || "new"
      localStorage.removeItem(`cachedReviews_${productId}`)
      if (productId === "new") {
        localStorage.removeItem(`cachedReviews_new`)
      }

      toast({
        title: "Success!",
        description: "Product has been saved as draft successfully.",
      })

      // Navigate to products page
      window.location.href = `/${storeId}/products`
    } catch (err: unknown) {
      console.error("Error saving draft:", err)
      let message = "Something went wrong. Please try again.";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      } else if (err && typeof (err as any).message === 'string') {
        message = (err as any).message;
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Add this right before the submitProductForm function to ensure schema is always included
  // This will run right before form submission
  const ensureSchemaIsIncluded = (values: ProductFormValues) => {
    // If schema is not set, create it from individual schemas
    if (!values.schema) {
      const schema1 = values.schema1
      const schema2 = values.schema2
      const schema3 = values.schema3

      // Create a combined schema object
      const combinedSchema = {}

      try {
        // Process schema1 (Product schema)
        if (schema1) {
          const parsedSchema1 = typeof schema1 === "string" ? JSON.parse(schema1) : schema1
          if (parsedSchema1) {
            // Use templateName if available, or @type, or default to "Product"
            const schemaType = parsedSchema1.templateName || parsedSchema1["@type"] || "Product"
            combinedSchema[schemaType] = parsedSchema1
            console.log(`Added schema1 as ${schemaType} to combined schema`)
          }
        }

        // Process schema2
        if (schema2) {
          const parsedSchema2 = typeof schema2 === "string" ? JSON.parse(schema2) : schema2
          if (parsedSchema2) {
            const schemaType = parsedSchema2.templateName || parsedSchema2["@type"] || "FAQPage"
            combinedSchema[schemaType] = parsedSchema2
            console.log(`Added schema2 as ${schemaType} to combined schema`)
          }
        }

        // Process schema3
        if (schema3) {
          const parsedSchema3 = typeof schema3 === "string" ? JSON.parse(schema3) : schema3
          if (parsedSchema3) {
            const schemaType = parsedSchema3.templateName || parsedSchema3["@type"] || "HowTo"
            combinedSchema[schemaType] = parsedSchema3
            console.log(`Added schema3 as ${schemaType} to combined schema`)
          }
        }

        // If we have at least one schema, set the combined schema
        if (Object.keys(combinedSchema).length > 0) {
          values.schema = JSON.stringify(combinedSchema)
          console.log("Created combined schema before submission with", Object.keys(combinedSchema).length, "schemas")
        }
      } catch (e) {
        console.error("Error creating combined schema before submission:", e)
      }

      // If still no schema, create a minimal default one
      if (!values.schema) {
        const productName = values.name || "Product"
        const productDescription = values.description || ""
        const productImage = values.mainImage || ""
        const productPrice = values.regularPrice || "0"

        const defaultSchema = {
          Product: {
            "@context": "https://schema.org",
            "@type": "Product",
            name: productName,
            description: productDescription,
            image: productImage,
            brand: {
              "@type": "Brand",
              name: values.brandName || "Leather Jacket By Fineyst",
            },
            offers: {
              "@type": "Offer",
              price: productPrice,
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
          },
        }

        values.schema = JSON.stringify(defaultSchema)
        console.log("Created minimal default schema before submission")
      }
    }

    return values
  }

  // Replace the submitProductForm function with this more robust version
  async function submitProductForm(values: ProductFormValues, type: "draft" | "publish") {
    try {
      setIsUploading(true)

      // Validate all required fields
      const validationErrors = validateRequiredFields(values)

      if (validationErrors.length > 0) {
        // Show toast with validation errors
        toast({
          title: "Validation Error",
          description: (
            <div className="space-y-2">
              <p>Please fix the following errors:</p>
              <ul className="list-disc pl-4">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            </div>
          ),
          variant: "destructive",
        })

        // Switch to the appropriate tab based on the first error
        switchToTabWithError(validationErrors[0].field)
        setIsUploading(false)
        return
      }

      // Log the form values and color links for debugging
      const currentFormValues = form.getValues()
      console.log("Form values before submission:", {
        ...currentFormValues,
        colorLinks: currentFormValues.categories?.colorVariationLinks,
      })

      // Create a safe copy of the values to prevent mutation issues
      let safeValues: ProductFormValues = JSON.parse(JSON.stringify(values));

      // Ensure schema is included
      safeValues = ensureSchemaIsIncluded(safeValues)

      // Ensure all required objects and arrays exist
      if (!safeValues.categories) {
        safeValues.categories = {
          gender: "",
          material: [],
          style: [],
          variationColors: [],
          colorVariationLinks: {},
          sizes: [],
        }
      }

      // Ensure all arrays exist
      safeValues.categories.material = Array.isArray(safeValues.categories.material)
        ? safeValues.categories.material
        : []
      safeValues.categories.style = Array.isArray(safeValues.categories.style) ? safeValues.categories.style : []
      safeValues.categories.sizes = Array.isArray(safeValues.categories.sizes) ? safeValues.categories.sizes : []
      safeValues.categories.variationColors = Array.isArray(safeValues.categories.variationColors)
        ? safeValues.categories.variationColors
        : []

      const formData = new FormData()

      // Add current URL for storeId extraction
      formData.append("url", window.location.pathname)

      // Add product ID if we're editing an existing product
      if (initialData) {
        formData.append("id", initialData.id)
        formData.append("storeId", initialData.storeId)
      } else {
        // For new products, ensure storeId is included
        const storeId = params.storeId?.toString()
        if (!storeId) {
          throw new Error("Store ID is required")
        }
        formData.append("storeId", storeId)
      }

      // Ensure storeId is included
      const storeId = params.storeId?.toString() || window.location.pathname.split("/")[1]
      formData.append("storeId", storeId)

      formData.append("submitType", type)
      const formattedSpecs = getFormattedSpecifications()

      // Prepare images with metadata
      const mainImage = safeValues.mainImage
        ? {
            url: safeValues.mainImage,
            altText: safeValues.mainImageMetadata?.altText || "",
            title: safeValues.mainImageMetadata?.title || "",
            caption: safeValues.mainImageMetadata?.caption || "",
            description: safeValues.mainImageMetadata?.description || "",
            excludeFromSitemap: safeValues.mainImageMetadata?.excludeFromSitemap || false,
          }
        : null

      const galleryImages = safeValues.images.map((url, index) => ({
        url,
        altText:
          safeValues.imagesMetadata && safeValues.imagesMetadata[index]
            ? safeValues.imagesMetadata[index].altText || ""
            : "",
        title:
          safeValues.imagesMetadata && safeValues.imagesMetadata[index]
            ? safeValues.imagesMetadata[index].title || ""
            : "",
        caption:
          safeValues.imagesMetadata && safeValues.imagesMetadata[index]
            ? safeValues.imagesMetadata[index].caption || ""
            : "",
        description:
          safeValues.imagesMetadata && safeValues.imagesMetadata[index]
            ? safeValues.imagesMetadata[index].description || ""
            : "",
        excludeFromSitemap:
          safeValues.imagesMetadata && safeValues.imagesMetadata[index]
            ? safeValues.imagesMetadata[index].excludeFromSitemap || false
            : false,
      }))

      // Combine all images with their metadata
      const allImages = mainImage ? [mainImage, ...galleryImages] : galleryImages
      formData.append("images", JSON.stringify(allImages))

      // Handle colorLinks with better error handling
      try {
        // Get selected colors
        const selectedColors = form.getValues("specifications.color") || []

        // Get color links with safer access
        const colorLinksInput = form.getValues("categories.colorVariationLinks") || {}
        console.log("Color links from form before submission:", colorLinksInput)

        // Make sure we always have a clean object
        const colorLinksObj = {}

        // Process each color's link more carefully
        selectedColors.forEach((color) => {
          const colorValue = colorLinksInput[color]

          // Only store valid strings
          if (typeof colorValue === "string") {
            colorLinksObj[color] = colorValue
          } else if (colorValue) {
            // Try to convert to string if possible
            colorLinksObj[color] = String(colorValue)
          } else {
            colorLinksObj[color] = ""
          }
        })

        // Convert to string with better error handling
        const colorLinksString = JSON.stringify(colorLinksObj)

        formData.append("colorLinks", colorLinksString)
        console.log("Color links structure being sent:", colorLinksObj)
        console.log("Color links JSON string being sent:", colorLinksString)
      } catch (error) {
        console.error("Error processing color links for submission:", error)
        formData.append("colorLinks", "{}")
      }

      // Add all form values to formData
      Object.entries(safeValues).forEach(([key, value]) => {
        // Skip images and mainImage as we've already handled them
        if (key === "images" || key === "mainImage" || key === "mainImageMetadata" || key === "imagesMetadata") {
          return
        }

        // Ensure slug is properly included
        if (key === "slug") {
          formData.append("slug", value?.toString() || "") // Send the top-level slug
          console.log("Adding slug to formData:", value)
        } else if (key === "specifications") {
          formData.append("specifications", JSON.stringify(value))
          formData.append("formattedSpecifications", formattedSpecs)
        } else if (key === "categories") {
           const categoriesData = value as ProductFormValues['categories'];
          // Handle categories
          const safeCategories = {
            gender: categoriesData?.gender || "",
            material: Array.isArray(categoriesData?.material) ? categoriesData.material : [],
            style: Array.isArray(categoriesData?.style) ? categoriesData.style : [],
            variationColors: Array.isArray(categoriesData?.variationColors) ? categoriesData.variationColors : [],
            sizes: Array.isArray(categoriesData?.sizes) ? categoriesData.sizes : [],
          }

          formData.append("gender", safeCategories.gender)
          formData.append("material", JSON.stringify(safeCategories.material))
          formData.append("style", JSON.stringify(safeCategories.style))
          formData.append("sizes", JSON.stringify(safeCategories.sizes))
        } else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value))
        } else if (typeof value === "object" && value !== null) {
          // For SEO, ensure its slug is consistent if the main slug is present
          if (key === "seo" && safeValues.slug) {
             const seoObject = { ...value, slug: safeValues.slug };
             formData.append(key, JSON.stringify(seoObject));
          } else {
            formData.append(key, JSON.stringify(value))
          }
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString())
        }
      })


      // Ensure sizes are properly formatted and included in the form data
      if (safeValues.categories && Array.isArray(safeValues.categories.sizes)) {
        formData.append("sizes", JSON.stringify(safeValues.categories.sizes))
        console.log("Appending sizes to formData:", JSON.stringify(safeValues.categories.sizes))
      }

      // Ensure tags are properly included in the form data
      try {
        const tags = form.getValues("tags") || []
        if (Array.isArray(tags)) {
          formData.append("tags", JSON.stringify(tags))
          console.log("Tags being included in form submission:", tags)
        }
      } catch (error) {
        console.error("Error processing tags for submission:", error)
        formData.append("tags", "[]")
      }
      
      // Add temporary reviews ID and cached reviews if present
      const tempReviewsId = form.getValues("tempReviewsId")
      const cachedReviews = form.getValues("cachedReviews")
      
      console.log("Form submission - tempReviewsId:", tempReviewsId)
      console.log("Form submission - cachedReviews:", cachedReviews)
      
      if (tempReviewsId) {
        formData.append("tempReviewsId", tempReviewsId)
        console.log("Added tempReviewsId to formData:", tempReviewsId)
      }
      if (cachedReviews && Array.isArray(cachedReviews) && cachedReviews.length > 0) {
        formData.append("cachedReviews", JSON.stringify(cachedReviews))
        console.log("Added cachedReviews to formData:", cachedReviews.length, "reviews")
      }

      // Ensure the isFeatured value is properly included in the form submission
      formData.append("isFeatured", safeValues.isFeatured.toString())

      // If we're editing, include the category and color IDs
      if (initialData) {
        formData.append("categoryId", initialData.categoryId || "")

        // Get the selected colors from the form specifications
        const selectedColors = form.getValues("specifications.color") || []
        console.log("Selected colors when editing:", selectedColors)

        // Map color names to color IDs
        const selectedColorIds = colors.filter((color) => selectedColors.includes(color.name)).map((color) => color.id)

        console.log("Mapped color IDs for editing:", selectedColorIds)
        formData.append("colorIds", JSON.stringify(selectedColorIds))
      } else {
        // For new products, use the first available category
        if (categories.length > 0) {
          formData.append("categoryId", categories[0].id)
        }

        // Get the selected colors from the form
        const selectedColors = form.getValues("specifications.color") || []
        console.log("Selected colors for new product:", selectedColors)

        // Map color names to color IDs
        const selectedColorIds = colors.filter((color) => selectedColors.includes(color.name)).map((color) => color.id)

        console.log("Mapped color IDs for new product:", selectedColorIds)
        formData.append("colorIds", JSON.stringify(selectedColorIds))
      }

      console.log("Submitting form data...")
      // Ensure schema is properly included in the formData
      if (!form.getValues("schema")) {
        // If no combined schema exists, check for individual schemas
        const schema1 = form.getValues("schema1")
        if (schema1) {
          try {
            const parsedSchema1 = typeof schema1 === "string" ? JSON.parse(schema1) : schema1
            const combinedSchema = { Product: parsedSchema1 }
            formData.append("schema", JSON.stringify(combinedSchema))
            console.log("Adding default product schema to formData")
          } catch (e) {
            console.error("Error creating default schema for form submission:", e)
          }
        }
      }

      // Process combined schema data
      try {
        const schema1 = form.getValues("schema1")
        const schema2 = form.getValues("schema2")
        const schema3 = form.getValues("schema3")

        // Create a combined schema object
        const combinedSchema = {}

        // Process schema1
        if (schema1 && schema1.trim() !== "") {
          try {
            const parsedSchema1 = typeof schema1 === "string" ? JSON.parse(schema1) : schema1
            if (parsedSchema1 && parsedSchema1.templateName) {
              combinedSchema[parsedSchema1.templateName] = parsedSchema1
            } else if (parsedSchema1) {
              // If no templateName, use "Product" as default
              combinedSchema["Product"] = parsedSchema1
            }
          } catch (e) {
            console.error("Error processing schema1 for combined schema:", e)
          }
        }

        // Process schema2
        if (schema2 && schema2.trim() !== "") {
          try {
            const parsedSchema2 = typeof schema2 === "string" ? JSON.parse(schema2) : schema2
            if (parsedSchema2 && parsedSchema2.templateName) {
              combinedSchema[parsedSchema2.templateName] = parsedSchema2
            }
          } catch (e) {
            console.error("Error processing schema2 for combined schema:", e)
          }
        }

        // Process schema3
        if (schema3 && schema3.trim() !== "") {
          try {
            const parsedSchema3 = typeof schema3 === "string" ? JSON.parse(schema3) : schema3
            if (parsedSchema3 && parsedSchema3.templateName) {
              combinedSchema[parsedSchema3.templateName] = parsedSchema3
            }
          } catch (e) {
            console.error("Error processing schema3 for combined schema:", e)
          }
        }

        // Only include if we have at least one valid schema
        if (Object.keys(combinedSchema).length > 0) {
          formData.append("schema", JSON.stringify(combinedSchema))
          console.log("Adding combined schema to formData:", JSON.stringify(combinedSchema).substring(0, 100) + "...")
        } else {
          // Create a minimal default schema if none exists
          const defaultSchema = {
            Product: {
              "@context": "https://schema.org",
              "@type": "Product",
              name: safeValues.name || "Product",
              description: safeValues.description || "",
              image: safeValues.mainImage || "",
              offers: {
                "@type": "Offer",
                price: safeValues.regularPrice || "0",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
              },
            },
          }
          formData.append("schema", JSON.stringify(defaultSchema))
          console.log("Adding default schema to formData")
        }
      } catch (error) {
        console.error("Error creating combined schema for form submission:", error)
        formData.append("schema", "")
      }

      // Log the formData entries for debugging
      console.log("FormData entries:")
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${typeof value === "string" ? value.substring(0, 50) : "[complex value]"}...`)
      }

      // Ensure keywords are properly formatted
      if (safeValues.seo && safeValues.seo.keywords) {
        // Make sure keywords is an array
        if (!Array.isArray(safeValues.seo.keywords)) {
          safeValues.seo.keywords = []
        }

        // Add keywords directly to the top level for database storage
        safeValues.keywords = safeValues.seo.keywords
        console.log("Keywords being submitted:", safeValues.keywords)
      }

      // Ensure sizeDetails are properly included in the form data
      try {
        // Get the selected size IDs from the form
        const selectedSizeIds = form.getValues("categories.sizes") || []
        console.log("Selected size IDs:", selectedSizeIds)

        if (selectedSizeIds.length > 0) {
          // Map size IDs to full size details
          const sizeDetailsArray = selectedSizeIds
            .map((sizeId) => {
              const sizeObj = sizes.find((s) => s.id === sizeId)
              return sizeObj
                ? {
                    id: sizeObj.id,
                    name: sizeObj.name,
                    value: sizeObj.value || sizeObj.name,
                  }
                : null
            })
            .filter(Boolean)

          console.log("Mapped size details:", sizeDetailsArray)

          // Add to form data
          formData.append("sizeDetails", JSON.stringify(sizeDetailsArray))
        }
      } catch (error) {
        console.error("Error processing size details for submission:", error)
        // Default to empty array instead of null
        formData.append("sizeDetails", "[]")
      }

      const result = await createProduct(formData)
      console.log("Form submission result:", result)

      toast({
        title: "Success!",
        description: `Product has been ${type === "draft" ? "saved as draft" : "published"} successfully.`,
      })

      // Form submitted successfully

      // Use the already declared storeId for navigation
      // Use setTimeout to ensure the state updates before navigation
      setTimeout(() => {
        // Use direct window.location navigation to avoid interception
        window.location.href = `/${storeId}/products`
      }, 500)
    } catch (err: unknown) {
      console.error("Error submitting form:", err)
      let message = "Something went wrong. Please try again.";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      } else if (err && typeof (err as any).message === 'string') {
        message = (err as any).message;
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw err // Re-throw to allow caller to handle
    } finally {
      setIsUploading(false)
    }
  }

  // Add this to your form submission handler
  const handleFormSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true)

      // Validate all required fields
      const validationErrors = validateRequiredFields(data)

      if (validationErrors.length > 0) {
        // Show toast with validation errors
        toast({
          title: "Validation Error",
          description: (
            <div className="space-y-2">
              <p>Please fix the following errors:</p>
              <ul className="list-disc pl-4">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            </div>
          ),
          variant: "destructive",
        })

        // Switch to the appropriate tab based on the first error
        switchToTabWithError(validationErrors[0].field)
        setLoading(false)
        return
      }

      // Check if SKU is unique (only for new products or if SKU changed)
      if (initialData?.sku !== data.sku) {
        const response = await fetch(`/api/stores/${params.storeId}/check-sku?sku=${encodeURIComponent(data.sku)}`)
        const result = await response.json()

        if (!result.isUnique) {
          // Use the suggested unique SKU instead
          data.sku = result.uniqueSku

          toast({
            title: "SKU Modified",
            description: `The SKU "${data.sku}" is already in use. The product will be saved with SKU "${result.uniqueSku}" instead.`,
          })
        }
      }

      // When saving as draft, explicitly set isArchived to false
      if (data.isPublished === false) {
        data.isArchived = false
      }

      // Modify the handleFormSubmit function to ensure schema is included
      // Find the handleFormSubmit function and add this right before the axios calls
      data = ensureSchemaIsIncluded(data)

      // Continue with form submission...
      // Rest of the submission logic...
      const toastMessage = initialData ? "Product updated!" : "Product created!"
      try {
        setLoading(true)

        // Add this right before the axios calls in the onSubmit function
        const selectedColors = form.getValues("specifications.color") || []
        const selectedColorIds = colors.filter((color) => selectedColors.includes(color.name)).map((color) => color.id)

        console.log("Selected colors in onSubmit:", selectedColors)
        console.log("Mapped color IDs in onSubmit:", selectedColorIds)

        // Prepare images with metadata for axios
        const mainImage = data.mainImage
          ? {
              url: data.mainImage,
              altText: data.mainImageMetadata?.altText || "",
              title: data.mainImageMetadata?.title || "",
              caption: data.mainImageMetadata?.caption || "",
              description: data.mainImageMetadata?.description || "",
              excludeFromSitemap: data.mainImageMetadata?.excludeFromSitemap || false,
            }
          : null

        const galleryImages = data.images.map((url, index) => ({
          url,
          altText: data.imagesMetadata && data.imagesMetadata[index] ? data.imagesMetadata[index].altText || "" : "",
          title: data.imagesMetadata && data.imagesMetadata[index] ? data.imagesMetadata[index].title || "" : "",
          caption: data.imagesMetadata && data.imagesMetadata[index] ? data.imagesMetadata[index].caption || "" : "",
          description:
            data.imagesMetadata && data.imagesMetadata[index] ? data.imagesMetadata[index].description || "" : "",
          excludeFromSitemap:
            data.imagesMetadata && data.imagesMetadata[index]
              ? data.imagesMetadata[index].excludeFromSitemap || false
              : false,
        }))

        // Combine all images with their metadata
        const allImages = mainImage ? [mainImage, ...galleryImages] : galleryImages

        // Then modify the axios calls to include the colorIds
        if (initialData) {
          await axios.patch(`/api/${params.storeId}/products/${params.productId}`, {
            ...data,
            isPublished: data.status === "published",
            colorIds: selectedColorIds,
            categories: {
              ...data.categories,
              colorVariationLinks: data.categories.colorVariationLinks || {},
            },
            colorLinks: data.categories.colorVariationLinks || {}, // Add this line
            images: allImages, // Use the images with metadata
          })
        } else {
          await axios.post(`/api/${params.storeId}/products`, {
            ...data,
            isPublished: data.status === "published",
            colorIds: selectedColorIds,
            categories: {
              ...data.categories,
              colorVariationLinks: data.categories.colorVariationLinks || {},
            },
            colorLinks: data.categories.colorVariationLinks || {}, // Add this line
            images: allImages, // Use the images with metadata
          })
        }

        router.refresh()

        toast({
          title: "Success!",
          description: toastMessage,
        })

        // Form submitted successfully

        // Use setTimeout to ensure the state updates before navigation
        setTimeout(() => {
          // Use direct window.location navigation to avoid interception
          window.location.href = `/${params.storeId}/products`
        }, 500)
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Something went wrong.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    } catch (error) {
      console.error("Form submission error:", error)
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Function to display validation errors
  const showValidationErrors = () => {
    const errors = form.formState.errors
    console.log("Form validation errors:", errors)

    // Create a list of error messages
    const errorMessages: string[] = []

    // Check for errors in each section
    if (errors.name) errorMessages.push("Product name is required")
    if (errors.description) errorMessages.push("Description is required")
    if (errors.images) errorMessages.push("At least one image is required")
    if (errors.regularPrice) errorMessages.push("Regular price is required")
    if (errors.sku) errorMessages.push("SKU is required")
    if (errors.stockStatus) errorMessages.push("Stock status is required")

    // SEO errors
    const seoErrors = errors.seo as FieldErrorsImpl<ProductFormValues['seo']> | FieldError | undefined;

    if (seoErrors) {
      // Check if seoErrors is for the object itself (FieldError) or for its fields (FieldErrorsImpl)
      if ('message' in seoErrors && seoErrors.message) { // It's a FieldError for the 'seo' object
        // errorMessages.push(seoErrors.message); // Optionally add this if you set errors on 'seo' path directly
      } else { // It's likely FieldErrorsImpl for child fields
        const seoFieldErrors = seoErrors as FieldErrorsImpl<ProductFormValues['seo']>;
        if (seoFieldErrors.metaTitle) errorMessages.push("Meta title is required");
        if (seoFieldErrors.metaDescription) errorMessages.push("Meta description is required");
        if (seoFieldErrors.slug) errorMessages.push("Slug is required");
      }
    }


    // Show toast with error messages
    if (errorMessages.length > 0) {
      toast({
        title: "Validation Error",
        description: (
          <div className="space-y-2">
            <p>Please fix the following errors:</p>
            <ul className="list-disc pl-4">
              {errorMessages.map((errorMsg, index) => (
                <li key={index}>{errorMsg}</li>
              ))}
            </ul>
          </div>
        ),
        variant: "destructive",
      })

      // Switch to the tab with errors
      if (
        errors.name ||
        errors.description ||
        errors.images ||
        errors.regularPrice ||
        errors.sku ||
        errors.stockStatus
      ) {
        setActiveTab("general")
      } else if (errors.seo) {
        setActiveTab("seo")
      } else if (errors.categories) {
        setActiveTab("general")
      }
    }

    return errorMessages.length === 0
  }

  const handleDraft = () => {
    console.log("Draft button clicked")

    // Validate all required fields
    const formValues = form.getValues()
    const validationErrors = validateRequiredFields(formValues)

    if (validationErrors.length > 0) {
      // Show toast with validation errors
      toast({
        title: "Validation Error",
        description: (
          <div className="space-y-2">
            <p>Please fix the following errors:</p>
            <ul className="list-disc pl-4">
              {validationErrors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </div>
        ),
        variant: "destructive",
      })

      // Switch to the appropriate tab based on the first error
      switchToTabWithError(validationErrors[0].field)
      return
    }

    // For draft, we don't need to validate as strictly
    setSubmitType("draft")
    onSubmit(form.getValues())
  }

  // Dummy functions for now
  const calculateSeoScore = () => 0
  const getSeoScoreColor = () => "gray"
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  // Update the handleSaveDraft function to reset formSubmitted state
  const onSubmit = (data: ProductFormValues) => {
    console.log("Form submitted with data:", data)
    handleFormSubmit(data)
  }

  return (
    <Form {...form}>
      <div className="space-y-8">
        <CompletionChecklist form={form} />
        <SeoScoreIndicator />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b rounded-none mb-6">
            <div
              className="flex w-full gap-1 p-1 bg-primary dark:bg-white rounded-lg shadow-sm"
              role="tablist"
              aria-orientation="horizontal"
            >
              <TabsTrigger
                value="general"
                className="flex-1 relative px-6 py-3 text-base font-semibold rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-primary dark:data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:bg-transparent data-[state=inactive]:text-white dark:data-[state=inactive]:text-gray-800 data-[state=inactive]:hover:bg-primary/80 dark:data-[state=inactive]:hover:bg-white/80 transition-all duration-200"
                aria-selected={activeTab === "general"}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M20 9v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9" />
                    <path d="M9 2h6a2 2 0 0 1 2 2v5H7V4a2 2 0 0 1 2- 2 0 0 1 2-" />
                  </svg>
                  <span>General</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="seo"
                className="flex-1 relative px-6 py-3 text-base font-semibold rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-primary dark:data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:bg-transparent data-[state=inactive]:text-white dark:data-[state=inactive]:text-gray-800 data-[state=inactive]:hover:bg-primary/80 dark:data-[state=inactive]:hover:bg-white/80 transition-all duration-200"
                aria-selected={activeTab === "seo"}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <span>SEO</span>
                </div>
              </TabsTrigger>
            </div>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <GeneralTab
              form={form}
              isUploading={isUploading}
              getFormattedSpecifications={getFormattedSpecifications}
              sizes={sizes}
              colors={colors}
              categories={categorizedCategories}
              storeId={params.storeId?.toString()}
              currentProductId={initialData?.id}
            />
          </TabsContent>

          <TabsContent value="seo" className="mt-6">
            <SeoTab form={form} initialData={initialData} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-8">
          <Button
            type="button"
            variant="outline"
            className="transition-all duration-200 hover:bg-muted"
            onClick={() => {
              console.log("Save Draft button clicked - direct handler")
              handleSaveDraft()
            }}
            disabled={isUploading || loading}
          >
            {isUploading || loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save as Draft"
            )}
          </Button>
          <Button
            type="button"
            disabled={isUploading || loading}
            className="transition-all duration-200 hover:opacity-90"
            onClick={() => {
              console.log("Publish button clicked - direct handler")
              handlePublish()
            }}
          >
            {isUploading || loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish Product"
            )}
          </Button>
        </div>
      </div>

    </Form>
  )
}
