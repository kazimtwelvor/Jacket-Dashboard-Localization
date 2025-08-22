"use client"
import type React from "react"
import { EditableText } from "../editable-text"
import { EditableImage } from "../editable-image"

interface StepTwelveVisualStorytellingProps {
  title: string
  subtitle: string
  content: string[]
  images: string[]
  imageLabels: string[]
  onSaveText: (field: string, value: string) => void
  onSaveImage: (field: string, url: string) => void
  stepIndex: number
}

export const StepTwelveVisualStorytelling: React.FC<StepTwelveVisualStorytellingProps> = ({
  title,
  subtitle,
  content,
  images,
  imageLabels,
  onSaveText,
  onSaveImage,
  stepIndex,
}) => {
  // Helper function to handle image save with direct URL
  const handleSaveImage = (index: number, url: string) => {
    console.log(`Saving image for step ${stepIndex}, image index ${index}:`, url)
    onSaveImage(`guideContent.steps.${stepIndex}.images.${index}`, url)
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col mb-6">
        <div className="border-l-4 border-[#FF6C1A] pl-4">
          <h2 className="text-xl font-bold text-[#0A2463] mb-2">
            <EditableText
              field={`guideContent.steps.${stepIndex}.title`}
              value={title}
              onSave={onSaveText}
              className="bg-transparent focus:outline-none focus:ring-0 border-0 p-0"
              preventFormSubmission={true}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            />
          </h2>
          <p className="text-gray-700 mb-4">
            <EditableText
              field={`guideContent.steps.${stepIndex}.subtitle`}
              value={subtitle}
              onSave={onSaveText}
              className="bg-transparent focus:outline-none focus:ring-0 border-0 p-0"
              preventFormSubmission={true}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            />
          </p>
          <p className="text-gray-700 mb-4">
            <EditableText
              field={`guideContent.steps.${stepIndex}.content.0`}
              value={content[0] || ""}
              onSave={onSaveText}
              className="bg-transparent focus:outline-none focus:ring-0 border-0 p-0"
              preventFormSubmission={true}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            />
          </p>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-8">
          <div className="relative h-[300px] rounded-lg overflow-hidden">
            <EditableImage
              field={`guideContent.steps.${stepIndex}.images.0`}
              value={images[0] || ""}
              onSave={(field, url) => handleSaveImage(0, url)}
              alt="Brand Storytelling"
              className="object-cover"
              width={800}
              height={300}
            />
            {images[0] && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 pointer-events-none">
                <h3 className="text-white font-bold text-xl">
                  <EditableText
                    field={`guideContent.steps.${stepIndex}.imageLabels.0`}
                    value={imageLabels[0] || "Brand Storytelling"}
                    onSave={onSaveText}
                    className="bg-transparent focus:outline-none focus:ring-0 border-0 p-0 pointer-events-auto"
                    preventFormSubmission={true}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  />
                </h3>
                <p className="text-white/80 text-sm mb-3">
                  <EditableText
                    field={`guideContent.steps.${stepIndex}.content.1`}
                    value={content[1] || "Creating emotional connections through visual narratives"}
                    onSave={onSaveText}
                    className="bg-transparent focus:outline-none focus:ring-0 border-0 p-0 pointer-events-auto"
                    preventFormSubmission={true}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  />
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="col-span-6 md:col-span-4">
          <div className="relative h-[140px] rounded-lg overflow-hidden mb-4">
            <EditableImage
              field={`guideContent.steps.${stepIndex}.images.1`}
              value={images[1] || ""}
              onSave={(field, url) => handleSaveImage(1, url)}
              alt="Data Visualization"
              className="object-cover"
              width={300}
              height={140}
            />
            {images[1] && (
              <div className="absolute inset-0 bg-[#FF6C1A]/20 hover:bg-[#FF6C1A]/10 transition-colors pointer-events-none"></div>
            )}
            {images[1] && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 pointer-events-none">
                <p className="text-white text-sm font-medium">
                  <EditableText
                    field={`guideContent.steps.${stepIndex}.imageLabels.1`}
                    value={imageLabels[1] || "Data Visualization"}
                    onSave={onSaveText}
                    className="bg-transparent focus:outline-none focus:ring-0 border-0 p-0 pointer-events-auto"
                    preventFormSubmission={true}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  />
                </p>
              </div>
            )}
          </div>
          <div className="relative h-[140px] rounded-lg overflow-hidden">
            <EditableImage
              field={`guideContent.steps.${stepIndex}.images.2`}
              value={images[2] || ""}
              onSave={(field, url) => handleSaveImage(2, url)}
              alt="Infographics"
              className="object-cover"
              width={300}
              height={140}
            />
            {images[2] && (
              <div className="absolute inset-0 bg-[#0A2463]/20 hover:bg-[#0A2463]/10 transition-colors pointer-events-none"></div>
            )}
            {images[2] && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 pointer-events-none">
                <p className="text-white text-sm font-medium">
                  <EditableText
                    field={`guideContent.steps.${stepIndex}.imageLabels.2`}
                    value={imageLabels[2] || "Infographics"}
                    onSave={onSaveText}
                    className="bg-transparent focus:outline-none focus:ring-0 border-0 p-0 pointer-events-auto"
                    preventFormSubmission={true}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  />
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="col-span-6 md:col-span-6">
          <div className="relative h-[200px] rounded-lg overflow-hidden">
            <EditableImage
              field={`guideContent.steps.${stepIndex}.images.3`}
              value={images[3] || ""}
              onSave={(field, url) => handleSaveImage(3, url)}
              alt="Motion Graphics"
              className="object-cover"
              width={500}
              height={200}
            />
            {images[3] && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pointer-events-none">
                <h3 className="text-white font-bold">
                  <EditableText
                    field={`guideContent.steps.${stepIndex}.imageLabels.3`}
                    value={imageLabels[3] || "Motion Graphics"}
                    onSave={onSaveText}
                    className="bg-transparent focus:outline-none focus:ring-0 border-0 p-0 pointer-events-auto"
                    preventFormSubmission={true}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  />
                </h3>
              </div>
            )}
          </div>
        </div>
        <div className="col-span-6 md:col-span-6">
          <div className="relative h-[200px] rounded-lg overflow-hidden">
            <EditableImage
              field={`guideContent.steps.${stepIndex}.images.4`}
              value={images[4] || ""}
              onSave={(field, url) => handleSaveImage(4, url)}
              alt="Photography"
              className="object-cover"
              width={500}
              height={200}
            />
            {images[4] && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pointer-events-none">
                <h3 className="text-white font-bold">
                  <EditableText
                    field={`guideContent.steps.${stepIndex}.imageLabels.4`}
                    value={imageLabels[4] || "Photography"}
                    onSave={onSaveText}
                    className="bg-transparent focus:outline-none focus:ring-0 border-0 p-0 pointer-events-auto"
                    preventFormSubmission={true}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  />
                </h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
