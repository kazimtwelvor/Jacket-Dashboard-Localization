"use client"
import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type FieldError, type FieldErrorsImpl } from "react-hook-form"
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

const safeJsonParse = (value: any, fallback: any = null) => {
  if (typeof value === "object" && value !== null) {
    return value
  }
  if (typeof value === "string") {
    if (value === "[object Object]" || value === "[object Object]" || value.trim() === "[object Object]") {
      return fallback
    }
    
    if (value.trim() === "") {
      return fallback
    }
    
    try {
      return JSON.parse(value)
    } catch (error) {
      console.error("JSON parse error:", error, "value:", value)
      return fallback
    }
  }
  return fallback
}
import type { Product, Category, Size, Color } from "../../types"
import axios from "axios"
import { useStoreName } from "./store-name-provider"

export interface ProductFormProps {
  initialData: Product | null
  colors: Color[]
  sizes: Size[]
  categories: Category[]
}


const organizeCategoriesByType = (categories: Category[]) => {
  const genderCategories: Category[] = []
  const materialCategories: Category[] = []
  const styleCategories: Category[] = []

  console.log("Raw categories from database:", categories)

  categories.forEach((category) => {
    if ((category as any)?.type) {
      if ((category as any)?.type.toLowerCase() === "gender") {
        genderCategories.push(category)
      } else if ((category as any)?.type.toLowerCase() === "material") {
        materialCategories.push(category)
      } else if ((category as any)?.type.toLowerCase() === "style") {
        styleCategories.push(category)
      }
    } else {
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

  const nameTimerRef = useRef<number | null>(null)
  const descriptionTimerRef = useRef<number | null>(null)


  const extractSizeDetails = () => {
    if (initialData && initialData.sizeDetails) {
      console.log("Raw sizeDetails from initialData:", initialData.sizeDetails)

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

  const processColorLinks = () => {
    if (!initialData) {
      console.log("No initial data available for color links")
      return {}
    }

    console.log("Raw initialData.colorLinks:", initialData.colorLinks)
    console.log("Raw initialData.colorLinks type:", typeof initialData.colorLinks)

    try {
      if (typeof initialData.colorLinks === "object" && initialData.colorLinks !== null) {
        console.log("colorLinks is already an object:", initialData.colorLinks)
        return initialData.colorLinks
      }

      if (typeof initialData.colorLinks === "string") {
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

  const parsedInitialData = initialData
    ? {
      mainImage: initialData.images.length > 0 ? initialData.images[0].url : "",
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
      images: initialData.images.length > 1 ? initialData.images.slice(1).map((img) => img.url) : [],
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
      specifications: safeJsonParse(initialData.specifications, {
        externalMaterial: [],
        internalMaterial: [],
        collar: [],
        closure: [],
        cuffs: [],
        pockets: [],
        color: [],
      }),
      status: initialData.isArchived === true ? "draft" : "published",
      regularPrice: initialData.price.toString(),
      salePrice: initialData.salePrice ? initialData.salePrice.toString() : "",
      sku: initialData.sku || "",
      stockStatus: initialData.stockStatus || "instock",
      isFeatured: initialData.isFeatured || false,
      brandName: initialData.brandName || "Leather Jacket By Fineyst",
      // ratingValue: initialData.ratingValue || "4.5",
      // reviewCount: initialData.reviewCount || "0",
      categories: {
        gender: initialData.gender || "",
        material: (() => {
          if (initialData.categoryData && typeof initialData.categoryData === 'object') {
            const categoryData = initialData.categoryData as any
            if (categoryData.material) {
              return Array.isArray(categoryData.material) ? categoryData.material : [categoryData.material]
            }
          }
          return Array.isArray(initialData.material) ? initialData.material : []
        })(),
        style: (() => {
          if (initialData.categoryData && typeof initialData.categoryData === 'object') {
            const categoryData = initialData.categoryData as any
            if (categoryData.style) {
              return Array.isArray(categoryData.style) ? categoryData.style : [categoryData.style]
            }
          }
          return Array.isArray(initialData.style) ? initialData.style : []
        })(),
        variationColors: (() => {
          const specs = safeJsonParse(initialData.specifications, {})
          return specs.color || []
        })(),
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
        colorVariationLinks: processColorLinks(),
      },
      tags: initialData.tags || [],
      // purchaseNote: initialData.purchaseNote || "",
      relatedProducts: Array.isArray((initialData as any).relatedProducts) ? (initialData as any).relatedProducts : [],
      menuOrder: initialData.menuOrder?.toString() || "0",
      reviews: true,
      seo: {
        metaTitle: initialData.metaTitle || "",
        metaDescription: initialData.metaDescription || "",
        slug: initialData.slug || "",
        keywords: Array.isArray((initialData as any)?.keywords)
          ? (initialData as any)?.keywords
          : initialData.focusKeyword
            ? [initialData.focusKeyword, ...(initialData.additionalKeywords || [])]
            : initialData.additionalKeywords || [],
        isPillarContent: false,
        // noIndex: initialData.noIndex || false,
        seoScore: 0,
        canonicalUrl: "",
        structuredData: true,
      },
      schema: initialData.schema || "",
      tempReviewsId: "",
      isParentProduct: (initialData as any).isParentProduct || false,
      parentProductId: (initialData as any).parentProductId || "",
      schema1: (() => {
        try {
          if (initialData.schema) {
            if (typeof initialData.schema === "string" && initialData.schema.trim() === "[object Object]") {
              return ""
            }
            
            const schemaObj =
              typeof initialData.schema === "string" ? JSON.parse(initialData.schema) : initialData.schema
            if (schemaObj.Product) {
              return JSON.stringify(schemaObj.Product, null, 2)
            }

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
            if (typeof initialData.schema === "string" && initialData.schema.trim() === "[object Object]") {
              return ""
            }
            
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
            if (typeof initialData.schema === "string" && initialData.schema.trim() === "[object Object]") {
              return ""
            }
            
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
      // ratingValue: "4.5",
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
      // purchaseNote: "",
      relatedProducts: [],

      // Debug log for new product
      menuOrder: "0",
      reviews: true,
      seo: {
        metaTitle: "",
        metaDescription: "",
        slug: "", // Initialize seo.slug as empty
        keywords: [],
        isPillarContent: false,
        // noIndex: false, // Ensure this defaults to false for new products
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
      isParentProduct: false,
      parentProductId: "",
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
        rawKeywords: (initialData as any).keywords,
        keywordsType: typeof (initialData as any).keywords,
        isArray: Array.isArray((initialData as any).keywords),
        parsedKeywords: form.getValues("seo.keywords"),
        focusKeyword: initialData.focusKeyword,
        additionalKeywords: initialData.additionalKeywords,
      })

      if (typeof (initialData as any).keywords === "string" && (initialData as any).keywords.trim() !== "") {
        const keywordsString = (initialData as any).keywords.trim()
        
        if (keywordsString === "[object Object]") {
          return
        }
        
        try {
          const parsedKeywords = JSON.parse(keywordsString)
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
        rawKeywords: (initialData as any).keywords,
        parsedKeywords: form.getValues("seo.keywords"),
        keywordsType: typeof (initialData as any).keywords,
        isArray: Array.isArray((initialData as any).keywords),
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
    let nameSubscription: any;
    let descriptionSubscription: any;
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


  const handlePublish = async () => {
    console.log("Publish button clicked - Direct submission approach")
    setIsUploading(true)

    try {
      const formValues = form.getValues()

      const formData = new FormData()

      formData.append("url", window.location.pathname)

      if (initialData) {
        formData.append("id", initialData.id)
        formData.append("storeId", initialData.storeId)
      }

      const storeId = params?.storeId?.toString() || window.location.pathname.split("/")[1]
      formData.append("storeId", storeId)

      formData.append("submitType", "publish")
      formData.append("isParentProduct", formValues.isParentProduct ? "true" : "false")
      formData.append("parentProductId", formValues.parentProductId || "")

      formData.append("name", formValues.name || "")
      formData.append("slug", formValues.slug || "")
      formData.append("description", formValues.description || "")
      formData.append("regularPrice", formValues.regularPrice || "0")
      formData.append("salePrice", formValues.salePrice || "0")
      formData.append("sku", formValues.sku || "")
      formData.append("stockStatus", formValues.stockStatus || "instock")
      formData.append("isFeatured", formValues.isFeatured ? "true" : "false")

      if (formValues.specifications) {
        formData.append("specifications", JSON.stringify(formValues.specifications))
      }

      if (formValues.tags && Array.isArray(formValues.tags)) {
        formData.append("tags", JSON.stringify(formValues.tags))
      }

      if (formValues.relatedProducts && Array.isArray(formValues.relatedProducts)) {
        formData.append("relatedProducts", JSON.stringify(formValues.relatedProducts))
      }

      if (formValues.categories) {
        formData.append("gender", formValues.categories.gender || "")
        formData.append("material", JSON.stringify(formValues.categories.material || []))
        formData.append("style", JSON.stringify(formValues.categories.style || []))
        formData.append("sizes", JSON.stringify(formValues.categories.sizes || []))
      }

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

      if (formValues.seo) {
        const seoData = { ...formValues.seo };
        if (formValues.slug) {
          seoData.slug = formValues.slug;
        }
        formData.append("seo", JSON.stringify(seoData))
      }


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

      const allImages = mainImage ? [mainImage, ...galleryImages] : galleryImages
      formData.append("images", JSON.stringify(allImages))

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

      const selectedColors = formValues.specifications?.color || []
      const selectedColorIds = colors.filter((color) => selectedColors.includes(color.name)).map((color) => color.id)
      formData.append("colorIds", JSON.stringify(selectedColorIds))

      const colorLinks = formValues.categories?.colorVariationLinks || {}
      formData.append("colorLinks", JSON.stringify(colorLinks))

      if (formValues.tempReviewsId) {
        formData.append("tempReviewsId", formValues.tempReviewsId)
      }
      if (formValues.cachedReviews && Array.isArray(formValues.cachedReviews) && formValues.cachedReviews.length > 0) {
        formData.append("cachedReviews", JSON.stringify(formValues.cachedReviews))
      }

      console.log("FormData entries:")
      for (const [key, value] of Array.from(formData?.entries() || [])) {
        console.log(`${key}: ${typeof value === "string" ? value.substring(0, 50) : "[complex value]"}...`)
      }

      const result = await createProduct(formData)

      const productId = initialData?.id || "new"
      localStorage.removeItem(`cachedReviews_${productId}`)
      if (productId === "new") {
        localStorage.removeItem(`cachedReviews_new`)
      }

      toast({
        title: "Success!",
        description: "Product has been published successfully.",
      })

      window.location.href = `/${storeId}/products`
    } catch (err: unknown) {
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

  const handleSaveDraft = async () => {
    console.log("Save Draft clicked - Direct submission approach")
    setIsUploading(true)

    try {
      const formValues = form.getValues()
      console.log("Current form values for draft:", formValues)

      const formData = new FormData()

      formData.append("url", window.location.pathname)

      if (initialData) {
        formData.append("id", initialData.id)
        formData.append("storeId", initialData.storeId)
      }

      const storeId = params?.storeId?.toString() || window.location.pathname.split("/")[1]
      formData.append("storeId", storeId)

      formData.append("submitType", "draft")

      formData.append("name", formValues.name || "")
      formData.append("slug", formValues.slug || "")
      formData.append("description", formValues.description || "")
      formData.append("regularPrice", formValues.regularPrice || "0")
      formData.append("salePrice", formValues.salePrice || "0")
      formData.append("sku", formValues.sku || "")
      formData.append("stockStatus", formValues.stockStatus || "instock")
      formData.append("isFeatured", formValues.isFeatured ? "true" : "false")

      if (formValues.specifications) {
        formData.append("specifications", JSON.stringify(formValues.specifications))
      }

      if (formValues.tags && Array.isArray(formValues.tags)) {
        formData.append("tags", JSON.stringify(formValues.tags))
      }

      if (formValues.relatedProducts && Array.isArray(formValues.relatedProducts)) {
        formData.append("relatedProducts", JSON.stringify(formValues.relatedProducts))
      }

      if (formValues.categories) {
        formData.append("gender", formValues.categories.gender || "")
        formData.append("material", JSON.stringify(formValues.categories.material || []))
        formData.append("style", JSON.stringify(formValues.categories.style || []))
        formData.append("sizes", JSON.stringify(formValues.categories.sizes || []))
      }

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

          formData.append("sizeDetails", JSON.stringify(sizeDetailsArray))
        } else {
          formData.append("sizeDetails", "[]")
        }
      } catch (error) {
        formData.append("sizeDetails", "[]")
      }

      if (formValues.seo) {
        const seoData = { ...formValues.seo };
        if (formValues.slug) {
          seoData.slug = formValues.slug;
        }
        formData.append("seo", JSON.stringify(seoData))
      }


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

      const allImages = mainImage ? [mainImage, ...galleryImages] : galleryImages
      formData.append("images", JSON.stringify(allImages))

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

      const selectedColors = formValues.specifications?.color || []
      const selectedColorIds = colors.filter((color) => selectedColors.includes(color.name)).map((color) => color.id)
      formData.append("colorIds", JSON.stringify(selectedColorIds))

      const colorLinks = formValues.categories?.colorVariationLinks || {}
      formData.append("colorLinks", JSON.stringify(colorLinks))

      if (formValues.tempReviewsId) {
        formData.append("tempReviewsId", formValues.tempReviewsId)
        console.log("Added tempReviewsId to draft formData:", formValues.tempReviewsId)
      }
      if (formValues.cachedReviews && Array.isArray(formValues.cachedReviews) && formValues.cachedReviews.length > 0) {
        formData.append("cachedReviews", JSON.stringify(formValues.cachedReviews))
        console.log("Added cachedReviews to draft formData:", formValues.cachedReviews.length, "reviews")
      }

      console.log("FormData entries for draft:")
      for (const [key, value] of Array.from(formData?.entries() || [])) {
        console.log(`${key}: ${typeof value === "string" ? value.substring(0, 50) : "[complex value]"}...`)
      }

      console.log("Calling createProduct server action for draft...")
      const result = await createProduct(formData)
      console.log("Draft submission result:", result)

      const productId = initialData?.id || "new"
      localStorage.removeItem(`cachedReviews_${productId}`)
      if (productId === "new") {
        localStorage.removeItem(`cachedReviews_new`)
      }

      toast({
        title: "Success!",
        description: "Product has been saved as draft successfully.",
      })

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

  const ensureSchemaIsIncluded = (values: ProductFormValues) => {
    if (!values.schema) {
      const schema1 = values.schema1
      const schema2 = values.schema2
      const schema3 = values.schema3

      const combinedSchema: any = {}

      try {
        if (schema1 && schema1.trim() !== "" && schema1.trim() !== "[object Object]") {
          const parsedSchema1 = typeof schema1 === "string" ? JSON.parse(schema1) : schema1
          if (parsedSchema1) {
            const schemaType = parsedSchema1.templateName || parsedSchema1["@type"] || "Product"
            combinedSchema[schemaType] = parsedSchema1

          }
        }

        if (schema2 && schema2.trim() !== "" && schema2.trim() !== "[object Object]") {
          const parsedSchema2 = typeof schema2 === "string" ? JSON.parse(schema2) : schema2
          if (parsedSchema2) {
            const schemaType = parsedSchema2.templateName || parsedSchema2["@type"] || "FAQPage"
            combinedSchema[schemaType] = parsedSchema2
            console.log(`Added schema2 as ${schemaType} to combined schema`)
          }
        }

        if (schema3 && schema3.trim() !== "" && schema3.trim() !== "[object Object]") {
          const parsedSchema3 = typeof schema3 === "string" ? JSON.parse(schema3) : schema3
          if (parsedSchema3) {
            const schemaType = parsedSchema3.templateName || parsedSchema3["@type"] || "HowTo"
            combinedSchema[schemaType] = parsedSchema3
            console.log(`Added schema3 as ${schemaType} to combined schema`)
          }
        }

        if (Object.keys(combinedSchema).length > 0) {
          values.schema = JSON.stringify(combinedSchema)
          console.log("Created combined schema before submission with", Object.keys(combinedSchema).length, "schemas")
        }
      } catch (e) {
        console.error("Error creating combined schema before submission:", e)
      }

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

  async function submitProductForm(values: ProductFormValues, type: "draft" | "publish") {
    try {
      setIsUploading(true)

      const validationErrors = validateRequiredFields(values)

      if (validationErrors.length > 0) {
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

        switchToTabWithError(validationErrors[0].field)
        setIsUploading(false)
        return
      }

      const currentFormValues = form.getValues()
      console.log("Form values before submission:", {
        ...currentFormValues,
        colorLinks: currentFormValues.categories?.colorVariationLinks,
      })

      let safeValues: ProductFormValues = JSON.parse(JSON.stringify(values));

      safeValues = ensureSchemaIsIncluded(safeValues)

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

      safeValues.categories.material = Array.isArray(safeValues.categories.material)
        ? safeValues.categories.material
        : []
      safeValues.categories.style = Array.isArray(safeValues.categories.style) ? safeValues.categories.style : []
      safeValues.categories.sizes = Array.isArray(safeValues.categories.sizes) ? safeValues.categories.sizes : []
      safeValues.categories.variationColors = Array.isArray(safeValues.categories.variationColors)
        ? safeValues.categories.variationColors
        : []

      const formData = new FormData()

      formData.append("url", window.location.pathname)

      if (initialData) {
        formData.append("id", initialData.id)
        formData.append("storeId", initialData.storeId)
      } else {
        const storeId = params?.storeId?.toString()
        if (!storeId) {
          throw new Error("Store ID is required")
        }
        formData.append("storeId", storeId)
      }

      const storeId = params?.storeId?.toString() || window.location.pathname.split("/")[1]
      formData.append("storeId", storeId)

      formData.append("submitType", type)
      const formattedSpecs = getFormattedSpecifications()

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

      const allImages = mainImage ? [mainImage, ...galleryImages] : galleryImages
      formData.append("images", JSON.stringify(allImages))

      try {
        const selectedColors = form.getValues("specifications.color") || []

        const colorLinksInput = form.getValues("categories.colorVariationLinks") || {}
        console.log("Color links from form before submission:", colorLinksInput)

        const colorLinksObj: any = {}

        selectedColors.forEach((color) => {
          const colorValue = colorLinksInput[color]
          if (typeof colorValue === "string") {
            colorLinksObj[color] = colorValue
          } else if (colorValue) {
            colorLinksObj[color] = String(colorValue)
          } else {
            colorLinksObj[color] = ""
          }
        })

        const colorLinksString = JSON.stringify(colorLinksObj)

        formData.append("colorLinks", colorLinksString)
        console.log("Color links structure being sent:", colorLinksObj)
        console.log("Color links JSON string being sent:", colorLinksString)
      } catch (error) {
        console.error("Error processing color links for submission:", error)
        formData.append("colorLinks", "{}")
      }

      Object.entries(safeValues).forEach(([key, value]) => {
        if (key === "images" || key === "mainImage" || key === "mainImageMetadata" || key === "imagesMetadata") {
          return
        }

        if (key === "slug") {
          formData.append("slug", value?.toString() || "")
          console.log("Adding slug to formData:", value)
        } else if (key === "specifications") {
          formData.append("specifications", JSON.stringify(value))
          formData.append("formattedSpecifications", formattedSpecs)
        } else if (key === "categories") {
          const categoriesData = value as ProductFormValues['categories'];
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


      if (safeValues.categories && Array.isArray(safeValues.categories.sizes)) {
        formData.append("sizes", JSON.stringify(safeValues.categories.sizes))
        console.log("Appending sizes to formData:", JSON.stringify(safeValues.categories.sizes))
      }

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

      const tempReviewsId = form.getValues("tempReviewsId")
      const cachedReviews = form.getValues("cachedReviews")


      if (tempReviewsId) {
        formData.append("tempReviewsId", tempReviewsId)
      }
      if (cachedReviews && Array.isArray(cachedReviews) && cachedReviews.length > 0) {
        formData.append("cachedReviews", JSON.stringify(cachedReviews))
      }

      formData.append("isFeatured", safeValues.isFeatured.toString())

      if (initialData) {
        formData.append("categoryId", (initialData as any).categoryId || "")

        const selectedColors = form.getValues("specifications.color") || []

        const selectedColorIds = colors.filter((color) => selectedColors.includes(color.name)).map((color) => color.id)

        formData.append("colorIds", JSON.stringify(selectedColorIds))
      } else {
        if (categories.length > 0) {
          formData.append("categoryId", categories[0].id)
        }

        const selectedColors = form.getValues("specifications.color") || []
        console.log("Selected colors for new product:", selectedColors)

        const selectedColorIds = colors.filter((color) => selectedColors.includes(color.name)).map((color) => color.id)

        console.log("Mapped color IDs for new product:", selectedColorIds)
        formData.append("colorIds", JSON.stringify(selectedColorIds))
      }

      console.log("Submitting form data...")
      if (!form.getValues("schema")) {
        const schema1 = form.getValues("schema1")
        if (schema1 && schema1.trim() !== "" && schema1.trim() !== "[object Object]") {
          try {
            const parsedSchema1 = typeof schema1 === "string" ? JSON.parse(schema1) : schema1
            const combinedSchema = { Product: parsedSchema1 }
            formData.append("schema", JSON.stringify(combinedSchema))
          } catch (e) {
            console.error("Error parsing schema1 in submission:", e)
          }
        }
      }

      try {
        const schema1 = form.getValues("schema1")
        const schema2 = form.getValues("schema2")
        const schema3 = form.getValues("schema3")

        const combinedSchema: any = {}

        if (schema1 && schema1.trim() !== "" && schema1.trim() !== "[object Object]") {
          try {
            const parsedSchema1 = typeof schema1 === "string" ? JSON.parse(schema1) : schema1
            if (parsedSchema1 && parsedSchema1.templateName) {
              combinedSchema[parsedSchema1.templateName] = parsedSchema1
            } else if (parsedSchema1) {
              combinedSchema["Product"] = parsedSchema1
            }
          } catch (e) {
            console.error("Error processing schema1 for combined schema:", e)
          }
        }

        if (schema2 && schema2.trim() !== "" && schema2.trim() !== "[object Object]") {
          try {
            const parsedSchema2 = typeof schema2 === "string" ? JSON.parse(schema2) : schema2
            if (parsedSchema2 && parsedSchema2.templateName) {
              combinedSchema[parsedSchema2.templateName] = parsedSchema2
            }
          } catch (e) {
            console.error("Error processing schema2 for combined schema:", e)
          }
        }

        if (schema3 && schema3.trim() !== "" && schema3.trim() !== "[object Object]") {
          try {
            const parsedSchema3 = typeof schema3 === "string" ? JSON.parse(schema3) : schema3
            if (parsedSchema3 && parsedSchema3.templateName) {
              combinedSchema[parsedSchema3.templateName] = parsedSchema3
            }
          } catch (e) {
            console.error("Error processing schema3 for combined schema:", e)
          }
        }

        if (Object.keys(combinedSchema).length > 0) {
          formData.append("schema", JSON.stringify(combinedSchema))
          console.log("Adding combined schema to formData:", JSON.stringify(combinedSchema).substring(0, 100) + "...")
        } else {
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

      console.log("FormData entries:")
      for (const [key, value] of Array.from(formData.entries())) {
        console.log(`${key}: ${typeof value === "string" ? value.substring(0, 50) : "[complex value]"}...`)
      }

      if (safeValues.seo && safeValues.seo.keywords) {
        if (!Array.isArray(safeValues.seo.keywords)) {
          safeValues.seo.keywords = []
        }

        (safeValues as any).keywords = safeValues.seo.keywords
        console.log("Keywords being submitted:", (safeValues as any).keywords)
      }

      try {
        try {
          const selectedSizeIds = form.getValues("categories.sizes") || []
          console.log("Selected size IDs:", selectedSizeIds)

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

            console.log("Mapped size details:", sizeDetailsArray)

            formData.append("sizeDetails", JSON.stringify(sizeDetailsArray))
          }
        } catch (error) {
          console.error("Error processing size details for submission:", error)
          formData.append("sizeDetails", "[]")
        }

        const result = await createProduct(formData)
        console.log("Form submission result:", result)

        toast({
          title: "Success!",
          description: `Product has been ${type === "draft" ? "saved as draft" : "published"} successfully.`,
        })

        setTimeout(() => {
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
        throw err
      } finally {
        setIsUploading(false)
      }
    } catch (err: unknown) {
      console.error("Error submitting form:", err)
      let message = "Something went wrong. Please try again."
      if (err instanceof Error) {
        message = err.message
      } else if (typeof err === 'string') {
        message = err
      } else if (err && typeof (err as any).message === 'string') {
        message = (err as any).message
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw err
    } finally {
      setIsUploading(false)
    }
  }

  const handleFormSubmit = async (data: ProductFormValues) => {
      try { 
        setLoading(true)

        const validationErrors = validateRequiredFields(data)

        if (validationErrors.length > 0) {
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

          switchToTabWithError(validationErrors[0].field)
          setLoading(false)
          return
        }

        if (initialData?.sku !== data.sku) {
          const response = await fetch(`/api/stores/${params?.storeId}/check-sku?sku=${encodeURIComponent(data.sku)}`)
          const result = await response.json()

          if (!result.isUnique) {
            data.sku = result.uniqueSku

            toast({
              title: "SKU Modified",
              description: `The SKU "${data.sku}" is already in use. The product will be saved with SKU "${result.uniqueSku}" instead.`,
            })
          }
        }

        if ((data as any).isPublished === false) {
          (data as any).isArchived = false
        }

        data = ensureSchemaIsIncluded(data)

        const toastMessage = initialData ? "Product updated!" : "Product created!"

        const selectedColors = form.getValues("specifications.color") || []
        const selectedColorIds = colors.filter((color) => selectedColors.includes(color.name)).map((color) => color.id)

        console.log("Selected colors in onSubmit:", selectedColors)
        console.log("Mapped color IDs in onSubmit:", selectedColorIds)

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

        const allImages = mainImage ? [mainImage, ...galleryImages] : galleryImages

        if (initialData) {
          await axios.patch(`/api/${params?.storeId}/products/${params?.productId}`, {
            ...data,
            isPublished: (data as any).status === "published",
            colorIds: selectedColorIds,
            categories: {
              ...data.categories,
              colorVariationLinks: data.categories.colorVariationLinks || {},
            },
            colorLinks: data.categories.colorVariationLinks || {},
            images: allImages,
          })
        } else {
          await axios.post(`/api/${params?.storeId}/products`, {
            ...data,
            isPublished: (data as any).status === "published",
            colorIds: selectedColorIds,
            categories: {
              ...data.categories,
              colorVariationLinks: data.categories.colorVariationLinks || {},
            },
            colorLinks: data.categories.colorVariationLinks || {},
            images: allImages,
          })
        }

        router.refresh()

        toast({
          title: "Success!",
          description: toastMessage,
        })

        setTimeout(() => {
          window.location.href = `/${params?.storeId}/products`
        }, 500)
      } catch (error: any) {
        console.error("Form submission error:", error)
        toast({
          title: "Error",
          description: error.message || "Something went wrong",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    const showValidationErrors = () => {
      const errors = form.formState.errors

      const errorMessages: string[] = []

      if (errors.name) errorMessages.push("Product name is required")
      if (errors.description) errorMessages.push("Description is required")
      if (errors.images) errorMessages.push("At least one image is required")
      if (errors.regularPrice) errorMessages.push("Regular price is required")
      if (errors.sku) errorMessages.push("SKU is required")
      if (errors.stockStatus) errorMessages.push("Stock status is required")

      const seoErrors = errors.seo as FieldErrorsImpl<ProductFormValues['seo']> | FieldError | undefined;

      if (seoErrors) {
        if ('message' in seoErrors && seoErrors.message) {
        } else {
          const seoFieldErrors = seoErrors as FieldErrorsImpl<ProductFormValues['seo']>;
          if (seoFieldErrors.metaTitle) errorMessages.push("Meta title is required");
          if (seoFieldErrors.metaDescription) errorMessages.push("Meta description is required");
          if (seoFieldErrors.slug) errorMessages.push("Slug is required");
        }
      }


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

      const formValues = form.getValues()
      const validationErrors = validateRequiredFields(formValues)

      if (validationErrors.length > 0) {
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

        switchToTabWithError(validationErrors[0].field)
        return
      }

      setSubmitType("draft")
      onSubmit(form.getValues())
    }

    const calculateSeoScore = () => 0
    const getSeoScoreColor = () => "gray"
    const handleTabChange = (tab: string) => {
      setActiveTab(tab)
    }

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
                className="flex w-full gap-1 p-1 bg-primary dark:bg-primary rounded-lg shadow-sm"
                role="tablist"
                aria-orientation="horizontal"
              >
                <TabsTrigger
                  value="general"
                  className="flex-1 relative px-6 py-3 text-base font-semibold rounded-md data-[state=active]:bg-background data-[state=active]:text-primary dark:data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:bg-transparent data-[state=inactive]:text-white dark:data-[state=inactive]:text-white data-[state=inactive]:hover:bg-background/20 transition-all duration-200"
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
                  className="flex-1 relative px-6 py-3 text-base font-semibold rounded-md data-[state=active]:bg-background data-[state=active]:text-primary dark:data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:bg-transparent data-[state=inactive]:text-white dark:data-[state=inactive]:text-white data-[state=inactive]:hover:bg-background/20 transition-all duration-200"
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
                storeId={params?.storeId?.toString()}
                currentProductId={initialData?.id}
              />
            </TabsContent>

            <TabsContent value="seo" className="mt-6">
              <SeoTab form={form} initialData={initialData as any} />
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