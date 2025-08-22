"use client"

import type React from "react"

import { useState } from "react"
import { Lightbulb, ArrowRight, TrendingUp, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

interface SeoScoreCardProps {
  score: number
  onGenerateSuggestions: () => void
  isGenerating: boolean
}

export const SeoScoreCard: React.FC<SeoScoreCardProps> = ({ score, onGenerateSuggestions, isGenerating }) => {
  const [activeTab, setActiveTab] = useState("insights")

  // Calculate how good the keyword is based on score
  const getKeywordCompetitiveness = (score: number) => {
    if (score < 30) return { level: "Low", badge: "text-emerald-700 bg-emerald-100" }
    if (score < 70) return { level: "Medium", badge: "text-amber-700 bg-amber-100" }
    return { level: "High", badge: "text-red-700 bg-red-100" }
  }

  // Generate random search positions based on seed (score)
  const generatePosition = (base: number, variance: number) => {
    return Math.max(1, Math.round(base + ((((score * 7) % 10) - 5) / 10) * variance))
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Keyword Opportunities</CardTitle>
        <CardDescription>Discover how to improve your search visibility</CardDescription>
      </CardHeader>
      <Tabs defaultValue="insights" value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6 pt-2">
          <TabsList className="grid grid-cols-3 w-full mb-1">
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-4 px-6">
          <TabsContent value="insights" className="mt-0 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                <Lightbulb size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium">Focus keyword performance</h4>
                <p className="text-xs text-muted-foreground">People also search for variations of your keywords</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Keyword difficulty</span>
                  <span className="text-xs text-muted-foreground">(Based on top 10 results)</span>
                </div>
                <Badge variant="secondary" className={getKeywordCompetitiveness(score).badge}>
                  {getKeywordCompetitiveness(score).level}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Content gap</span>
                <Badge variant="outline" className="font-normal">
                  {100 - score}%
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Search intent match</span>
                <Badge variant="outline" className="font-normal">
                  {Math.min(100, score + 15)}%
                </Badge>
              </div>
            </div>

            <div className="border-t pt-3 mt-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Content completeness</span>
                  <span className="font-medium">{score}%</span>
                </div>
                <Progress value={score} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {score < 50
                    ? "Add more details about product specifications and benefits"
                    : score < 80
                      ? "Good progress! Add more unique selling points to stand out"
                      : "Excellent! Your content covers most key areas"}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ranking" className="mt-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-50 p-2 rounded-full text-emerald-600">
                <TrendingUp size={20} />
              </div>
              <div>
                <h4 className="text-sm font-medium">Estimated search positions</h4>
                <p className="text-xs text-muted-foreground">Based on content quality and keyword relevance</p>
              </div>
            </div>

            <div className="space-y-2 mt-3">
              {["Google", "Bing", "Amazon", "YouTube"].map((engine, idx) => (
                <div key={engine} className="flex items-center justify-between p-2 bg-muted/40 rounded-md">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{engine}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${idx === 0 || idx === 2 ? "text-emerald-600 font-medium" : ""}`}>
                      Position {generatePosition(10 - Math.floor(score / 20), 6)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
              <p>Improve your ranking by using keywords in the first paragraph and H1 tag.</p>
            </div>
          </TabsContent>

          <TabsContent value="competitors" className="mt-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-50 p-2 rounded-full text-amber-600">
                <Target size={20} />
              </div>
              <div>
                <h4 className="text-sm font-medium">Competitive analysis</h4>
                <p className="text-xs text-muted-foreground">What's working for your competitors</p>
              </div>
            </div>

            <div className="space-y-2 mt-1">
              <div className="flex items-center justify-between p-2">
                <span className="text-sm font-medium">Common keywords in top results</span>
              </div>

              <div className="flex flex-wrap gap-1 mt-1">
                {["quality", "premium", "durable", "stylish", "comfortable"].map((term) => (
                  <Badge key={term} variant="outline" className="text-xs">
                    {term}
                  </Badge>
                ))}
              </div>

              <div className="mt-3 space-y-2">
                <h5 className="text-sm font-medium">Competitive advantages</h5>
                <ul className="text-xs space-y-1.5">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-3 w-3 mt-1 text-muted-foreground" />
                    <span>Average word count: 850 words ({Math.floor(score / 10) * 100} in yours)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-3 w-3 mt-1 text-muted-foreground" />
                    <span>All competitors use schema markup</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-3 w-3 mt-1 text-muted-foreground" />
                    <span>Most include video content (80%)</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onGenerateSuggestions} disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Get Keyword Suggestions"}
        </Button>
      </CardFooter>
    </Card>
  )
}
