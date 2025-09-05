"use server"

import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

interface ProductReview {
  id?: string
  text: string
  customerName: string
  rating: number
  date: string
}

export async function generateAndSaveReviews(
  storeId: string,
  productId: string,
  productName: string,
  productDescription: string,
  reviewCount: number
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error("Unauthenticated")
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set")
    }

    const product = await prismadb.product.findFirst({
      where: {
        id: productId,
        storeId: storeId,
      },
    })

    if (!product) {
      throw new Error("Product not found")
    }

    const prompt = `Generate ${reviewCount} realistic product reviews for a product called "${productName}". 
    ${productDescription ? `Product description: ${productDescription}` : ""}
    
    Each review should include:
    - A realistic customer name (mix of different ethnicities and genders)
    - A rating between 3-5 stars (mostly 4-5 stars, occasionally 3 stars)
    - A detailed review text (50-150 words) that mentions specific aspects of the product
    - A realistic date within the last 6 months
    
    Make the reviews sound authentic and varied. Some should mention fit, quality, style, comfort, or value for money.
    Avoid overly promotional language and include minor constructive feedback occasionally.
    
    Return the response as a JSON array with this exact structure:
    [
      {
        "customerName": "John Smith",
        "rating": 5,
        "text": "Great product! Really happy with the quality...",
        "date": "2024-01-15"
      }
    ]
    
    Important: Return ONLY the JSON array, no additional text or formatting.`

    let response
    let retryCount = 0
    const maxRetries = 3
    
    while (retryCount < maxRetries) {
      try {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.8,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
              },
            }),
          }
        )
        
        if (response.status === 429) {
          const waitTime = Math.pow(2, retryCount) * 1000 
          await new Promise(resolve => setTimeout(resolve, waitTime))
          retryCount++
          continue
        }
        
        break 
      } catch (fetchError) {
        retryCount++
        if (retryCount >= maxRetries) {
          throw fetchError
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
      }
    }

    if (!response || !response.ok) {
      if (response?.status === 429) {
        const fallbackReviews = generateFallbackReviews(reviewCount, productName)
        
        return {
          success: true,
          reviews: fallbackReviews,
          createdCount: fallbackReviews.length,
          fallback: true,
        }
      }
      const errorData = response ? await response.json() : {}
      console.error("Gemini API error:", errorData)
      throw new Error(`API call failed: ${response?.statusText || 'Network error'}`)
    }

    const data = await response.json()

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      throw new Error("Unexpected API response format")
    }

    const rawText = data.candidates[0].content.parts[0].text

    let cleanedText = rawText.trim()
    
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/```json\n?/, "").replace(/\n?```$/, "")
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/```\n?/, "").replace(/\n?```$/, "")
    }

    let generatedReviews: ProductReview[]
    try {
      generatedReviews = JSON.parse(cleanedText)
    } catch (parseError) {
      throw new Error("Failed to parse AI response")
    }

    if (!Array.isArray(generatedReviews)) {
      throw new Error("AI response is not an array")
    }

    return {
      success: true,
      reviews: generatedReviews,
      createdCount: generatedReviews.length,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      reviews: [],
      createdCount: 0,
    }
  }
}

function generateFallbackReviews(count: number, productName: string): ProductReview[] {
  const names = [
    "Sarah Johnson", "Mike Chen", "Emma Davis", "James Wilson", "Lisa Garcia",
    "David Brown", "Anna Martinez", "Chris Taylor", "Maria Rodriguez", "John Smith",
    "Jessica Lee", "Robert Kim", "Amanda White", "Kevin Park", "Rachel Green"
  ]
  
  const reviewTemplates = [
    "Great quality {product}! Really happy with my purchase. The fit is perfect and the material feels premium.",
    "Love this {product}! Exactly what I was looking for. Fast shipping and excellent customer service.",
    "Amazing {product}! The quality exceeded my expectations. Would definitely recommend to others.",
    "Perfect {product} for the price. Great value and looks exactly like the pictures. Very satisfied!",
    "Excellent {product}! The craftsmanship is top-notch and it arrived quickly. Will buy again.",
    "Really impressed with this {product}. The quality is outstanding and it fits perfectly. Highly recommend!",
    "Beautiful {product}! The attention to detail is amazing. Exactly what I wanted and more.",
    "Outstanding {product}! Great quality materials and excellent workmanship. Very pleased with this purchase.",
    "Fantastic {product}! Looks great and feels even better. The quality is definitely worth the price.",
    "Wonderful {product}! Perfect fit and excellent quality. Fast delivery and great packaging too."
  ]
  
  const reviews: ProductReview[] = []
  const now = new Date()
  
  for (let i = 0; i < count; i++) {
    const randomName = names[Math.floor(Math.random() * names.length)]
    const randomTemplate = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)]
    const rating = Math.random() < 0.7 ? 5 : Math.random() < 0.8 ? 4 : 3
    
    const randomDays = Math.floor(Math.random() * 90)
    const reviewDate = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000)
    
    reviews.push({
      customerName: randomName,
      rating: rating,
      text: randomTemplate.replace('{product}', productName.toLowerCase()),
      date: reviewDate.toISOString().split('T')[0]
    })
  }
  
  return reviews
}