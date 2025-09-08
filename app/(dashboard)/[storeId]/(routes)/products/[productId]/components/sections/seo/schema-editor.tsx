"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Check, Code, Eye, AlertCircle, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ProductData {
  id?: string
  name: string
  description: string
  price: string
  salePrice?: string
  isDiscounted?: boolean
  mainImage: string
  images: any[]
  brandName?: string
  sku: string
  stockStatus: string
  specifications: any
  material: string[]
  style: string[]
  gender: string
  tags: string[]
  ratingValue?: string
  reviewCount?: string
  slug?: string
  metaTitle?: string
  metaDescription?: string
  storeId?: string
  storeName?: string
  categoryId?: string
  categoryName?: string
}

interface SchemaEditorProps {
  productData: ProductData
  initialSchema: string
  onSchemaChange: (schema: string) => void
  schemaType?: string
  isLocked?: boolean
}

export const SchemaEditor: React.FC<SchemaEditorProps> = ({
  productData,
  initialSchema,
  onSchemaChange,
  schemaType,
  isLocked = false,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(schemaType || "Product")
  const [schemaData, setSchemaData] = useState<string>(initialSchema || "")
  const [isValid, setIsValid] = useState<boolean>(true)
  const [editorMode, setEditorMode] = useState<string>("visual")
  const [validationMessage, setValidationMessage] = useState<string>("")

  const schemaTypeDescriptions = {
    Product: "Provides detailed product information to search engines",
    FAQPage: "Displays frequently asked questions in search results",
    HowTo: "Shows step-by-step instructions in search results",
    Review: "Highlights product reviews in search results",
    Article: "Formats content as an article for search engines",
    BreadcrumbList: "Shows navigation path in search results",
    Organization: "Provides business information to search engines",
    WebPage: "Describes the web page content to search engines",
  }

  useEffect(() => {
    if (schemaType) {
      setSelectedTemplate(schemaType)
    }
    else if (initialSchema) {
      try {
        const parsed = JSON.parse(initialSchema)
        if (parsed["@type"]) {
          setSelectedTemplate(parsed["@type"])
        }
      } catch (e) {
      }
    }

    if (initialSchema && initialSchema.trim() !== "") {
      setSchemaData(initialSchema)
    }
    else {
      const timer = setTimeout(() => {
        if (selectedTemplate && typeof selectedTemplate === 'string') {
          generateSchema()
        }
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [initialSchema, schemaType, selectedTemplate])

  const safelyUpdateSchemaData = (newSchema: string) => {
    setSchemaData(newSchema)
    if (onSchemaChange) {
      onSchemaChange(newSchema)

      try {
        const parsed = JSON.parse(newSchema)
        if (parsed && parsed["@type"]) {
          parsed.templateName = parsed["@type"]
          onSchemaChange(JSON.stringify(parsed))
        }
      } catch (e) {
      }
    }
  }

  const generateSchema = () => {
    let schema = {}
    
    const templateType = typeof selectedTemplate === 'string' ? selectedTemplate : 'Product'

    switch (templateType) {
      case "Product":
        schema = generateProductSchema()
        break
      case "FAQPage":
        schema = generateFAQSchema()
        break
      case "HowTo":
        schema = generateHowToSchema()
        break
      case "Review":
        schema = generateReviewSchema()
        break
      case "Article":
        schema = generateArticleSchema()
        break
      case "BreadcrumbList":
        schema = generateBreadcrumbSchema()
        break
      case "Organization":
        schema = generateOrganizationSchema()
        break
      case "WebPage":
        schema = generateWebPageSchema()
        break
      default:
        schema = generateProductSchema()
    }

    if (schema && typeof schema === "object") {
      const schemaObj = schema as Record<string, any>
      schemaObj["@type"] = templateType
      schemaObj.templateName = templateType
    }

    const formattedSchema = JSON.stringify(schema, null, 2)
    safelyUpdateSchemaData(formattedSchema)
    setIsValid(true)
    setValidationMessage("")

  }

  const generateProductSchema = () => {
    const images = Array.isArray(productData.images)
      ? productData.images.map((img) => (typeof img === "object" && img.url ? img.url : img)).filter(Boolean)
      : []

    const mainImage = productData.mainImage || (images.length > 0 ? images[0] : "")

    const name = productData.name || ""
    const description = stripHtmlTags(productData.description || "")
    const sku = productData.sku || ""
    const price = productData.isDiscounted && productData.salePrice ? productData.salePrice : productData.price || "0"
    const brandName = productData.brandName || productData.storeName || ""
    const stockStatus = productData.stockStatus || "instock"
    const ratingValue = productData.ratingValue || "4.5"
    const reviewCount = productData.reviewCount || "0"

    return {
      "@context": "https://schema.org/",
      "@type": "Product",
      name,
      description,
      image: [mainImage, ...images].filter(Boolean),
      sku,
      mpn: sku,
      brand: {
        "@type": "Brand",
        name: brandName,
      },
      offers: {
        "@type": "Offer",
        url: productData.slug ? `${window.location.origin}/${productData.slug}` : window.location.href,
        priceCurrency: "USD",
        price,
        priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
        availability: stockStatus === "instock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue,
        reviewCount,
      },
      templateName: "Product",
    }
  }

  const generateFAQSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `What materials is the ${productData.name} made of?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `The ${productData.name} is made of ${productData.material?.join(", ") || "high-quality materials"}.`,
          },
        },
        {
          "@type": "Question",
          name: `What sizes are available for the ${productData.name}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: "This product is available in various sizes. Please check the product description for detailed sizing information.",
          },
        },
        {
          "@type": "Question",
          name: "What is your return policy?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We offer a 30-day return policy for all our products. Items must be in original condition with tags attached.",
          },
        },
      ],
    }
  }

  const generateHowToSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: `How to Care for Your ${productData.name}`,
      description: `Learn how to properly care for your ${productData.name} to ensure it lasts for years to come.`,
      step: [
        {
          "@type": "HowToStep",
          name: "Check Care Label",
          text: "Always check the care label inside the garment for specific instructions.",
        },
        {
          "@type": "HowToStep",
          name: "Washing",
          text: `For ${productData.material?.join(", ") || "this material"}, we recommend gentle washing with similar colors.`,
        },
        {
          "@type": "HowToStep",
          name: "Drying",
          text: "Air dry flat or hang to dry for best results and to maintain shape.",
        },
        {
          "@type": "HowToStep",
          name: "Storage",
          text: "Store in a cool, dry place away from direct sunlight to prevent fading.",
        },
      ],
    }
  }

  const generateReviewSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "Review",
      itemReviewed: {
        "@type": "Product",
        name: productData.name,
        image: productData.mainImage,
        description: stripHtmlTags(productData.description),
        sku: productData.sku,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: productData.ratingValue || "4.5",
        bestRating: "5",
      },
      author: {
        "@type": "Person",
        name: "Customer Review",
      },
      reviewBody: `This ${productData.name} is excellent quality and exactly as described. The ${productData.material?.join(", ") || "material"} feels premium and the fit is perfect.`,
    }
  }

  const generateArticleSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: productData.metaTitle || `About ${productData.name}`,
      description: stripHtmlTags(productData.metaDescription || productData.description),
      image: productData.mainImage,
      author: {
        "@type": "Organization",
        name: productData.storeName || "Store",
      },
      publisher: {
        "@type": "Organization",
        name: productData.storeName || "Store",
        logo: {
          "@type": "ImageObject",
          url: `${window.location.origin}/logo.png`,
        },
      },
      datePublished: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    }
  }

  const generateBreadcrumbSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: window.location.origin,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: productData.categoryName || "Products",
          item: `${window.location.origin}/products`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: productData.name,
          item: window.location.href,
        },
      ],
    }
  }

  const generateOrganizationSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: productData.storeName || "Store",
      url: window.location.origin,
      logo: `${window.location.origin}/logo.png`,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+1-800-123-4567",
        contactType: "customer service",
        availableLanguage: ["English"],
      },
      sameAs: [
        "https://www.facebook.com/yourstore",
        "https://www.instagram.com/yourstore",
        "https://twitter.com/yourstore",
      ],
    }
  }

  const generateWebPageSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: productData.metaTitle || productData.name,
      description: stripHtmlTags(productData.metaDescription || productData.description),
      url: window.location.href,
      image: productData.mainImage,
      datePublished: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      isPartOf: {
        "@type": "WebSite",
        name: productData.storeName || "Store",
        url: window.location.origin,
      },
    }
  }

  const validateSchema = () => {
    try {
      if (!schemaData.trim()) {
        setIsValid(false)
        setValidationMessage("Schema is empty")
        return false
      }

      const parsed = JSON.parse(schemaData)

      if (!parsed["@context"] || !parsed["@type"]) {
        setIsValid(false)
        setValidationMessage("Schema missing required fields (@context or @type)")
        return false
      }

      setIsValid(true)
      setValidationMessage("Schema is valid!")

      onSchemaChange(schemaData)
      return true
    } catch (e) {
      setIsValid(false)
      setValidationMessage(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`)
      return false
    }
  }

  const stripHtmlTags = (html: string) => {
    if (!html) return ""
    return html.replace(/<[^>]*>?/gm, "")
  }

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value)
  }

  const handleSchemaDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    safelyUpdateSchemaData(newValue)
    setIsValid(true) 
    setValidationMessage("")
  }

  const renderSchemaPreview = () => {
    try {
      const schema = JSON.parse(schemaData)

      return (
        <div className="space-y-4">
          <div className="p-4 border rounded-md bg-background dark:bg-gray-800">
            <h3 className="font-medium mb-2">Schema Type: {schema["@type"]}</h3>

            {schema["@type"] === "Product" && (
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Name:</span> {schema.name}
                </div>
                <div>
                  <span className="font-medium">Description:</span> {schema.description?.substring(0, 100)}...
                </div>
                <div>
                  <span className="font-medium">SKU:</span> {schema.sku}
                </div>
                <div>
                  <span className="font-medium">Price:</span> {schema.offers?.price} {schema.offers?.priceCurrency}
                </div>
                <div>
                  <span className="font-medium">Availability:</span> {schema.offers?.availability?.split("/").pop()}
                </div>
                {schema.aggregateRating && (
                  <div>
                    <span className="font-medium">Rating:</span> {schema.aggregateRating.ratingValue}/5 (
                    {schema.aggregateRating.reviewCount} reviews)
                  </div>
                )}
              </div>
            )}

            {schema["@type"] === "FAQPage" && (
              <div className="space-y-2">
                <div className="font-medium">Questions:</div>
                <ul className="list-disc pl-5">
                  {schema.mainEntity?.map((item: any, index: number) => (
                    <li key={index}>{item.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {schema["@type"] === "HowTo" && (
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Title:</span> {schema.name}
                </div>
                <div className="font-medium">Steps:</div>
                <ol className="list-decimal pl-5">
                  {schema.step?.map((step: any, index: number) => (
                    <li key={index}>{step.name}</li>
                  ))}
                </ol>
              </div>
            )}

            {schema["@type"] === "Review" && (
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Product:</span> {schema.itemReviewed?.name}
                </div>
                <div>
                  <span className="font-medium">Rating:</span> {schema.reviewRating?.ratingValue}/5
                </div>
                <div>
                  <span className="font-medium">Review:</span> {schema.reviewBody?.substring(0, 100)}...
                </div>
              </div>
            )}

            {schema["@type"] === "Article" && (
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Headline:</span> {schema.headline}
                </div>
                <div>
                  <span className="font-medium">Description:</span> {schema.description?.substring(0, 100)}...
                </div>
              </div>
            )}

            {schema["@type"] === "BreadcrumbList" && (
              <div className="space-y-2">
                <div className="font-medium">Navigation:</div>
                <ol className="list-decimal pl-5">
                  {schema.itemListElement?.map((item: any, index: number) => (
                    <li key={index}>{item.name}</li>
                  ))}
                </ol>
              </div>
            )}

            {schema["@type"] === "Organization" && (
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Name:</span> {schema.name}
                </div>
                <div>
                  <span className="font-medium">URL:</span> {schema.url}
                </div>
              </div>
            )}

            {schema["@type"] === "WebPage" && (
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Name:</span> {schema.name}
                </div>
                <div>
                  <span className="font-medium">Description:</span> {schema.description?.substring(0, 100)}...
                </div>
              </div>
            )}
          </div>
        </div>
      )
    } catch (e) {
      return (
        <div className="p-4 border rounded-md bg-red-50 text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Invalid JSON format. Please check your schema.</span>
          </div>
        </div>
      )
    }
  }

  useEffect(() => {
    if (schemaData) {
      try {
        const parsed = JSON.parse(schemaData)

        if (parsed["@type"] !== selectedTemplate) {
          generateSchema()
        }
      } catch (e) {
        generateSchema()
      }
    } else {
      generateSchema()
    }
  }, [selectedTemplate])

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Schema Type</label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="rounded-full bg-muted p-1 cursor-help">
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{schemaTypeDescriptions[selectedTemplate as keyof typeof schemaTypeDescriptions]}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Badge variant={isLocked ? "secondary" : "outline"}>{isLocked ? "Required Schema" : "Optional Schema"}</Badge>
        </div>
        <Select value={selectedTemplate} onValueChange={handleTemplateChange} disabled={isLocked}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select schema type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Product">Product</SelectItem>
            <SelectItem value="FAQPage">FAQ Page</SelectItem>
            <SelectItem value="HowTo">How-To Guide</SelectItem>
            <SelectItem value="Review">Review</SelectItem>
            <SelectItem value="Article">Article</SelectItem>
            <SelectItem value="BreadcrumbList">Breadcrumb</SelectItem>
            <SelectItem value="Organization">Organization</SelectItem>
            <SelectItem value="WebPage">Web Page</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-600 dark:text-gray-300">{schemaTypeDescriptions[selectedTemplate as keyof typeof schemaTypeDescriptions]}</p>
      </div>

      {/* Editor Tabs */}
      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="grid grid-cols-2 mb-2">
          <TabsTrigger value="visual" onClick={() => setEditorMode("visual")}>
            <Eye className="h-4 w-4 mr-2" />
            Visual
          </TabsTrigger>
          <TabsTrigger value="code" onClick={() => setEditorMode("code")}>
            <Code className="h-4 w-4 mr-2" />
            Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-4">
          {renderSchemaPreview()}
        </TabsContent>

        <TabsContent value="code" className="space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">JSON Schema</label>
              <div className="flex space-x-2">
                <Button type="button" size="sm" variant="outline" onClick={generateSchema} className="h-8 px-2 text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Regenerate
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={validateSchema}
                  className={`h-8 px-2 text-xs ${isValid ? "text-green-600" : "text-red-600"}`}
                >
                  {isValid && !validationMessage ? <Check className="h-3 w-3 mr-1" /> : null}
                  Validate
                </Button>
              </div>
            </div>
            <textarea
              value={schemaData}
              onChange={handleSchemaDataChange}
              className={`w-full h-48 p-2 text-xs font-mono border rounded-md ${
                isValid ? "border-gray-300" : "border-red-500"
              }`}
            />
            {validationMessage && (
              <div
                className={`text-xs p-2 rounded ${isValid ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
              >
                {validationMessage}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-xs text-gray-600 dark:text-gray-300 bg-muted/30 p-2 rounded">
        <p>
          <strong>Tip:</strong> You can switch between visual and code views to edit your schema. The visual view shows
          a simplified preview, while the code view allows direct JSON editing.
        </p>
      </div>
    </div>
  )
}
