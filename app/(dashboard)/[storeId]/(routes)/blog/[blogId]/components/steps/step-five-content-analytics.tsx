"use client"

import { EditableText } from "../editable-text"
import { EditableImage } from "../editable-image"

interface StepFiveContentAnalyticsProps {
  title: string
  subtitle: string
  content: string[]
  image: string
  onSaveText: (field: string, value: string) => void
  onSaveImage: (field: string, url: string) => void
  stepIndex: number
  openTextEditor?: () => void // Add this prop
}

export const StepFiveContentAnalytics = ({
  title,
  subtitle,
  content,
  image,
  onSaveText,
  onSaveImage,
  stepIndex,
  openTextEditor,
}: StepFiveContentAnalyticsProps) => {
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col">
        <div className="border-l-4 border-[#FF6C1A] pl-4 mb-4">
          <h2 className="text-xl font-bold text-[#0A2463] mb-2">
            {title}
          </h2>
          <p className="text-gray-700 mb-4">
            {subtitle}
          </p>
          {content.map((paragraph, idx) => (
            <p key={idx} className="text-gray-700 mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
      <div className="mt-4 w-full h-[300px] relative rounded-lg overflow-hidden border border-gray-200">
        <EditableImage
          field={`guideContent.steps.${stepIndex}.image`}
          value={image || "/content-analytics-dashboard.png"}
          onSave={onSaveImage}
          alt="Content Analytics Dashboard"
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  )
}
