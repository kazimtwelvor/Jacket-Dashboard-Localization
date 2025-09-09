"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Check, AlertCircle, RefreshCw, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

interface ProductData {
  id?: string
  name: string
  description?: string
  price: string | number
  salePrice?: string | number | null
  isDiscounted?: boolean
  // originalPrice?: string | number
  images?: Array<{ id: string; url: string }>
  mainImage?: string
  brandName?: string
  sku: string
  stockStatus?: string
  specifications?: any
  material?: string[]
  style?: string[]
  gender?: string
  metaTitle?: string
  metaDescription?: string
  slug?: string
  // ratingValue?: string
  // reviewCount?: string
  categoryId?: string
  categoryName?: string
  storeId?: string
  storeName?: string
  isFeatured?: boolean
  isPublished?: boolean
  tags?: string[]
  // productType?: string
}

interface SchemaEditorProps {
  productData: ProductData
  initialSchema: string
  onSchemaChange: (schema: string) => void
  index?: number
  title?: string
}

const getAvailabilityString = (stockStatus?: string): string => {
  switch (stockStatus?.toLowerCase()) {
    case "instock":
      return "https://schema.org/InStock"
    case "outofstock":
      return "https://schema.org/OutOfStock"
    case "onbackorder":
      return "https://schema.org/BackOrder"
    default:
      return "https://schema.org/InStock"
  }
}

const getProductUrl = (storeId?: string, slug?: string): string => {
  if (slug) {
    return `${process.env.NEXT_PUBLIC_FRONTEND_STORE_URL || "https://yourstore.com"}/products/${slug}`
  }
  return `${process.env.NEXT_PUBLIC_FRONTEND_STORE_URL || "https://yourstore.com"}/products/${
    storeId ? `${storeId}/` : ""
  }product`
}

const getImageUrls = (images?: Array<{ id: string; url: string }>, mainImage?: string): string[] => {
  const urls: string[] = []

  if (mainImage) {
    urls.push(mainImage)
  }

  if (images && images.length > 0) {
    images.forEach((image) => {
      if (!urls.includes(image.url)) {
        urls.push(image.url)
      }
    })
  }

  if (urls.length === 0) {
    urls.push("https://yourstore.com/images/product.jpg")
  }

  return urls
}

