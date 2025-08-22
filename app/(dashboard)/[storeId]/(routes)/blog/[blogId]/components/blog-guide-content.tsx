"use client"

import type React from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

import { KeyTakeaways } from "./steps/key-takeaways"
import { StepOneContentStrategy } from "./steps/step-one-content-strategy"
import { StepTwoContentCreation } from "./steps/step-two-content-creation"
import { StepThreeLinkAcquisition } from "./steps/step-three-link-acquisition"
import { StepFourSeoConsulting } from "./steps/step-four-seo-consulting"
import { StepFiveContentAnalytics } from "./steps/step-five-content-analytics"
import { StepSixSocialMedia } from "./steps/step-six-social-media"
import { StepSevenEmailMarketing } from "./steps/step-seven-email-marketing"
import { StepEightContentDistribution } from "./steps/step-eight-content-distribution"
import { StepNineVideoMarketing } from "./steps/step-nine-video-marketing"
import { StepTenInteractiveContent } from "./steps/step-ten-interactive-content"
import { StepElevenContentPersonalization } from "./steps/step-eleven-content-personalization"
import { StepTwelveVisualStorytelling } from "./steps/step-twelve-visual-storytelling"
import { StepThirteenContentOptimization } from "./steps/step-thirteen-content-optimization"
import { StepFourteen3DImageExperience } from "./steps/step-fourteen-3d-image-experience"
import { StepFifteenContentAuditing } from "./steps/step-fifteen-content-auditing"
import { StepSixteenContentLocalization } from "./steps/step-sixteen-content-localization"
import { StepSeventeenAnalyticsDashboard } from "./steps/step-seventeen-analytics-dashboard"
import { StepEighteenContentShowcase } from "./steps/step-eighteen-content-showcase"
// Add a new import for the text editor modal
import { TextEditorModal } from "./text-editor-modal"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { EditableText } from "./editable-text"
import { toast } from "react-hot-toast"

interface BlogGuideContentProps {
  title: string
  steps: {
    title: string
    subtitle: string
    content: string[]
    image?: string
    images?: string[]
    imageLabels?: string[]
    cardTitles?: string[]
    cardDescriptions?: string[]
    buttonText?: string
    isActive?: boolean
    timelineItems?: {
      title: string
      description: string
    }[]
    metrics?: {
      before?: string[]
      after?: string[]
      titles?: string[]
      values?: string[]
    }
  }[]
  keyTakeaways: {
    title: string
    isActive?: boolean
    whatYouLearned: {
      title: string
      items: string[]
    }
    nextSteps: {
      title: string
      description: string
      items: string[]
    }
  }
  onSaveText: (field: string, value: string) => void
  onSaveImage: (field: string, url: string) => void
  onToggleStep?: (index: number, value: boolean) => void
  onToggleKeyTakeaways?: (value: boolean) => void
}

