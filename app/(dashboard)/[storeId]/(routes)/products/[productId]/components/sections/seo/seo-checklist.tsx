"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle } from "lucide-react"

interface SeoChecklistProps {
  metaTitle: string
  metaDescription: string
  focusKeyword: string
  imageAltText: boolean
  structuredData: boolean
}

export const SeoChecklist: React.FC<SeoChecklistProps> = ({
  metaTitle,
  metaDescription,
  focusKeyword,
  imageAltText,
  structuredData,
}) => {
  const titleLength = metaTitle?.length || 0
  const descriptionLength = metaDescription?.length || 0
  const hasFocusKeyword = !!focusKeyword && focusKeyword.trim() !== ""
  const hasImageAlt = !!imageAltText
  const hasStructuredData = !!structuredData

  const titleValid = titleLength > 0 && titleLength <= 60
  const descriptionValid = descriptionLength > 0 && descriptionLength <= 160

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">SEO Checklist</CardTitle>
        <CardDescription>Key optimization factors</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {titleValid ? (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              <span>Meta Title</span>
            </div>
            <Badge variant={titleValid ? "outline" : "destructive"}>{titleLength}/60</Badge>
          </div>
          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {descriptionValid ? (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              <span>Meta Description</span>
            </div>
            <Badge variant={descriptionValid ? "outline" : "destructive"}>{descriptionLength}/160</Badge>
          </div>
          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasFocusKeyword ? (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              <span>Focus Keyword</span>
            </div>
            <Badge variant={hasFocusKeyword ? "outline" : "destructive"}>{hasFocusKeyword ? "Set" : "Missing"}</Badge>
          </div>
          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasImageAlt ? (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              <span>Image Alt Text</span>
            </div>
            <Badge variant={hasImageAlt ? "outline" : "destructive"}>{hasImageAlt ? "Set" : "Missing"}</Badge>
          </div>
          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasStructuredData ? (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              <span>Structured Data</span>
            </div>
            <Badge variant={hasStructuredData ? "outline" : "destructive"}>
              {hasStructuredData ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