const schemaTemplates = {
  default: (data: ProductData) => {
    const imageUrls = getImageUrls(data.images, data.mainImage)
    const availability = getAvailabilityString(data.stockStatus)
    const productUrl = getProductUrl(data.storeId, data.slug)

    return {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: data.name || "Product Name",
      description: data.description || "",
      image: imageUrls,
      sku: data.sku || "",
      mpn: data.sku || "",
      brand: {
        "@type": "Brand",
        name: data.storeName || data.brandName || "Brand Name",
      },
      offers: {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: "USD",
        price: data.isDiscounted ? data.salePrice : data.price || 0,
        priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
        itemCondition: "https://schema.org/NewCondition",
        availability: availability,
      },
      // ...(data.ratingValue && data.reviewCount
      //   ? {
      //       // aggregateRating: {
      //       //   "@type": "AggregateRating",
      //       //   ratingValue: data.ratingValue || "4.5",
      //       //   reviewCount: data.reviewCount || "0",
      //       // },
      //     }
      //   : {}),
    }
  },
  clothing: (data: ProductData) => {
    const imageUrls = getImageUrls(data.images, data.mainImage)
    const availability = getAvailabilityString(data.stockStatus)
    const productUrl = getProductUrl(data.storeId, data.slug)

    let colors: string[] = []
    let materials: string[] = []

    if (data.specifications && typeof data.specifications === "object") {
      if (data.specifications.color && Array.isArray(data.specifications.color)) {
        colors = data.specifications.color
      }

      if (data.specifications.externalMaterial && Array.isArray(data.specifications.externalMaterial)) {
        materials = [...materials, ...data.specifications.externalMaterial]
      }

      if (data.specifications.internalMaterial && Array.isArray(data.specifications.internalMaterial)) {
        materials = [...materials, ...data.specifications.internalMaterial]
      }
    }

    if (data.material && Array.isArray(data.material) && data.material.length > 0) {
      materials = Array.from(new Set([...materials, ...data.material]))
    }

    return {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: data.name || "Clothing Product Name",
      description: data.description || "",
      image: imageUrls,
      sku: data.sku || "",
      brand: {
        "@type": "Brand",
        name: data.storeName || data.brandName || "Brand Name",
      },
      offers: {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: "USD",
        price: data.isDiscounted ? data.salePrice : data.price || 0,
        priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
        itemCondition: "https://schema.org/NewCondition",
        availability: availability,
      },
      // ...(data.ratingValue && data.reviewCount
      //   ? {
      //       // aggregateRating: {
      //       //   "@type": "AggregateRating",
      //       //   ratingValue: data.ratingValue || "4.5",
      //       //   reviewCount: data.reviewCount || "0",
      //       // }, 
      //     }
      //   : {}),
      color: colors.length > 0 ? colors.join(", ") : undefined,
      material: materials.length > 0 ? materials.join(", ") : undefined,
      category: data.categoryName || data.gender || "Clothing",
    }
  },
  electronics: (data: ProductData) => {
    const imageUrls = getImageUrls(data.images, data.mainImage)
    const availability = getAvailabilityString(data.stockStatus)
    const productUrl = getProductUrl(data.storeId, data.slug)

    return {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: data.name || "Electronics Product Name",
      description: data.description || "",
      image: imageUrls,
      sku: data.sku || "",
      mpn: data.sku || "",
      brand: {
        "@type": "Brand",
        name: data.storeName || data.brandName || "Brand Name",
      },
      offers: {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: "USD",
        price: data.isDiscounted ? data.salePrice : data.price || 0,
        priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
        itemCondition: "https://schema.org/NewCondition",
        availability: availability,
        warranty: "1 Year Manufacturer Warranty",
      },
      // ...(data.ratingValue && data.reviewCount
      //   ? {
      //       // aggregateRating: {
      //       //   "@type": "AggregateRating",
      //       //   ratingValue: data.ratingValue || "4.5",
      //       //   reviewCount: data.reviewCount || "0",
      //       // },
      //     }
      //   : {}),
      category: data.categoryName || "Electronics",
      ...(data.tags && data.tags.length > 0 ? { keywords: data.tags.join(", ") } : {}),
    }
  },
  food: (data: ProductData) => {
    const imageUrls = getImageUrls(data.images, data.mainImage)
    const availability = getAvailabilityString(data.stockStatus)
    const productUrl = getProductUrl(data.storeId, data.slug)

    return {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: data.name || "Food Product Name",
      description: data.description || "",
      image: imageUrls,
      sku: data.sku || "",
      brand: {
        "@type": "Brand",
        name: data.storeName || data.brandName || "Brand Name",
      },
      offers: {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: "USD",
        price: data.isDiscounted ? data.salePrice : data.price || 0,
        priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
        itemCondition: "https://schema.org/NewCondition",
        availability: availability,
      },
      // ...(data.ratingValue && data.reviewCount
      //   ? {
      //       // aggregateRating: {
      //       //   "@type": "AggregateRating",
      //       //   ratingValue: data.ratingValue || "4.5",
      //       //   reviewCount: data.reviewCount || "0",
      //       // },
      //     }
      //   : {}),
      category: data.categoryName || "Food",
      nutrition: {
        "@type": "NutritionInformation",
        servingSize: "100g",
      },
    }
  },
  book: (data: ProductData) => {
    const imageUrls = getImageUrls(data.images, data.mainImage)
    const availability = getAvailabilityString(data.stockStatus)
    const productUrl = getProductUrl(data.storeId, data.slug)

    return {
      "@context": "https://schema.org/",
      "@type": "Book",
      name: data.name || "Book Title",
      description: data.description || "",
      image: imageUrls,
      isbn: data.sku || "",
      author: {
        "@type": "Person",
        name: "Author Name",
      },
      publisher: {
        "@type": "Organization",
        name: data.storeName || data.brandName || "Publisher Name",
      },
      offers: {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: "USD",
        price: data.isDiscounted ? data.salePrice : data.price || 0,
        priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
        itemCondition: "https://schema.org/NewCondition",
        availability: availability,
      },
      // ...(data.ratingValue && data.reviewCount
      //   ? {
      //       // aggregateRating: {
      //       //   "@type": "AggregateRating",
      //       //   ratingValue: data.ratingValue || "4.5",
      //       //   reviewCount: data.reviewCount || "0",
      //       // },
      //     }
      //   : {}),
      ...(data.tags && data.tags.length > 0 ? { keywords: data.tags.join(", ") } : {}),
    }
  },
  faq: (data: ProductData) => {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `What are the features of ${data.name || "this product"}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: data.description || "Please check the product description for detailed features.",
          },
        },
        {
          "@type": "Question",
          name: "What is the return policy?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We offer a 30-day return policy for all our products. Please contact customer service for more details.",
          },
        },
        {
          "@type": "Question",
          name: "How long is the warranty?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Our products come with a standard 1-year manufacturer warranty.",
          },
        },
      ],
    }
  },
  howto: (data: ProductData) => {
    return {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: `How to use ${data.name || "this product"}`,
      description: `Step by step guide on how to use ${data.name || "this product"} effectively.`,
      step: [
        {
          "@type": "HowToStep",
          name: "Unpack the product",
          text: "Carefully remove the product from its packaging and check all components.",
        },
        {
          "@type": "HowToStep",
          name: "Read the manual",
          text: "Go through the user manual to understand all features and safety instructions.",
        },
        {
          "@type": "HowToStep",
          name: "Start using",
          text: "Follow the specific instructions for your product model to begin using it.",
        },
      ],
    }
  },
  review: (data: ProductData) => {
    return {
      "@context": "https://schema.org",
      "@type": "Review",
      itemReviewed: {
        "@type": "Product",
        name: data.name || "Product Name",
        image: data.mainImage || "https://yourstore.com/images/product.jpg",
        description: data.description || "",
        sku: data.sku || "",
        brand: {
          "@type": "Brand",
          name: data.storeName || data.brandName || "Brand Name",
        },
      },
      // reviewRating: {
      //   "@type": "Rating",
      //   // ratingValue: data.ratingValue || "4.5",
      //   bestRating: "5",
      // },
      author: {
        "@type": "Person",
        name: "Customer Review",
      },
      reviewBody: "This product exceeded my expectations. The quality is excellent and it works perfectly.",
    }
  },
}

export const CustomSchemaEditor: React.FC<SchemaEditorProps> = ({
  productData,
  initialSchema,
  onSchemaChange,
  index = 0,
  title = "Schema Markup",
}) => {
  const [enabled, setEnabled] = useState(true)
  const [template, setTemplate] = useState<keyof typeof schemaTemplates>("default")
  const [schemaText, setSchemaText] = useState("")
  const [isValid, setIsValid] = useState(true)
  const [validationMessage, setValidationMessage] = useState("")

  useEffect(() => {
    if (initialSchema) {
      try {
        const parsed = JSON.parse(initialSchema)

        if (JSON.stringify(parsed, null, 2) !== schemaText) {
          setSchemaText(JSON.stringify(parsed, null, 2))
          setEnabled(true)
        }

        if (parsed["@type"] === "Book") {
          setTemplate("book")
        } else if (parsed["@type"] === "FAQPage") {
          setTemplate("faq")
        } else if (parsed["@type"] === "HowTo") {
          setTemplate("howto")
        } else if (parsed["@type"] === "Review") {
          setTemplate("review")
        } else if (parsed.nutrition) {
          setTemplate("food")
        } else if (parsed.warranty) {
          setTemplate("electronics")
        } else if (parsed.color || parsed.material) {
          setTemplate("clothing")
        } else {
          setTemplate("default")
        }
      } catch (e) {
        if (!schemaText) {
          generateSchema("default")
          setEnabled(true)
        }
      }
    } else {
      if (!schemaText) {
        generateSchema("default")
        setEnabled(true)
      }
    }
  }, [initialSchema])

  useEffect(() => {
    if (schemaText) {
      validateSchema(schemaText)

      if (enabled) {
        onSchemaChange(schemaText)
      } else if (onSchemaChange) {
        onSchemaChange("")
      }
    }
  }, [schemaText, enabled, onSchemaChange])

  const generateSchema = (templateName: keyof typeof schemaTemplates) => {
    const template = schemaTemplates[templateName]
    const schema = template(productData)
    setSchemaText(JSON.stringify(schema, null, 2))
    setTemplate(templateName)
  }

  const validateSchema = (text: string) => {
    try {
      if (!text.trim()) {
        setIsValid(false)
        setValidationMessage("Schema cannot be empty")
        return
      }

      JSON.parse(text)
      setIsValid(true)
      setValidationMessage("")
    } catch (e) {
      setIsValid(false)
      setValidationMessage((e as Error).message)
    }
  }

  const handleToggleChange = (checked: boolean) => {
    setEnabled(checked)
  }

  const handleTemplateChange = (value: string) => {
    generateSchema(value as keyof typeof schemaTemplates)
  }

  const handleSchemaTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSchemaText(e.target.value)
  }

  const handleRegenerate = () => {
    generateSchema(template)
  }

  const openGoogleTest = () => {
    const encodedSchema = encodeURIComponent(schemaText)
    window.open(
      `https://search.google.com/test/rich-results?url=https://example.com&user_agent=2&html=${encodedSchema}`,
      "_blank",
    )
  }

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="text-xs">Configure structured data for search engines</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor={`schema-toggle-${index}`} className="text-xs font-medium">
              Enable
            </Label>
            <Switch id={`schema-toggle-${index}`} checked={enabled} onCheckedChange={handleToggleChange} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {enabled ? (
          <>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`schema-template-${index}`} className="text-xs font-medium">
                    Template
                  </Label>
                  <Select value={template} onValueChange={handleTemplateChange}>
                    <SelectTrigger id={`schema-template-${index}`} className="w-[150px] h-8 text-xs">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Product</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="book">Book</SelectItem>
                      <SelectItem value="faq">FAQ Page</SelectItem>
                      <SelectItem value="howto">How-To Guide</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="outline" size="sm" onClick={handleRegenerate} className="h-7 text-xs px-2">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Regenerate
                  </Button>
                  <Button variant="outline" size="sm" onClick={openGoogleTest} className="h-7 text-xs px-2">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Validate
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`schema-editor-${index}`} className="text-xs font-medium">
                    Structured Data
                  </Label>
                  <Badge variant={isValid ? "outline" : "destructive"} className="text-xs flex items-center gap-1 h-5">
                    {isValid ? (
                      <>
                        <Check className="h-3 w-3" />
                        Valid
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3" />
                        Invalid
                      </>
                    )}
                  </Badge>
                </div>
                <Textarea
                  id={`schema-editor-${index}`}
                  value={schemaText}
                  onChange={handleSchemaTextChange}
                  className="font-mono text-xs h-[250px] resize-none"
                  placeholder="Enter JSON-LD schema markup"
                />
                {!isValid && <p className="text-xs text-destructive">{validationMessage}</p>}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mb-2 opacity-20" />
            <h3 className="text-sm font-medium mb-1">Schema Disabled</h3>
            <p className="text-xs">Enable schema markup to help search engines understand your product better.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
