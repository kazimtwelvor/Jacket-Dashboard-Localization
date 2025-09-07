"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Edit2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import ImageUpload from "@/components/ui/image-upload"

interface StepFifteenContentAuditingProps {
  title: string
  subtitle: string
  content: string[]
  images?: string[]
  cardTitles?: string[]
  cardDescriptions?: string[]
  onSaveText: (field: string, value: string) => void
  onSaveImage: (field: string, url: string) => void
  stepIndex: number
  openTextEditor?: () => void
}

export const StepFifteenContentAuditing: React.FC<StepFifteenContentAuditingProps> = ({
  title,
  subtitle,
  content,
  images = ["", "", "", ""],
  cardTitles = ["Content Inventory", "Performance Analysis", "Gap Analysis", "Recommendations"],
  cardDescriptions = [
    "Catalog and organize all your existing content assets",
    "Evaluate content performance against key metrics",
    "Identify missing content opportunities in your strategy",
    "Actionable insights to improve your content strategy",
  ],
  onSaveText,
  onSaveImage,
  stepIndex,
  openTextEditor,
}) => {
  // Create direct image upload components for each card
  // This completely bypasses the EditableImage component

  // Create a component for each card image
  const CardImage = ({ index, imageUrl }: { index: number; imageUrl: string }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [currentUrl, setCurrentUrl] = useState(imageUrl || "")

    useEffect(() => {
      setCurrentUrl(imageUrl || "")
    }, [imageUrl])

    const handleImageChange = (url: string) => {
      try {
        setIsLoading(true)

        if (!url) {
          return
        }

        // Update local state
        setCurrentUrl(url)

        // Create a copy of the images array
        const updatedImages = [...images]
        while (updatedImages.length < 4) {
          updatedImages.push("")
        }

        // Update the specific index
        updatedImages[index] = url

        // Save the entire array directly
        onSaveImage(`guideContent.steps.${stepIndex}.images`, updatedImages)

        toast.success("Image saved")
      } catch (error) {
        toast.error("Failed to save image")
      } finally {
        setIsLoading(false)
        setIsEditing(false)
      }
    }

    const handleImageRemove = () => {
      try {
        // Create a copy of the images array
        const updatedImages = [...images]
        while (updatedImages.length < 4) {
          updatedImages.push("")
        }

        // Update the specific index to empty string
        updatedImages[index] = ""

        // Save the entire array
        onSaveImage(`guideContent.steps.${stepIndex}.images`, updatedImages)

        // Update local state
        setCurrentUrl("")

        toast.success("Image removed")
      } catch (error) {
        toast.error("Failed to remove image")
      } finally {
        setIsEditing(false)
      }
    }

    if (isEditing) {
      return (
        <div className="relative border rounded-md p-4 bg-gray-50 z-50">
          <ImageUpload
            value={currentUrl ? [currentUrl] : []}
            disabled={isLoading}
            onChange={handleImageChange}
            onRemove={handleImageRemove}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(false)}
            className="absolute right-2 top-2 bg-white rounded-full h-6 w-6 p-0"
            type="button"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )
    }

    // Check if we have a valid image URL
    const hasValidImage = currentUrl && currentUrl !== "undefined"

    return (
      <div className="group relative cursor-pointer w-full h-full" onClick={() => setIsEditing(true)}>
        {hasValidImage ? (
          <div className="w-full h-full">
            <img
              src={currentUrl || "/placeholder.svg"}
              alt={cardTitles[index]}
              className="object-cover w-full h-full"
              style={{
                maxHeight: "100%",
                maxWidth: "100%",
              }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full min-h-[140px] bg-gray-100 rounded-md border border-dashed border-gray-300">
            <div className="text-center">
              <Edit2 className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Click to add an image</p>
            </div>
          </div>
        )}
        {/* This overlay should not block clicks */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all pointer-events-none">
          <Edit2 className="text-white opacity-0 group-hover:opacity-100 h-8 w-8" />
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in my-16 bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl">
      <div className="text-center mb-10">
        <div className="inline-block border-b-4 border-[#FF6C1A] pb-2 mb-2">
          <h2 className="text-2xl font-bold text-[#0A2463]">{title}</h2>
        </div>
        <p className="text-gray-700 max-w-2xl mx-auto">{subtitle}</p>
        <p className="text-gray-700 max-w-2xl mx-auto mt-2">{content[0]}</p>
      </div>

      <div className="relative h-[500px]">
        {/* Floating card 1 */}
        <div className="absolute top-0 left-[10%] w-64 bg-white rounded-lg shadow-lg p-4 transform hover:-translate-y-2 transition-transform duration-300">
          <div className="h-40 relative rounded-md overflow-hidden mb-3">
            <CardImage index={0} imageUrl={images[0] || ""} />
          </div>
          <h3 className="font-bold text-[#0A2463] mb-1">{cardTitles[0]}</h3>
          <p className="text-sm text-gray-600">{cardDescriptions[0]}</p>
        </div>

        {/* Floating card 2 */}
        <div className="absolute top-[15%] right-[15%] w-64 bg-white rounded-lg shadow-lg p-4 transform hover:-translate-y-2 transition-transform duration-300">
          <div className="h-40 relative rounded-md overflow-hidden mb-3">
            <CardImage index={1} imageUrl={images[1] || ""} />
          </div>
          <h3 className="font-bold text-[#0A2463] mb-1">{cardTitles[1]}</h3>
          <p className="text-sm text-gray-600">{cardDescriptions[1]}</p>
        </div>

        {/* Floating card 3 */}
        <div className="absolute bottom-[10%] left-[20%] w-64 bg-white rounded-lg shadow-lg p-4 transform hover:-translate-y-2 transition-transform duration-300">
          <div className="h-40 relative rounded-md overflow-hidden mb-3">
            <CardImage index={2} imageUrl={images[2] || ""} />
          </div>
          <h3 className="font-bold text-[#0A2463] mb-1">{cardTitles[2]}</h3>
          <p className="text-sm text-gray-600">{cardDescriptions[2]}</p>
        </div>

        {/* Floating card 4 */}
        <div className="absolute bottom-[20%] right-[10%] w-64 bg-white rounded-lg shadow-lg p-4 transform hover:-translate-y-2 transition-transform duration-300">
          <div className="h-40 relative rounded-md overflow-hidden mb-3">
            <CardImage index={3} imageUrl={images[3] || ""} />
          </div>
          <h3 className="font-bold text-[#0A2463] mb-1">{cardTitles[3]}</h3>
          <p className="text-sm text-gray-600">{cardDescriptions[3]}</p>
        </div>

        {/* Center element */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-[#FF6C1A] flex items-center justify-center text-white font-bold text-xl shadow-lg">
          Audit Process
        </div>
      </div>
    </div>
  )
}
