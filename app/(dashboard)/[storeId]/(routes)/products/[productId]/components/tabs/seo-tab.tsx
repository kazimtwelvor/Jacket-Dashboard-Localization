"use client"

import React from "react"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import * as z from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FormDescription, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Globe, Info, Lightbulb, Smartphone, Star, Twitter } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Product } from "@prisma/client"
import { SeoSchemaSection } from "../sections/seo/seo-schema-section"

interface SeoTabProps {
  initialData: Product | null
  form: any 
}

const formSchema = z.object({
  metaTitle: z.string().max(60, "Meta title should be 60 characters or less"),
  metaDescription: z.string().max(160, "Meta description should be 160 characters or less"),
  focusKeyword: z.string().min(1, "Focus keyword is required").optional().or(z.literal("")),
  additionalKeywords: z.string().optional().or(z.literal("")),
  canonicalUrl: z.string().url().optional().or(z.literal("")),
  ogTitle: z.string().max(60, "Open Graph title should be 60 characters or less"),
  ogDescription: z.string().max(160, "Open Graph description should be 160 characters or less"),
  twitterTitle: z.string().max(60, "Twitter title should be 60 characters or less"),
  twitterDescription: z.string().max(160, "Twitter description should be 160 characters or less"),
  structuredData: z.boolean().default(true),
  indexPage: z.boolean().default(true),
  followLinks: z.boolean().default(true),
})

const POWER_WORDS = [
  "amazing",
  "exclusive",
  "free",
  "instantly",
  "new",
  "powerful",
  "proven",
  "secret",
  "special",
  "ultimate",
  "unique",
  "best",
  "easy",
  "essential",
  "extraordinary",
  "guaranteed",
  "incredible",
  "revolutionary",
  "simple",
  "stunning",
]

