"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Edit2, X } from "lucide-react"
import ImageUpload from "@/components/ui/image-upload"
import { toast } from "react-hot-toast"

interface EditableImageProps {
  field: string
  value: string
  onSave: (field: string, url: string) => void
  alt: string
  className?: string
  width?: number
  height?: number
}

export const EditableImage: React.FC<EditableImageProps> = ({
  field,
  value,
  onSave,
  alt,
  className = "",
  width = 800,
  height = 600,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>(value || "")
  const [isLoading, setIsLoading] = useState(false)
  // Add a flag to prevent duplicate toasts
  const [toastShown, setToastShown] = useState(false)

  // Update local state when prop changes
  useEffect(() => {
    setImageUrl(value || "")
    // Reset toast flag when value changes
    setToastShown(false)
  }, [value])

  // Update the handleImageChange function to add more debugging and better validation
  const handleImageChange = (url: string) => {
    try {
      setIsLoading(true)
      console.log("EditableImage: Image URL received:", url)
      console.log("EditableImage: Field being updated:", field)

      // Validate URL - make sure it's not a field path or undefined
      if (!url) {
        console.error("EditableImage: Empty URL received")
        if (!toastShown) {
          toast.error("No image URL received")
          setToastShown(true)
        }
        setIsLoading(false)
        setIsEditing(false)
        return
      }

      // Check for invalid URLs - field paths, undefined, or non-URL strings
      if (
        url.startsWith("guideContent.") ||
        url === "undefined" ||
        url.includes(".steps.") ||
        url.includes(".images.")
      ) {
        console.error("EditableImage: Invalid URL detected:", url)
        if (!toastShown) {
          toast.error("Invalid image URL")
          setToastShown(true)
        }
        setIsLoading(false)
        setIsEditing(false)
        return
      }

      // Save the image URL - IMPORTANT: Pass the field and URL separately
      console.log("EditableImage: Saving valid URL:", url)
      onSave(field, url)
      setImageUrl(url)

      // Only show success toast if we haven't shown one yet
      if (!toastShown) {
        toast.success("Image updated successfully")
        setToastShown(true)
      }
    } catch (error) {
      console.error("Error in handleImageChange:", error)
      if (!toastShown) {
        toast.error("Failed to update image")
        setToastShown(true)
      }
    } finally {
      setIsLoading(false)
      setIsEditing(false)
    }
  }

  const handleImageRemove = () => {
    try {
      onSave(field, "")
      setImageUrl("")
      if (!toastShown) {
        toast.success("Image removed")
        setToastShown(true)
      }
    } catch (error) {
      console.error("Error removing image:", error)
      if (!toastShown) {
        toast.error("Failed to remove image")
        setToastShown(true)
      }
    } finally {
      setIsEditing(false)
    }
  }

  // Handle click on the image container
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event from bubbling up
    setIsEditing(true)
    // Reset toast flag when starting a new edit
    setToastShown(false)
  }

  if (isEditing) {
    return (
      <div className="relative border rounded-md p-4 bg-gray-50 z-50">
        <ImageUpload
          value={imageUrl && imageUrl !== "undefined" ? [imageUrl] : []}
          disabled={isLoading}
          onChange={handleImageChange}
          onRemove={handleImageRemove}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation()
            setIsEditing(false)
          }}
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
  const hasValidImage = imageUrl && imageUrl !== "undefined" && !imageUrl.startsWith("guideContent.steps.")

  return (
    <div
      className={`group relative cursor-pointer ${className}`}
      onClick={handleClick}
      style={{ maxHeight: height ? `${height}px` : "auto" }}
    >
      {hasValidImage ? (
        <div className="w-full h-full">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={alt}
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
