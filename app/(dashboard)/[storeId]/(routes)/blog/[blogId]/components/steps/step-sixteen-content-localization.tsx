"use client"

import type React from "react"
import { EditableImage } from "../editable-image"
import { EditableText } from "../editable-text"

interface TimelineItem {
  title: string
  description: string
}

interface StepSixteenContentLocalizationProps {
  title: string
  subtitle: string
  content: string[]
  images: string[]
  timelineItems?: TimelineItem[]
  onSaveText: (field: string, value: string) => void
  onSaveImage: (field: string, url: string) => void
  stepIndex: number
  openTextEditor?: () => void
}

export const StepSixteenContentLocalization: React.FC<StepSixteenContentLocalizationProps> = ({
  title,
  subtitle,
  content,
  images,
  timelineItems = [
    {
      title: "Market Research",
      description:
        "Understand local preferences, cultural nuances, and market-specific needs to inform your localization strategy.",
    },
    {
      title: "Translation & Adaptation",
      description:
        "Professional translation and cultural adaptation of your content to ensure it resonates with local audiences.",
    },
    {
      title: "Local SEO & Distribution",
      description:
        "Optimize your localized content for local search engines and distribute through region-specific channels.",
    },
  ],
  onSaveText,
  onSaveImage,
  stepIndex,
  openTextEditor,
}) => {
  const handleSaveImage = (index: number, url: string) => {
    onSaveImage(`guideContent.steps.${stepIndex}.images.${index}`, url)
  }

  const handleSaveTimelineItem = (index: number, field: string, value: string) => {
    const path = `guideContent.steps.${stepIndex}.timelineItems.${index}.${field}`
    onSaveText(path, value)
  }

  return (
    <div className="animate-fade-in my-16">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-1 h-8 bg-[#FF6C1A] rounded-full"></div>
        <h2 className="text-2xl font-bold text-[#0A2463]">
          <EditableText field={`guideContent.steps.${stepIndex}.title`} value={title} onSave={onSaveText} />
        </h2>
      </div>

      <p className="text-gray-700 mb-10 max-w-3xl">
        <EditableText
          field={`guideContent.steps.${stepIndex}.content.0`}
          value={content[0]}
          onSave={onSaveText}
          isTextarea={true}
        />
      </p>

      {/* Timeline layout */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-[#0A2463] to-[#FF6C1A]"></div>

        {/* Timeline item 1 */}
        <div className="relative mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="md:text-right">
              <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-[#0A2463] md:ml-auto">
                <h3 className="text-lg font-bold text-[#0A2463] mb-2 pointer-events-auto">
                  <EditableText
                    field={`timelineItems.0.title`}
                    value={timelineItems[0]?.title || "Market Research"}
                    onSave={(field, value) => handleSaveTimelineItem(0, "title", value)}
                  />
                </h3>
                <p className="text-gray-700 pointer-events-auto">
                  <EditableText
                    field={`timelineItems.0.description`}
                    value={timelineItems[0]?.description || "Understand local preferences, cultural nuances, and market-specific needs to inform your localization strategy."}
                    onSave={(field, value) => handleSaveTimelineItem(0, "description", value)}
                    isTextarea={true}
                  />
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="h-[200px] relative rounded-lg overflow-hidden shadow-md">
                <EditableImage
                  field={`guideContent.steps.${stepIndex}.images.0`}
                  value={images[0]}
                  onSave={(field, url) => handleSaveImage(0, url)}
                  className="object-cover"
                  width={400}
                  height={200}
                  alt="Market Research"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A2463]/20 to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>
          {/* Timeline dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0A2463] border-4 border-white pointer-events-none"></div>
        </div>

        {/* Timeline item 2 */}
        <div className="relative mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="md:order-2 md:text-left">
              <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-[#FF6C1A] md:mr-auto">
                <h3 className="text-lg font-bold text-[#0A2463] mb-2 pointer-events-auto">
                  <EditableText
                    field={`timelineItems.1.title`}
                    value={timelineItems[1]?.title || "Translation & Adaptation"}
                    onSave={(field, value) => handleSaveTimelineItem(1, "title", value)}
                  />
                </h3>
                <p className="text-gray-700 pointer-events-auto">
                  <EditableText
                    field={`timelineItems.1.description`}
                    value={timelineItems[1]?.description || "Professional translation and cultural adaptation of your content to ensure it resonates with local audiences."}
                    onSave={(field, value) => handleSaveTimelineItem(1, "description", value)}
                    isTextarea={true}
                  />
                </p>
              </div>
            </div>
            <div className="relative md:order-1">
              <div className="h-[200px] relative rounded-lg overflow-hidden shadow-md">
                <EditableImage
                  field={`guideContent.steps.${stepIndex}.images.1`}
                  value={images[1]}
                  onSave={(field, url) => handleSaveImage(1, url)}
                  className="object-cover"
                  width={400}
                  height={200}
                  alt="Translation & Adaptation"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-[#FF6C1A]/20 to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>
          {/* Timeline dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FF6C1A] border-4 border-white pointer-events-none"></div>
        </div>

        {/* Timeline item 3 */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="md:text-right">
              <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-[#0A2463] md:ml-auto">
                <h3 className="text-lg font-bold text-[#0A2463] mb-2 pointer-events-auto">
                  <EditableText
                    field={`timelineItems.2.title`}
                    value={timelineItems[2]?.title || "Local SEO & Distribution"}
                    onSave={(field, value) => handleSaveTimelineItem(2, "title", value)}
                  />
                </h3>
                <p className="text-gray-700 pointer-events-auto">
                  <EditableText
                    field={`timelineItems.2.description`}
                    value={timelineItems[2]?.description || "Optimize your localized content for local search engines and distribute through region-specific channels."}
                    onSave={(field, value) => handleSaveTimelineItem(2, "description", value)}
                    isTextarea={true}
                  />
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="h-[200px] relative rounded-lg overflow-hidden shadow-md">
                <EditableImage
                  field={`guideContent.steps.${stepIndex}.images.2`}
                  value={images[2]}
                  onSave={(field, url) => handleSaveImage(2, url)}
                  className="object-cover"
                  width={400}
                  height={200}
                  alt="Local SEO & Distribution"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A2463]/20 to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>
          {/* Timeline dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0A2463] border-4 border-white pointer-events-none"></div>
        </div>
      </div>
    </div>
  )
}
