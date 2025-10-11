"use client"

import { useEffect, useState } from "react"
import { Check, X, Loader2, AlertCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface CategoryResult {
  id: string
  name: string
  slug: string
  url: string
  status: "ready" | "pending" | "success" | "error"
  statusCode?: number
  responseTime?: number
  error?: string
  type?: string
  apiSlug?: string
}

export default function Test404CheckerPage() {
  const [categories, setCategories] = useState<CategoryResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    error: 0,
    pending: 0,
  })

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/test/categories")
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch categories")
      }

      const allCategories: CategoryResult[] = data.categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        url: `/us/collections/${cat.slug}`,
        status: "ready" as const,
        type: cat.type,
        apiSlug: cat.apiSlug,
      }))

      setCategories(allCategories)
      setStats({
        total: allCategories.length,
        success: 0,
        error: 0,
        pending: 0,
      })
    } catch (error) {
      console.error("Error fetching categories:", error)
      alert(
        `Failed to fetch categories: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    } finally {
      setIsLoading(false)
    }
  }

  const testCategory = async (category: CategoryResult) => {
    try {
      const productionUrl = `https://www.fineystjackets.com${category.url}`
      
      console.log(`Testing: ${productionUrl}`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 35000)

      try {
        const response = await fetch("/api/test/check-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: productionUrl }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          console.error(`API error for ${category.slug}: ${response.status}`)
          return {
            ...category,
            status: "error",
            error: `API returned ${response.status}`,
          } as CategoryResult
        }

        const data = await response.json()
        console.log(`Result for ${category.slug}:`, data)

        if (!data.success) {
          return {
            ...category,
            status: "error",
            error: data.error || "Failed to check URL",
          } as CategoryResult
        }

        return {
          ...category,
          status: data.ok ? "success" : "error",
          statusCode: data.statusCode,
          responseTime: data.responseTime,
          error: !data.ok ? (data.error || `HTTP ${data.statusCode}`) : undefined,
        } as CategoryResult
      } catch (fetchError) {
        clearTimeout(timeoutId)
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          return {
            ...category,
            status: "error",
            error: "Request timeout",
          } as CategoryResult
        }
        throw fetchError
      }
    } catch (error) {
      console.error(`Error testing ${category.slug}:`, error)
      return {
        ...category,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      } as CategoryResult
    }
  }

  const testAllCategories = async () => {
    if (categories.length === 0) return

    console.log(`Starting test for ${categories.length} categories`)
    setIsLoading(true)

    const batchSize = 5
    const results: CategoryResult[] = []

    try {
      for (let i = 0; i < categories.length; i += batchSize) {
        const batch = categories.slice(i, i + batchSize)
        console.log(`Testing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(categories.length / batchSize)}`)
        
        const batchResults = await Promise.all(
          batch.map((cat) => testCategory(cat))
        )

        results.push(...batchResults)

        setCategories([...results, ...categories.slice(results.length)])
        setStats({
          total: categories.length,
          success: results.filter((r) => r.status === "success").length,
          error: results.filter((r) => r.status === "error").length,
          pending: categories.length - results.length,
        })

        if (i + batchSize < categories.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
      
      console.log('All tests completed')
    } catch (error) {
      console.error('Error in testAllCategories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Collection Page 404 Checker</CardTitle>
            <CardDescription>
              Test all collection pages (/us/collections/[slug]) on production to find 404 errors.
              This tool fetches category slugs from your backend and tests each URL on fineystjackets.com.
            </CardDescription>
            <p className="text-sm text-blue-600 mt-2">
              ℹ️ Using HEAD requests with timeout. Testing 5 pages at a time. Check browser console for details.
            </p>
            
            {isLoading && stats.total > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Testing in progress... (Check browser console for details)</span>
                  <span>{stats.total - stats.pending} / {stats.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((stats.total - stats.pending) / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={fetchCategories}
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Refresh Categories"
                )}
              </Button>
              <Button
                onClick={testAllCategories}
                disabled={isLoading || categories.length === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test All Categories"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Collection pages loaded</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Successful</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-500">{stats.success}</div>
              <p className="text-xs text-muted-foreground mt-1">Pages returning 200 OK</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-destructive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{stats.error}</div>
              <p className="text-xs text-muted-foreground mt-1">Pages with 404 or errors</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-500">{stats.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">Waiting to be tested</p>
            </CardContent>
          </Card>
        </div>

        {/* Results Table */}
        <Card>
          <CardHeader className="border-b bg-muted/50">
            <CardTitle className="text-base">Test Results</CardTitle>
            <CardDescription>Collection pages tested on production environment</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Category Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Production URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Response
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Response Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {categories.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-16 text-center"
                      >
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <AlertCircle className="w-12 h-12 text-muted-foreground" />
                          <div className="space-y-1">
                            <p className="text-base font-medium text-foreground">No categories found</p>
                            <p className="text-sm text-muted-foreground">
                              Click "Refresh Categories" to load collection pages from database
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    categories.map((category) => (
                      <tr
                        key={category.id}
                        className={
                          category.status === "error"
                            ? "bg-destructive/5 hover:bg-destructive/10"
                            : "hover:bg-muted/50"
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {category.status === "ready" && (
                              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                            )}
                            {category.status === "pending" && (
                              <Loader2 className="w-5 h-5 text-primary animate-spin" />
                            )}
                            {category.status === "success" && (
                              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                            {category.status === "error" && (
                              <div className="w-5 h-5 rounded-full bg-destructive flex items-center justify-center">
                                <X className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">
                              {category.name}
                            </span>
                            <span className="text-xs text-muted-foreground mt-0.5">
                              Collection Page
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-xs font-mono bg-muted px-2 py-1 rounded text-foreground">
                            {category.slug}
                          </code>
                        </td>
                        <td className="px-6 py-4 max-w-md">
                          <a
                            href={`https://www.fineystjackets.com${category.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1.5 group"
                          >
                            <span className="truncate">fineystjackets.com{category.url}</span>
                            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {category.status === "ready" && (
                            <span className="text-xs text-muted-foreground">Not tested</span>
                          )}
                          {category.statusCode && (
                            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              category.status === "success"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : "bg-destructive/10 text-destructive"
                            }`}>
                              {category.statusCode}
                            </div>
                          )}
                          {category.error && (
                            <span className="text-xs text-destructive font-medium">
                              {category.error}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {category.responseTime ? (
                            <span className="text-sm font-mono text-muted-foreground">
                              {category.responseTime}ms
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Error Summary */}
        {stats.error > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-red-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Categories with Errors ({stats.error})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories
                  .filter((cat) => cat.status === "error")
                  .map((cat) => (
                    <div
                      key={cat.id}
                      className="bg-white rounded p-3 border border-red-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">
                            {cat.name}
                          </div>
                          <div className="text-sm text-gray-600">{cat.url}</div>
                        </div>
                        <div className="text-sm text-red-600 font-medium">
                          {cat.error}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

