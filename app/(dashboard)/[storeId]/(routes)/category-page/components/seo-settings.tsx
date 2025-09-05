"use client"

import React, { useState, useCallback, useMemo, useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle, Globe, Info, Twitter } from "lucide-react"

interface SeoSettingsProps {
  form: UseFormReturn<any>
}

const FRONTEND_STORE_URL = process.env.NEXT_PUBLIC_FRONTEND_STORE_URL || "https://yourstore.com"
const CategoryKeywordInput = ({ form }: { form: UseFormReturn<any> }) => {
  const keywords = form.watch("supportingKeywords") || []
  const focusKeyword = form.watch("focusKeyword") || ""
  const [inputValue, setInputValue] = useState("")

  const addKeyword = () => {
    if (inputValue.trim()) {
      const newKeywords = [...keywords, inputValue.trim()]
      form.setValue("supportingKeywords", newKeywords, { shouldDirty: true })
      setInputValue("")
    }
  }

  const removeKeyword = (index: number) => {
    const newKeywords = [...keywords]
    newKeywords.splice(index, 1)
    form.setValue("supportingKeywords", newKeywords, { shouldDirty: true })
  }

  const setAsFocusKeyword = (keyword: string) => {
    form.setValue("focusKeyword", keyword, { shouldDirty: true })
  }

  return (
    <div className="space-y-3">
      <div>
        <FormLabel>Focus Keyword</FormLabel>
        <Input
          value={focusKeyword}
          onChange={(e) => form.setValue("focusKeyword", e.target.value, { shouldDirty: true })}
          placeholder="Enter your main focus keyword"
          className="mt-2"
        />
        <FormDescription className="mt-1">
          The primary keyword you want this category page to rank for.
        </FormDescription>
      </div>

      <div>
        <FormLabel>Supporting Keywords</FormLabel>
        <div className="flex gap-2 mt-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter supporting keyword and press Enter"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addKeyword()
              }
            }}
          />
          <Button type="button" onClick={addKeyword}>
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {keywords.map((keyword: string, index: number) => (
            <Badge key={index} variant="outline" className="px-3 py-1 flex items-center gap-1">
              {keyword}
              <button
                type="button"
                className="ml-1 text-xs underline hover:text-primary"
                onClick={() => setAsFocusKeyword(keyword)}
              >
                set as focus
              </button>
              <button
                type="button"
                className="ml-1 hover:text-destructive"
                onClick={() => removeKeyword(index)}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>

        <FormDescription className="mt-1">
          Additional keywords that support your focus keyword.
        </FormDescription>
      </div>
    </div>
  )
}

const CategorySeoAnalysis = ({ form }: { form: UseFormReturn<any> }) => {
  const seoTitle = form.watch("seoTitle") || ""
  const seoDescription = form.watch("seoDescription") || ""
  const focusKeyword = form.watch("focusKeyword") || ""
  const description = form.watch("description") || ""
  const name = form.watch("name") || ""

  const displayTitle = seoTitle || name
  const displayDescription = seoDescription || description

  const keywordInTitle = focusKeyword && displayTitle.toLowerCase().includes(focusKeyword.toLowerCase())
  const keywordInDescription = focusKeyword && displayDescription.toLowerCase().includes(focusKeyword.toLowerCase())
  const titleLengthGood = displayTitle.length >= 30 && displayTitle.length <= 60
  const descriptionLengthGood = displayDescription.length >= 120 && displayDescription.length <= 160
  const hasDescription = description.length > 100

  const seoScore = useMemo(() => {
    let score = 0
    if (displayTitle && titleLengthGood) score += 20
    if (displayDescription && descriptionLengthGood) score += 20
    if (focusKeyword) score += 15
    if (keywordInTitle) score += 15
    if (keywordInDescription) score += 15
    if (hasDescription) score += 15
    return score
  }, [displayTitle, displayDescription, focusKeyword, keywordInTitle, keywordInDescription, titleLengthGood, descriptionLengthGood, hasDescription])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">SEO Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">SEO Score</span>
              <Badge variant={seoScore > 60 ? "outline" : "secondary"}>{seoScore}/100</Badge>
            </div>
            <Progress value={seoScore} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              {keywordInTitle ? (
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
              )}
              <span className="text-sm">
                {keywordInTitle
                  ? "Focus keyword found in title."
                  : "Focus keyword not found in title."}
              </span>
            </div>

            <div className="flex items-start gap-2">
              {keywordInDescription ? (
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
              )}
              <span className="text-sm">
                {keywordInDescription
                  ? "Focus keyword found in description."
                  : "Focus keyword not found in description."}
              </span>
            </div>

            <div className="flex items-start gap-2">
              {titleLengthGood ? (
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
              )}
              <span className="text-sm">
                {titleLengthGood
                  ? `Title length is good (${displayTitle.length} characters).`
                  : `Title length needs improvement (${displayTitle.length}/30-60 characters).`}
              </span>
            </div>

            <div className="flex items-start gap-2">
              {descriptionLengthGood ? (
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
              )}
              <span className="text-sm">
                {descriptionLengthGood
                  ? `Description length is good (${displayDescription.length} characters).`
                  : `Description length needs improvement (${displayDescription.length}/120-160 characters).`}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const SearchPreview = ({ form }: { form: UseFormReturn<any> }) => {
  const seoTitle = form.watch("seoTitle") || ""
  const seoDescription = form.watch("seoDescription") || ""
  const name = form.watch("name") || ""
  const description = form.watch("description") || ""
  const slug = form.watch("slug") || ""

  const displayTitle = seoTitle || name || "Category Page Title"
  const displayDescription = seoDescription || description || "Category page description will appear here."

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Search Engine Preview</CardTitle>
        <CardDescription>How your category page will appear in search results</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md p-4 bg-white">
          <div className="text-blue-600 text-xl font-medium line-clamp-1 hover:underline cursor-pointer">
            {displayTitle}
          </div>
          <div className="text-green-700 text-sm mb-1">
            {FRONTEND_STORE_URL.replace(/^https?:\/\//, "")}/category/{slug || "category-name"}
          </div>
          <div className="text-gray-700 text-sm line-clamp-2">
            {displayDescription}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const SeoSettings: React.FC<SeoSettingsProps> = ({ form }) => {
  const [activeTab, setActiveTab] = useState("basic")

  const getDisplayValue = useCallback(
    (field: string) => {
      const value = form.watch(field)
      return value || ""
    },
    [form]
  )

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>SEO Optimization</AlertTitle>
        <AlertDescription>
          Optimize your category page for search engines to improve visibility and rankings.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="basic">Basic SEO</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="schema">Schema</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic SEO Settings</CardTitle>
              <CardDescription>Configure essential SEO elements for your category page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="seoTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO Title</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder={`Custom SEO title (defaults to: ${form.watch("name") || "Category Name"})`}
                          {...field}
                          className={field.value && field.value.length > 60 ? "border-destructive" : ""}
                        />
                      </FormControl>
                      <span className={`absolute right-3 top-2.5 text-xs ${(field.value || "").length > 60 ? "text-destructive" : "text-muted-foreground"
                        }`}>
                        {(field.value || "").length}/60
                      </span>
                    </div>
                    <FormDescription>
                      The title that appears in search engine results. Leave empty to use the category name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="seoDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Textarea
                          placeholder="Custom meta description for search engines"
                          {...field}
                          className={`resize-none min-h-[100px] ${field.value && field.value.length > 160 ? "border-destructive" : ""}`}
                          rows={4}
                        />
                      </FormControl>
                      <span className={`absolute right-3 bottom-3 text-xs ${(field.value || "").length > 160 ? "text-destructive" : "text-muted-foreground"
                        }`}>
                        {(field.value || "").length}/160
                      </span>
                    </div>
                    <FormDescription>
                      The description that appears in search engine results. Leave empty to use the category description.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Keywords</FormLabel>
                <CategoryKeywordInput form={form} />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CategorySeoAnalysis form={form} />
            <SearchPreview form={form} />
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Optimization</CardTitle>
              <CardDescription>Customize how your category page appears when shared on social media</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-base font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Open Graph (Facebook, LinkedIn)
                </h3>

                <FormField
                  control={form.control}
                  name="ogTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Open Graph Title</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            placeholder={form.watch("name") || "Enter Open Graph title"}
                            {...field}
                            className={field.value && field.value.length > 60 ? "border-destructive" : ""}
                          />
                        </FormControl>
                        <span className={`absolute right-3 top-2.5 text-xs ${(field.value || "").length > 60 ? "text-destructive" : "text-muted-foreground"
                          }`}>
                          {(field.value || "").length}/60
                        </span>
                      </div>
                      <FormDescription>
                        Title that appears when shared on Facebook, LinkedIn, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ogDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Open Graph Description</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Textarea
                            placeholder={form.watch("description") || "Enter Open Graph description"}
                            {...field}
                            className={`min-h-[100px] resize-none ${field.value && field.value.length > 160 ? "border-destructive" : ""}`}
                            rows={4}
                          />
                        </FormControl>
                        <span className={`absolute right-3 bottom-3 text-xs ${(field.value || "").length > 160 ? "text-destructive" : "text-muted-foreground"
                          }`}>
                          {(field.value || "").length}/160
                        </span>
                      </div>
                      <FormDescription>
                        Description that appears when shared on Facebook, LinkedIn, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-base font-medium flex items-center gap-2">
                  <Twitter className="h-4 w-4" /> Twitter Card
                </h3>

                <FormField
                  control={form.control}
                  name="twitterTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter Title</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            placeholder={form.watch("name") || "Enter Twitter title"}
                            {...field}
                            className={field.value && field.value.length > 60 ? "border-destructive" : ""}
                          />
                        </FormControl>
                        <span className={`absolute right-3 top-2.5 text-xs ${(field.value || "").length > 60 ? "text-destructive" : "text-muted-foreground"
                          }`}>
                          {(field.value || "").length}/60
                        </span>
                      </div>
                      <FormDescription>
                        Title that appears when shared on Twitter.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="twitterDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter Description</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Textarea
                            placeholder={form.watch("description") || "Enter Twitter description"}
                            {...field}
                            className={`min-h-[100px] resize-none ${field.value && field.value.length > 160 ? "border-destructive" : ""}`}
                            rows={4}
                          />
                        </FormControl>
                        <span className={`absolute right-3 bottom-3 text-xs ${(field.value || "").length > 160 ? "text-destructive" : "text-muted-foreground"
                          }`}>
                          {(field.value || "").length}/160
                        </span>
                      </div>
                      <FormDescription>
                        Description that appears when shared on Twitter.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced SEO Settings</CardTitle>
              <CardDescription>Configure technical SEO settings for better search engine performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="canonicalUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Canonical URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`${FRONTEND_STORE_URL}/category/category-name`}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The preferred URL for this category page. Leave blank to use the default URL.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="indexPage"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Index Page</FormLabel>
                        <FormDescription>Allow search engines to index this page</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value !== false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="followLinks"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Follow Links</FormLabel>
                        <FormDescription>Allow search engines to follow links on this page</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value !== false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schema" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schema Markup</CardTitle>
              <CardDescription>Configure structured data for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Structured data helps search engines understand your category page better and may enable rich results in search listings.
                </p>
              </div>

              <FormField
                control={form.control}
                name="enableSchema"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-6">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Schema Markup</FormLabel>
                      <FormDescription>Add structured data to help search engines display rich results</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value !== false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("enableSchema") !== false && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="schemaType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schema Type</FormLabel>
                        <FormControl>
                          <select
                            className="w-full p-2 border rounded-md"
                            {...field}
                          >
                            <option value="CollectionPage">Collection Page</option>
                            <option value="WebPage">Web Page</option>
                            <option value="CategoryPage">Category Page</option>
                          </select>
                        </FormControl>
                        <FormDescription>
                          Select the most appropriate schema type for your category page.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customSchema"
                    render={({ field }) => {
                      const [jsonError, setJsonError] = useState("")

                      const validateJson = (value: string) => {
                        if (!value.trim()) {
                          setJsonError("")
                          return
                        }
                        try {
                          JSON.parse(value)
                          setJsonError("")
                        } catch (e) {
                          setJsonError("Invalid JSON format")
                        }
                      }

                      return (
                        <FormItem>
                          <FormLabel>Custom Schema JSON-LD</FormLabel>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span></span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (field.value) {
                                    try {
                                      const formatted = JSON.stringify(JSON.parse(field.value), null, 2)
                                      field.onChange(formatted)
                                      setJsonError("")
                                    } catch (e) {
                                      setJsonError("Cannot format invalid JSON")
                                    }
                                  }
                                }}
                              >
                                Format JSON
                              </Button>
                            </div>
                            <FormControl>
                              <Textarea
                                placeholder={`{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "${form.watch("name") || "Category Name"}",
  "description": "${form.watch("description") || "Category description"}",
  "url": "${FRONTEND_STORE_URL}/category/${form.watch("slug") || "category-slug"}",
  "mainEntity": {
    "@type": "ItemList",
    "name": "${form.watch("name") || "Category Name"} Products"
  }
}`}
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => {
                                  field.onChange(e.target.value)
                                  validateJson(e.target.value)
                                }}
                                className={`min-h-[200px] font-mono text-sm resize-none ${jsonError ? "border-destructive" : ""}`}
                                rows={10}
                              />
                            </FormControl>
                          </div>
                          {jsonError && (
                            <p className="text-sm text-destructive mt-1">{jsonError}</p>
                          )}
                          <FormDescription>
                            Advanced: Add custom JSON-LD structured data. Leave empty to use auto-generated schema.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-md">
                    <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Auto-Generated Schema Preview</h4>
                    <pre className="text-xs text-blue-700 dark:text-blue-300 overflow-x-auto">
                      {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": form.watch("schemaType") || "CollectionPage",
                        "name": form.watch("name") || "Category Name",
                        "description": form.watch("description") || "Category description",
                        "url": `${FRONTEND_STORE_URL}/category/${form.watch("slug") || "category-slug"}`,
                        "image": form.watch("imageUrl") || "",
                        "mainEntity": {
                          "@type": "ItemList",
                          "name": `${form.watch("name") || "Category Name"} Products`,
                          "description": `Browse our collection of ${form.watch("name") || "category"} products`
                        },
                        "breadcrumb": {
                          "@type": "BreadcrumbList",
                          "itemListElement": [
                            {
                              "@type": "ListItem",
                              "position": 1,
                              "name": "Home",
                              "item": FRONTEND_STORE_URL
                            },
                            {
                              "@type": "ListItem",
                              "position": 2,
                              "name": form.watch("name") || "Category",
                              "item": `${FRONTEND_STORE_URL}/category/${form.watch("slug") || "category-slug"}`
                            }
                          ]
                        }
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <SearchPreview form={form} />

          <Card>
            <CardHeader>
              <CardTitle>SEO Recommendations</CardTitle>
              <CardDescription>Actionable tips to improve your category page's search visibility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!form.watch("seoTitle") && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Missing SEO Title</AlertTitle>
                    <AlertDescription>Add a custom SEO title to improve your search engine visibility.</AlertDescription>
                  </Alert>
                )}

                {!form.watch("seoDescription") && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Missing Meta Description</AlertTitle>
                    <AlertDescription>
                      Add a meta description to improve your click-through rate from search results.
                    </AlertDescription>
                  </Alert>
                )}

                {!form.watch("focusKeyword") && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Missing Focus Keyword</AlertTitle>
                    <AlertDescription>
                      Add a focus keyword to help optimize your content for search engines.
                    </AlertDescription>
                  </Alert>
                )}

                {form.watch("seoTitle") && form.watch("seoTitle").length < 30 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>SEO Title Too Short</AlertTitle>
                    <AlertDescription>
                      Your SEO title is too short. Aim for 30-60 characters for optimal visibility.
                    </AlertDescription>
                  </Alert>
                )}

                {form.watch("seoDescription") && form.watch("seoDescription").length < 120 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Meta Description Too Short</AlertTitle>
                    <AlertDescription>
                      Your meta description is too short. Aim for 120-160 characters for optimal visibility.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}