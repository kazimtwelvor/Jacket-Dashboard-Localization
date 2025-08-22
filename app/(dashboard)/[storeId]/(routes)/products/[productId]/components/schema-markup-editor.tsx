"use client"

import { useState, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Code, CheckCircle2 } from "lucide-react"
import { SCHEMA_TEMPLATES, getTemplateById, fillTemplate } from "./schema-templates"

export const SchemaMarkupEditor = () => {
  const { watch, setValue, getValues } = useFormContext()
  const [schemaValue, setSchemaValue] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isEnabled, setIsEnabled] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState("default")
  const [isValid, setIsValid] = useState(true)

  // Get form values
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

  // Initialize schema from form value
  useEffect(() => {
    if (schema) {
      try {
        // If it's a string, try to parse it
        if (typeof schema === "string") {
          const parsedSchema = JSON.parse(schema)
          setSchemaValue(JSON.stringify(parsedSchema, null, 2))
          setIsValid(true)

          // Try to determine the template type from schema
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
          // If it's already an object
          setSchemaValue(JSON.stringify(schema, null, 2))
          setIsValid(true)
        }
        setError(null)
      } catch (e) {
        setSchemaValue(schema || "")
        setError("Invalid JSON format. Please check your schema markup.")
        setIsValid(false)
      }
    } else {
      // If no schema exists, generate a default one
      generateTemplate("default")
    }
  }, [schema])

  // Generate a template schema based on product data and template type
  const generateTemplate = (templateType = selectedTemplate) => {
    const storeDomain = window.location.origin
    const productSlug = slug || formProductName?.toLowerCase().replace(/\s+/g, "-") || "product"
    const productUrl = `${storeDomain}/products/${productSlug}`

    // Get template from our templates library
    const template = getTemplateById(templateType)

    if (!template) {
      console.error("Template not found:", templateType)
      return
    }

    // Prepare data for the template
    const data = {
      name: formProductName || "Product Name",
      description: formProductDescription || "Product Description",
      sku: sku || "",
      image: formProductImages.length > 0 ? formProductImages : ["https://yourstore.com/images/product.jpg"],
      brandName: brandName || "Your Brand",
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
      manufacturer: brandName || "Manufacturer",
      author: "Author Name", // Default value
      publisher: brandName || "Publisher Name",
      isbn: sku || "",
      numberOfPages: "100", // Default value
      servingSize: "100g", // Default value
      applicationCategory: "Application", // Default value
      operatingSystem: "Web Browser", // Default value
    }

    // Fill the template with our data
    const filledTemplate = fillTemplate(template.template, data)

    // Set the generated schema
    const formattedSchema = JSON.stringify(filledTemplate, null, 2)
    setSchemaValue(formattedSchema)
    setValue("schema", formattedSchema)
    setSelectedTemplate(templateType)
    setError(null)
    setIsValid(true)
  }

  // Handle schema changes
  const handleSchemaChange = (value: string) => {
    setSchemaValue(value)

    try {
      // Validate JSON
      JSON.parse(value)
      setValue("schema", value)
      setError(null)
      setIsValid(true)
    } catch (e) {
      setError("Invalid JSON format. Please check your schema markup.")
      setIsValid(false)
      // Still update the form value so user doesn't lose their work
      setValue("schema", value)
    }
  }

  // Handle template selection change
  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value)
    generateTemplate(value)
  }

  // Handle enable/disable toggle
  const handleEnableToggle = (checked: boolean) => {
    setIsEnabled(checked)
    setValue("seo.structuredData", checked)

    // If enabling and no schema, generate one
    if (checked && !schemaValue) {
      generateTemplate()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg bg-white">
        <div>
          <Label htmlFor="enable-schema" className="font-medium">
            Enable Product Schema
          </Label>
          <p className="text-sm text-muted-foreground">
            Adds Product schema markup to help search engines display rich results
          </p>
        </div>
        <Switch id="enable-schema" checked={isEnabled} onCheckedChange={handleEnableToggle} />
      </div>

      {isEnabled && (
        <>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Schema Template</Label>
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

            <Card>
              <CardContent className="pt-6">
                <Label htmlFor="schema-editor" className="mb-2 block">
                  Schema Preview
                </Label>
                <div className="relative">
                  <Code className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="schema-editor"
                    value={schemaValue}
                    onChange={(e) => handleSchemaChange(e.target.value)}
                    className="min-h-[300px] font-mono text-sm pl-9 resize-y"
                    placeholder='{"@context": "https://schema.org/", "@type": "Product", ...}'
                  />
                </div>
              </CardContent>
            </Card>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Schema Markup Tips</h3>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Include price, availability, and review information for best results</li>
                  <li>Use high-quality product images</li>
                  <li>Keep product information up to date</li>
                  <li>Test your markup with Google's Rich Results Test</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Schema Validation</h3>
                <p className="text-sm text-muted-foreground mb-4">Check if your schema markup is valid</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle2 className={`h-4 w-4 mr-2 ${isValid ? "text-green-500" : "text-gray-300"}`} />
                      <span>Product Schema</span>
                    </div>
                    <span className={isValid ? "text-green-500 text-sm" : "text-gray-400 text-sm"}>
                      {isValid ? "Enabled" : "Invalid"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle2 className={`h-4 w-4 mr-2 ${isValid ? "text-green-500" : "text-gray-300"}`} />
                      <span>Required Fields</span>
                    </div>
                    <span className={isValid ? "text-green-500 text-sm" : "text-gray-400 text-sm"}>
                      {isValid ? "Complete" : "Incomplete"}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => window.open("https://search.google.com/test/rich-results", "_blank")}
                >
                  Validate with Google
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
