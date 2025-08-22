"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Ruler, CheckCircle2, XCircle } from "lucide-react"

interface SizeStatsProps {
  totalSizes: number
  commonSizes: number
  specialSizes: number
  compact?: boolean
}

export const SizeStats = ({ totalSizes, commonSizes, specialSizes, compact = false }: SizeStatsProps) => {
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Ruler className="h-3.5 w-3.5" />
            Total Sizes
          </span>
          <span className="font-medium">{totalSizes}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Common Sizes
          </span>
          <span className="font-medium">{commonSizes}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5" />
            Special Sizes
          </span>
          <span className="font-medium">{specialSizes}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sizes</CardTitle>
          <Ruler className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSizes}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Common Sizes</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{commonSizes}</div>
          <p className="text-xs text-muted-foreground">{Math.round((commonSizes / totalSizes) * 100)}% of sizes</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Special Sizes</CardTitle>
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{specialSizes}</div>
          <p className="text-xs text-muted-foreground">{Math.round((specialSizes / totalSizes) * 100)}% of sizes</p>
        </CardContent>
      </Card>
    </div>
  )
}
