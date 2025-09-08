"use client"

import { useState, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { Loader2, AlertCircle, Star, StarHalf, Sparkles, Database, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import type { ProductFormValues } from "../../product-form-schema"
import { generateAndSaveReviews } from "../../actions/generate-and-save-reviews"
import { getProductReviews } from "../../actions/get-product-reviews"
import { testReviewSave } from "../../actions/test-review-save"
import { getReviewCount } from "../../actions/get-review-count"

interface ProductReview {
  id?: string
  text: string
  customerName: string
  rating: number
  date: string
}

export const ReviewsSection = () => {
  const { toast } = useToast()
  const form = useFormContext<ProductFormValues>()
  const [isGenerating, setIsGenerating] = useState(false)
  const [reviewCount, setReviewCount] = useState(10)
  const [error, setError] = useState<string | null>(null)
  const [savedReviews, setSavedReviews] = useState<ProductReview[]>([])
  const [cachedReviews, setCachedReviews] = useState<ProductReview[]>([])
  const [lastGenerationCount, setLastGenerationCount] = useState(0)
  const [existingReviews, setExistingReviews] = useState<ProductReview[]>([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [isTestingReviewSave, setIsTestingReviewSave] = useState(false)
  const [reviewStats, setReviewStats] = useState({ total: 0, product: 0 })

  const productName = form.watch("name")
  const productDescription = form.watch("description")
  const reviewsEnabled = form.watch("reviews")

  const getProductId = () => {
    const pathParts = window.location.pathname.split("/")
    return pathParts[pathParts.length - 1]
  }

  const getStoreId = () => {
    const pathParts = window.location.pathname.split("/")
    return pathParts[1]
  }

  useEffect(() => {
    const loadExistingReviews = async () => {
      const productId = getProductId()
      const storeId = getStoreId()
      
      if (productId && storeId && productId !== "new") {
        setIsLoadingReviews(true)
        try {
          const result = await getProductReviews(storeId, productId)
          if (result.success) {
            setExistingReviews(result.reviews)
          }
          
          const savedCachedReviews = localStorage.getItem(`cachedReviews_${productId}`)
          if (savedCachedReviews) {
            const parsedReviews = JSON.parse(savedCachedReviews)
            setCachedReviews(parsedReviews)
            form.setValue("cachedReviews", parsedReviews, { shouldValidate: false })
          }
        } catch (error) {
        } finally {
          setIsLoadingReviews(false)
        }
      } else if (productId === "new") {
        const savedCachedReviews = localStorage.getItem(`cachedReviews_new`)
        if (savedCachedReviews) {
          const parsedReviews = JSON.parse(savedCachedReviews)
          setCachedReviews(parsedReviews)
          form.setValue("cachedReviews", parsedReviews, { shouldValidate: false })
        }
      }
    }
    
    loadExistingReviews()
    
    const loadReviewCount = async () => {
      const productId = getProductId()
      const storeId = getStoreId()
      
      if (storeId) {
        try {
          const result = await getReviewCount(storeId, productId)
          if (result.success) {
            setReviewStats({ total: result.totalReviews, product: result.productReviews })
          }
        } catch (error) {
        }
      }
    }
    
    loadReviewCount()
  }, [])

  const handleGenerateAndSaveReviews = async () => {
    try {
      setIsGenerating(true)
      setError(null)

      if (!productName) {
        toast({
          title: "Product name required",
          description: "Please enter a product name before generating reviews",
          variant: "destructive",
        })
        return
      }

      const productId = getProductId()
      const storeId = getStoreId()

      if (productId && storeId && productId !== "new") {

        const result = await generateAndSaveReviews(storeId, productId, productName, productDescription, reviewCount)

        if (result.success) {
          const newReviews = result.reviews || []
          
          form.setValue("cachedReviews", newReviews, { shouldDirty: true, shouldValidate: false })
          
          setCachedReviews(newReviews)
          
          localStorage.setItem(`cachedReviews_${productId}`, JSON.stringify(newReviews))
          setLastGenerationCount(result.createdCount || 0)

          toast({
            title: result.fallback ? "Fallback reviews generated!" : "Reviews generated!",
            description: result.fallback 
              ? `Generated ${result.createdCount} sample reviews. They will be saved when you publish the product.`
              : `Successfully generated ${result.createdCount} reviews. They will be saved when you publish the product.`,
          })

          if (!reviewsEnabled) {
            form.setValue("reviews", true, { shouldDirty: true })
          }
        } else {
          throw new Error(result.error || "Failed to generate reviews")
        }
      } 
      else if (storeId) {
        const { generateReviewsForNewProduct } = await import("../../actions/generate-reviews-for-new-product")
        
        
        const result = await generateReviewsForNewProduct(productName, productDescription, reviewCount, storeId)
        
        if (result.success) {
          form.setValue("tempReviewsId", result.tempProductId || undefined, { shouldDirty: true, shouldValidate: false })
          form.setValue("cachedReviews", result.reviews || [], { shouldDirty: true, shouldValidate: false })
          
          setCachedReviews(result.reviews || [])
          
          localStorage.setItem(`cachedReviews_new`, JSON.stringify(result.reviews))
          
          
          form.setValue("reviews", true, { shouldDirty: true })
          
          setLastGenerationCount(result.count)
          
          toast({
            title: result.fallback ? "Fallback reviews generated!" : "Reviews generated!",
            description: result.fallback 
              ? `Generated ${result.count} sample reviews. They will be saved when you publish the product.`
              : `Successfully generated ${result.count} reviews. They will be saved when you publish the product.`,
          })
        } else {
          throw new Error(result.error || "Failed to generate reviews")
        }
      } else {
        toast({
          title: "Store ID required",
          description: "Could not determine the store ID",
          variant: "destructive",
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      
      if (errorMessage.includes("Rate limit") || errorMessage.includes("429")) {
        setError("Rate limit exceeded. Please wait a few minutes and try again with fewer reviews.")
        toast({
          title: "Rate Limit Exceeded",
          description: "Please wait 2-3 minutes and try generating 5-8 reviews instead of 10+",
          variant: "destructive",
        })
      } else {
        setError(errorMessage)
        toast({
          title: "Failed to generate reviews",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTestReviewSave = async () => {
    try {
      setIsTestingReviewSave(true)
      
      const productId = getProductId()
      const storeId = getStoreId()
      
      if (productId && storeId && productId !== "new") {
        const result = await testReviewSave(storeId, productId)
        
        toast({
          title: result.success ? "Test Passed" : "Test Failed",
          description: result.message,
          variant: result.success ? "default" : "destructive",
        })
      } else {
        toast({
          title: "Cannot Test",
          description: "Product must be saved before testing review functionality",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Test Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsTestingReviewSave(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch (e) {
      return dateString
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)
    }

    return stars
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Reviews Generator
            </CardTitle>
            <CardDescription>
              Generate authentic reviews using Gemini AI and save them directly to the database
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="enable-reviews-toggle" className="text-sm font-medium">
              Enable Reviews
            </Label>
            <Switch
              id="enable-reviews-toggle"
              checked={reviewsEnabled}
              onCheckedChange={(checked) => form.setValue("reviews", checked, { shouldDirty: true })}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Generation Failed</AlertTitle>
            <AlertDescription>
              {error}
              <div className="mt-2 text-sm">
                <p>This system requires Gemini AI to generate all reviews. Please:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Check your GEMINI_API_KEY environment variable</li>
                  <li>Wait a few minutes if you hit rate limits</li>
                  <li>Try reducing the number of reviews (5-8 instead of 10+)</li>
                  <li>Ensure you have sufficient API quota</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {lastGenerationCount > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Reviews Generated & Cached!</AlertTitle>
            <AlertDescription className="text-yellow-700">
              {lastGenerationCount} reviews have been generated and cached. They will be saved as pending reviews when you publish the product and can be approved from the Reviews page.
            </AlertDescription>
          </Alert>
        )}

        {reviewStats.total > 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <Database className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Current Review Status</AlertTitle>
            <AlertDescription className="text-blue-700">
              Total reviews in store: {reviewStats.total} | Reviews for this product: {reviewStats.product}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="review-count">Number of Reviews</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  id="review-count"
                  min={5}
                  max={15}
                  step={1}
                  value={[reviewCount]}
                  onValueChange={(value) => setReviewCount(value[0])}
                  className="w-[200px]"
                />
                <Badge variant="outline">{reviewCount}</Badge>
              </div>
            </div>

            <Button
              onClick={handleGenerateAndSaveReviews}
              disabled={isGenerating || !productName}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating & Saving...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Generate & Save to Database
                </>
              )}
            </Button>
          </div>

          {(existingReviews.length > 0 || savedReviews.length > 0 || cachedReviews.length > 0) && (
            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  Product Reviews ({existingReviews.length + cachedReviews.length})
                </h3>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {isLoadingReviews ? "Loading..." : "From Database"}
                </Badge>
              </div>

              <div className="max-h-[400px] overflow-y-auto space-y-4 border rounded-md p-4 bg-blue-50/30">
                {cachedReviews.map((review, index) => (
                  <div key={`cached-${index}`} className="relative space-y-2 p-4 border rounded-md bg-yellow-50 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="flex flex-col">
                          <span className="font-medium flex items-center gap-2">
                            {review.customerName}
                            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                              Cached
                            </Badge>
                          </span>
                          <div className="flex items-center mt-1">
                            {renderStars(review.rating)}
                            <span className="ml-2 text-xs text-muted-foreground">{formatDate(review.date)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{review.text}</p>
                    {index < cachedReviews.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
                {existingReviews.map((review, index) => (
                  <div key={review.id || index} className="relative space-y-2 p-4 border rounded-md bg-white shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex flex-col">
                          <span className="font-medium flex items-center gap-2">
                            {review.customerName}
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              <Database className="h-3 w-3 mr-1" />
                              Saved
                            </Badge>
                          </span>
                          <div className="flex items-center mt-1">
                            {renderStars(review.rating)}
                            <span className="ml-2 text-xs text-muted-foreground">{formatDate(review.date)}</span>
                          </div>
                        </div>
                      </div>
                      {review.id && (
                        <Badge variant="outline" className="text-xs">
                          ID: {review.id.slice(-8)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{review.text}</p>
                    {index < existingReviews.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between bg-muted/50 px-6 py-4">
        <p className="text-sm text-muted-foreground">
          Reviews are generated by Gemini AI and saved directly to the database. No manual saving required.
        </p>
      </CardFooter>
    </Card>
  )
}
