"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle } from "lucide-react"

interface KeywordAnalysisProps {
  content: string
  title: string
  description: string
  imageAlt: string
  focusKeyword: string
}

export const KeywordAnalysis: React.FC<KeywordAnalysisProps> = ({
  content,
  title,
  description,
  imageAlt,
  focusKeyword,
}) => {
  if (!focusKeyword) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">Add a focus keyword to see analysis</p>
      </div>
    )
  }

  const keywordLower = focusKeyword.toLowerCase()
  const titleLower = title.toLowerCase()
  const descriptionLower = description.toLowerCase()
  const contentLower = content.toLowerCase()
  const imageAltLower = imageAlt.toLowerCase()

  const inTitle = titleLower.includes(keywordLower)
  const inDescription = descriptionLower.includes(keywordLower)
  const inContent = contentLower.includes(keywordLower)
  const inImageAlt = imageAltLower.includes(keywordLower)

  const contentDensity = contentLower.split(keywordLower).length - 1
  const contentWords = contentLower.split(/\s+/).length
  const keywordDensity = contentWords > 0 ? (contentDensity / contentWords) * 100 : 0
  const idealDensity = keywordDensity >= 0.5 && keywordDensity <= 2.5

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm">Keyword in title</span>
          <Badge variant={inTitle ? "outline" : "destructive"}>{inTitle ? "Yes" : "No"}</Badge>
        </div>
        <Progress value={inTitle ? 100 : 0} className="h-2" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm">Keyword in description</span>
          <Badge variant={inDescription ? "outline" : "destructive"}>{inDescription ? "Yes" : "No"}</Badge>
        </div>
        <Progress value={inDescription ? 100 : 0} className="h-2" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm">Keyword in content</span>
          <Badge variant={inContent ? "outline" : "destructive"}>{inContent ? "Yes" : "No"}</Badge>
        </div>
        <Progress value={inContent ? 100 : 0} className="h-2" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm">Keyword in image alt text</span>
          <Badge variant={inImageAlt ? "outline" : "destructive"}>{inImageAlt ? "Yes" : "No"}</Badge>
        </div>
        <Progress value={inImageAlt ? 100 : 0} className="h-2" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm">Keyword density</span>
          <Badge variant={idealDensity ? "outline" : contentDensity > 0 ? "secondary" : "destructive"}>
            {keywordDensity.toFixed(1)}%
          </Badge>
        </div>
        <Progress
          value={Math.min(100, keywordDensity * 40)}
          className={`h-2 ${idealDensity ? "" : contentDensity > 0 ? "bg-amber-500" : "bg-destructive"}`}
        />
        <p className="text-xs text-muted-foreground">
          {idealDensity
            ? "Ideal keyword density (0.5% - 2.5%)"
            : keywordDensity > 2.5
              ? "Keyword density too high (potential keyword stuffing)"
              : contentDensity > 0
                ? "Keyword density too low"
                : "Keyword not found in content"}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          {inTitle && inDescription && inContent && idealDensity ? (
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-500" />
          )}
          <span className="font-medium">
            {inTitle && inDescription && inContent && idealDensity
              ? "Excellent keyword optimization"
              : "Keyword optimization needs improvement"}
          </span>
        </div>
      </div>
    </div>
  )
}
