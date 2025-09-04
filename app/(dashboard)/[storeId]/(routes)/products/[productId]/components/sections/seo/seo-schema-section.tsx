"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2 } from "lucide-react"
import { SchemaEditor } from "./schema-editor"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SeoSchemaProps {
  form: any
  productData: any
}

export const SeoSchemaSection = ({ form, productData }: SeoSchemaProps) => {
  const [activeSchemaTab, setActiveSchemaTab] = useState("primary")
  const [showSecondarySchema, setShowSecondarySchema] = useState(false)
  const [showAdditionalSchema, setShowAdditionalSchema] = useState(false)

  useEffect(() => {
    const schema1 = form.getValues("schema1")
    const schema2 = form.getValues("schema2")
    const schema3 = form.getValues("schema3")

    console.log("Checking schema data for tabs:", {
      schema1: schema1 ? "exists" : "empty",
      schema2: schema2 ? "exists" : "empty",
      schema3: schema3 ? "exists" : "empty",
    })

    if (schema2 && schema2.trim() !== "") {
      setShowSecondarySchema(true)
      console.log("Enabling secondary schema tab")
    }

    if (schema3 && schema3.trim() !== "") {
      setShowAdditionalSchema(true)
      console.log("Enabling additional schema tab")
    }

    console.log("Schema data loaded:", {
      schema1: schema1 ? schema1.substring(0, 50) + "..." : "none",
      schema2: schema2 ? schema2.substring(0, 50) + "..." : "none",
      schema3: schema3 ? schema3.substring(0, 50) + "..." : "none",
    })
  }, [form])

  const handleSchemaChange = (schemaField: string, schema: string) => {
    console.log(`Updating ${schemaField} with new schema data`)
    form.setValue(schemaField, schema, { shouldDirty: true })

    setTimeout(() => {
      const schema1 = form.getValues("schema1")
      const schema2 = form.getValues("schema2")
      const schema3 = form.getValues("schema3")

      try {
        const combinedSchema = {}

        if (schema1) {
          const parsedSchema1 = typeof schema1 === "string" ? JSON.parse(schema1) : schema1
          if (parsedSchema1) {
            const schemaType = parsedSchema1.templateName || parsedSchema1["@type"] || "Product"
            ;(combinedSchema as any)[schemaType] = parsedSchema1
          }
        }

        if (schema2) {
          const parsedSchema2 = typeof schema2 === "string" ? JSON.parse(schema2) : schema2
          if (parsedSchema2) {
            const schemaType = parsedSchema2.templateName || parsedSchema2["@type"] || "FAQPage"
            ;(combinedSchema as any)[schemaType] = parsedSchema2
          }
        }

        if (schema3) {
          const parsedSchema3 = typeof schema3 === "string" ? JSON.parse(schema3) : schema3
          if (parsedSchema3) {
            const schemaType = parsedSchema3.templateName || parsedSchema3["@type"] || "HowTo"
            ;(combinedSchema as any)[schemaType] = parsedSchema3
          }
        }

        if (Object.keys(combinedSchema).length > 0) {
          const schemaString = JSON.stringify(combinedSchema)
          form.setValue("schema", schemaString, { shouldDirty: true })
          console.log("Combined schemas updated with", Object.keys(combinedSchema).length, "schemas")
        }
      } catch (error) {
        console.error("Error combining schemas after schema change:", error)
      }
    }, 300)
  }

  const getSchemaType = (schemaData: string): string => {
    if (!schemaData) return "Product"

    try {
      const parsed = JSON.parse(schemaData)
      return parsed["@type"] || "Product"
    } catch (e) {
      console.error("Error parsing schema data to get type:", e)
      return "Product"
    }
  }

  const addSecondarySchema = () => {
    setShowSecondarySchema(true)
    setActiveSchemaTab("secondary")
    if (!form.getValues("schema2")) {
      const defaultSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        templateName: "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `What materials is the ${productData.name} made of?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `The ${productData.name} is made of high-quality materials.`,
            },
          },
        ],
      }

      form.setValue("schema2", JSON.stringify(defaultSchema, null, 2), { shouldDirty: true })
      console.log("Created default secondary schema (FAQ)")
    }
  }

  const addAdditionalSchema = () => {
    setShowAdditionalSchema(true)
    setActiveSchemaTab("additional")

    if (!form.getValues("schema3")) {
      const defaultSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        templateName: "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://example.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Products",
            item: "https://example.com/products/",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: productData.name,
            item: `https://example.com/products/${productData.slug || "product"}`,
          },
        ],
      }

      form.setValue("schema3", JSON.stringify(defaultSchema, null, 2), { shouldDirty: true })
      console.log("Created default additional schema (Breadcrumb)")
    }
  }

  const removeSecondarySchema = () => {
    form.setValue("schema2", "", { shouldDirty: true })
    setShowSecondarySchema(false)
    setActiveSchemaTab("primary")
    console.log("Removed secondary schema")
  }

  const removeAdditionalSchema = () => {
    form.setValue("schema3", "", { shouldDirty: true })
    setShowAdditionalSchema(false)
    setActiveSchemaTab(showSecondarySchema ? "secondary" : "primary")
    console.log("Removed additional schema")
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Schema Markup</CardTitle>
        <CardDescription>Configure structured data for search engines</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeSchemaTab} onValueChange={setActiveSchemaTab} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="primary">Primary Schema</TabsTrigger>
              {showSecondarySchema && <TabsTrigger value="secondary">Secondary Schema</TabsTrigger>}
              {showAdditionalSchema && <TabsTrigger value="additional">Additional Schema</TabsTrigger>}
            </TabsList>

            <div className="flex gap-2">
              {!showSecondarySchema && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSecondarySchema}
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Secondary Schema
                </Button>
              )}

              {showSecondarySchema && !showAdditionalSchema && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAdditionalSchema}
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Additional Schema
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="primary" className="space-y-4">
            <Alert variant="default" className="mb-4">
              <AlertDescription>
                The primary schema is required and will be the main structured data for this product.
              </AlertDescription>
            </Alert>

            <SchemaEditor
              productData={productData}
              initialSchema={form.getValues("schema1") || ""}
              onSchemaChange={(schema) => handleSchemaChange("schema1", schema)}
              schemaType={getSchemaType(form.getValues("schema1"))}
              isLocked={true}
            />
          </TabsContent>

          {showSecondarySchema && (
            <TabsContent value="secondary" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <Alert variant="default" className="mb-0 flex-1 mr-2">
                  <AlertDescription>
                    Secondary schema provides additional structured data for search engines.
                  </AlertDescription>
                </Alert>

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeSecondarySchema}
                  className="flex items-center gap-1 whitespace-nowrap"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </div>

              <SchemaEditor
                productData={productData}
                initialSchema={form.getValues("schema2") || ""}
                onSchemaChange={(schema) => handleSchemaChange("schema2", schema)}
                schemaType={getSchemaType(form.getValues("schema2"))}
                isLocked={false}
              />
            </TabsContent>
          )}

          {showAdditionalSchema && (
            <TabsContent value="additional" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <Alert variant="default" className="mb-0 flex-1 mr-2">
                  <AlertDescription>Additional schema provides even more context for search engines.</AlertDescription>
                </Alert>

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeAdditionalSchema}
                  className="flex items-center gap-1 whitespace-nowrap"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </div>

              <SchemaEditor
                productData={productData}
                initialSchema={form.getValues("schema3") || ""}
                onSchemaChange={(schema) => handleSchemaChange("schema3", schema)}
                schemaType={getSchemaType(form.getValues("schema3"))}
                isLocked={false}
              />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}
