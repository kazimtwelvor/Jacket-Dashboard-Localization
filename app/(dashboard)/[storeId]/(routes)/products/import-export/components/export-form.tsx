"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const exportFormSchema = z.object({
  fileType: z.enum(["csv", "xlsx"], {
    required_error: "Please select a file type",
  }),
  exportScope: z.enum(["all", "filtered", "selected"], {
    required_error: "Please select what to export",
  }),
  categoryId: z.string().optional(),
  includeDeleted: z.boolean().default(false),
  includeImages: z.boolean().default(true),
  includeVariations: z.boolean().default(true),
  includeCategories: z.boolean().default(true),
  includeSEO: z.boolean().default(false),
  includeInventory: z.boolean().default(true),
  includePricing: z.boolean().default(true),
})

type ExportFormValues = z.infer<typeof exportFormSchema>

interface Category {
  id: string
  name: string
}

interface ExportProductsFormProps {
  storeId: string
  categories: Category[]
  productCount: number
}

export const ExportProductsForm: React.FC<ExportProductsFormProps> = ({ storeId, categories, productCount }) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ExportFormValues>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
      fileType: "xlsx",
      exportScope: "all",
      includeDeleted: false,
      includeImages: true,
      includeVariations: true,
      includeCategories: true,
      includeSEO: false,
      includeInventory: true,
      includePricing: true,
    },
  })

  const exportScope = form.watch("exportScope")

  const onSubmit = async (data: ExportFormValues) => {
    try {
      setIsLoading(true)

      const response = await fetch(`/api/${storeId}/products/export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Export API error:", errorText)
        throw new Error(errorText || "Failed to start export")
      }

      const blob = await response.blob()

      const contentDisposition = response.headers.get("Content-Disposition")
      let filename = "products_export.xlsx"
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1]
        }
      } else {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
        filename = `products_export_${timestamp}.${data.fileType}`
      }

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success("Export completed successfully")
      router.refresh()
    } catch (error) {
      console.error("Export error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to export products")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Export Settings</h3>
                  <p className="text-sm text-muted-foreground">Configure your product export options</p>
                </div>

                <FormField
                  control={form.control}
                  name="fileType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>File Format</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="xlsx" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer flex items-center">
                              <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                              Excel (.xlsx)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="csv" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-blue-600" />
                              CSV (.csv)
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <FormField
                  control={form.control}
                  name="exportScope"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>What to Export</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="all" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">All Products ({productCount})</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="filtered" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Filter by Category</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {exportScope === "filtered" && (
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="includeDeleted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Include Deleted Products</FormLabel>
                        <FormDescription>Export products that are in the trash</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Data Fields</h3>
                  <p className="text-sm text-muted-foreground">Select which data to include in the export</p>
                </div>

                <Accordion type="multiple" className="w-full" defaultValue={["basic"]}>
                  <AccordionItem value="basic">
                    <AccordionTrigger>Basic Information</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="basic-id" defaultChecked disabled />
                          <label
                            htmlFor="basic-id"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Product ID
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="basic-name" defaultChecked disabled />
                          <label
                            htmlFor="basic-name"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Product Name
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="basic-sku" defaultChecked disabled />
                          <label
                            htmlFor="basic-sku"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            SKU
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="basic-description" defaultChecked disabled />
                          <label
                            htmlFor="basic-description"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Description
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="basic-status" defaultChecked disabled />
                          <label
                            htmlFor="basic-status"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Status (Published/Draft/Archived)
                          </label>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="pricing">
                    <AccordionTrigger>Pricing</AccordionTrigger>
                    <AccordionContent>
                      <FormField
                        control={form.control}
                        name="includePricing"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} id="include-pricing" />
                              </FormControl>
                              <FormLabel
                                htmlFor="include-pricing"
                                className="text-sm font-medium leading-none cursor-pointer"
                              >
                                Include Pricing Information
                              </FormLabel>
                            </div>
                            <FormDescription className="pl-6">
                              Regular price, sale price, and discount information
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="inventory">
                    <AccordionTrigger>Inventory</AccordionTrigger>
                    <AccordionContent>
                      <FormField
                        control={form.control}
                        name="includeInventory"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  id="include-inventory"
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor="include-inventory"
                                className="text-sm font-medium leading-none cursor-pointer"
                              >
                                Include Inventory Information
                              </FormLabel>
                            </div>
                            <FormDescription className="pl-6">
                              Stock status and inventory management settings
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="categories">
                    <AccordionTrigger>Categories & Attributes</AccordionTrigger>
                    <AccordionContent>
                      <FormField
                        control={form.control}
                        name="includeCategories"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  id="include-categories"
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor="include-categories"
                                className="text-sm font-medium leading-none cursor-pointer"
                              >
                                Include Categories & Attributes
                              </FormLabel>
                            </div>
                            <FormDescription className="pl-6">
                              Product categories, tags, and custom attributes
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="variations">
                    <AccordionTrigger>Variations</AccordionTrigger>
                    <AccordionContent>
                      <FormField
                        control={form.control}
                        name="includeVariations"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  id="include-variations"
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor="include-variations"
                                className="text-sm font-medium leading-none cursor-pointer"
                              >
                                Include Variations
                              </FormLabel>
                            </div>
                            <FormDescription className="pl-6">
                              Color and size variations, and their specific details
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="images">
                    <AccordionTrigger>Images</AccordionTrigger>
                    <AccordionContent>
                      <FormField
                        control={form.control}
                        name="includeImages"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} id="include-images" />
                              </FormControl>
                              <FormLabel
                                htmlFor="include-images"
                                className="text-sm font-medium leading-none cursor-pointer"
                              >
                                Include Image URLs
                              </FormLabel>
                            </div>
                            <FormDescription className="pl-6">Product image URLs and image metadata</FormDescription>
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="seo">
                    <AccordionTrigger>SEO</AccordionTrigger>
                    <AccordionContent>
                      <FormField
                        control={form.control}
                        name="includeSEO"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} id="include-seo" />
                              </FormControl>
                              <FormLabel
                                htmlFor="include-seo"
                                className="text-sm font-medium leading-none cursor-pointer"
                              >
                                Include SEO Information
                              </FormLabel>
                            </div>
                            <FormDescription className="pl-6">
                              Meta titles, descriptions, keywords, and schema markup
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing Export...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" /> Export Products
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
