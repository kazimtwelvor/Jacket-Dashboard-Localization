"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { Download, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WikihowTemplateProps {
  isEditing?: boolean
  title?: string
  authorName?: string
  authorTitle?: string
  reviewDate?: string
  viewCount?: string
  helpfulPercentage?: string
  introduction?: string
  parts?: Part[]
  onTitleChange?: (value: string) => void
  onAuthorNameChange?: (value: string) => void
  onAuthorTitleChange?: (value: string) => void
  onReviewDateChange?: (value: string) => void
  onViewCountChange?: (value: string) => void
  onHelpfulPercentageChange?: (value: string) => void
  onIntroductionChange?: (value: string) => void
  onPartsChange?: (value: Part[]) => void
  onDelete?: () => void
}

interface Part {
  id: string
  title: string
  steps: Step[]
}

interface Step {
  id: string
  title: string
  content: string
  tips: string[]
}

export const WikihowTemplate: React.FC<WikihowTemplateProps> = ({
  isEditing = false,
  title: propTitle,
  authorName: propAuthorName,
  authorTitle: propAuthorTitle,
  reviewDate: propReviewDate,
  viewCount: propViewCount,
  helpfulPercentage: propHelpfulPercentage,
  introduction: propIntroduction,
  parts: propParts,
  onPartsChange,
}) => {
  const [title, setTitle] = useState<string>(propTitle || "How to Write a Good Blog Post: Complete Guide")
  const [authorName, setAuthorName] = useState<string>(propAuthorName || "Ryan Corrigan")
  const [authorTitle, setAuthorTitle] = useState<string>(propAuthorTitle || "Social Media Expert")
  const [reviewDate, setReviewDate] = useState<string>(propReviewDate || "March 29, 2023")
  const [viewCount, setViewCount] = useState<string>(propViewCount || "1,234,567")
  const [helpfulPercentage, setHelpfulPercentage] = useState<string>(propHelpfulPercentage || "87%")
  const [introduction, setIntroduction] = useState<string>(
    propIntroduction ||
      "A blog post is a piece of writing that appears on a website audience. Before you begin writing your blog post, you should have a clear understanding of your target audience. If you're writing for your own blog, you probably know your audience. If you're guest blogging, you'll want to make sure your post aligns with the site's usual content.",
  )

  const [parts, setParts] = useState<Part[]>(
    propParts || [
      {
        id: "part1",
        title: "Finding Your Style",
        steps: [
          {
            id: "step1",
            title: "Consider what you want to write about.",
            content:
              "Use your blog to write about something you're passionate about. Try to narrow down your topic by considering details or other people's blogs. If anything you write feels inauthentic or what you don't have experience in, your readers will notice.",
            tips: [
              "Focus on a specific topic, like food, travel, fashion, or music, or you can write about several things.",
              "Think about blogs, websites, and images on the other blogs you enjoy reading.",
              "Visit the blogs regularly.",
              "Pay attention to what gets the most comments on your favorite blogs. Also, note if the site has an active comments board and how often the author responds to reader comments.",
            ],
          },
          {
            id: "step2",
            title: "Consider who you're writing to, or your audience.",
            content:
              "The language you use and the information you include will depend on who you expect to read your blog.",
            tips: [
              "If you are writing for a personal blog meant for daily close friends and family, you can use inside jokes and casual language.",
              "Think about what your readers want to know. This is what it takes to be on them in your life.",
              "Think of personal blog as a conversation. Imagine you are chatting with a close friend. Use contractions and the first person (I, me, my) whenever you can.",
              "If you are writing for a professional audience, you may want to use more precise language and be careful.",
              "If you are writing for a personal blog that is meant for a larger audience, you can still use casual language, but you may need to include more explanation or background information to ensure your readers can follow along.",
            ],
          },
        ],
      },
      {
        id: "part2",
        title: "Opening the Post",
        steps: [
          {
            id: "step3",
            title: "Choose your topic.",
            content:
              "This can be as general or specific as you'd like, but keep it to something you actually know and can write about effectively.",
            tips: [
              'If you are writing a personal blog about fashion, you may want to consider a specific clothing item, like "How to Style a White Button-Down Shirt 5 Ways" or a general category for your site, like "The Best Street Style from Paris Fashion Week."',
              "If you are writing a business blog, you may want to focus on a particular aspect of your business that might be interesting to your customers. For example, if you run a bakery, you might want to write about how you source local ingredients, or how your favorite recipes came to be.",
            ],
          },
          {
            id: "step4",
            title: "Come up with a title.",
            content: "If you don't pick a title, try to narrow down the title so it is specific to your post.",
            tips: [
              "Make the headline of your blog strong, concise, and punchy, which basically will attract your reader.",
              "Avoid using a bland title. The title is the first thing the reader will see, so you want to make it interesting.",
              "Think of your title as a mini-summary of the content of your blog post.",
            ],
          },
        ],
      },
      {
        id: "part3",
        title: "Think about what you can say differently",
        steps: [
          {
            id: "step5",
            title: "Think about what you can say differently",
            content:
              "Consider what you can write about that is different from what everyone else is saying. An effective blog post offers unique information to the reader, whether it's an opinion, experience, or guide.",
            tips: [
              "For example, you are writing a blog post about how to make chocolate cake on your personal food blog. Of course, there are many recipes for chocolate cake online. So what makes your recipe stand out? Are you adding interesting ingredients like salt or candy? Or are you using a unique technique to make the chocolate cake?",
              "If you're writing about a popular topic, find a unique angle or perspective that hasn't been covered extensively. This could be your personal experience, a contrarian viewpoint, or a deep dive into a specific aspect of the topic.",
              "Use your own voice and style. Your unique writing style can make even common topics feel fresh and interesting to readers.",
            ],
          },
        ],
      },
    ],
  )

  const addPart = () => {
    const newPartId = `part${parts.length + 1}`
    const newParts = [...parts, { id: newPartId, title: "New Part", steps: [] }]
    setParts(newParts)
    onPartsChange?.(newParts)
  }

  const removePart = (index: number) => {
    if (parts.length <= 1) {
      return
    }
    const newParts = [...parts]
    newParts.splice(index, 1)
    setParts(newParts)
    onPartsChange?.(newParts)
  }

  const addStep = (partIndex: number) => {
    const newParts = [...parts]
    const stepCount = newParts[partIndex].steps.length
    const newStepId = `step${Date.now()}`
    newParts[partIndex].steps.push({
      id: newStepId,
      title: `New Step ${stepCount + 1}`,
      content: "Add your step content here",
      tips: ["Add your tips here"],
    })
    setParts(newParts)
    onPartsChange?.(newParts)
  }

  const removeStep = (partIndex: number, stepIndex: number) => {
    if (parts[partIndex].steps.length <= 1) {
      return
    }
    const newParts = [...parts]
    newParts[partIndex].steps.splice(stepIndex, 1)
    setParts(newParts)
    onPartsChange?.(newParts)
  }

  const addTip = (partIndex: number, stepIndex: number) => {
    const newParts = [...parts]
    newParts[partIndex].steps[stepIndex].tips.push("New tip")
    setParts(newParts)
    onPartsChange?.(newParts)
  }

  const removeTip = (partIndex: number, stepIndex: number, tipIndex: number) => {
    if (parts[partIndex].steps[stepIndex].tips.length <= 1) {
      return
    }
    const newParts = [...parts]
    newParts[partIndex].steps[stepIndex].tips.splice(tipIndex, 1)
    setParts(newParts)
    onPartsChange?.(newParts)
  }

  const updatePartTitle = (index: number, newTitle: string) => {
    const newParts = [...parts]
    newParts[index].title = newTitle
    setParts(newParts)
    onPartsChange?.(newParts)
  }

  const updateStepTitle = (partIndex: number, stepIndex: number, newTitle: string) => {
    const newParts = [...parts]
    newParts[partIndex].steps[stepIndex].title = newTitle
    setParts(newParts)
    onPartsChange?.(newParts)
  }

  const updateStepContent = (partIndex: number, stepIndex: number, newContent: string) => {
    const newParts = [...parts]
    newParts[partIndex].steps[stepIndex].content = newContent
    setParts(newParts)
    onPartsChange?.(newParts)
  }

  const updateStepTip = (partIndex: number, stepIndex: number, tipIndex: number, newTip: string) => {
    const newParts = [...parts]
    newParts[partIndex].steps[stepIndex].tips[tipIndex] = newTip
    setParts(newParts)
    onPartsChange?.(newParts)
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-6 flex flex-col">
        <div className="w-full">
          <div className="flex flex-col md:flex-row justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 md:mb-0">{title}</h1>
          </div>

          <div className="mb-8">
            <p className="text-gray-700 mb-4">{introduction}</p>
            <div className="flex justify-center my-4">
              <Button variant="outline" className="flex items-center border-red-500 text-red-500">
                <Download className="h-4 w-4 mr-2" />
                Download Article
              </Button>
            </div>
          </div>

          {parts.map((part, partIndex) => (
            <div key={part.id} className="mb-10 relative">
              <div className="sticky top-0 z-10 bg-white flex justify-between items-center border-b border-gray-200 py-2">
                <div className="flex items-center">
                  <div className="bg-[#76b474] text-white px-4 py-2 rounded-md inline-flex items-center mr-3">
                    <span className="font-bold">Part</span>
                    <span className="font-bold ml-1">{partIndex + 1}</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={part.title}
                      onChange={(e) => updatePartTitle(partIndex, e.target.value)}
                      className="text-xl font-bold border-b border-gray-300 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <h2 className="text-xl font-bold">{part.title}</h2>
                  )}
                </div>
                <div className="flex items-center">
                  <Button variant="outline" className="flex items-center border-red-500 text-red-500 mr-2">
                    <Download className="h-4 w-4 mr-2" />
                    Download Article
                  </Button>
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2 text-red-500 border-red-500"
                      onClick={() => removePart(partIndex)}
                      disabled={parts.length <= 1}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove Part
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {part.steps.map((step, stepIndex) => (
                  <div key={step.id} className="border border-gray-200 p-4 rounded-md mt-4 mb-6">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-1/2 mb-4 md:mb-0 md:pr-4">
                        <Image
                          src="/placeholder.svg?height=300&width=400"
                          alt="Finding your style illustration"
                          width={400}
                          height={300}
                          className="w-full h-auto rounded-md"
                        />
                      </div>
                      <div className="w-full md:w-1/2">
                        <div className="mb-6">
                          <div className="flex items-start mb-2">
                            <span className="font-bold text-lg mr-2">{stepIndex + 1}</span>
                            {isEditing ? (
                              <input
                                type="text"
                                value={step.title}
                                onChange={(e) => updateStepTitle(partIndex, stepIndex, e.target.value)}
                                className="font-bold w-full border-b border-gray-300 focus:outline-none focus:border-blue-500"
                              />
                            ) : (
                              <p className="font-bold">{step.title}</p>
                            )}
                          </div>
                          {isEditing ? (
                            <textarea
                              value={step.content}
                              onChange={(e) => updateStepContent(partIndex, stepIndex, e.target.value)}
                              className="text-gray-700 ml-6 mb-2 w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
                              rows={3}
                            />
                          ) : (
                            <p className="text-gray-700 ml-6 mb-2">{step.content}</p>
                          )}
                          <ul className="list-disc ml-12 text-gray-700">
                            {step.tips.map((tip, tipIndex) => (
                              <li key={tipIndex} className="mb-2">
                                {isEditing ? (
                                  <div className="flex items-center">
                                    <input
                                      type="text"
                                      value={tip}
                                      onChange={(e) => updateStepTip(partIndex, stepIndex, tipIndex, e.target.value)}
                                      className="w-full border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="ml-2 text-red-500 h-6 w-6 p-0"
                                      onClick={() => removeTip(partIndex, stepIndex, tipIndex)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  tip
                                )}
                              </li>
                            ))}
                            {isEditing && (
                              <li>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addTip(partIndex, stepIndex)}
                                  className="text-blue-500"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add Tip
                                </Button>
                              </li>
                            )}
                          </ul>
                        </div>
                        {isEditing && (
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 border-red-500"
                              onClick={() => removeStep(partIndex, stepIndex)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove Step
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isEditing && (
                  <Button variant="outline" size="sm" onClick={() => addStep(partIndex)} className="ml-6">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                )}
              </div>
            </div>
          ))}
          {isEditing && (
            <Button variant="outline" size="sm" onClick={addPart} className="mb-6">
              <Plus className="h-4 w-4 mr-2" />
              Add Part
            </Button>
          )}

          <div className="border border-gray-200 rounded-md p-4 mb-6">
            <div className="flex items-center mb-4">
              <Image
                src="/placeholder.svg?height=60&width=60"
                alt="Author"
                width={60}
                height={60}
                className="rounded-full"
              />
              <div className="ml-2">
                <p className="font-semibold text-sm">{authorName}</p>
                <p className="text-xs text-gray-500">{authorTitle}</p>
                <p className="text-xs text-gray-500">This article has been viewed {viewCount} times.</p>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              <p className="mb-2">Co-authors: 14</p>
              <p className="mb-2">Updated: {reviewDate}</p>
              <p className="mb-2">Views: {viewCount}</p>
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M7 10v12l10-6.5L7 10z"></path>
                  <path d="M21 10 7 3.5v6.5"></path>
                </svg>
                <span>{helpfulPercentage}</span>
                <span className="ml-1">of readers found this article helpful</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