// Update the component to include state for the text editor modal
export const BlogGuideContent: React.FC<BlogGuideContentProps> = ({
  title,
  steps,
  keyTakeaways,
  onSaveText,
  onSaveImage,
  onToggleStep,
  onToggleKeyTakeaways,
}) => {
  // Add state for the text editor modal
  const [textEditorOpen, setTextEditorOpen] = useState(false)
  const [currentEditStep, setCurrentEditStep] = useState<{ index: number; type: "step" | "keyTakeaways" } | null>(null)

  // Helper function to open the text editor for a specific step
  const openTextEditor = (index: number, type: "step" | "keyTakeaways" = "step") => {
    setCurrentEditStep({ index, type })
    setTextEditorOpen(true)
  }

  // Update the handleSaveImage function to add better error handling and logging
  const handleSaveImage = (field: string, url: string) => {
    try {
      console.log(`BlogGuideContent: Saving image for field ${field}:`, url)

      // Special handling for specific steps
      if (field.includes("steps.1.image")) {
        console.log("Step 2 image update detected:", url)
      }
      if (field.includes("steps.2.image")) {
        console.log("Step 3 image update detected:", url)
      }
      if (field.includes("steps.5.images")) {
        console.log("Step 6 social media image update detected:", url)
      }

      // Make sure we're not passing a field name as a URL
      if (url && url.startsWith("guideContent.steps.")) {
        console.error("Invalid URL detected (field name):", url)
        toast.error("Invalid image URL")
        return
      }

      // Ensure the URL is valid before saving
      if (url && !url.startsWith("http") && !url.startsWith("/")) {
        console.error("Invalid URL format:", url)
        toast.error("Invalid image URL format")
        return
      }

      onSaveImage(field, url)
      toast.success("Image updated successfully")
    } catch (error) {
      console.error("Error saving image:", error)
      toast.error("Failed to save image")
    }
  }

  // Helper function to render step with toggle
  const renderStepWithToggle = (index: number, stepComponent: React.ReactNode) => {
    const isActive = steps[index]?.isActive !== false // Default to true if undefined

    return (
      <div className="mb-12 relative">
        <div className="absolute top-0 right-0 flex items-center space-x-2 z-10">
          <Button variant="outline" size="sm" onClick={() => openTextEditor(index)} className="mr-2">
            Edit Content
          </Button>
          <Label htmlFor={`toggle-step-${index}`} className="text-sm text-gray-500">
            {isActive ? "Enabled" : "Disabled"}
          </Label>
          <Switch
            id={`toggle-step-${index}`}
            checked={isActive}
            onCheckedChange={(value) => onToggleStep && onToggleStep(index, value)}
          />
        </div>
        {isActive && stepComponent}
        {!isActive && (
          <div className="p-4 border border-dashed border-gray-300 rounded-md bg-gray-50 text-center text-gray-500">
            Step {index + 1} is disabled
          </div>
        )}
      </div>
    )
  }

  // Ensure step 6 has valid images array
  const step6Images = steps[5]?.images || ["", "", ""]
  // Filter out any invalid values
  const validStep6Images = step6Images.map((img) =>
    img && img !== "undefined" && !img.startsWith("guideContent.steps.") ? img : "",
  )

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-8 text-center">
        <EditableText
          field={`guideContent.title`}
          value={title}
          onSave={onSaveText}
          className="bg-transparent focus:outline-none focus:ring-0 border-0 p-0 text-center"
        />
      </h2>

      {/* Step 1: Content Strategy */}
      {renderStepWithToggle(
        0,
        <StepOneContentStrategy
          title={steps[0]?.title || ""}
          subtitle={steps[0]?.subtitle || ""}
          content={steps[0]?.content || []}
          image={steps[0]?.image || ""}
          onSaveText={onSaveText}
          onSaveImage={(field, url) => handleSaveImage(`guideContent.steps.0.image`, url)}
          stepIndex={0}
          openTextEditor={() => openTextEditor(0)}
        />,
      )}

      {/* Step 2: Content Creation */}
      {renderStepWithToggle(
        1,
        <StepTwoContentCreation
          title={steps[1]?.title || ""}
          subtitle={steps[1]?.subtitle || ""}
          content={steps[1]?.content || []}
          image={steps[1]?.image || ""}
          onSaveText={onSaveText}
          onSaveImage={(field, url) => handleSaveImage(`guideContent.steps.1.image`, url)}
          stepIndex={1}
          openTextEditor={() => openTextEditor(1)}
        />,
      )}

      {/* Step 3: Link Acquisition */}
      {renderStepWithToggle(
        2,
        <StepThreeLinkAcquisition
          title={steps[2]?.title || ""}
          subtitle={steps[2]?.subtitle || ""}
          content={steps[2]?.content || []}
          image={steps[2]?.image || ""}
          onSaveText={onSaveText}
          onSaveImage={(field, url) => handleSaveImage(`guideContent.steps.2.image`, url)}
          stepIndex={2}
          openTextEditor={() => openTextEditor(2)}
        />,
      )}

      {/* Step 4: SEO Consulting */}
      {renderStepWithToggle(
        3,
        <StepFourSeoConsulting
          title={steps[3]?.title || ""}
          subtitle={steps[3]?.subtitle || ""}
          content={steps[3]?.content || []}
          image={steps[3]?.image || ""}
          onSaveText={onSaveText}
          onSaveImage={(field, url) => handleSaveImage(`guideContent.steps.3.image`, url)}
          stepIndex={3}
          openTextEditor={() => openTextEditor(3)}
        />,
      )}

      {/* Step 5: Content Analytics */}
      {renderStepWithToggle(
        4,
        <StepFiveContentAnalytics
          title={steps[4]?.title || ""}
          subtitle={steps[4]?.subtitle || ""}
          content={steps[4]?.content || []}
          image={steps[4]?.image || ""}
          onSaveText={onSaveText}
          onSaveImage={(field, url) => handleSaveImage(`guideContent.steps.4.image`, url)}
          stepIndex={4}
          openTextEditor={() => openTextEditor(4)}
        />,
      )}

      {/* Step 6: Social Media */}
      {renderStepWithToggle(
        5,
        <StepSixSocialMedia
          title={steps[5]?.title || ""}
          subtitle={steps[5]?.subtitle || ""}
          content={steps[5]?.content || []}
          images={validStep6Images}
          onSaveText={onSaveText}
          onSaveImage={handleSaveImage}
          stepIndex={5}
          openTextEditor={() => openTextEditor(5)}
        />,
      )}

      {/* Step 7: Email Marketing */}
      {renderStepWithToggle(
        6,
        <StepSevenEmailMarketing
          title={steps[6]?.title || ""}
          subtitle={steps[6]?.subtitle || ""}
          content={steps[6]?.content || []}
          image={steps[6]?.image || ""}
          onSaveText={onSaveText}
          onSaveImage={(field, url) => handleSaveImage(`guideContent.steps.6.image`, url)}
          stepIndex={6}
          openTextEditor={() => openTextEditor(6)}
        />,
      )}

      {/* Step 8: Content Distribution */}
      {renderStepWithToggle(
        7,
        <StepEightContentDistribution
          title={steps[7]?.title || ""}
          subtitle={steps[7]?.subtitle || ""}
          content={steps[7]?.content || []}
          images={steps[7]?.images || ["", "", ""]}
          onSaveText={onSaveText}
          onSaveImage={handleSaveImage}
          stepIndex={7}
          openTextEditor={() => openTextEditor(7)}
        />,
      )}

      {/* Step 9: Video Marketing */}
      {renderStepWithToggle(
        8,
        <StepNineVideoMarketing
          title={steps[8]?.title || ""}
          subtitle={steps[8]?.subtitle || ""}
          content={steps[8]?.content || []}
          image={steps[8]?.image || ""}
          onSaveText={onSaveText}
          onSaveImage={handleSaveImage}
          stepIndex={8}
          openTextEditor={() => openTextEditor(8)}
        />,
      )}

      {/* Step 10: Interactive Content */}
      {renderStepWithToggle(
        9,
        <StepTenInteractiveContent
          title={steps[9]?.title || ""}
          subtitle={steps[9]?.subtitle || ""}
          content={steps[9]?.content || []}
          images={steps[9]?.images || ["", "", ""]}
          cardTitles={steps[9]?.cardTitles || []}
          cardDescriptions={steps[9]?.cardDescriptions || []}
          onSaveText={onSaveText}
          onSaveImage={handleSaveImage}
          stepIndex={9}
          openTextEditor={() => openTextEditor(9)}
        />,
      )}

      {/* Step 11: Content Personalization */}
      {renderStepWithToggle(
        10,
        <StepElevenContentPersonalization
          title={steps[10]?.title || ""}
          subtitle={steps[10]?.subtitle || ""}
          content={steps[10]?.content || []}
          image={steps[10]?.image || ""}
          buttonText={steps[10]?.buttonText || ""}
          onSaveText={onSaveText}
          onSaveImage={handleSaveImage}
          stepIndex={10}
          openTextEditor={() => openTextEditor(10)}
        />,
      )}

      {/* Step 12: Visual Storytelling */}
      {renderStepWithToggle(
        11,
        <StepTwelveVisualStorytelling
          title={steps[11]?.title || ""}
          subtitle={steps[11]?.subtitle || ""}
          content={steps[11]?.content || []}
          images={steps[11]?.images || ["", "", "", "", ""]}
          imageLabels={steps[11]?.imageLabels || []}
          onSaveText={onSaveText}
          onSaveImage={handleSaveImage}
          stepIndex={11}
          openTextEditor={() => openTextEditor(11)}
        />,
      )}

      {/* Step 13: Content Optimization */}
      {renderStepWithToggle(
        12,
        <StepThirteenContentOptimization
          title={steps[12]?.title || ""}
          subtitle={steps[12]?.subtitle || ""}
          content={steps[12]?.content || []}
          images={steps[12]?.images || ["", ""]}
          metrics={steps[12]?.metrics || { before: [], after: [] }}
          onSaveText={onSaveText}
          onSaveImage={handleSaveImage}
          stepIndex={12}
          openTextEditor={() => openTextEditor(12)}
        />,
      )}

      {/* Step 14: 3D Image Experience */}
      {renderStepWithToggle(
        13,
        <StepFourteen3DImageExperience
          title={steps[13]?.title || ""}
          subtitle={steps[13]?.subtitle || ""}
          content={steps[13]?.content || []}
          image={steps[13]?.image || ""}
          buttonText={steps[13]?.buttonText || ""}
          onSaveText={onSaveText}
          onSaveImage={(field, url) => handleSaveImage(`guideContent.steps.13.image`, url)}
          stepIndex={13}
          openTextEditor={() => openTextEditor(13)}
        />,
      )}

      {/* Step 15: Content Auditing */}
      {renderStepWithToggle(
        14,
        <StepFifteenContentAuditing
          title={steps[14]?.title || ""}
          subtitle={steps[14]?.subtitle || ""}
          content={steps[14]?.content || []}
          images={steps[14]?.images || ["", "", "", ""]}
          cardTitles={steps[14]?.cardTitles || []}
          cardDescriptions={steps[14]?.cardDescriptions || []}
          onSaveText={onSaveText}
          onSaveImage={handleSaveImage}
          stepIndex={14}
          openTextEditor={() => openTextEditor(14)}
        />,
      )}

      {/* Step 16: Content Localization */}
      {renderStepWithToggle(
        15,
        <StepSixteenContentLocalization
          title={steps[15]?.title || ""}
          subtitle={steps[15]?.subtitle || ""}
          content={steps[15]?.content || []}
          images={steps[15]?.images || ["", "", ""]}
          timelineItems={steps[15]?.timelineItems || []}
          onSaveText={onSaveText}
          onSaveImage={handleSaveImage}
          stepIndex={15}
          openTextEditor={() => openTextEditor(15)}
        />,
      )}

      {/* Step 17: Analytics Dashboard */}
      {renderStepWithToggle(
        16,
        <StepSeventeenAnalyticsDashboard
          title={steps[16]?.title || ""}
          subtitle={steps[16]?.subtitle || ""}
          content={steps[16]?.content || []}
          images={steps[16]?.images || ["", "", ""]}
          metrics={steps[16]?.metrics || { titles: [], values: [] }}
          onSaveText={onSaveText}
          onSaveImage={handleSaveImage}
          stepIndex={16}
          openTextEditor={() => openTextEditor(16)}
        />,
      )}

      {/* Step 18: Content Showcase */}
      {renderStepWithToggle(
        17,
        <StepEighteenContentShowcase
          title={steps[17]?.title || ""}
          subtitle={steps[17]?.subtitle || ""}
          content={steps[17]?.content || []}
          images={steps[17]?.images || ["", "", "", "", "", ""]}
          imageLabels={steps[17]?.imageLabels || []}
          onSaveText={onSaveText}
          onSaveImage={handleSaveImage}
          stepIndex={17}
          openTextEditor={() => openTextEditor(17)}
        />,
      )}

      {/* Key Takeaways */}
      <div className="mb-12 relative">
        <div className="absolute top-0 right-0 flex items-center space-x-2 z-10">
          <Button variant="outline" size="sm" onClick={() => openTextEditor(0, "keyTakeaways")} className="mr-2">
            Edit Content
          </Button>
          <Label htmlFor="toggle-key-takeaways" className="text-sm text-gray-500">
            {keyTakeaways.isActive !== false ? "Enabled" : "Disabled"}
          </Label>
          <Switch
            id="toggle-key-takeaways"
            checked={keyTakeaways.isActive !== false}
            onCheckedChange={(value) => onToggleKeyTakeaways && onToggleKeyTakeaways(value)}
          />
        </div>
        {keyTakeaways.isActive !== false ? (
          <KeyTakeaways
            title={keyTakeaways.title}
            whatYouLearned={keyTakeaways.whatYouLearned}
            nextSteps={keyTakeaways.nextSteps}
            onSaveText={onSaveText}
            openTextEditor={() => openTextEditor(0, "keyTakeaways")}
          />
        ) : (
          <div className="p-4 border border-dashed border-gray-300 rounded-md bg-gray-50 text-center text-gray-500">
            Key Takeaways section is disabled
          </div>
        )}
      </div>

      {/* Text Editor Modal */}
      {textEditorOpen && currentEditStep && (
        <TextEditorModal
          isOpen={textEditorOpen}
          onClose={() => setTextEditorOpen(false)}
          stepData={currentEditStep.type === "step" ? steps[currentEditStep.index] : null}
          keyTakeawaysData={currentEditStep.type === "keyTakeaways" ? keyTakeaways : null}
          stepIndex={currentEditStep.index}
          type={currentEditStep.type}
          onSave={(data) => {
            if (currentEditStep.type === "step") {
              // Save step data
              onSaveText(`guideContent.steps.${currentEditStep.index}.title`, data.title || "")
              onSaveText(`guideContent.steps.${currentEditStep.index}.subtitle`, data.subtitle || "")

              // Save each paragraph
              if (data.content) {
                data.content.forEach((paragraph, idx) => {
                  onSaveText(`guideContent.steps.${currentEditStep.index}.content.${idx}`, paragraph)
                })
              }
            } else if (currentEditStep.type === "keyTakeaways") {
              // Save key takeaways data
              onSaveText("guideContent.keyTakeaways.title", data.title || "")

              // Save what you learned items
              if (data.whatYouLearned?.items) {
                data.whatYouLearned.items.forEach((item, idx) => {
                  onSaveText(`guideContent.keyTakeaways.whatYouLearned.items.${idx}`, item)
                })
              }

              // Save next steps
              if (data.nextSteps) {
                onSaveText("guideContent.keyTakeaways.nextSteps.description", data.nextSteps.description || "")

                if (data.nextSteps.items) {
                  data.nextSteps.items.forEach((item, idx) => {
                    onSaveText(`guideContent.keyTakeaways.nextSteps.items.${idx}`, item)
                  })
                }
              }
            }

            setTextEditorOpen(false)
          }}
        />
      )}
    </div>
  )
}
