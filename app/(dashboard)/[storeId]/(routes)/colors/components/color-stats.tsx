"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette, Sun, Moon } from "lucide-react"

interface ColorStatsProps {
  totalColors: number
  lightColors: number
  darkColors: number
  compact?: boolean
}

export const ColorStats = ({ totalColors, lightColors, darkColors, compact = false }: ColorStatsProps) => {
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Palette className="h-3.5 w-3.5" />
            Total Colors
          </span>
          <span className="font-medium">{totalColors}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Sun className="h-3.5 w-3.5" />
            Light Colors
          </span>
          <span className="font-medium">{lightColors}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Moon className="h-3.5 w-3.5" />
            Dark Colors
          </span>
          <span className="font-medium">{darkColors}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Colors</CardTitle>
          <Palette className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalColors}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Light Colors</CardTitle>
          <Sun className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{lightColors}</div>
          <p className="text-xs text-muted-foreground">{Math.round((lightColors / totalColors) * 100)}% of colors</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dark Colors</CardTitle>
          <Moon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{darkColors}</div>
          <p className="text-xs text-muted-foreground">{Math.round((darkColors / totalColors) * 100)}% of colors</p>
        </CardContent>
      </Card>
    </div>
  )
}
