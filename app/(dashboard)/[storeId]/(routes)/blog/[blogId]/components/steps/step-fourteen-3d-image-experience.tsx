"use client"

import type React from "react"
import { EditableText } from "../editable-text"
import { EditableImage } from "../editable-image"

interface StepFourteen3DImageExperienceProps {
  title: string
  subtitle: string
  content: string[]
  image: string
  buttonText: string
  onSaveText: (field: string, value: string) => void
  onSaveImage: (field: string, url: string) => void
  stepIndex: number
  openTextEditor?: () => void 
}

export const StepFourteen3DImageExperience: React.FC<StepFourteen3DImageExperienceProps> = ({
  title,
  subtitle,
  content,
  image,
  buttonText,
  onSaveText,
  onSaveImage,
  stepIndex,
  openTextEditor,
}) => {
  return (
    <div className="animate-fade-in my-16">
      <div className="relative overflow-hidden rounded-xl">
        <div className="absolute top-0 right-0 w-3/5 h-full bg-[#0A2463] transform -skew-x-12 origin-top-right z-0"></div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          <div className="flex flex-col justify-center">
            <div className="border-l-4 border-[#FF6C1A] pl-4 mb-6">
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
              <button className="bg-[#FF6C1A] hover:bg-[#FF8C4A] text-white px-6 py-2 rounded-full transition-colors">
                {buttonText}
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-[#FF6C1A]/20 rounded-full"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#FF6C1A]/10 rounded-full"></div>
            <div className="relative z-10 h-[400px] rounded-lg overflow-hidden shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <EditableImage
                field={`guideContent.steps.${stepIndex}.image`}
                value={image}
                onSave={onSaveImage}
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