const DetailedSeoAnalysis = ({
  form,
  getDisplayValue,
  formDescription,
  initialDescription,
}: {
  form: any
  getDisplayValue: (field: string) => string
  formDescription: string
  initialDescription: string
}) => {
  const keywords = form.getValues("seo.keywords") || []
  const focusKeyword = keywords.length > 0 ? keywords[0] : form.getValues("seo.focusKeyword") || ""
  const metaTitle = getDisplayValue("metaTitle")
  const metaDescription = getDisplayValue("metaDescription")
  const content = formDescription || initialDescription || ""
  const wordCount = (() => {
    const textContent = content.replace(/<[^>]*>/g, " ")

    const words = textContent
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter((word) => word.length > 0)

    return words.length
  })()
  const productImages = form.getValues("images") || []
  const mainImage = form.getValues("mainImage") || ""
  const allImages = [mainImage, ...productImages].filter(Boolean)

  const keywordInTitle = focusKeyword && metaTitle.toLowerCase().includes(focusKeyword.toLowerCase())

  const keywordAtBeginningOfTitle =
    focusKeyword && metaTitle.toLowerCase().indexOf(focusKeyword.toLowerCase()) < Math.min(10, metaTitle.length / 3)

  const keywordInDescription = focusKeyword && metaDescription.toLowerCase().includes(focusKeyword.toLowerCase())

  const slug = form.getValues("seo.slug") || form.getValues("slug") || ""
  const keywordInUrl = focusKeyword && slug.toLowerCase().includes(focusKeyword.toLowerCase().replace(/\s+/g, "-"))

  const keywordInFirst10Percent =
    focusKeyword && content.toLowerCase().indexOf(focusKeyword.toLowerCase()) < content.length * 0.1

  const keywordInContent = focusKeyword && content.toLowerCase().includes(focusKeyword.toLowerCase())

  const contentLengthGood = wordCount >= 300 && wordCount <= 1000

  const usingProductSchema = form.getValues("seo.structuredData")

  const keywordDensity =
    content.length > 0 && focusKeyword
      ? (content.toLowerCase().split(focusKeyword.toLowerCase()).length - 1) / (wordCount / 100)
      : 0

  const keywordAppearances =
    content.length > 0 && focusKeyword ? content.toLowerCase().split(focusKeyword.toLowerCase()).length - 1 : 0

  const urlLength = slug.length
  const urlLengthGood = urlLength > 0 && urlLength <= 75

  const keywordNotUsedBefore = true

  const hasPowerWord = POWER_WORDS.some((word) => metaTitle.toLowerCase().includes(word.toLowerCase()))

  const hasMediaContent = allImages.length > 0

  const calculateActualSeoScore = () => {
    const allChecksPassing =
      keywordInTitle &&
      keywordInDescription &&
      keywordInUrl &&
      keywordInFirst10Percent &&
      keywordInContent &&
      contentLengthGood &&
      usingProductSchema &&
      keywordDensity > 0 &&
      urlLengthGood &&
      keywordNotUsedBefore &&
      keywordAtBeginningOfTitle &&
      hasPowerWord &&
      hasMediaContent

    if (allChecksPassing) {
      return 100
    }

    let score = 0
    let totalPossiblePoints = 0

    totalPossiblePoints += 20
    if (metaTitle) score += 5
    if (metaTitle && metaTitle.length >= 30 && metaTitle.length <= 60) score += 5
    if (focusKeyword && metaTitle.toLowerCase().includes(focusKeyword.toLowerCase())) score += 5
    if (focusKeyword && metaTitle.toLowerCase().indexOf(focusKeyword.toLowerCase()) < 10) score += 5

    totalPossiblePoints += 20
    if (metaDescription) score += 5
    if (metaDescription && metaDescription.length >= 70 && metaDescription.length <= 160) score += 5
    if (focusKeyword && metaDescription.toLowerCase().includes(focusKeyword.toLowerCase())) score += 10

    totalPossiblePoints += 25
    if (wordCount >= 100) score += 5
    if (wordCount >= 300) score += 5
    if (focusKeyword && content.toLowerCase().includes(focusKeyword.toLowerCase())) score += 5
    if (focusKeyword && content.toLowerCase().indexOf(focusKeyword.toLowerCase()) < content.length * 0.1) score += 5
    if (content.split(/\n\s*\n/).length >= 3) score += 5 

    totalPossiblePoints += 5
    if (allImages.length > 0) score += 5

    totalPossiblePoints += 15
    if (form.getValues("seo.structuredData")) score += 15

    totalPossiblePoints += 10
    if (focusKeyword) score += 5
    if (keywords.length >= 3) score += 5

    return Math.min(100, Math.round((score / totalPossiblePoints) * 100))
  }

  const actualSeoScore = calculateActualSeoScore()

  React.useEffect(() => {
    const timer = setTimeout(() => {
      form.setValue("seo.seoScore", actualSeoScore, {
        shouldDirty: false,
        shouldValidate: false,
        shouldTouch: false,
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [actualSeoScore, form])

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
              <Badge variant={actualSeoScore > 60 ? "outline" : "secondary"}>{actualSeoScore}/100</Badge>
            </div>
            <Progress value={actualSeoScore} className="h-2" />
          </div>

          <div className="space-y-1 mt-4">
            <h3 className="text-sm font-medium mb-2">Detailed SEO Analysis</h3>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                {keywordInTitle ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                )}
                <span className="text-sm">
                  {keywordInTitle
                    ? "Hurray! You're using Focus Keyword in the SEO Title."
                    : "Your SEO Title doesn't contain the Focus Keyword."}
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
                    ? "Focus Keyword used inside SEO Meta Description."
                    : "Your SEO Meta Description doesn't contain the Focus Keyword."}
                </span>
              </div>

              <div className="flex items-start gap-2">
                {keywordInUrl ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                )}
                <span className="text-sm">
                  {keywordInUrl ? "Focus Keyword used in the URL." : "Your URL doesn't contain the Focus Keyword."}
                </span>
              </div>

              <div className="flex items-start gap-2">
                {keywordInFirst10Percent ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                )}
                <span className="text-sm">
                  {keywordInFirst10Percent
                    ? "Focus Keyword appears in the first 10% of the content."
                    : "Focus Keyword doesn't appear in the first 10% of the content."}
                </span>
              </div>

              <div className="flex items-start gap-2">
                {keywordInContent ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                )}
                <span className="text-sm">
                  {keywordInContent ? "Focus Keyword found in the content." : "Focus Keyword not found in the content."}
                </span>
              </div>

              <div className="flex items-start gap-2">
                {contentLengthGood ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                )}
                <span className="text-sm">
                  {contentLengthGood
                    ? `Content is ${wordCount} words long. Good job!`
                    : `Content is ${wordCount} words long. ${wordCount < 300 ? "Aim for 300-1000 words." : "Content is too long. Keep it under 1000 words."}`}
                </span>
              </div>

              <div className="flex items-start gap-2">
                {usingProductSchema ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                )}
                <span className="text-sm">
                  {usingProductSchema
                    ? "You are using the Product Schema for this Product"
                    : "You are not using Product Schema. Enable it for better visibility."}
                </span>
              </div>

              <div className="flex items-start gap-2">
                {keywordDensity > 0 ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                )}
                <span className="text-sm">
                  {keywordDensity > 0
                    ? `Keyword Density is ${keywordDensity.toFixed(2)}, the Focus Keyword appears ${keywordAppearances} times.`
                    : "No keyword density detected. Add your focus keyword to the content."}
                </span>
              </div>

              <div className="flex items-start gap-2">
                {urlLengthGood ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                )}
                <span className="text-sm">
                  {urlLengthGood
                    ? `URL is ${urlLength} characters long. Kudos!`
                    : `URL is ${urlLength} characters long. Keep it under 75 characters.`}
                </span>
              </div>

              <div className="flex items-start gap-2">
                {keywordNotUsedBefore ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                )}
                <span className="text-sm">
                  {keywordNotUsedBefore
                    ? "You haven't used this Focus Keyword before."
                    : "You've used this Focus Keyword before. Consider using a different one."}
                </span>
              </div>

              <div className="flex items-start gap-2">
                {keywordAtBeginningOfTitle ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                )}
                <span className="text-sm">
                  {keywordAtBeginningOfTitle
                    ? "Focus Keyword used at the beginning of SEO title."
                    : "Focus Keyword not used at the beginning of SEO title."}
                </span>
              </div>

              <div className="flex items-start gap-2">
                {hasPowerWord ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                )}
                <span className="text-sm">
                  {hasPowerWord
                    ? "Your title contains a power word. Great job!"
                    : "Your title doesn't contain a power word. Add at least one."}
                </span>
              </div>

              <div className="flex items-start gap-2">
                {hasMediaContent ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                )}
                <span className="text-sm">
                  {hasMediaContent
                    ? "Your content contains images."
                    : "Your content doesn't contain any images. Add media for better engagement."}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const ReadabilityAnalysis = ({ contentAnalysis }: { contentAnalysis: any }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-base">Readability</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Score</span>
            <Badge variant={contentAnalysis.readability > 60 ? "outline" : "secondary"}>
              {contentAnalysis.readability}/100
            </Badge>
          </div>
          <Progress value={contentAnalysis.readability} className="h-2" />
          <div className="text-xs text-muted-foreground mt-1">
            {contentAnalysis.readability > 80
              ? "Very easy to read"
              : contentAnalysis.readability > 60
                ? "Easy to read"
                : contentAnalysis.readability > 40
                  ? "Moderately difficult"
                  : contentAnalysis.readability > 20
                    ? "Difficult"
                    : "Very difficult"}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-md p-3 text-center">
            <div className="text-2xl font-bold">{contentAnalysis.contentLength}</div>
            <div className="text-xs text-muted-foreground">Characters</div>
          </div>
          <div className="border rounded-md p-3 text-center">
            <div className="text-2xl font-bold">{contentAnalysis.readingTime}</div>
            <div className="text-xs text-muted-foreground">Min read</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-md p-3 text-center">
            <div className="text-2xl font-bold">{contentAnalysis.wordCount || 0}</div>
            <div className="text-xs text-muted-foreground">Words</div>
          </div>
          <div className="border rounded-md p-3 text-center">
            <div className="text-2xl font-bold">{contentAnalysis.sentences || 0}</div>
            <div className="text-xs text-muted-foreground">Sentences</div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)

