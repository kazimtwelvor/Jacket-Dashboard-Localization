"use client"

import type React from "react"

import { useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { ChevronDown, HelpCircle, Search, X } from "lucide-react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { ProductFormValues } from "../../product-form-schema"
import type { SeoCheckCategory } from "../../hooks/use-seo-checks"

interface SeoGeneralSectionProps {
  form: UseFormReturn<ProductFormValues>
  seoChecks: {
    basicSeo: SeoCheckCategory
    additional: SeoCheckCategory
    titleReadability: SeoCheckCategory
    contentReadability: SeoCheckCategory
  }
}

export const SeoGeneralSection: React.FC<SeoGeneralSectionProps> = ({ form, seoChecks }) => {
  const [showSerpPreviewEditor, setShowSerpPreviewEditor] = useState(false)
  const [openedChecklists, setOpenedChecklists] = useState<string[]>([])

  const toggleChecklist = (id: string) => {
    if (openedChecklists.includes(id)) {
      setOpenedChecklists(openedChecklists.filter((item) => item !== id))
    } else {
      setOpenedChecklists([...openedChecklists, id])
    }
  }

  const getKeywordTags = () => {
    const keywords = form.watch("seo.keywords")
    if (!keywords) return []
    if (Array.isArray(keywords)) return keywords
    if (typeof keywords === "string") {
      try {
        const parsed = JSON.parse(keywords)
        return Array.isArray(parsed) ? parsed : [keywords]
      } catch (e) {
        return [keywords]
      }
    }
    return [String(keywords)]
  }

  return (
    <div>
      <div className="border rounded-lg mb-6">
        <div className="p-4">
          <div className="bg-white dark:bg-gray-900 p-4 rounded border mb-4">
            <div className="flex items-center mb-2">
              <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
              <div className="text-green-600 text-sm truncate">
                {typeof window !== "undefined" ? window?.location?.origin || "yourstore.com" : "yourstore.com"}
                /products/
                {form.watch("seo.slug") || form.watch("name")?.toLowerCase().replace(/\s+/g, "-") || "product-name"}
              </div>
            </div>
            <h5 className="text-blue-600 text-lg font-medium mb-1 hover:underline">
              {form.watch("seo.metaTitle") || form.watch("name") || "Product Title"}
            </h5>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              {form.watch("seo.metaDescription") ||
                form.watch("description")?.substring(0, 160) ||
                "Product description will appear here. Make sure to add a compelling meta description to improve click-through rates."}
            </div>
          </div>

          {form.watch("seo.noIndex") && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-md">
              <h3 className="font-medium text-yellow-800 dark:text-yellow-400">Noindex robots meta is enabled</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-500">
                This page will not appear in search results. You can disable noindex in the Advanced tab.
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-between">
          <Button type="button" onClick={() => setShowSerpPreviewEditor(!showSerpPreviewEditor)} variant="default">
            Edit Snippet
          </Button>
          <Button type="button" variant="outline">
            Analytics
          </Button>
        </div>
      </div>

      {showSerpPreviewEditor && (
        <div className="border rounded-lg p-4 mb-6 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="font-medium mb-4">Edit SEO Snippet</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="seo.metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title</FormLabel>
                  <FormControl>
                    <Input
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      placeholder="Enter meta title"
                      {...field}
                    />
                  </FormControl>
                  <div className="text-xs text-muted-foreground mt-1">{field.value?.length || 0}/60 characters</div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="seo.slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-2">yourstore.com/products/</span>
                    <FormControl>
                      <Input
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        placeholder="product-name"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="seo.metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                      placeholder="Enter meta description"
                      {...field}
                    />
                  </FormControl>
                  <div className="text-xs text-muted-foreground mt-1">{field.value?.length || 0}/160 characters</div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}

      <div className="border rounded-lg mb-6">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center">
            <h3 className="font-medium">Keywords</h3>
            <div className="relative ml-2">
              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" className="flex items-center gap-1">
            <Search className="w-3 h-3" />
            <span>Compare Keywords</span>
          </Button>
        </div>

        <div className="p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {getKeywordTags().map((keyword, index) => (
              <div
                key={index}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm ${
                  index === 0
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
                }`}
              >
                <span>{keyword}</span>
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => {
                    const newKeywords = [...(form.watch("seo.keywords") || [])]
                    newKeywords.splice(index, 1)
                    form.setValue("seo.keywords", newKeywords, {
                      shouldDirty: true,
                      shouldValidate: false,
                      shouldTouch: false,
                    })
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            <div className="flex-1">
              <Input
                placeholder="Add keyword..."
                className="border-0 bg-transparent focus:ring-0 p-0 h-auto text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value) {
                    e.preventDefault()
                    const value = e.currentTarget.value.trim()
                    if (value) {
                      const currentKeywords = form.watch("seo.keywords") || []
                      form.setValue("seo.keywords", [...currentKeywords, value], {
                        shouldDirty: true,
                        shouldValidate: false,
                        shouldTouch: false,
                      })
                      e.currentTarget.value = ""
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(seoChecks).map(([key, category]) => (
          <Collapsible key={key} open={openedChecklists.includes(key)} onOpenChange={() => toggleChecklist(key)}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 border rounded-lg">
              <div className="flex items-center">
                <span className="font-medium">{category.name}</span>
              </div>
              <div className="flex items-center">
                <Badge
                  variant="outline"
                  className={`${
                    category.allPassed
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                      : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
                  }`}
                >
                  {category.allPassed
                    ? "All Good"
                    : `${category.checks.filter((c) => c.passed).length}/${category.checks.length} Passed`}
                </Badge>
                <ChevronDown className="w-5 h-5 ml-2" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="border border-t-0 rounded-b-lg p-4 space-y-2">
              {category.checks.map((check, index) => (
                <div key={index} className="flex items-center text-sm">
                  {check.passed ? (
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
                      className="w-4 h-4 text-green-500 mr-2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
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
                      className="w-4 h-4 text-yellow-500 mr-2"
                    >
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                      <path d="M12 9v4" />
                      <path d="M12 17h.01" />
                    </svg>
                  )}
                  <span>{check.message}</span>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  )
}
