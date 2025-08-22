"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tag, ShoppingBag, CheckCircle2, XCircle } from "lucide-react"

interface CategoryStatsProps {
  totalCategories: number
  totalProducts: number
  categoriesWithProducts: number
  emptyCategories: number
  compact?: boolean
}

export const CategoryStats = ({
  totalCategories,
  totalProducts,
  categoriesWithProducts,
  emptyCategories,
  compact = false,
}: CategoryStatsProps) => {
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" />
            Total Categories
          </span>
          <span className="font-medium">{totalCategories}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <ShoppingBag className="h-3.5 w-3.5" />
            Total Products
          </span>
          <span className="font-medium">{totalProducts}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            With Products
          </span>
          <span className="font-medium">{categoriesWithProducts}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5" />
            Empty Categories
          </span>
          <span className="font-medium">{emptyCategories}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
          <Tag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCategories}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">With Products</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{categoriesWithProducts}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((categoriesWithProducts / totalCategories) * 100)}% of categories
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Empty Categories</CardTitle>
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{emptyCategories}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((emptyCategories / totalCategories) * 100)}% of categories
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
