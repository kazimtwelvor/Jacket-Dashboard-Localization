"use client"
import { EditableImage } from "../editable-image"

interface StepOneContentStrategyProps {
  title: string
  subtitle: string
  content: string[]
  image: string
  onSaveText: (field: string, value: string) => void
  onSaveImage: (field: string, url: string) => void
  stepIndex: number
  openTextEditor?: () => void // Add this prop
}

export const StepOneContentStrategy = ({
  title,
  subtitle,
  content,
  image,
  onSaveText,
  onSaveImage,
  stepIndex,
  openTextEditor,
}: StepOneContentStrategyProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <div className="rounded-lg p-6 flex items-center justify-center border border-gray-200">
        <EditableImage
          field={`guideContent.steps.${stepIndex}.image`}
          value={image || "/content-strategy-brainstorm.png"}
          onSave={onSaveImage}
          alt="Content Strategy"
          className="object-contain w-full max-h-[300px]"
        />
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
          <p className="text-gray-700 font-medium">Content strategy overview</p>
        </div>
      </div>
    </div>
  )
}
