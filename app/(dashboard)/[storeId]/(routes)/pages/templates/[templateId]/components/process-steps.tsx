"use client"

import type React from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import ImageUpload from "@/components/ui/image-upload"

interface ProcessStepsProps {
  isEditing?: boolean
  mainImage: string
  step1Title: string
  step1Content: string
  step2Title: string
  step2Content: string
  step3Title: string
  step3Content: string
  onMainImageChange: (url: string) => void
  onMainImageRemove: () => void
  onStep1TitleChange: (value: string) => void
  onStep1ContentChange: (value: string) => void
  onStep2TitleChange: (value: string) => void
  onStep2ContentChange: (value: string) => void
  onStep3TitleChange: (value: string) => void
  onStep3ContentChange: (value: string) => void
  isUploading: boolean
}

export const ProcessSteps: React.FC<ProcessStepsProps> = ({
  isEditing = false,
  mainImage,
  step1Title,
  step1Content,
  step2Title,
  step2Content,
  step3Title,
  step3Content,
  onMainImageChange,
  onMainImageRemove,
  onStep1TitleChange,
  onStep1ContentChange,
  onStep2TitleChange,
  onStep2ContentChange,
  onStep3TitleChange,
  onStep3ContentChange,
  isUploading,
}) => {
  return (
    <div className="w-full py-16 px-4 bg-white">
      {isEditing ? (
        <div className="space-y-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Process Steps Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="process-image">Main Process Image</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="relative w-40 h-40 overflow-hidden rounded-md border">
                    <Image
                      fill
                      className="object-cover"
                      alt="Process image preview"
                      src={mainImage || "/placeholder.svg?height=300&width=300"}
                    />
                  </div>
                  <div>
                    <ImageUpload
                      value={mainImage ? [mainImage] : []}
                      disabled={isUploading}
                      onChange={(url) => onMainImageChange(url)}
                      onRemove={onMainImageRemove}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="step1-title">Step 1 Title</Label>
                  <Input
                    id="step1-title"
                    value={step1Title}
                    onChange={(e) => onStep1TitleChange(e.target.value)}
                    placeholder="Enter step 1 title"
                  />
                </div>
                <div>
                  <Label htmlFor="step1-content">Step 1 Content</Label>
                  <Textarea
                    id="step1-content"
                    value={step1Content}
                    onChange={(e) => onStep1ContentChange(e.target.value)}
                    placeholder="Enter step 1 content"
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="step2-title">Step 2 Title</Label>
                  <Input
                    id="step2-title"
                    value={step2Title}
                    onChange={(e) => onStep2TitleChange(e.target.value)}
                    placeholder="Enter step 2 title"
                  />
                </div>
                <div>
                  <Label htmlFor="step2-content">Step 2 Content</Label>
                  <Textarea
                    id="step2-content"
                    value={step2Content}
                    onChange={(e) => onStep2ContentChange(e.target.value)}
                    placeholder="Enter step 2 content"
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="step3-title">Step 3 Title</Label>
                  <Input
                    id="step3-title"
                    value={step3Title}
                    onChange={(e) => onStep3TitleChange(e.target.value)}
                    placeholder="Enter step 3 title"
                  />
                </div>
                <div>
                  <Label htmlFor="step3-content">Step 3 Content</Label>
                  <Textarea
                    id="step3-content"
                    value={step3Content}
                    onChange={(e) => onStep3ContentChange(e.target.value)}
                    placeholder="Enter step 3 content"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="lg:w-1/2">
            <div className="space-y-6">
              <article className="process-step">
                <header className="process-header">
                  <h2 className="process-title">{step1Title}</h2>
                  <div className="process-accent"></div>
                  <div className="process-line-accents">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </header>
                <div className="process-content">
                  <div className="process-corner top-left"></div>
                  <div className="process-corner bottom-right"></div>
                  <p className="process-description">{step1Content}</p>
                  <div className="process-divider"></div>
                </div>
              </article>

              <article className="process-step">
                <header className="process-header">
                  <h2 className="process-title">{step2Title}</h2>
                  <div className="process-accent"></div>
                  <div className="process-line-accents">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </header>
                <div className="process-content">
                  <div className="process-corner top-left"></div>
                  <div className="process-corner bottom-right"></div>
                  <p className="process-description">{step2Content}</p>
                  <div className="process-divider"></div>
                </div>
              </article>

              <article className="process-step">
                <header className="process-header">
                  <h2 className="process-title">{step3Title}</h2>
                  <div className="process-accent"></div>
                  <div className="process-line-accents">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </header>
                <div className="process-content">
                  <div className="process-corner top-left"></div>
                  <div className="process-corner bottom-right"></div>
                  <p className="process-description">{step3Content}</p>
                  <div className="process-divider"></div>
                </div>
              </article>
            </div>
          </div>

          <div className="lg:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md">
              <Image
                src={mainImage || "https://d2.fineyst.com/wp-content/uploads/2025/02/Untitled-design-54-430x553.png"}
                alt="Custom patch process"
                width={600}
                height={600}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .process-step {
          position: relative;
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 
              0 20px 40px rgba(222, 114, 36, 0.08),
              0 0 0 1px rgba(222, 114, 36, 0.05);
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }

        .process-step:hover {
          transform: translateY(-5px);
          box-shadow: 
              0 30px 60px rgba(222, 114, 36, 0.12),
              0 0 0 2px rgba(222, 114, 36, 0.1);
        }

        .process-header {
          background: linear-gradient(135deg, #DE7224, #f4a261);
          padding: 1.5rem 2rem;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          height: 80px;
        }

        .process-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, 
              rgba(255, 255, 255, 0.1),
              rgba(255, 255, 255, 0.2)
          );
          transform: skewX(-45deg) translateX(-150%);
          transition: transform 0.6s ease;
        }

        .process-step:hover .process-header::before {
          transform: skewX(-45deg) translateX(150%);
        }

        .process-title {
          color: #fff;
          font-size: 1.75rem;
          font-weight: 800;
          position: relative;
          z-index: 1;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          letter-spacing: -0.02em;
          padding-right: 3rem;
        }

        .process-content {
          padding: 1.5rem 2rem;
          position: relative;
          background: linear-gradient(135deg, 
              rgba(255, 255, 255, 1), 
              rgba(255, 255, 255, 0.95)
          );
        }

        .process-description {
          color: #4a4a4a;
          font-size: 1rem;
          line-height: 1.6;
          position: relative;
          z-index: 1;
        }

        .process-accent {
          position: absolute;
          right: 2rem;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .process-accent::before {
          content: '';
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .process-step:hover .process-accent {
          transform: translateY(-50%) rotate(180deg);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .process-step:hover .process-accent::before {
          border-color: rgba(255, 255, 255, 0.6);
        }

        .process-corner {
          position: absolute;
          width: 40px;
          height: 40px;
        }

        .process-corner::before,
        .process-corner::after {
          content: '';
          position: absolute;
          background: rgba(222, 114, 36, 0.2);
        }

        .process-corner::before {
          width: 2px;
          height: 100%;
        }

        .process-corner::after {
          width: 100%;
          height: 2px;
        }

        .process-corner.top-left {
          top: 20px;
          left: 20px;
        }

        .process-corner.bottom-right {
          bottom: 20px;
          right: 20px;
          transform: rotate(180deg);
        }

        .process-line-accents {
          position: absolute;
          right: 4rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          gap: 3px;
        }

        .process-line-accents span {
          width: 15px;
          height: 2px;
          background: rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }

        .process-step:hover .process-line-accents span {
          background: rgba(255, 255, 255, 0.6);
        }

        .process-step:hover .process-line-accents span:nth-child(2) {
          transform: scaleX(1.5);
        }

        .process-divider {
          width: 40px;
          height: 3px;
          background: linear-gradient(90deg, #DE7224, transparent);
          margin: 1rem 0;
        }

        @media (max-width: 1024px) {
          .process-step {
            margin-bottom: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}
