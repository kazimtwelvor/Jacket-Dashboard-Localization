"use client"

import type React from "react"

import { Link2, ExternalLink, Copy, Check } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { ProductFormValues } from "../../product-form-schema"

interface ColorLinksSectionProps {
  form: UseFormReturn<ProductFormValues>
}

export const ColorLinksSection: React.FC<ColorLinksSectionProps> = ({ form }) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null)
  const selectedColors = form.watch("specifications.color") || []
  const [colorLinks, setColorLinks] = useState<Record<string, string>>({})

  // Initialize colorLinks from form values with better error handling
  useEffect(() => {
    try {
      // Get the raw form value first and log it
      const rawColorLinks = form.getValues("categories.colorVariationLinks")
      console.log("Raw color links from form:", rawColorLinks)

      // Process the color links based on their type
      let processedLinks = {}

      if (typeof rawColorLinks === "string") {
        try {
          // Check if it's the problematic "[object Object]" string
          if (rawColorLinks === "[object Object]") {
            console.log("Found '[object Object]' string in color-links-section, using empty object")
            processedLinks = {}
          } else {
            processedLinks = JSON.parse(rawColorLinks)
            console.log("Parsed color links from string:", processedLinks)
          }
        } catch (e) {
          console.error("Failed to parse color links string:", e)
          // Try parsing it again (handles double-stringified JSON)
          try {
            processedLinks = JSON.parse(JSON.parse(rawColorLinks))
            console.log("Parsed double-stringified color links:", processedLinks)
          } catch (doubleParseError) {
            console.error("Error parsing double-stringified color links:", doubleParseError)
            processedLinks = {}
          }
        }
      } else if (rawColorLinks && typeof rawColorLinks === "object") {
        processedLinks = rawColorLinks
        console.log("Using color links object directly:", processedLinks)
      }

      // Create a clean object with only the selected colors
      const cleanLinks = {}
      selectedColors.forEach((color) => {
        // Check if the color exists in processedLinks and has a value
        if (processedLinks && processedLinks[color]) {
          cleanLinks[color] = processedLinks[color]
        } else {
          cleanLinks[color] = ""
        }
      })

      console.log("Final processed color links:", cleanLinks)
      setColorLinks(cleanLinks)

      // Update the form with the clean links to ensure consistency
      form.setValue("categories.colorVariationLinks", cleanLinks, { shouldDirty: false })
    } catch (error) {
      console.error("Error processing color links in component:", error)

      // Initialize with empty object if there's an error
      const emptyLinks = selectedColors.reduce((acc, color) => {
        acc[color] = ""
        return acc
      }, {})

      setColorLinks(emptyLinks)
      form.setValue("categories.colorVariationLinks", emptyLinks, { shouldDirty: false })
    }
  }, [form, selectedColors])

  // Handle input change
  const handleInputChange = (color: string, value: string) => {
    // Update local state
    const updatedLinks = { ...colorLinks, [color]: value }
    setColorLinks(updatedLinks)

    // Get current form value and update it
    const currentLinks = form.getValues("categories.colorVariationLinks") || {}
    const newLinks = { ...currentLinks, [color]: value }

    // Update the form value directly
    form.setValue("categories.colorVariationLinks", newLinks, { shouldDirty: true })

    console.log(`Updated ${color} link to:`, value)
    console.log("Updated colorLinks in form:", newLinks)
  }

  // Copy link to clipboard
  const copyToClipboard = (color: string, link: string) => {
    if (!link) return

    navigator.clipboard.writeText(link).then(() => {
      setCopiedColor(color)
      setTimeout(() => setCopiedColor(null), 2000)
    })
  }

  // Open link in new tab
  const openLink = (link: string) => {
    if (!link) return
    window.open(link, "_blank")
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Link2 className="h-5 w-5" />
        <h3 className="text-base font-medium">Color Variation Links</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Add links to other color variations of this product. Enter the full URL for each color variation (e.g.,
        http://localhost:3001/products/product-name-in-color).
      </p>

      {selectedColors.length > 0 ? (
        <div className="space-y-4 border rounded-md p-4 bg-muted/10">
          {selectedColors.map((color) => (
            <div key={color} className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-full border border-gray-400 dark:border-gray-600 shadow-sm flex-shrink-0"
                style={{
                  backgroundColor: color.toLowerCase(),
                  borderColor: ["White", "Yellow", "Beige"].includes(color) ? "#999" : "transparent",
                  boxShadow: color === "Black" ? "0 0 0 1px rgba(255,255,255,0.5)" : "",
                }}
              ></div>
              <div className="flex-1 flex items-center gap-2">
                <span className="text-sm font-medium min-w-[80px]">{color}:</span>
                <div className="flex-1 flex gap-2">
                  <Input
                    className="flex-1"
                    placeholder={`Enter full URL for ${color} variation (http://...)`}
                    value={colorLinks[color] || ""}
                    onChange={(e) => handleInputChange(color, e.target.value)}
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          type="button"
                          disabled={!colorLinks[color]}
                          onClick={() => copyToClipboard(color, colorLinks[color] || "")}
                        >
                          {copiedColor === color ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{copiedColor === color ? "Copied!" : "Copy link"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          type="button"
                          disabled={!colorLinks[color]}
                          onClick={() => openLink(colorLinks[color] || "")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Open link in new tab</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          ))}
          <div className="text-xs text-muted-foreground mt-4 p-2 bg-muted/20 rounded-md">
            <p>Enter the complete URL for each color variation (including http:// or https://)</p>
            <p className="mt-1">Example: http://localhost:3001/products/product-name-in-red-color</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground border rounded-md">
          No colors selected. Please select colors in the Color Variations section first.
        </div>
      )}
    </div>
  )
}
