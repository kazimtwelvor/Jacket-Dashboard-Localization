"use client"

import type React from "react"
import { EditableImage } from "../editable-image"
import { EditableText } from "../editable-text"

interface StepTenInteractiveContentProps {
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

export const StepTenInteractiveContent: React.FC<StepTenInteractiveContentProps> = ({
  title,
  subtitle,
  content,
  images = ["", "", ""],
  cardTitles = ["Interactive Quizzes", "ROI Calculators", "Interactive Infographics"],
  cardDescriptions = ["Engage and qualify leads", "Demonstrate value clearly", "Visualize complex data"],
  onSaveText,
  onSaveImage,
  stepIndex,
  openTextEditor,
}) => {
  // Create a handler function for saving images with direct field path
  const handleSaveImage = (index: number, url: string) => {
    onSaveImage(`guideContent.steps.${stepIndex}.images.${index}`, url)
  }

  // Create a handler function for saving card titles and descriptions
  const handleSaveCardText = (index: number, type: "title" | "description", value: string) => {
    const fieldPath = `guideContent.steps.${stepIndex}.card${type === "title" ? "Titles" : "Descriptions"}.${index}`
    onSaveText(fieldPath, value)
  }

  return (
    <div className="mt-16 mb-16 bg-white">
      <div className="flex flex-col mb-6">
        <div className="border-l-4 border-[#FF6C1A] pl-4">
          <h2 className="text-xl font-bold text-[#0A2463] mb-2">
            <EditableText
              field={`guideContent.steps.${stepIndex}.title`}
              value={title}
              onSave={onSaveText}
              className="font-bold text-[#0A2463]"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {[0, 1, 2].map((idx) => (
          <div key={idx} className="relative h-[250px] rounded-lg overflow-hidden">
            <EditableImage
              field={`guideContent.steps.${stepIndex}.images.${idx}`}
              value={images[idx] || ""}
              onSave={(field, url) => handleSaveImage(idx, url)}
              className="w-full h-full"
              width={350}
              height={250}
              alt={cardTitles[idx] || `Interactive content ${idx + 1}`}
            />
            {images[idx] && (
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/70 to-transparent"></div>
            )}
            <div className="absolute bottom-0 left-0 p-4 text-white w-full">
              <h3 className="font-bold mb-1 pointer-events-auto">
                <EditableText
                  field={`guideContent.steps.${stepIndex}.cardTitles.${idx}`}
                  value={cardTitles[idx]}
                  onSave={(field, value) => handleSaveCardText(idx, "title", value)}
                  className="font-bold text-white"
                />
              </h3>
              <p className="text-sm opacity-80 pointer-events-auto">
                <EditableText
                  field={`guideContent.steps.${stepIndex}.cardDescriptions.${idx}`}
                  value={cardDescriptions[idx]}
                  onSave={(field, value) => handleSaveCardText(idx, "description", value)}
                  className="text-sm text-white opacity-80"
                />
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
