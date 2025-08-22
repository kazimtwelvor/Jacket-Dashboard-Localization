"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, FileText } from "lucide-react"

interface ContentAnalysisProps {
  seoScore: number
  focusKeyword: string
  recommendations: string[]
}

export const ContentAnalysis: React.FC<ContentAnalysisProps> = ({ seoScore, focusKeyword, recommendations }) => {
  const getScoreColor = (score: number) => {
    if (score < 40) return "bg-destructive"
    if (score < 70) return "bg-amber-500"
    return "bg-emerald-500"
  }

  const getScoreText = (score: number) => {
    if (score < 40) return "Needs improvement"
    if (score < 70) return "Good"
    return "Excellent"
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" /> Content Analysis
            </h3>
            <Badge className={getScoreColor(seoScore)}>{getScoreText(seoScore)}</Badge>
          </div>

          <div className="space-y-3">
            {focusKeyword ? (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>
                  Focus keyword set: <span className="font-medium">{focusKeyword}</span>
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span>No focus keyword set</span>
              </div>
            )}

            {recommendations.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                <ul className="space-y-2">
                  {recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recommendations.length === 0 && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>No content issues detected</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
