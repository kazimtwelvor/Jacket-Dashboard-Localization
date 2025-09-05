"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ImagePlus } from "lucide-react"
import ImageUpload from "@/components/ui/image-upload"

interface ProductOption {
  image: string
  title: string
  description: string
  buttonText: string
}

interface ProductOptionsTabsProps {
  isEditing?: boolean
  mainHeading: string
  mainDescription: string
  backingOptions: ProductOption[]
  borderOptions: ProductOption[]
  threadOptions: ProductOption[]
  onMainHeadingChange: (value: string) => void
  onMainDescriptionChange: (value: string) => void
  onOptionChange: (tabIndex: number, optionIndex: number, field: keyof ProductOption, value: string) => void
  onOptionImageChange: (tabIndex: number, optionIndex: number, url: string) => void
  onOptionImageRemove: (tabIndex: number, optionIndex: number) => void
  isUploading: boolean
}

export const ProductOptionsTabs: React.FC<ProductOptionsTabsProps> = ({
  isEditing = false,
  mainHeading,
  mainDescription,
  backingOptions,
  borderOptions,
  threadOptions,
  onMainHeadingChange,
  onMainDescriptionChange,
  onOptionChange,
  onOptionImageChange,
  onOptionImageRemove,
  isUploading,
}) => {
  const [activeTab, setActiveTab] = useState("backing")

  const handleKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    const tabs = ["backing", "border", "thread"]
    const currentIndex = tabs.indexOf(activeTab)
    let newIndex

    switch (e.key) {
      case "ArrowLeft":
      case "ArrowUp":
        newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1
        e.preventDefault()
        setActiveTab(tabs[newIndex])
        break
      case "ArrowRight":
      case "ArrowDown":
        newIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1
        e.preventDefault()
        setActiveTab(tabs[newIndex])
        break
      case "Home":
        e.preventDefault()
        setActiveTab(tabs[0])
        break
      case "End":
        e.preventDefault()
        setActiveTab(tabs[tabs.length - 1])
        break
      case "Enter":
      case " ":
        e.preventDefault()
        setActiveTab(tabId)
        break
    }
  }

  return (
    <div className="w-full py-12 px-4 bg-gray-50">
      {isEditing ? (
        <div className="space-y-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Product Options Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="options-heading">Main Heading</Label>
                <Input
                  id="options-heading"
                  value={mainHeading}
                  onChange={(e) => onMainHeadingChange(e.target.value)}
                  placeholder="Enter main heading"
                />
              </div>
              <div>
                <Label htmlFor="options-description">Main Description</Label>
                <Textarea
                  id="options-description"
                  value={mainDescription}
                  onChange={(e) => onMainDescriptionChange(e.target.value)}
                  placeholder="Enter main description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="backing" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="backing">Backing Options</TabsTrigger>
              <TabsTrigger value="border">Border Options</TabsTrigger>
              <TabsTrigger value="thread">Thread Color Options</TabsTrigger>
            </TabsList>

            <TabsContent value="backing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Backing Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {backingOptions.map((option, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle>Option {index + 1}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <ImagePlus className="h-5 w-5" />
                              <div>
                                <h3 className="text-base font-bold">
                                  Option Image <span className="text-red-500">*</span>
                                </h3>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div>
                                <ImageUpload
                                  value={option.image ? [option.image] : []}
                                  disabled={isUploading}
                                  onChange={(url) => onOptionImageChange(0, index, url)}
                                  onRemove={() => onOptionImageRemove(0, index)}
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`backing-${index}-title`}>Title</Label>
                            <Input
                              id={`backing-${index}-title`}
                              value={option.title}
                              onChange={(e) => onOptionChange(0, index, "title", e.target.value)}
                              placeholder="Enter title"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`backing-${index}-description`}>Description</Label>
                            <Textarea
                              id={`backing-${index}-description`}
                              value={option.description}
                              onChange={(e) => onOptionChange(0, index, "description", e.target.value)}
                              placeholder="Enter description"
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`backing-${index}-button`}>Button Text</Label>
                            <Input
                              id={`backing-${index}-button`}
                              value={option.buttonText}
                              onChange={(e) => onOptionChange(0, index, "buttonText", e.target.value)}
                              placeholder="Enter button text"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="border" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Border Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {borderOptions.map((option, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle>Option {index + 1}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <ImagePlus className="h-5 w-5" />
                              <div>
                                <h3 className="text-base font-bold">
                                  Option Image <span className="text-red-500">*</span>
                                </h3>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div>
                                <ImageUpload
                                  value={option.image ? [option.image] : []}
                                  disabled={isUploading}
                                  onChange={(url) => onOptionImageChange(1, index, url)}
                                  onRemove={() => onOptionImageRemove(1, index)}
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`border-${index}-title`}>Title</Label>
                            <Input
                              id={`border-${index}-title`}
                              value={option.title}
                              onChange={(e) => onOptionChange(1, index, "title", e.target.value)}
                              placeholder="Enter title"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`border-${index}-description`}>Description</Label>
                            <Textarea
                              id={`border-${index}-description`}
                              value={option.description}
                              onChange={(e) => onOptionChange(1, index, "description", e.target.value)}
                              placeholder="Enter description"
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`border-${index}-button`}>Button Text</Label>
                            <Input
                              id={`border-${index}-button`}
                              value={option.buttonText}
                              onChange={(e) => onOptionChange(1, index, "buttonText", e.target.value)}
                              placeholder="Enter button text"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="thread" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thread Color Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {threadOptions.map((option, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle>Option {index + 1}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <ImagePlus className="h-5 w-5" />
                              <div>
                                <h3 className="text-base font-bold">
                                  Option Image <span className="text-red-500">*</span>
                                </h3>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div>
                                <ImageUpload
                                  value={option.image ? [option.image] : []}
                                  disabled={isUploading}
                                  onChange={(url) => onOptionImageChange(2, index, url)}
                                  onRemove={() => onOptionImageRemove(2, index)}
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`thread-${index}-title`}>Title</Label>
                            <Input
                              id={`thread-${index}-title`}
                              value={option.title}
                              onChange={(e) => onOptionChange(2, index, "title", e.target.value)}
                              placeholder="Enter title"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`thread-${index}-description`}>Description</Label>
                            <Textarea
                              id={`thread-${index}-description`}
                              value={option.description}
                              onChange={(e) => onOptionChange(2, index, "description", e.target.value)}
                              placeholder="Enter description"
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`thread-${index}-button`}>Button Text</Label>
                            <Input
                              id={`thread-${index}-button`}
                              value={option.buttonText}
                              onChange={(e) => onOptionChange(2, index, "buttonText", e.target.value)}
                              placeholder="Enter button text"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : null}

      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-4 text-orange-500">{mainHeading}</h2>
        <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">{mainDescription}</p>

        <div className="patch-tabs-container">
          <div className="patch-tabs-wrapper" aria-label="Patch Customization Options">
            <div className="patch-tabs-heading" role="tablist">
              <button
                id="patch-tab-backing"
                className={`patch-tabs-title ${activeTab === "backing" ? "active" : ""}`}
                aria-selected={activeTab === "backing"}
                role="tab"
                tabIndex={activeTab === "backing" ? 0 : -1}
                aria-controls="patch-content-backing"
                onClick={() => setActiveTab("backing")}
                onKeyDown={(e) => handleKeyDown(e, "backing")}
              >
                Backing Options
                <span className="patch-tabs-icon"></span>
              </button>
              <button
                id="patch-tab-border"
                className={`patch-tabs-title ${activeTab === "border" ? "active" : ""}`}
                aria-selected={activeTab === "border"}
                role="tab"
                tabIndex={activeTab === "border" ? 0 : -1}
                aria-controls="patch-content-border"
                onClick={() => setActiveTab("border")}
                onKeyDown={(e) => handleKeyDown(e, "border")}
              >
                Border Options
                <span className="patch-tabs-icon"></span>
              </button>
              <button
                id="patch-tab-thread"
                className={`patch-tabs-title ${activeTab === "thread" ? "active" : ""}`}
                aria-selected={activeTab === "thread"}
                role="tab"
                tabIndex={activeTab === "thread" ? 0 : -1}
                aria-controls="patch-content-thread"
                onClick={() => setActiveTab("thread")}
                onKeyDown={(e) => handleKeyDown(e, "thread")}
              >
                Thread Color Options
                <span className="patch-tabs-icon"></span>
              </button>
            </div>

            <div className="patch-tabs-content">
              <div
                id="patch-content-backing"
                role="tabpanel"
                aria-labelledby="patch-tab-backing"
                className={`patch-tabs-panel ${activeTab === "backing" ? "active" : ""}`}
              >
                <div className="patch-tabs-grid">
                  {backingOptions.map((option, index) => (
                    <div className="patch-tabs-card" key={index}>
                      <div className="relative w-full aspect-[4/3]">
                        <Image
                          src={option.image || "/placeholder.svg?height=300&width=300"}
                          alt={option.title}
                          fill
                          className="patch-tabs-image object-cover"
                        />
                      </div>
                      <div className="patch-tabs-card-content">
                        <h3 className="patch-tabs-card-title">{option.title}</h3>
                        <p className="patch-tabs-card-description">{option.description}</p>
                        <button className="patch-tabs-quote-btn">{option.buttonText}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                id="patch-content-border"
                role="tabpanel"
                aria-labelledby="patch-tab-border"
                className={`patch-tabs-panel ${activeTab === "border" ? "active" : ""}`}
              >
                <div className="patch-tabs-grid">
                  {borderOptions.map((option, index) => (
                    <div className="patch-tabs-card" key={index}>
                      <div className="relative w-full aspect-[4/3]">
                        <Image
                          src={option.image || "/placeholder.svg?height=300&width=300"}
                          alt={option.title}
                          fill
                          className="patch-tabs-image object-cover"
                        />
                      </div>
                      <div className="patch-tabs-card-content">
                        <h3 className="patch-tabs-card-title">{option.title}</h3>
                        <p className="patch-tabs-card-description">{option.description}</p>
                        <button className="patch-tabs-quote-btn">{option.buttonText}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                id="patch-content-thread"
                role="tabpanel"
                aria-labelledby="patch-tab-thread"
                className={`patch-tabs-panel ${activeTab === "thread" ? "active" : ""}`}
              >
                <div className="patch-tabs-grid">
                  {threadOptions.map((option, index) => (
                    <div className="patch-tabs-card" key={index}>
                      <div className="relative w-full aspect-[4/3]">
                        <Image
                          src={option.image || "/placeholder.svg?height=300&width=300"}
                          alt={option.title}
                          fill
                          className="patch-tabs-image object-cover"
                        />
                      </div>
                      <div className="patch-tabs-card-content">
                        <h3 className="patch-tabs-card-title">{option.title}</h3>
                        <p className="patch-tabs-card-description">{option.description}</p>
                        <button className="patch-tabs-quote-btn">{option.buttonText}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Variables */
        :root {
          --white: #ffffff;
          --gray-50: #f9fafb;
          --gray-100: #f3f4f6;
          --gray-200: #e5e7eb;
          --gray-300: #d1d5db;
          --gray-400: #9ca3af;
          --gray-500: #6b7280;
          --gray-600: #4b5563;
          --gray-700: #374151;
          --gray-800: #1f2937;
          --gray-900: #111827;
          --primary: #fe7224;
          --primary-hover: #e65a0c;
          --primary-light: rgba(254, 114, 36, 0.1);
          --radius: 0.5rem;
          --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        /* Container */
        .patch-tabs-container {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        /* Patch Options */
        .patch-tabs-wrapper {
          background: var(--white);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          overflow: hidden;
          border: 1px solid var(--gray-200);
        }

        /* Enhanced Tabs Heading */
        .patch-tabs-heading {
          display: flex;
          flex-direction: column;
          background: var(--gray-50);
          padding: 1rem;
          gap: 0.75rem;
          position: relative;
          border-bottom: 1px solid var(--gray-200);
        }

        /* Enhanced Tab Title */
        .patch-tabs-title {
          position: relative;
          padding: 1rem 1.5rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--gray-600);
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          text-align: left;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          overflow: hidden;
        }

        .patch-tabs-title::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 3px;
          background-color: var(--primary);
          transform: scaleY(0);
          transition: transform 0.3s ease;
        }

        .patch-tabs-title:hover {
          color: var(--primary);
          background: var(--primary-light);
          border-color: var(--primary);
        }

        .patch-tabs-title[aria-selected="true"] {
          color: var(--primary);
          background: var(--primary-light);
          border-color: var(--primary);
        }

        .patch-tabs-title[aria-selected="true"]::before {
          transform: scaleY(1);
        }

        /* Tab Icon */
        .patch-tabs-icon {
          width: 20px;
          height: 20px;
          position: relative;
          transition: transform 0.3s ease;
        }

        .patch-tabs-icon::before,
        .patch-tabs-icon::after {
          content: '';
          position: absolute;
          background-color: currentColor;
          border-radius: 1px;
          transition: all 0.3s ease;
        }

        .patch-tabs-icon::before {
          width: 2px;
          height: 10px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) scaleY(0);
        }

        .patch-tabs-icon::after {
          width: 10px;
          height: 2px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }

        .patch-tabs-title[aria-selected="true"] .patch-tabs-icon::before {
          transform: translate(-50%, -50%) scaleY(1);
        }

        /* Tabs Content */
        .patch-tabs-content {
          padding: 2rem 1rem;
          background: var(--white);
        }

        /* Tab Content */
        .patch-tabs-panel {
          display: none;
          opacity: 0;
          transform: translateY(10px);
        }

        .patch-tabs-panel.active {
          display: block;
          animation: patchTabsFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes patchTabsFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Options Grid */
        .patch-tabs-grid {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: 1fr;
        }

        /* Option Card */
        .patch-tabs-card {
          background: var(--white);
          border-radius: var(--radius);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: all 0.3s ease;
          border: 1px solid var(--gray-200);
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .patch-tabs-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow);
          border-color: var(--primary);
        }

        /* Option Image */
        .patch-tabs-image {
          width: 100%;
          aspect-ratio: 4/3;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .patch-tabs-card:hover .patch-tabs-image {
          transform: scale(1.05);
        }

        /* Option Content */
        .patch-tabs-card-content {
          padding: 1.5rem;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* Option Title */
        .patch-tabs-card-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--gray-800);
          margin: 0;
        }

        /* Option Description */
        .patch-tabs-card-description {
          color: var(--gray-600);
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0;
        }

        /* Quote Button */
        .patch-tabs-quote-btn {
          margin-top: auto;
          padding: 0.875rem 1.5rem;
          background-color: var(--primary);
          color: white;
          border: none;
          border-radius: var(--radius);
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .patch-tabs-quote-btn:hover {
          background-color: var(--primary-hover);
          transform: translateY(-2px);
        }

        /* Responsive Styles */
        @media (min-width: 640px) {
          .patch-tabs-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 768px) {
          .patch-tabs-heading {
            flex-direction: row;
            padding: 1rem 1.5rem;
            gap: 1rem;
            justify-content: center;
          }

          .patch-tabs-title {
            width: auto;
            min-width: 200px;
            text-align: center;
            justify-content: center;
            padding: 1.25rem 2rem;
          }

          .patch-tabs-title::before {
            width: 100%;
            height: 3px;
            top: auto;
            bottom: 0;
            transform: scaleX(0);
          }

          .patch-tabs-title[aria-selected="true"]::before {
            transform: scaleX(1);
          }

          .patch-tabs-content {
            padding: 3rem 2rem;
          }
        }

        @media (min-width: 1024px) {
          .patch-tabs-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* Focus States */
        .patch-tabs-title:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(254, 114, 36, 0.3);
        }

        .patch-tabs-title:focus:not(:focus-visible) {
          box-shadow: none;
        }

        /* Touch Device Optimizations */
        @media (hover: none) {
          .patch-tabs-title:hover {
            background: var(--white);
            border-color: var(--gray-200);
            color: var(--gray-600);
          }
          
          .patch-tabs-title:active {
            background: var(--primary-light);
            border-color: var(--primary);
            color: var(--primary);
          }

          .patch-tabs-card:hover {
            transform: none;
          }
          
          .patch-tabs-card:active {
            transform: translateY(-2px);
          }
        }
      `}</style>
    </div>
  )
}
