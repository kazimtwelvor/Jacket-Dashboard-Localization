"use client"

import type React from "react"
import { EditableImage } from "../editable-image"
import { EditableText } from "../editable-text"

interface StepEighteenContentShowcaseProps {
  title: string
  subtitle: string
  content: string[]
  images?: string[]
  imageLabels?: string[]
  onSaveText: (field: string, value: string) => void
  onSaveImage: (field: string, url: string) => void
  stepIndex: number
  openTextEditor?: () => void
}

export const StepEighteenContentShowcase: React.FC<StepEighteenContentShowcaseProps> = ({
  title,
  subtitle,
  content,
  images = ["", "", "", "", "", ""],
  imageLabels = [
    "E-commerce Content Strategy",
    "SaaS Blog Strategy",
    "Healthcare Content",
    "Travel Blog",
    "Financial Services",
    "Food & Beverage Campaign",
  ],
  onSaveText,
  onSaveImage,
  stepIndex,
  openTextEditor,
}) => {
  // Function to handle saving images directly
  const handleSaveImage = (index: number, url: string) => {
    console.log(`Saving image for step ${stepIndex}, image index ${index}:`, url)
    onSaveImage(`guideContent.steps.${stepIndex}.images.${index}`, url)
  }

  // Function to handle saving text for image labels
  const handleSaveLabel = (index: number, value: string) => {
    onSaveText(`guideContent.steps.${stepIndex}.imageLabels.${index}`, value)
  }

  // Function to handle saving other text elements
  const handleSaveText = (field: string, value: string) => {
    onSaveText(`guideContent.steps.${stepIndex}.${field}`, value)
  }

  return (
    <div className="animate-fade-in my-16">
      <div className="flex flex-col items-center text-center mb-10">
        <h2 className="text-2xl font-bold text-[#0A2463] mb-3">
          <EditableText field="title" value={title} onSave={handleSaveText} className="text-[#0A2463] font-bold" />
        </h2>
        <div className="w-16 h-1 bg-[#FF6C1A] mb-4"></div>
        <p className="text-gray-700 max-w-2xl">
          <EditableText field="subtitle" value={subtitle} onSave={handleSaveText} className="text-gray-700" />
        </p>
        {content.map((paragraph, idx) => (
          <p key={idx} className="text-gray-600 mb-4 max-w-2xl">
            <EditableText
              field={`content.${idx}`}
              value={paragraph}
              onSave={handleSaveText}
              className="text-gray-600"
              isTextarea={true}
            />
          </p>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
        {/* Large featured item */}
        <div className="col-span-2 row-span-2 group relative rounded-xl overflow-hidden shadow-lg">
          <EditableImage
            field={`guideContent.steps.${stepIndex}.images.0`}
            value={images[0] || ""}
            onSave={(field, url) => handleSaveImage(0, url)}
            alt="Featured content showcase"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            style={{ width: "100%", height: "100%", position: "absolute" }}
            width={600}
            height={400}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 z-10 w-full">
            <div className="pointer-events-auto inline-block">
              <EditableText
                field="tagText"
                value="E-commerce"
                onSave={(field, value) => handleSaveText("tagText", value)}
                className="bg-[#FF6C1A] text-white text-xs px-2 py-1 rounded mb-2 inline-block"
                isInline={true}
                darkMode={true}
              />
            </div>
            <div className="pointer-events-auto">
              <EditableText
                field="imageLabels.0"
                value={imageLabels[0] || "E-commerce Content Strategy"}
                onSave={(field, value) => handleSaveLabel(0, value)}
                className="text-white text-xl font-bold mb-1 block"
                darkMode={true}
              />
            </div>
            <div className="pointer-events-auto">
              <EditableText
                field="mainMetric"
                value="Increased organic traffic by 156% in 6 months"
                onSave={(field, value) => handleSaveText("mainMetric", value)}
                className="text-white/80 text-sm mb-3 block"
                darkMode={true}
              />
            </div>
            <div className="pointer-events-auto">
              <EditableText
                field="buttonText"
                value="View Case Study"
                onSave={(field, value) => handleSaveText("buttonText", value)}
                className="bg-white text-[#0A2463] px-4 py-1 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 inline-block"
                isInline={true}
              />
            </div>
          </div>
        </div>

        {/* Regular items */}
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="group relative rounded-xl overflow-hidden shadow-md">
            <EditableImage
              field={`guideContent.steps.${stepIndex}.images.${index}`}
              value={images[index] || ""}
              onSave={(field, url) => handleSaveImage(index, url)}
              alt={`Case Study ${index}`}
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              style={{ width: "100%", height: "100%", position: "absolute" }}
              width={300}
              height={200}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 p-4 z-10 w-full pointer-events-auto">
              <EditableText
                field={`imageLabels.${index}`}
                value={imageLabels[index] || `Case Study ${index}`}
                onSave={(field, value) => handleSaveLabel(index, value)}
                className="text-white text-sm font-bold"
                darkMode={true}
              />
            </div>
          </div>
        ))}

        <div className="col-span-2 group relative rounded-xl overflow-hidden shadow-md">
          <EditableImage
            field={`guideContent.steps.${stepIndex}.images.5`}
            value={images[5] || ""}
            onSave={(field, url) => handleSaveImage(5, url)}
            alt="Food and Beverage Campaign"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            style={{ width: "100%", height: "100%", position: "absolute" }}
            width={600}
            height={200}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 p-4 z-10 w-full">
            <div className="pointer-events-auto">
              <EditableText
                field={`imageLabels.5`}
                value={imageLabels[5] || "Food & Beverage Campaign"}
                onSave={(field, value) => handleSaveLabel(5, value)}
                className="text-white text-sm font-bold"
                darkMode={true}
              />
            </div>
            <div className="pointer-events-auto">
              <EditableText
                field="secondaryMetric"
                value="Seasonal recipe content strategy"
                onSave={(field, value) => handleSaveText("secondaryMetric", value)}
                className="text-white/80 text-xs"
                darkMode={true}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <div className="inline-block pointer-events-auto">
          <EditableText
            field="viewAllButtonText"
            value="View All Case Studies"
            onSave={(field, value) => handleSaveText("viewAllButtonText", value)}
            className="bg-[#0A2463] hover:bg-[#0A2463]/90 text-white px-8 py-3 rounded-full font-medium transition-colors inline-block"
            isInline={true}
            darkMode={true}
          />
        </div>
      </div>
    </div>
  )
}
