import type React from "react"

interface StepGuideProps {
  title: string
  introduction: string
  steps: Array<{
    number: number
    title: string
    content: string
    image?: string
  }>
}

export const StepGuide: React.FC<StepGuideProps> = ({ title, introduction, steps }) => {
  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <h2 className="text-3xl font-bold mb-4">{title}</h2>
      <p className="text-gray-600 mb-8">{introduction}</p>
      <div className="space-y-8">
        {steps.map((step) => (
          <div key={step.number} className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">{step.number}</span>
            </div>
            <div className="flex-grow">
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600 mb-4">{step.content}</p>
              {step.image && (
                <img src={step.image} alt={`Step ${step.number}`} className="rounded-lg max-w-full h-auto" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
