"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Code, AlertTriangle } from "lucide-react"
import { useFormContext } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { useParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { validateSchema } from "../../schema-validator"
import { SCHEMA_TEMPLATES, getTemplateById, fillTemplate } from "../../schema-templates"

export const SchemaMarkupEditor = () => {
  const { watch, setValue } = useFormContext()
  const [schemaValue, setSchemaValue] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [storeInfo, setStoreInfo] = useState<{ name: string; url: string } | null>(null)
  const [enabled, setEnabled] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState("default")
  const params = useParams()
  const storeId = params?.storeId as string

  const formProductName = watch("name")
  const formProductDescription = watch("description")
  const formProductPrice = watch("regularPrice")
  const formProductImages = [watch("mainImage"), ...(watch("images") || [])].filter(Boolean)
  const brandName = watch("brandName")
  const stockStatus = watch("stockStatus")
  const schema = watch("schema")
  const slug = watch("seo.slug")
  const sku = watch("sku")
  const salePrice = watch("salePrice")
  const specifications = watch("specifications")
  const categories = watch("categories")

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const response = await fetch(`/api/stores/${storeId}/info`)
        if (response.ok) {
          const data = await response.json()
          setStoreInfo({
            name: data.name || "Your Store",
            url: data.url || window.location.origin,
          })
        }
      } catch (error) {
        console.error("Failed to fetch store info:", error)
      }
    }

    fetchStoreInfo()
  }, [storeId])

  useEffect(() => {
    if (schema) {
      try {
        if (typeof schema === "string") {
          const parsedSchema = JSON.parse(schema)
          setSchemaValue(JSON.stringify(parsedSchema, null, 2))

          if (parsedSchema["@type"] === "Book") {
            setSelectedTemplate("book")
          } else if (parsedSchema["@type"] === "SoftwareApplication") {
            setSelectedTemplate("software")
          } else if (parsedSchema.category === "Clothing") {
            setSelectedTemplate("clothing")
          } else if (parsedSchema.category === "Food") {
            setSelectedTemplate("food")
          } else if (parsedSchema.category === "Electronics") {
            setSelectedTemplate("electronics")
          } else {
            setSelectedTemplate("default")
          }
        } else {
          setSchemaValue(JSON.stringify(schema, null, 2))
        }
        setError(null)
      } catch (e) {
        setSchemaValue(schema)
        setError("Invalid JSON format. Please check your schema markup.")
      }
    } else {
      generateTemplate("default")
    }
  }, [schema])

  useEffect(() => {
    if (schemaValue) {
      try {
        const result = validateSchema(schemaValue)
        if (!result.isValid) {
          setError("Schema validation failed. Please fix the errors below.")
        } else {
          setError(null)
        }
        setWarnings(result.warnings)
      } catch (e) {
        console.error("Schema validation error:", e)
      }
    }
  }, [schemaValue])

  const generateTemplate = (templateType = selectedTemplate) => {
    const storeDomain = storeInfo?.url || window.location.origin
    const productSlug = slug || formProductName?.toLowerCase().replace(/\s+/g, "-") || "product"
    const productUrl = `${storeDomain}/products/${productSlug}`

    const template = getTemplateById(templateType)

    if (!template) {
      console.error("Template not found:", templateType)
      return
    }

    const data = {
      name: formProductName || "Product Name",
      description: formProductDescription || "Product Description",
      sku: sku || "",
      image: formProductImages.length > 0 ? formProductImages : [],
      brandName: brandName || storeInfo?.name || "Your Brand",
      price: formProductPrice || "99.99",
      salePrice: salePrice || "",
      availability:
        stockStatus === "instock"
          ? "https://schema.org/InStock"
          : stockStatus === "outofstock"
            ? "https://schema.org/OutOfStock"
            : "https://schema.org/BackOrder",
      url: productUrl,
      color: specifications?.color || [],
      material: specifications?.externalMaterial || [],
      model: sku || "",
      manufacturer: brandName || storeInfo?.name || "Manufacturer",
      author: "Author Name", 
      publisher: brandName || storeInfo?.name || "Publisher Name",
      isbn: sku || "",
      numberOfPages: "100", 
      servingSize: "100g", 
      applicationCategory: "Application", 
      operatingSystem: "Web Browser", 
    }

    const filledTemplate = fillTemplate(template.template, data)

    const formattedSchema = JSON.stringify(filledTemplate, null, 2)
    setSchemaValue(formattedSchema)
    setValue("schema", formattedSchema)
    setSelectedTemplate(templateType)
    setError(null)
  }

  const handleSchemaChange = (value: string) => {
    setSchemaValue(value)

    try {
      JSON.parse(value)
      setValue("schema", value)
      setError(null)
    } catch (e) {
      setError("Invalid JSON format. Please check your schema markup.")
    }
  }

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value)
    generateTemplate(value)
  }

  const handleToggleSchema = (isEnabled: boolean) => {
    setEnabled(isEnabled)
    if (isEnabled && !schemaValue) {
      generateTemplate()
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Schema Markup</CardTitle>
          <div className="flex items-center space-x-2">
            <Label htmlFor="schema-toggle" className="text-sm">
              Enable
            </Label>
            <Switch id="schema-toggle" checked={enabled} onCheckedChange={handleToggleSchema} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {enabled ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Schema Template</h3>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {SCHEMA_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Schema Markup Editor</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => generateTemplate()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {warnings.length > 0 && (
              <Alert variant="default" className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700">
                  <p className="font-medium mb-1">Schema has warnings:</p>
                  <ul className="list-disc pl-5 text-sm">
                    {warnings.map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="relative">
              <Code className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                value={schemaValue}
                onChange={(e) => handleSchemaChange(e.target.value)}
                className="min-h-[300px] font-mono text-sm pl-9 resize-y"
                placeholder='{"@context": "https://schema.org/", "@type": "Product", ...}'
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Enter valid JSON-LD schema markup for this product. This will be added to the page's HTML to improve
              search engine visibility.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Code className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-4">Schema markup is disabled</p>
            <Button variant="outline" size="sm" onClick={() => handleToggleSchema(true)}>
              Enable Schema Markup
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
