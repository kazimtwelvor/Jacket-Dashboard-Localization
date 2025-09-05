"use client"

import { useFormContext } from "react-hook-form"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"

export const SeoScoreIndicator = () => {
  const form = useFormContext()
  const [score, setScore] = useState(0)

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "seo.seoScore" || name === undefined) {
        setScore(form.getValues("seo.seoScore") || 0)
      }
    })

    setScore(form.getValues("seo.seoScore") || 0)

    return () => subscription.unsubscribe()
  }, [form])

  const getScoreColor = (score: number) => {
    if (score < 40) return "text-red-500"
    if (score < 70) return "text-amber-500"
    return "text-emerald-500"
  }

  const getScoreText = (score: number) => {
    if (score < 40) return "Poor"
    if (score < 70) return "Good"
    return "Excellent"
  }

  const ScoreIcon = ({ score }: { score: number }) => {
    if (score < 40) return <XCircle className="w-6 h-6 text-red-500" />
    if (score < 70) return <AlertTriangle className="w-6 h-6 text-amber-500" />
    return <CheckCircle className="w-6 h-6 text-emerald-500" />
  }

  const getProgressColor = (score: number) => {
    if (score < 40) return "bg-red-500"
    if (score < 70) return "bg-amber-500"
    return "bg-emerald-500"
  }

  return (
    <Card className="border shadow-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-muted/20 flex items-center justify-center relative">
                <div className="absolute inset-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted/30"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${score * 2.51}, 251`}
                      className={getScoreColor(score)}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}%</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ScoreIcon score={score} />
                <h2 className={`text-xl font-semibold ${getScoreColor(score)}`}>SEO Score: {getScoreText(score)}</h2>
              </div>
              <p className="text-muted-foreground max-w-md">
                {score < 40
                  ? "Your SEO needs improvement. Follow the checklist to increase visibility."
                  : score < 70
                    ? "Good progress on SEO. A few more improvements will help your product rank better."
                    : "Excellent SEO optimization! Your product is well-optimized for search engines."}
              </p>
            </div>
          </div>
          <div className="w-full sm:w-1/3">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">SEO Progress</span>
              <span className={`font-semibold ${getScoreColor(score)}`}>{score}%</span>
            </div>
            <Progress value={score} className="h-3 rounded-full" indicatorClassName={getProgressColor(score)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
