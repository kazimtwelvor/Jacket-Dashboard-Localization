"use client"

import type React from "react"
import { EditableImage } from "../editable-image"
import { EditableText } from "../editable-text"

interface StepThirteenContentOptimizationProps {
  title: string
  subtitle: string
  content: string[]
  images?: string[]
  metrics?: {
    before: string[]
    after: string[]
  }
  onSaveText: (field: string, value: string) => void
  onSaveImage: (field: string, url: string) => void
  stepIndex: number
  openTextEditor?: () => void
}

export const StepThirteenContentOptimization: React.FC<StepThirteenContentOptimizationProps> = ({
  title,
  subtitle,
  content,
  images = ["", ""],
  metrics = {
    before: ["Low engagement rate (1.2%)", "High bounce rate (78%)", "Poor conversion (0.5%)"],
    after: ["High engagement rate (4.8%)", "Low bounce rate (32%)", "Strong conversion (2.7%)"],
  },
  onSaveText,
  onSaveImage,
  stepIndex,
  openTextEditor,
}) => {
  const handleSaveImage = (index: number, url: string) => {
    onSaveImage(`guideContent.steps.${stepIndex}.images.${index}`, url)
  }

  const handleSaveMetric = (type: "before" | "after", index: number, value: string) => {
    onSaveText(`guideContent.steps.${stepIndex}.metrics.${type}.${index}`, value)
  }

  return (
    <div className="animate-fade-in bg-gray-50 p-8 rounded-xl">
      <div className="flex flex-col mb-6">
        <div className="border-l-4 border-[#FF6C1A] pl-4 mb-6">
          <h2 className="text-xl font-bold text-[#0A2463] mb-2">{title}</h2>
          <p className="text-gray-700 mb-4">{subtitle}</p>
          {content.map((paragraph, idx) => (
            <p key={idx} className="text-gray-700 mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-red-500 mb-2">
              <EditableText
                field={`guideContent.steps.${stepIndex}.cardTitles.0`}
                value="Before Optimization"
                onSave={onSaveText}
                className="text-red-500 font-bold"
                isInline={true}
              />
            </h3>
            <div className="h-[200px] relative rounded-lg overflow-hidden mb-4">
              <EditableImage
                field={`guideContent.steps.${stepIndex}.images.0`}
                value={images[0]}
                onSave={(field, url) => handleSaveImage(0, url)}
                className="object-cover"
                alt="Before Optimization"
                width={400}
                height={200}
              />
              <div className="absolute inset-0 bg-red-500/10 pointer-events-none"></div>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded-full w-full"></div>
              <div className="h-2 bg-gray-200 rounded-full w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded-full w-5/6"></div>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-500">
            {metrics.before.map((metric, idx) => (
              <div key={idx} className="flex items-center group">
                <div className="w-4 h-4 rounded-full bg-red-100 mr-2 flex-shrink-0"></div>
                <EditableText
                  field={`guideContent.steps.${stepIndex}.metrics.before.${idx}`}
                  value={metric}
                  onSave={(field, value) => handleSaveMetric("before", idx, value)}
                  className="text-gray-500"
                  isInline={true}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-green-500 mb-2">
              <EditableText
                field={`guideContent.steps.${stepIndex}.cardTitles.1`}
                value="After Optimization"
                onSave={onSaveText}
                className="text-green-500 font-bold"
                isInline={true}
              />
            </h3>
            <div className="h-[200px] relative rounded-lg overflow-hidden mb-4">
              <EditableImage
                field={`guideContent.steps.${stepIndex}.images.1`}
                value={images[1]}
                onSave={(field, url) => handleSaveImage(1, url)}
                className="object-cover"
                alt="After Optimization"
                width={400}
                height={200}
              />
              <div className="absolute inset-0 bg-green-500/10 pointer-events-none"></div>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-[#FF6C1A] rounded-full w-full"></div>
              <div className="h-2 bg-[#FF6C1A] rounded-full w-3/4"></div>
              <div className="h-2 bg-[#FF6C1A] rounded-full w-5/6"></div>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-500">
            {metrics.after.map((metric, idx) => (
              <div key={idx} className="flex items-center group">
                <div className="w-4 h-4 rounded-full bg-green-100 mr-2 flex-shrink-0"></div>
                <EditableText
                  field={`guideContent.steps.${stepIndex}.metrics.after.${idx}`}
                  value={metric}
                  onSave={(field, value) => handleSaveMetric("after", idx, value)}
                  className="text-gray-500"
                  isInline={true}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
