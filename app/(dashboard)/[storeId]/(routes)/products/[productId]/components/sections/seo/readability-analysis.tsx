"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, BarChart } from "lucide-react"

interface ReadabilityAnalysisProps {
  score: number
  contentLength: number
  readingTime: number
}

export const ReadabilityAnalysis: React.FC<ReadabilityAnalysisProps> = ({ score, contentLength, readingTime }) => {
  const getScoreColor = (score: number) => {
    if (score < 40) return "bg-destructive"
    if (score < 70) return "bg-amber-500"
    return "bg-emerald-500"
  }

  const getScoreText = (score: number) => {
    if (score < 40) return "Difficult"
    if (score < 70) return "Okay"
    return "Easy to read"
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Readability
            </h3>
            <Badge className={getScoreColor(score)}>{getScoreText(score)}</Badge>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Readability score</span>
              <span>{score}/100</span>
            </div>
            <Progress value={score} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-md">
              <Clock className="h-5 w-5 mb-1 text-muted-foreground" />
              <span className="text-lg font-medium">{readingTime} min</span>
              <span className="text-xs text-muted-foreground">Reading time</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-md">
              <BarChart className="h-5 w-5 mb-1 text-muted-foreground" />
              <span className="text-lg font-medium">{contentLength}</span>
              <span className="text-xs text-muted-foreground">Characters</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