const SchemaToggle = ({ form }: { form: any }) => {
  const [isEnabled, setIsEnabled] = useState(() => {
    return form.getValues("seo.structuredData") !== false
  })

  useEffect(() => {
    form.setValue("seo.structuredData", isEnabled, { shouldDirty: true })

    if (isEnabled && !form.getValues("schema1")) {
      const productName = form.getValues("name") || ""
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

      try {
        form.setValue("schema1", JSON.stringify(defaultSchema, null, 2), { shouldDirty: false })
      } catch (e) {
      }
    }
  }, [isEnabled, form])

  return (
    <div className="flex flex-row items-center justify-between rounded-lg border p-4 mb-6">
      <div className="space-y-0.5">
        <FormLabel className="text-base">Enable Schema Markup</FormLabel>
        <FormDescription>Add structured data to help search engines display rich results</FormDescription>
      </div>
      <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
    </div>
  )
}

export const SeoTab = ({ initialData, form }: SeoTabProps) => {
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)

  const watchedValues = form.watch()

  const getDisplayValue = useCallback(
    (field: string) => {
      const value = form.getValues(`seo.${field}`)

      if (!value || value.trim() === "") {
        return ""
      }

      return value
    },
    [form],
  )

  const seoScore = useMemo(() => {
    let score = 0
    const metaTitle = form.getValues("seo.metaTitle") || form.getValues("name") || ""
    const metaDescription = form.getValues("seo.metaDescription") || form.getValues("description") || ""
    const focusKeyword = form.getValues("seo.focusKeyword") || ""

    if (metaTitle) score += metaTitle.length > 10 && metaTitle.length <= 60 ? 20 : 10
    if (metaDescription) score += metaDescription.length > 50 && metaDescription.length <= 160 ? 20 : 10
    if (focusKeyword) score += 20
    if (form.getValues("seo.additionalKeywords")?.length > 0) score += 15
    if (form.getValues("seo.structuredData")) score += 15
    if (form.getValues("seo.canonicalUrl")) score += 10
    setTimeout(() => {
      form.setValue("seo.seoScore", score, {
        shouldDirty: true,
        shouldValidate: false,
        shouldTouch: false,
      })
    }, 0)

    return score
  }, [form, initialData])


  const contentAnalysis = useMemo(() => {
    const formDescription = form.getValues("description") || ""
    const initialDescription = initialData?.description || ""

    const content = formDescription || initialDescription

    const contentLength = content.length

    const wordCount = (() => {
      const textContent = content.replace(/<[^>]*>/g, " ")

      const words = textContent
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .filter((word: string) => word.length > 0)

      return words.length
    })()

    const readingTime = Math.max(1, Math.ceil(wordCount / 200))

    const sentences = content.split(/[.!?]+/).filter((sentence: string) => sentence.trim().length > 0).length

    let readabilityScore = 0

    if (sentences > 0 && wordCount > 0) {
      const avgWordsPerSentence = wordCount / sentences

      const avgSyllablesPerWord = 1.5 

      const fleschScore = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord

      readabilityScore = Math.min(100, Math.max(0, fleschScore * 0.8))
    }

    const recommendations = []
    if (contentLength < 300) recommendations.push("Content is too short. Aim for at least 300 characters.")
    if (sentences > 0 && wordCount / sentences > 25)
      recommendations.push("Sentences are too long. Try to keep sentences shorter.")
    if (wordCount > 0 && contentLength / wordCount < 4)
      recommendations.push("Words are too short. Use more descriptive language.")

    const keywords = form.getValues("seo.keywords") || []
    const focusKeyword = keywords.length > 0 ? keywords[0] : ""

    if (!focusKeyword) recommendations.push("Add a focus keyword to improve SEO.")

    const metaTitle = getDisplayValue("metaTitle")
    if (metaTitle.length < 40) recommendations.push("Meta title is too short. Aim for 50-60 characters.")

    const metaDescription = getDisplayValue("metaDescription")
    if (metaDescription.length < 120) recommendations.push("Meta description is too short. Aim for 120-160 characters.")

    return {
      readability: Math.round(readabilityScore),
      seoScore,
      contentLength,
      wordCount,
      sentences,
      readingTime,
      recommendations,
      hasDescription: contentLength > 0,
    }
  }, [initialData, form, seoScore, getDisplayValue])


  const [, forceUpdate] = useState({})
  useEffect(() => {
    const subscription = form.watch(() => {
      forceUpdate({})
    })
    return () => subscription.unsubscribe()
  }, [form])


  const getFieldValue = useCallback(
    (field: string, fallback?: string) => {
      const value = form.getValues(`seo.${field}`)

      if (!value || value === "") {
        if (field === "metaTitle" || field === "ogTitle" || field === "twitterTitle") {
          return initialData?.name || ""
        }
        if (field === "metaDescription" || field === "ogDescription" || field === "twitterDescription") {
          return initialData?.description || ""
        }
        return fallback || ""
      }

      return value
    },
    [form, initialData],
  )

  const generateAiSuggestions = () => {
    setIsGeneratingSuggestions(true)
    setTimeout(() => {
      setAiSuggestions([
        "Consider adding the focus keyword near the beginning of your meta title",
        "Your meta description could be more compelling by adding a call to action",
        "Add more specific product details to improve relevance",
        "Consider adding structured data for product pricing and availability",
        "Optimize your image alt text to include the focus keyword",
      ])
      setIsGeneratingSuggestions(false)
    }, 2000)
  }

  const getScoreColor = (score: number) => {
    if (score < 40) return "bg-destructive"
    if (score < 70) return "bg-amber-500"
    return "bg-emerald-500"
  }

  const getScoreText = (score: number) => {
    if (score < 40) return "Poor"
    if (score < 70) return "Good"
    return "Excellent"
  }

  const KeywordInput = () => {
    const keywords = form.getValues("seo.keywords") || []
    const [inputValue, setInputValue] = useState("")
    const hasSetFocusKeywordRef = useRef(false)
    const inputRef = useRef<HTMLInputElement>(null)

    React.useEffect(() => {
      if ((!hasSetFocusKeywordRef.current || keywords.length > 0) && keywords.length > 0) {
        const focusKeyword = keywords[0]
        const currentFocusKeyword = form.getValues("seo.focusKeyword")

        if (focusKeyword && focusKeyword !== currentFocusKeyword) {
          form.setValue("seo.focusKeyword", focusKeyword, {
            shouldDirty: false,
            shouldValidate: false,
            shouldTouch: false,
          })

          hasSetFocusKeywordRef.current = true
        }
      }
    }, [keywords]) 

    const addKeyword = useCallback(() => {
      if (inputValue.trim()) {
        const newKeywords = [...keywords, inputValue.trim()]
        setInputValue("")
        form.setValue("seo.keywords", newKeywords, {
          shouldDirty: true,
          shouldValidate: false,
          shouldTouch: false,
        })
      }
    }, [inputValue, keywords, form])

    const removeKeyword = (index: number) => {
      const newKeywords = [...keywords]
      newKeywords.splice(index, 1)
      form.setValue("seo.keywords", newKeywords, {
        shouldDirty: true,
        shouldValidate: false,
        shouldTouch: false,
      })
    }

    const promoteToPrimary = (index: number) => {
      if (index === 0) return 

      const newKeywords = [...keywords]
      const keyword = newKeywords[index]
      newKeywords.splice(index, 1)
      newKeywords.unshift(keyword)
      form.setValue("seo.keywords", newKeywords, {
        shouldDirty: true,
        shouldValidate: false,
        shouldTouch: false,
      })
    }

    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter keyword and press Enter"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                e.stopPropagation()
                addKeyword()
                requestAnimationFrame(() => {
                  inputRef.current?.focus()
                })
              }
            }}
            onBlur={(e) => {
              
              if (e.relatedTarget?.textContent === 'Add') {
                e.preventDefault()
                requestAnimationFrame(() => {
                  inputRef.current?.focus()
                })
              }
            }}
          />
          <Button type="button" onClick={addKeyword}>
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {keywords.map((keyword: string, index: number) => (
            <Badge
              key={index}
              variant={index === 0 ? "default" : "outline"}
              className="px-3 py-1 flex items-center gap-1"
            >
              {index === 0 && <Star className="h-3 w-3 mr-1" />}
              {keyword}
              {index !== 0 && (
                <button
                  type="button"
                  className="ml-1 text-xs underline hover:text-primary"
                  onClick={() => promoteToPrimary(index)}
                >
                  promote
                </button>
              )}
              <button type="button" className="ml-1 hover:text-destructive" onClick={() => removeKeyword(index)}>
                ×
              </button>
            </Badge>
          ))}

          {keywords.length === 0 && <div className="text-sm text-muted-foreground">No keywords added yet</div>}
        </div>
      </div>
    )
  }

  const formDescription = form.getValues("description") || ""
  const initialDescription = initialData?.description || ""

  const productData = useMemo(() => {
    return {
      id: initialData?.id || undefined,
      name: form.getValues("name") || initialData?.name || "",
      description: form.getValues("description") || initialData?.description || "",
      price: form.getValues("regularPrice") || initialData?.price?.toString() || "0",
      salePrice: form.getValues("salePrice") || initialData?.salePrice?.toString() || "",
      isDiscounted: !!form.getValues("salePrice") || !!initialData?.salePrice,
      mainImage:
        form.getValues("mainImage") ||
        ((initialData as any)?.images && (initialData as any)?.images.length > 0 ? (initialData as any)?.images[0].url : ""),
      images:
        form.getValues("images") ||
        ((initialData as any)?.images
          ? Array.isArray((initialData as any).images)
            ? (initialData as any)?.images.map((img: any) => (typeof img === "string" ? img : img.url))
            : []
          : []),
      brandName: form.getValues("brandName") || initialData?.brandName || "",
      sku: form.getValues("sku") || initialData?.sku || "",
      stockStatus: form.getValues("stockStatus") || initialData?.stockStatus || "instock",
      specifications: form.getValues("specifications") || initialData?.specifications || {},
      material: form.getValues("categories.material") || (initialData as any)?.material || [],
      style: form.getValues("categories.style") || (initialData as any)?.style || [],
      gender: form.getValues("categories.gender") || initialData?.gender || "",
      tags: form.getValues("tags") || initialData?.tags || [],
      // ratingValue: form.getValues("ratingValue") || initialData?.ratingValue || "4.5",
      // reviewCount: form.getValues("reviewCount") || initialData?.reviewCount || "0",
      slug: form.getValues("seo.slug") || form.getValues("slug") || initialData?.slug || "",
      metaTitle: form.getValues("seo.metaTitle") || initialData?.metaTitle || "",
      metaDescription: form.getValues("seo.metaDescription") || initialData?.metaDescription || "",
      storeId: initialData?.storeId,
      categoryId: (initialData as any)?.categoryId,
      schema: form.getValues("schema") || initialData?.schema || "",
    }
  }, [initialData, form]) 


  return (
    <div className="space-y-6">
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
      </Alert>
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="w-full md:w-1/3">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Brand Name</CardTitle>
            <CardDescription>Set your product's brand</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <FormLabel className="flex items-center">Brand Name</FormLabel>
                <div className="relative mt-2">
                  <Input
                    value={form.getValues("brandName") || "Leather Jacket By Fineyst"}
                    onChange={(e) => form.setValue("brandName", e.target.value, { shouldDirty: true })}
                    placeholder="Leather Jacket By Fineyst"
                  />
                </div>
                <FormDescription className="mt-1">
                  This will appear in search results and product schema.
                </FormDescription>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => form.setValue("brandName", "Leather Jacket By Fineyst", { shouldDirty: true })}
            >
              Reset to Default
            </Button>
          </CardFooter>
        </Card>

        <Card className="w-full md:w-2/3">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">SEO Checklist</CardTitle>
            <CardDescription>Key optimization factors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {form.getValues("seo.metaTitle")?.trim() ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  <span>Meta Title</span>
                </div>
                <Badge
                  variant={
                    form.getValues("seo.metaTitle")?.trim()
                      ? form.getValues("seo.metaTitle").length <= 60
                        ? "outline"
                        : "destructive"
                      : "destructive"
                  }
                >
                  {form.getValues("seo.metaTitle")?.trim() ? `${form.getValues("seo.metaTitle").length}/60` : "Missing"}
                </Badge>
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {form.getValues("seo.metaDescription")?.trim() ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  <span>Meta Description</span>
                </div>
                <Badge
                  variant={
                    form.getValues("seo.metaDescription")?.trim()
                      ? form.getValues("seo.metaDescription").length <= 160
                        ? "outline"
                        : "destructive"
                      : "destructive"
                  }
                >
                  {form.getValues("seo.metaDescription")?.trim()
                    ? `${form.getValues("seo.metaDescription").length}/160`
                    : "Missing"}
                </Badge>
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {form.getValues("seo.keywords")?.length > 0 || form.getValues("seo.focusKeyword")?.trim() ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  <span>Focus Keyword</span>
                </div>
                <Badge
                  variant={
                    form.getValues("seo.keywords")?.length > 0 || form.getValues("seo.focusKeyword")?.trim()
                      ? "outline"
                      : "destructive"
                  }
                >
                  {form.getValues("seo.keywords")?.length > 0 || form.getValues("seo.focusKeyword")?.trim()
                    ? "Set"
                    : "Missing"}
                </Badge>
              </div>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {form.getValues("seo.structuredData") ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  <span>Structured Data</span>
                </div>
                <Badge variant={form.getValues("seo.structuredData") ? "outline" : "destructive"}>
                  {form.getValues("seo.structuredData") ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {aiSuggestions.length > 0 && (
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>AI-Generated SEO Suggestions</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {aiSuggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-8">
        <Tabs defaultValue="basic" className="w-full">
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
                <CardDescription>Configure the essential SEO elements for search engines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <FormLabel className="flex items-center">Meta Title</FormLabel>
                  <div className="relative mt-2">
                    <Input
                      value={form.getValues("seo.metaTitle") || ""}
                      onChange={(e) => form.setValue("seo.metaTitle", e.target.value, { shouldDirty: true })}
                      placeholder={`Custom meta title (defaults to: ${initialData?.name || "Product Name"})`}
                      className={getDisplayValue("metaTitle").length > 60 ? "border-destructive" : ""}
                    />
                    <span
                      className={`absolute right-3 top-2.5 text-xs ${
                        getDisplayValue("metaTitle").length > 60 ? "text-destructive" : "text-muted-foreground"
                      }`}
                    >
                      {getDisplayValue("metaTitle").length}/60
                    </span>
                  </div>
                  <FormDescription className="mt-1">
                    The title that appears in search engine results. Leave empty to use the product name.
                  </FormDescription>
                </div>

                <div>
                  <FormLabel className="flex items-center">Meta Description</FormLabel>
                  <div className="relative mt-2">
                    <Textarea
                      value={form.getValues("seo.metaDescription") || ""}
                      onChange={(e) => form.setValue("seo.metaDescription", e.target.value, { shouldDirty: true })}
                      placeholder={`Custom meta description (defaults to product description)`}
                      className={`min-h-[100px] ${getDisplayValue("metaDescription").length > 160 ? "border-destructive" : ""}`}
                    />
                    <span
                      className={`absolute right-3 bottom-3 text-xs ${
                        getDisplayValue("metaDescription").length > 160 ? "text-destructive" : "text-muted-foreground"
                      }`}
                    >
                      {getDisplayValue("metaDescription").length}/160
                    </span>
                  </div>
                  <FormDescription className="mt-1">
                    The description that appears in search engine results. Leave empty to use the product description.
                  </FormDescription>
                </div>

                <div className="space-y-4">
                  <div>
                    <FormLabel>Keywords</FormLabel>
                    <div className="mt-2">
                      <KeywordInput />
                    </div>
                    <FormDescription className="mt-2">
                      Enter keywords one at a time. Press Enter after each keyword. The first keyword will be your focus
                      keyword.
                    </FormDescription>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Content Analysis</CardTitle>
                <CardDescription>Analysis of your product content for SEO and readability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ReadabilityAnalysis contentAnalysis={contentAnalysis} />
                  <DetailedSeoAnalysis
                    form={form}
                    getDisplayValue={getDisplayValue}
                    formDescription={formDescription}
                    initialDescription={initialDescription}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Keyword Analysis</CardTitle>
                <CardDescription>Check how well your content uses the focus keyword</CardDescription>
              </CardHeader>
              <CardContent>
                {form.getValues("seo.focusKeyword") ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Keyword in title</span>
                        <Badge
                          variant={
                            form
                              .getValues("seo.metaTitle")
                              ?.toLowerCase()
                              .includes(form.getValues("seo.focusKeyword")?.toLowerCase())
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {form
                            .getValues("seo.metaTitle")
                            ?.toLowerCase()
                            .includes(form.getValues("seo.focusKeyword")?.toLowerCase())
                            ? "Yes"
                            : "No"}
                        </Badge>
                      </div>
                      <Progress
                        value={
                          form
                            .getValues("seo.metaTitle")
                            ?.toLowerCase()
                            .includes(form.getValues("seo.focusKeyword")?.toLowerCase())
                            ? 100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Keyword in description</span>
                        <Badge
                          variant={
                            form
                              .getValues("seo.metaDescription")
                              ?.toLowerCase()
                              .includes(form.getValues("seo.focusKeyword")?.toLowerCase())
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {form
                            .getValues("seo.metaDescription")
                            ?.toLowerCase()
                            .includes(form.getValues("seo.focusKeyword")?.toLowerCase())
                            ? "Yes"
                            : "No"}
                        </Badge>
                      </div>
                      <Progress
                        value={
                          form
                            .getValues("seo.metaDescription")
                            ?.toLowerCase()
                            .includes(form.getValues("seo.focusKeyword")?.toLowerCase())
                            ? 100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Keyword in product content</span>
                        <Badge
                          variant={
                            (formDescription || initialDescription)
                              ?.toLowerCase()
                              .includes(form.getValues("seo.focusKeyword")?.toLowerCase())
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {(formDescription || initialDescription)
                            ?.toLowerCase()
                            .includes(form.getValues("seo.focusKeyword")?.toLowerCase())
                            ? "Yes"
                            : "No"}
                        </Badge>
                      </div>
                      <Progress
                        value={
                          (formDescription || initialDescription)
                            ?.toLowerCase()
                            .includes(form.getValues("seo.focusKeyword")?.toLowerCase())
                            ? 100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Add a focus keyword to see analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Optimization</CardTitle>
                <CardDescription>Customize how your product appears when shared on social media</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    These settings control how your product appears when shared on social media platforms.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-base font-medium flex items-center gap-2">
                      <Globe className="h-4 w-4" /> Open Graph (Facebook, LinkedIn)
                    </h3>

                    <div>
                      <FormLabel className="flex items-center">Open Graph Title</FormLabel>
                      <div className="relative mt-2">
                        <Input
                          value={form.getValues("seo.ogTitle") || ""}
                          onChange={(e) => form.setValue("seo.ogTitle", e.target.value, { shouldDirty: true })}
                          placeholder={initialData?.name || "Enter Open Graph title"}
                          className={form.getValues("seo.ogTitle")?.length > 60 ? "border-destructive" : ""}
                        />
                        <span
                          className={`absolute right-3 top-2.5 text-xs ${
                            getDisplayValue("ogTitle").length > 60 ? "text-destructive" : "text-muted-foreground"
                          }`}
                        >
                          {getDisplayValue("ogTitle").length}/60
                        </span>
                      </div>
                      <FormDescription className="mt-1">
                        Title that appears when shared on Facebook, LinkedIn, etc.
                      </FormDescription>
                    </div>

                    <div>
                      <FormLabel className="flex items-center">Open Graph Description</FormLabel>
                      <div className="relative mt-2">
                        <Textarea
                          value={form.getValues("seo.ogDescription") || ""}
                          onChange={(e) => form.setValue("seo.ogDescription", e.target.value, { shouldDirty: true })}
                          placeholder={initialData?.description || "Enter Open Graph description"}
                          className={`min-h-[100px] ${form.getValues("seo.ogDescription")?.length > 160 ? "border-destructive" : ""}`}
                        />
                        <span
                          className={`absolute right-3 bottom-3 text-xs ${
                            getDisplayValue("ogDescription").length > 160 ? "text-destructive" : "text-muted-foreground"
                          }`}
                        >
                          {getDisplayValue("ogDescription").length}/160
                        </span>
                      </div>
                      <FormDescription className="mt-1">
                        Description that appears when shared on Facebook, LinkedIn, etc.
                      </FormDescription>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-base font-medium flex items-center gap-2">
                      <Twitter className="h-4 w-4" /> Twitter Card
                    </h3>

                    <div>
                      <FormLabel className="flex items-center">Twitter Title</FormLabel>
                      <div className="relative mt-2">
                        <Input
                          value={form.getValues("seo.twitterTitle") || ""}
                          onChange={(e) => form.setValue("seo.twitterTitle", e.target.value, { shouldDirty: true })}
                          placeholder={initialData?.name || "Enter Twitter title"}
                          className={form.getValues("seo.twitterTitle")?.length > 60 ? "border-destructive" : ""}
                        />
                        <span
                          className={`absolute right-3 top-2.5 text-xs ${
                            getDisplayValue("twitterTitle").length > 60 ? "text-destructive" : "text-muted-foreground"
                          }`}
                        >
                          {getDisplayValue("twitterTitle").length}/60
                        </span>
                      </div>
                      <FormDescription className="mt-1">Title that appears when shared on Twitter.</FormDescription>
                    </div>

                    <div>
                      <FormLabel className="flex items-center">Twitter Description</FormLabel>
                      <div className="relative mt-2">
                        <Textarea
                          value={form.getValues("seo.twitterDescription") || ""}
                          onChange={(e) =>
                            form.setValue("seo.twitterDescription", e.target.value, { shouldDirty: true })
                          }
                          placeholder={initialData?.description || "Enter Twitter description"}
                          className={`min-h-[100px] ${form.getValues("seo.twitterDescription")?.length > 160 ? "border-destructive" : ""}`}
                        />
                        <span
                          className={`absolute right-3 bottom-3 text-xs ${
                            getDisplayValue("twitterDescription").length > 160
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }`}
                        >
                          {getDisplayValue("twitterDescription").length}/160
                        </span>
                      </div>
                      <FormDescription className="mt-1">
                        Description that appears when shared on Twitter.
                      </FormDescription>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Select defaultValue="summary_large_image">
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select card type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="summary">Summary Card</SelectItem>
                          <SelectItem value="summary_large_image">Summary Card with Large Image</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Media Preview</CardTitle>
                <CardDescription>See how your product will appear when shared on social platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border rounded-md p-4">
                    <div className="text-blue-600 text-xl font-medium line-clamp-1">
                      {getDisplayValue("metaTitle") || "Your Product Title"}
                    </div>
                    <div className="text-green-700 text-sm mb-1">yourstore.com/products/product-name</div>
                    <div className="text-gray-700 text-sm line-clamp-2">
                      {getDisplayValue("metaDescription") ||
                        "Your product description will appear here. Make sure to write a compelling description to attract clicks from search engine results."}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-base font-medium mb-3 flex items-center gap-2">
                        <Smartphone className="h-4 w-4" /> Mobile Preview
                      </h3>
                      <div className="border rounded-md p-3 max-w-[320px] mx-auto">
                        <div className="text-blue-600 text-base font-medium line-clamp-1">
                          {getDisplayValue("metaTitle") || "Your Product Title"}
                        </div>
                        <div className="text-green-700 text-xs mb-1">yourstore.com/products/...</div>
                        <div className="text-gray-700 text-xs line-clamp-2">
                          {getDisplayValue("metaDescription") ||
                            "Your product description will appear here. Make sure to write a compelling description."}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-medium mb-3 flex items-center gap-2">
                        <Star className="h-4 w-4" /> Rich Snippet Preview
                      </h3>
                      <div className="border rounded-md p-3">
                        <div className="text-blue-600 text-base font-medium line-clamp-1">
                          {getDisplayValue("metaTitle") || "Your Product Title"}
                        </div>
                        <div className="text-green-700 text-xs mb-1">yourstore.com/products/product-name</div>
                        <div className="flex items-center gap-1 text-amber-500 text-xs mb-1">
                          <Star className="h-3 w-3 fill-current" />
                          <Star className="h-3 w-3 fill-current" />
                          <Star className="h-3 w-3 fill-current" />
                          <Star className="h-3 w-3 fill-current" />
                          <Star className="h-3 w-3" />
                          <span className="text-gray-700">(42 reviews)</span>
                        </div>
                        <div className="text-gray-700 text-xs line-clamp-2">
                          {getDisplayValue("metaDescription") ||
                            "Your product description will appear here. Make sure to write a compelling description."}
                        </div>
                        <div className="text-gray-700 text-xs mt-1">$99.99 · In stock</div>
                      </div>
                    </div>
                  </div>
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
                <div>
                  <FormLabel>Canonical URL</FormLabel>
                  <div className="mt-2">
                    <Input
                      value={form.getValues("seo.canonicalUrl") || ""}
                      onChange={(e) => form.setValue("seo.canonicalUrl", e.target.value, { shouldDirty: true })}
                      placeholder="https://yourstore.com/products/product-name"
                    />
                  </div>
                  <FormDescription className="mt-1">
                    The preferred URL for this product. Leave blank to use the default URL.
                  </FormDescription>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Index Page</FormLabel>
                      <FormDescription>Allow search engines to index</FormDescription>
                    </div>
                    <Switch
                      checked={form.getValues("seo.indexPage") || false}
                      onCheckedChange={(checked) => form.setValue("seo.indexPage", checked, { shouldDirty: true })}
                    />
                  </div>

                  <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Follow Links</FormLabel>
                      <FormDescription>Allow search engines to follow links</FormDescription>
                    </div>
                    <Switch
                      checked={form.getValues("seo.followLinks") || false}
                      onCheckedChange={(checked) => form.setValue("seo.followLinks", checked, { shouldDirty: true })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technical SEO Analysis</CardTitle>
                <CardDescription>Advanced technical SEO insights and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      <span>Mobile Friendly</span>
                    </div>
                    <Badge variant="outline">Optimized</Badge>
                  </div>
                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      <span>Page Speed</span>
                    </div>
                    <Badge variant="outline">Fast</Badge>
                  </div>
                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {form.getValues("seo.canonicalUrl") ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                      )}
                      <span>Canonical URL</span>
                    </div>
                    <Badge variant={form.getValues("seo.canonicalUrl") ? "outline" : "secondary"}>
                      {form.getValues("seo.canonicalUrl") ? "Custom" : "Default"}
                    </Badge>
                  </div>
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
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Structured data helps search engines understand your content better and may enable rich results in
                    search listings.
                  </p>
                </div>

                <SchemaToggle form={form} />

                {form.watch("seo.structuredData") && (
                  <>
                    <div className="mb-2 text-sm text-muted-foreground">
                      Schema markup helps search engines understand your content better and may enable rich results in
                      search listings.
                    </div>
                    <SeoSchemaSection form={form} productData={productData} />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search Engine Preview</CardTitle>
                <CardDescription>See how your product will appear in search engine results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border rounded-md p-4">
                    <div className="text-blue-600 text-xl font-medium line-clamp-1">
                      {getDisplayValue("metaTitle") || "Your Product Title"}
                    </div>
                    <div className="text-green-700 text-sm mb-1">yourstore.com/products/product-name</div>
                    <div className="text-gray-700 text-sm line-clamp-2">
                      {getDisplayValue("metaDescription") ||
                        "Your product description will appear here. Make sure to write a compelling description to attract clicks from search engine results."}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-base font-medium mb-3 flex items-center gap-2">
                        <Smartphone className="h-4 w-4" /> Mobile Preview
                      </h3>
                      <div className="border rounded-md p-3 max-w-[320px] mx-auto">
                        <div className="text-blue-600 text-base font-medium line-clamp-1">
                          {getDisplayValue("metaTitle") || "Your Product Title"}
                        </div>
                        <div className="text-green-700 text-xs mb-1">yourstore.com/products/...</div>
                        <div className="text-gray-700 text-xs line-clamp-2">
                          {getDisplayValue("metaDescription") ||
                            "Your product description will appear here. Make sure to write a compelling description."}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-medium mb-3 flex items-center gap-2">
                        <Star className="h-4 w-4" /> Rich Snippet Preview
                      </h3>
                      <div className="border rounded-md p-3">
                        <div className="text-blue-600 text-base font-medium line-clamp-1">
                          {getDisplayValue("metaTitle") || "Your Product Title"}
                        </div>
                        <div className="text-green-700 text-xs mb-1">yourstore.com/products/product-name</div>
                        <div className="flex items-center gap-1 text-amber-500 text-xs mb-1">
                          <Star className="h-3 w-3 fill-current" />
                          <Star className="h-3 w-3 fill-current" />
                          <Star className="h-3 w-3 fill-current" />
                          <Star className="h-3 w-3 fill-current" />
                          <Star className="h-3 w-3" />
                          <span className="text-gray-700">(42 reviews)</span>
                        </div>
                        <div className="text-gray-700 text-xs line-clamp-2">
                          {getDisplayValue("metaDescription") ||
                            "Your product description will appear here. Make sure to write a compelling description."}
                        </div>
                        <div className="text-gray-700 text-xs mt-1">$99.99 · In stock</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Recommendations</CardTitle>
                <CardDescription>Actionable tips to improve your product's search visibility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!form.getValues("seo.metaTitle") && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Missing Meta Title</AlertTitle>
                      <AlertDescription>Add a meta title to improve your search engine visibility.</AlertDescription>
                    </Alert>
                  )}

                  {!form.getValues("seo.metaDescription") && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Missing Meta Description</AlertTitle>
                      <AlertDescription>
                        Add a meta description to improve your click-through rate from search results.
                      </AlertDescription>
                    </Alert>
                  )}

                  {!form.getValues("seo.focusKeyword") && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Missing Focus Keyword</AlertTitle>
                      <AlertDescription>
                        Add a focus keyword to help optimize your content for search engines.
                      </AlertDescription>
                    </Alert>
                  )}

                  {form.getValues("seo.metaTitle") && form.getValues("seo.metaTitle").length < 30 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Meta Title Too Short</AlertTitle>
                      <AlertDescription>
                        Your meta title is too short. Aim for 50-60 characters for optimal visibility.
                      </AlertDescription>
                    </Alert>
                  )}

                  {form.getValues("seo.metaDescription") && form.getValues("seo.metaDescription").length < 70 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Meta Description Too Short</AlertTitle>
                      <AlertDescription>
                        Your meta description is too short. Aim for 120-160 characters for optimal visibility.
                      </AlertDescription>
                    </Alert>
                  )}

                  {form.getValues("seo.focusKeyword") &&
                    form.getValues("seo.metaTitle") &&
                    !form
                      .getValues("seo.metaTitle")
                      .toLowerCase()
                      .includes(form.getValues("seo.focusKeyword").toLowerCase()) && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Keyword Missing in Title</AlertTitle>
                        <AlertDescription>
                          Include your focus keyword in the meta title for better SEO.
                        </AlertDescription>
                      </Alert>
                    )}

                  {form.getValues("seo.focusKeyword") &&
                    form.getValues("seo.metaDescription") &&
                    !form
                      .getValues("seo.metaDescription")
                      .toLowerCase()
                      .includes(form.getValues("seo.focusKeyword").toLowerCase()) && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Keyword Missing in Description</AlertTitle>
                        <AlertDescription>
                          Include your focus keyword in the meta description for better SEO.
                        </AlertDescription>
                      </Alert>
                    )}

                  {seoScore >= 70 && (
                    <Alert className="bg-emerald-50 text-emerald-800 border-emerald-200">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <AlertTitle>Good SEO Score</AlertTitle>
                      <AlertDescription>Your product has a good SEO score. Keep up the good work!</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
