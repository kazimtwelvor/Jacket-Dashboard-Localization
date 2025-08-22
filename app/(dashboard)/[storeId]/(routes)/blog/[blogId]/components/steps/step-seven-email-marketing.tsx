"use client"

import type React from "react"
import { EditableImage } from "../editable-image"

interface StepSevenEmailMarketingProps {
  title: string
  subtitle: string
  content: string[]
  image: string
  onSaveText: (field: string, value: string) => void
  onSaveImage: (field: string, url: string) => void
  stepIndex: number
  openTextEditor?: () => void
}

export const StepSevenEmailMarketing: React.FC<StepSevenEmailMarketingProps> = ({
  title,
  subtitle,
  content,
  image,
  onSaveText,
  onSaveImage,
  stepIndex,
  openTextEditor,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in relative mb-8">
      <div className="relative h-[300px] w-full overflow-hidden">
        <div className="absolute top-0 left-0 w-3/4 h-3/4 bg-yellow-400 rounded-lg"></div>
        <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-white rounded-lg shadow-lg p-4 flex items-center justify-center">
          <EditableImage
            field={`guideContent.steps.${stepIndex}.image`}
            value={image}
            onSave={onSaveImage}
            className="object-contain max-h-full max-w-full"
            width={300}
            height={200}
            alt="Email Template"
            placeholder="/placeholder.svg?key=vlaol"
          />
        </div>
      </div>
      <div className="flex flex-col">
        <div className="border-l-4 border-[#FF6C1A] pl-4 mb-4">
          <h2 className="text-xl font-bold text-[#0A2463] mb-2">{title}</h2>
          <p className="text-gray-700 mb-4">{subtitle}</p>

          {content.map((paragraph, idx) => (
            <p key={idx} className="text-gray-700 mb-4">
              {paragraph}
            </p>
          ))}

          <p className="text-gray-700 font-medium">Email marketing services</p>
        </div>
      </div>
    </div>
  )
}
