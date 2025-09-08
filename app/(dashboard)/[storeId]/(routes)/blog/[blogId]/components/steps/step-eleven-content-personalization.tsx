"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { EditableImage } from "../editable-image"
import { EditableText } from "../editable-text"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LinkIcon, Check, X } from "lucide-react"
import { toast } from "react-hot-toast"

interface StepElevenContentPersonalizationProps {
  title: string
  subtitle: string
  content: string[]
  image: string
  buttonText?: string
  buttonLink?: string
  onSaveText: (field: string, value: string) => void
  onSaveImage: (field: string, url: string) => void
  stepIndex: number
  openTextEditor?: () => void
}

export const StepElevenContentPersonalization: React.FC<StepElevenContentPersonalizationProps> = ({
  title,
  subtitle,
  content,
  image,
  buttonText = "Learn more",
  buttonLink = "",
  onSaveText,
  onSaveImage,
  stepIndex,
  openTextEditor,
}) => {
  // State for editing the button link
  const [isEditingLink, setIsEditingLink] = useState(false)
  const [localButtonLink, setLocalButtonLink] = useState(buttonLink || "")

  // Track the current image locally
  const [currentImage, setCurrentImage] = useState(image || "")

  // Update local state when prop changes
  useEffect(() => {
    setCurrentImage(image || "")
  }, [image])

  // Create a handler function for saving the image directly
  const handleSaveImage = (field: string, url: string) => {
    try {
      // Don't use the field parameter, use our hardcoded path instead
      if (!url) {
        return
      }

      // Validate URL
      if (url.includes("guideContent.steps.") || url === "undefined") {
        toast.error("Invalid image URL")
        return
      }


      // Update local state
      setCurrentImage(url)

      // Save to parent component with correct field path
      onSaveImage(`guideContent.steps.${stepIndex}.image`, url)
    } catch (error) {
      toast.error("Failed to save image")
    }
  }

  // Format URL to ensure it has a protocol
  const formatUrl = (url: string): string => {
    if (!url) return ""

    // Remove any leading/trailing whitespace
    url = url.trim()

    // Check if the URL already has a protocol
    if (url.match(/^(https?:\/\/|mailto:|tel:)/i)) {
      return url
    }

    // Add https:// protocol if missing
    return `https://${url}`
  }

  // Handle saving the button link
  const handleSaveButtonLink = () => {
    const formattedUrl = formatUrl(localButtonLink)
    const fieldPath = `guideContent.steps.${stepIndex}.buttonLink`
    onSaveText(fieldPath, formattedUrl)
    setLocalButtonLink(formattedUrl)
    setIsEditingLink(false)
  }

  // Handle canceling the button link edit
  const handleCancelLinkEdit = () => {
    setLocalButtonLink(buttonLink || "")
    setIsEditingLink(false)
  }

  // Get the display URL for the UI
  const getDisplayUrl = (url: string): string => {
    if (!url) return "No link set"
    return url.replace(/^https?:\/\//i, "")
  }

  // Get the full URL for the href
  const getFullUrl = (url: string): string => {
    if (!url) return "#"
    return url
  }

  return (
    <div className="animate-fade-in mb-12">
      {/* Main container with relative positioning */}
      <div className="relative h-[400px] rounded-xl overflow-hidden">
        {/* Image container - explicitly set to fill the entire space and be clickable */}
        <div className="absolute inset-0 w-full h-full">
          <EditableImage
            field={`guideContent.steps.${stepIndex}.image`}
            value={currentImage}
            onSave={handleSaveImage}
            className="w-full h-full"
            width={800}
            height={400}
            alt="Content personalization"
          />
        </div>

        {/* Gradient overlay - non-blocking */}
        {currentImage && (
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#0A2463]/80 to-transparent"></div>
        )}

        {/* Content overlay - positioned to not block the image clicks */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="h-full flex items-center">
            <div className="max-w-lg p-8">
              <div className="border-l-4 border-[#FF6C1A] pl-4 mb-4">
                {/* Title - clickable for editing */}
                <div className="text-2xl font-bold text-white mb-4 pointer-events-auto">
                  <EditableText
                    field={`guideContent.steps.${stepIndex}.title`}
                    value={title}
                    onSave={onSaveText}
                    className="font-bold text-white"
                    darkMode={true}
                  />
                </div>

                {/* Subtitle - clickable for editing */}
                <div className="text-white mb-4 pointer-events-auto">
                  <EditableText
                    field={`guideContent.steps.${stepIndex}.subtitle`}
                    value={subtitle}
                    onSave={onSaveText}
                    className="text-white"
                    darkMode={true}
                  />
                </div>

                {/* Content - clickable for editing */}
                {content && content[0] && (
                  <div className="text-white/90 mb-6 pointer-events-auto">
                    <EditableText
                      field={`guideContent.steps.${stepIndex}.content.0`}
                      value={content[0]}
                      onSave={onSaveText}
                      className="text-white/90"
                      isTextarea={true}
                      darkMode={true}
                    />
                  </div>
                )}

                {/* Button with link - clickable */}
                <div className="pointer-events-auto relative inline-flex items-center">
                  <a
                    href={getFullUrl(buttonLink)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-block bg-[#FF6C1A] hover:bg-[#FF8C4A] text-white px-6 py-2 rounded-full transition-colors ${!buttonLink ? "pointer-events-none" : ""}`}
                    onClick={(e) => {
                      if (!buttonLink) e.preventDefault()
                      e.stopPropagation() // Prevent click from reaching the image
                    }}
                  >
                    <EditableText
                      field={`guideContent.steps.${stepIndex}.buttonText`}
                      value={buttonText}
                      onSave={onSaveText}
                      className="text-white"
                      isInline={true}
                      darkMode={true}
                    />
                  </a>

                  {/* Link edit button - now positioned right next to the button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-2 text-white bg-gray-800/50 hover:bg-gray-800/70 h-7 w-7 p-0 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation() // Prevent click from reaching the image
                      setIsEditingLink(true)
                    }}
                    type="button"
                    title="Edit link"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>

                  {/* Link edit modal */}
                  {isEditingLink && (
                    <div
                      className="absolute top-full left-0 mt-2 p-3 bg-gray-800 rounded-md shadow-lg z-50 w-full max-w-md"
                      onClick={(e) => e.stopPropagation()} // Prevent click from reaching the image
                    >
                      <div className="text-white text-sm mb-2">Button Link URL:</div>
                      <div className="flex items-center gap-2">
                        <Input
                          value={localButtonLink}
                          onChange={(e) => setLocalButtonLink(e.target.value)}
                          placeholder="google.com"
                          className="bg-gray-700 text-white border-gray-600"
                          onClick={(e) => e.stopPropagation()} // Prevent click from reaching the image
                        />
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation() // Prevent click from reaching the image
                            handleSaveButtonLink()
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation() // Prevent click from reaching the image
                            handleCancelLinkEdit()
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-gray-400 text-xs mt-2">
                        {buttonLink ? (
                          <>
                            Current link: <span className="text-blue-400">{getDisplayUrl(buttonLink)}</span>
                            <span className="text-gray-500"> (https:// will be added automatically if needed)</span>
                          </>
                        ) : (
                          "No link set"
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
