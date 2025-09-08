"use client"

import type React from "react"
import { EditableImage } from "../editable-image"
import { EditableText } from "../editable-text"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"

interface StepNineVideoMarketingProps {
  title: string
  subtitle: string
  content: string[]
  image?: string
  onSaveText: (field: string, value: string) => void
  onSaveImage: (field: string, url: string) => void
  stepIndex: number
  openTextEditor?: () => void
}

export const StepNineVideoMarketing: React.FC<StepNineVideoMarketingProps> = ({
  title,
  subtitle,
  content,
  image = "",
  onSaveText,
  onSaveImage,
  stepIndex,
  openTextEditor,
}) => {
  // Track the current image locally
  const [currentImage, setCurrentImage] = useState(image || "")

  // Update local state when prop changes
  useEffect(() => {
    setCurrentImage(image || "")
  }, [image])

  // Create a direct handler for the image save
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in mb-20">
      <div className="relative h-auto min-h-[200px] border border-gray-200 rounded-lg">
        <EditableImage
          field={`guideContent.steps.${stepIndex}.image`}
          value={currentImage}
          onSave={handleSaveImage}
          className="object-cover rounded-lg"
          width={500}
          height={200}
          alt="Video Marketing"
        />
      </div>
      <div className="flex flex-col">
        <div className="border-l-4 border-[#FF6C1A] pl-4 mb-4">
          <h2 className="text-xl font-bold text-[#0A2463] mb-2">
            <EditableText
              field={`guideContent.steps.${stepIndex}.title`}
              value={title}
              onSave={onSaveText}
              className="text-[#0A2463] font-bold"
            />
          </h2>
          <p className="text-gray-700 mb-4">
            <EditableText
              field={`guideContent.steps.${stepIndex}.subtitle`}
              value={subtitle}
              onSave={onSaveText}
              className="text-gray-700"
            />
          </p>
          {content.map((paragraph, idx) => (
            <p key={idx} className="text-gray-700 mb-4">
              <EditableText
                field={`guideContent.steps.${stepIndex}.content.${idx}`}
                value={paragraph}
                onSave={onSaveText}
                className="text-gray-700"
                isTextarea={true}
              />
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
