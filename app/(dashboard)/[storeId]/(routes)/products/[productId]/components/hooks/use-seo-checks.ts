"use client"

import { useMemo, useRef } from "react"
import type { UseFormReturn } from "react-hook-form"
import type { ProductFormValues } from "../product-form-schema"

export type SeoCheckResult = { passed: boolean; message: string }
export type SeoCheckCategory = { name: string; checks: SeoCheckResult[]; allPassed: boolean }

export const useSeoChecks = (form: UseFormReturn<ProductFormValues>) => {
  const prevScoreRef = useRef<number>(0)

  const watchedValues = form.watch([
    "name",
    "description",
    "seo.metaTitle",
    "seo.metaDescription",
    "seo.slug",
    "seo.keywords",
    "images",
    "mainImage",
  ])

  const checkFocusKeywordInTitle = (): SeoCheckResult => {
    const keywords = form.watch("seo.keywords") || []
    const focusKeyword = keywords.length > 0 ? keywords[0] : ""
    const title = form.watch("seo.metaTitle") || form.watch("name") || ""

    if (!focusKeyword) return { passed: false, message: "No focus keyword set" }
    if (!title) return { passed: false, message: "No title set" }

    const keywordInTitle = title.toLowerCase().includes(focusKeyword.toLowerCase())
    return {
      passed: keywordInTitle,
      message: keywordInTitle ? "Focus keyword appears in the title" : "Focus keyword does not appear in the title",
    }
  }

  const checkFocusKeywordInDescription = (): SeoCheckResult => {
    const keywords = form.watch("seo.keywords") || []
    const focusKeyword = keywords.length > 0 ? keywords[0] : ""
    const description = form.watch("seo.metaDescription") || form.watch("description") || ""

    if (!focusKeyword) return { passed: false, message: "No focus keyword set" }
    if (!description) return { passed: false, message: "No description set" }

    const keywordInDescription = description.toLowerCase().includes(focusKeyword.toLowerCase())
    return {
      passed: keywordInDescription,
      message: keywordInDescription
        ? "Focus keyword appears in the description"
        : "Focus keyword does not appear in the description",
    }
  }

  const checkFocusKeywordInSlug = (): SeoCheckResult => {
    const keywords = form.watch("seo.keywords") || []
    const focusKeyword = keywords.length > 0 ? keywords[0] : ""
    const slug =
      form.watch("seo.slug") || form.watch("slug") || form.watch("name")?.toLowerCase().replace(/\s+/g, "-") || ""

    if (!focusKeyword) return { passed: false, message: "No focus keyword set" }
    if (!slug) return { passed: false, message: "No slug set" }

    const keywordSlug = focusKeyword.toLowerCase().replace(/\s+/g, "-")
    const keywordInSlug = slug.toLowerCase().includes(keywordSlug)
    return {
      passed: keywordInSlug,
      message: keywordInSlug ? "Focus keyword appears in the URL" : "Focus keyword does not appear in the URL",
    }
  }

  const checkTitleLength = (): SeoCheckResult => {
    const title = form.watch("seo.metaTitle") || form.watch("name") || ""
    const length = title.length

    if (length === 0) return { passed: false, message: "Title is empty" }
    if (length < 30) return { passed: false, message: "Title is too short (less than 30 characters)" }
    if (length > 60) return { passed: false, message: "Title is too long (more than 60 characters)" }

    return { passed: true, message: "Title length is good (between 30-60 characters)" }
  }

  const checkDescriptionLength = (): SeoCheckResult => {
    const description = form.watch("seo.metaDescription") || form.watch("description") || ""
    const length = description.length
    const wordCount = description.split(/\s+/).filter(Boolean).length

    if (length === 0) return { passed: false, message: "Description is empty" }
    if (length < 70) return { passed: false, message: "Description is too short (less than 70 characters)" }
    if (length > 160) return { passed: false, message: "Description is too long (more than 160 characters)" }

    return { passed: true, message: "Description length is good (between 70-160 characters)" }
  }

  const checkContentLength = (): SeoCheckResult => {
    const content = form.watch("description") || ""
    const wordCount = content.split(/\s+/).filter(Boolean).length

    if (wordCount === 0) return { passed: false, message: "Content is empty" }
    if (wordCount < 100) return { passed: false, message: "Content is too short (less than 100 words)" }
    if (wordCount < 300) return { passed: false, message: "Content is on the short side (less than 300 words)" }

    return { passed: true, message: `Content is ${wordCount} words, which is good` }
  }

  const checkImagesHaveAlt = (): SeoCheckResult => {
    const mainImage = form.watch("mainImage")
    const images = form.watch("images") || []
    const allImages = [mainImage, ...images].filter(Boolean)

    if (allImages.length === 0) return { passed: false, message: "No images added to the product" }

    return { passed: true, message: `Product has ${allImages.length} images` }
  }

  const checkTitleCase = (): SeoCheckResult => {
    const title = form.watch("seo.metaTitle") || form.watch("name") || ""
    if (!title) return { passed: false, message: "No title set" }

    const hasAllCapsWords = /\b[A-Z]{3,}\b/.test(title)
    return {
      passed: !hasAllCapsWords,
      message: hasAllCapsWords ? "Title contains words in all capitals" : "Title has proper capitalization",
    }
  }

  const checkTitleHasNumber = (): SeoCheckResult => {
    const title = form.watch("seo.metaTitle") || form.watch("name") || ""
    if (!title) return { passed: false, message: "No title set" }

    const hasNumbers = /\d/.test(title)
    return {
      passed: hasNumbers,
      message: hasNumbers
        ? "Title contains numbers which can improve CTR"
        : "Consider adding numbers to your title to improve CTR",
    }
  }

  const checkParagraphLength = (): SeoCheckResult => {
    const content = form.watch("description") || ""
    if (!content) return { passed: false, message: "No content set" }

    const paragraphs = content.split(/\n\s*\n/)
    const longParagraphs = paragraphs.filter((p) => {
      const wordCount = p.split(/\s+/).filter(Boolean).length
      return wordCount > 150
    })

    return {
      passed: longParagraphs.length === 0,
      message:
        longParagraphs.length > 0
          ? `${longParagraphs.length} paragraphs are too long (more than 150 words)`
          : "Paragraphs are a good length",
    }
  }

  const checkReadabilityScore = (): SeoCheckResult => {
    const content = form.watch("description") || ""
    if (!content) return { passed: false, message: "No content set" }

    const sentences = content.split(/[.!?]+/).filter(Boolean).length

    const words = content.split(/\s+/).filter(Boolean).length

    const syllables = content.replace(/[^aeiouy]/gi, "").length

    if (sentences === 0 || words === 0)
      return { passed: false, message: "Content is too short for readability analysis" }

    const wordsPerSentence = words / sentences
    const syllablesPerWord = syllables / words

    const readabilityScore = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord
    const normalizedScore = Math.min(100, Math.max(0, readabilityScore))

    const goodReadability = wordsPerSentence < 20 && syllablesPerWord < 1.5

    return {
      passed: goodReadability,
      message: goodReadability
        ? `Content has good readability (score: ${normalizedScore.toFixed(0)})`
        : `Content readability could be improved (score: ${normalizedScore.toFixed(0)})`,
    }
  }

  const calculateSeoScore = (checks: SeoCheckCategory[]): number => {
    let totalPossiblePoints = 0
    let earnedPoints = 0

    checks.forEach((category) => {
      category.checks.forEach((check) => {
        totalPossiblePoints++
        if (check.passed) earnedPoints++
      })
    })

    const score = totalPossiblePoints > 0 ? Math.round((earnedPoints / totalPossiblePoints) * 100) : 0

    if (score !== prevScoreRef.current) {
      prevScoreRef.current = score

      setTimeout(() => {
        form.setValue("seo.seoScore", score, {
          shouldDirty: false,
          shouldValidate: false,
          shouldTouch: false,
        })
      }, 0)
    }

    return score
  }

  const seoChecks = useMemo(() => {
    const basicSeoChecks: SeoCheckCategory = {
      name: "Basic SEO",
      checks: [
        checkFocusKeywordInTitle(),
        checkFocusKeywordInDescription(),
        checkFocusKeywordInSlug(),
        checkTitleLength(),
        checkDescriptionLength(),
      ],
      allPassed: false,
    }

    const additionalChecks: SeoCheckCategory = {
      name: "Additional",
      checks: [checkContentLength(), checkImagesHaveAlt()],
      allPassed: false,
    }

    const titleReadabilityChecks: SeoCheckCategory = {
      name: "Title Readability",
      checks: [checkTitleCase(), checkTitleHasNumber()],
      allPassed: false,
    }

    const contentReadabilityChecks: SeoCheckCategory = {
      name: "Content Readability",
      checks: [checkReadabilityScore(), checkParagraphLength()],
      allPassed: false,
    }

    basicSeoChecks.allPassed = basicSeoChecks.checks.every((check) => check.passed)
    additionalChecks.allPassed = additionalChecks.checks.every((check) => check.passed)
    titleReadabilityChecks.allPassed = titleReadabilityChecks.checks.every((check) => check.passed)
    contentReadabilityChecks.allPassed = contentReadabilityChecks.checks.every((check) => check.passed)

    const allChecks = {
      basicSeo: basicSeoChecks,
      additional: additionalChecks,
      titleReadability: titleReadabilityChecks,
      contentReadability: contentReadabilityChecks,
    }

    const seoScore = calculateSeoScore([
      basicSeoChecks,
      additionalChecks,
      titleReadabilityChecks,
      contentReadabilityChecks,
    ])

    return allChecks
  }, [watchedValues])

  return { seoChecks }
}
