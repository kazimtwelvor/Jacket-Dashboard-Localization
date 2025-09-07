"use client"

import type React from "react"
import { EditableText } from "../editable-text"
import { EditableImage } from "../editable-image"

interface StepSeventeenAnalyticsDashboardProps {
  title: string
  subtitle: string
  content: string[]
  images?: string[]
  metrics?: {
    titles: string[]
    values: string[]
  }
  onSaveText: (field: string, value: string) => void
  onSaveImage: (field: string, url: string) => void
  stepIndex: number
}

export const StepSeventeenAnalyticsDashboard: React.FC<StepSeventeenAnalyticsDashboardProps> = ({
  title,
  subtitle,
  content,
  images = ["", "", ""],
  metrics = {
    titles: ["Traffic", "Engagement", "Conversions"],
    values: ["+24%", "+18%", "+32%"],
  },
  onSaveText,
  onSaveImage,
  stepIndex,
}) => {
  // Function to handle image save with direct URL
  const handleSaveImage = (index: number, url: string) => {
    onSaveImage(`guideContent.steps.${stepIndex}.images.${index}`, url)
  }

  return (
    <div className="animate-fade-in my-16">
      <div className="relative overflow-hidden rounded-xl bg-[#f3f4f6] p-8">
        {/* Background elements for parallax effect */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-[#FF6C1A]/10 pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-[#0A2463]/10 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-[#FF6C1A]/20 pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold text-[#0A2463] mb-3">
              <EditableText
                field={`guideContent.steps.${stepIndex}.title`}
                value={title}
                onSave={onSaveText}
                className="bg-transparent focus:outline-none focus:ring-0 border-0 p-0 text-center w-full"
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
            <p className="text-gray-700">
              <EditableText
                field={`guideContent.steps.${stepIndex}.subtitle`}
                value={subtitle}
                onSave={onSaveText}
                className="bg-transparent focus:outline-none focus:ring-0 border-0 p-0 text-center w-full"
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
            {content.map((paragraph, idx) => (
              <p key={idx} className="text-gray-700 mt-2">
                <EditableText
                  field={`guideContent.steps.${stepIndex}.content.${idx}`}
                  value={paragraph}
                  onSave={onSaveText}
                  className="bg-transparent focus:outline-none focus:ring-0 border-0 p-0 text-center w-full"
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
            ))}
          </div>

          {/* Main dashboard container with relative positioning */}
          <div className="relative mt-8 mb-16">
            {/* Main dashboard image */}
            <div className="relative z-20 rounded-lg overflow-hidden shadow-2xl border-8 border-white">
              <div className="h-[300px] relative">
                <EditableImage
                  field={`guideContent.steps.${stepIndex}.images.0`}
                  value={images[0]}
                  onSave={(field, url) => handleSaveImage(0, url)}
                  className="object-cover"
                  width={800}
                  height={300}
                  alt="Analytics Dashboard"
                />
              </div>
            </div>

            {/* Traffic Analytics Box - Top Right, outside of text area */}
            <div className="absolute -top-12 -right-8 z-30 w-48 h-48 rounded-lg overflow-hidden shadow-lg transform rotate-6">
              <div className="relative h-full w-full">
                <div className="h-full w-full" onClick={(e) => e.stopPropagation()}>
                  <EditableImage
                    field={`guideContent.steps.${stepIndex}.images.1`}
                    value={images[1]}
                    onSave={(field, url) => handleSaveImage(1, url)}
                    className="object-cover"
                    width={200}
                    height={200}
                    alt="Traffic Analytics"
                  />
                </div>
                {images[1] && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0A2463]/50 to-transparent flex items-end p-3 pointer-events-none">
                    <span className="text-white text-sm font-medium">Traffic Analytics</span>
                  </div>
                )}
              </div>
            </div>

            {/* Conversion Metrics Box - Bottom Left, positioned better */}
            <div className="absolute -bottom-12 -left-8 z-30 w-40 h-40 rounded-lg overflow-hidden shadow-lg transform -rotate-3">
              <div className="relative h-full w-full">
                <div className="h-full w-full" onClick={(e) => e.stopPropagation()}>
                  <EditableImage
                    field={`guideContent.steps.${stepIndex}.images.2`}
                    value={images[2]}
                    onSave={(field, url) => handleSaveImage(2, url)}
                    className="object-cover"
                    width={160}
                    height={160}
                    alt="Conversion Metrics"
                  />
                </div>
                {images[2] && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6C1A]/50 to-transparent flex items-end p-3 pointer-events-none">
                    <span className="text-white text-sm font-medium">Conversion Metrics</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {metrics.titles.map((title, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-[#0A2463]">
                    <EditableText
                      field={`guideContent.steps.${stepIndex}.metrics.titles.${idx}`}
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
                  </h3>
                  <span className="text-green-500 text-sm font-medium">
                    <EditableText
                      field={`guideContent.steps.${stepIndex}.metrics.values.${idx}`}
                      value={metrics.values[idx]}
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
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF6C1A] rounded-full"
                    style={{ width: idx === 0 ? "75%" : idx === 1 ? "66%" : "80%" }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
