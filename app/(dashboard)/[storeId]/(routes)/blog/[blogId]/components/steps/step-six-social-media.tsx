"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import ImageUpload from "@/components/ui/image-upload"
import { toast } from "react-hot-toast"

interface StepSixSocialMediaProps {
  title: string
  subtitle: string
  content: string[]
  images: string[]
  onSaveText: (field: string, value: string) => void
  onSaveImage: (field: string, url: string) => void
  stepIndex: number
  openTextEditor?: () => void
}

export const StepSixSocialMedia = ({
  title,
  subtitle,
  content,
  images,
  onSaveText,
  onSaveImage,
  stepIndex,
  openTextEditor,
}: StepSixSocialMediaProps) => {
  const socialPlatforms = ["Instagram Marketing", "Twitter Marketing", "YouTube Marketing"]
  const bgColors = ["bg-pink-500", "bg-blue-400", "bg-red-500"]

  // Track local state for images
  const [localImages, setLocalImages] = useState<string[]>(images || ["", "", ""])
  const [isEditing, setIsEditing] = useState<number | null>(null)

  // Update local state when props change
  useEffect(() => {
    setLocalImages(images || ["", "", ""])
  }, [images])

  // Direct image upload handler
  const handleImageUpload = (index: number, url: string) => {
    try {
      console.log(`StepSixSocialMedia: Uploading image at index ${index}:`, url)

      // Update local state
      const newImages = [...localImages]
      newImages[index] = url
      setLocalImages(newImages)

      // Update form state - first update the specific index
      onSaveImage(`guideContent.steps.${stepIndex}.images.${index}`, url)

      // Then update the entire array
      console.log(`StepSixSocialMedia: Updating entire images array:`, newImages)

      // Use a direct approach to update the array in the form
      const arrayPath = `guideContent.steps.${stepIndex}.images`
      onSaveImage(arrayPath, JSON.stringify(newImages))

      toast.success(`Image ${index + 1} updated successfully`)
      setIsEditing(null)
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
    }
  }

  // Handle image removal
  const handleImageRemove = (index: number) => {
    try {
      const newImages = [...localImages]
      newImages[index] = ""
      setLocalImages(newImages)

      // Update form state
      onSaveImage(`guideContent.steps.${stepIndex}.images.${index}`, "")
      onSaveImage(`guideContent.steps.${stepIndex}.images`, JSON.stringify(newImages))

      toast.success(`Image ${index + 1} removed`)
      setIsEditing(null)
    } catch (error) {
      console.error("Error removing image:", error)
      toast.error("Failed to remove image")
    }
  }

  return (
    <div className="animate-fade-in bg-[#131a31] p-6 rounded-lg">
      <div className="flex flex-col mb-6">
        <div className="border-l-4 border-[#FF6C1A] pl-4">
          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
          <p className="text-gray-300 mb-4">{subtitle}</p>
          {content.map((paragraph, idx) => (
            <p key={idx} className="text-gray-300 mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((idx) => {
          const hasImage = localImages[idx] && localImages[idx] !== "undefined"

          return (
            <div key={idx} className={`aspect-square relative rounded-lg overflow-hidden ${bgColors[idx]}`}>
              {isEditing === idx ? (
                <div className="absolute inset-0 bg-white z-10 p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Upload {socialPlatforms[idx]} Image</h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditing(null)}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <ImageUpload
                    value={hasImage ? [localImages[idx]] : []}
                    disabled={false}
                    onChange={(url) => handleImageUpload(idx, url)}
                    onRemove={() => handleImageRemove(idx)}
                  />
                </div>
              ) : (
                <>
                  {hasImage ? (
                    <img
                      src={localImages[idx] || "/placeholder.svg"}
                      alt={socialPlatforms[idx]}
                      className="object-cover w-full h-full hover:scale-110 transition-transform duration-500"
                      onClick={() => setIsEditing(idx)}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                      onClick={() => setIsEditing(idx)}
                    >
                      <Upload className="h-8 w-8 text-white mb-2" />
                      <p className="text-white text-sm text-center px-2">{socialPlatforms[idx]}</p>
                    </div>
                  )}

                  <div
                    className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center transition-all cursor-pointer"
                    onClick={() => setIsEditing(idx)}
                  >
                    <Upload className="text-white opacity-0 group-hover:opacity-100 h-8 w-8" />
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
