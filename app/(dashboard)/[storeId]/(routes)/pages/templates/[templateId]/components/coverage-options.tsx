"use client"

import type React from "react"
import Image from "next/image"

interface CoverageOptionsProps {
  isEditing?: boolean
  mainHeading?: string
  options?: any[]
  onMainHeadingChange?: (value: string) => void
  onOptionChange?: (index: number, field: string, value: string) => void
  onOptionImageChange?: (index: number, url: string) => void
  onOptionImageRemove?: (index: number) => void
  isUploading?: boolean

  option1Image?: string
  option2Image?: string
  option3Image?: string
  onOption1ImageChange?: (url: string) => void
  onOption2ImageChange?: (url: string) => void
  onOption3ImageChange?: (url: string) => void
  onOption1ImageRemove?: () => void
  onOption2ImageRemove?: () => void
  onOption3ImageRemove?: () => void
}

export const CoverageOptions: React.FC<CoverageOptionsProps> = ({
  isEditing = false,
  mainHeading = "Create A Fully Customizable Product",
  options = [
    {
      image: "/placeholder.svg?height=300&width=300",
      percentage: "50% coverage area",
      description: "With 50% thread coverage, this option is best for text-only designs.",
      buttonText: "FREE QUOTE",
    },
    {
      image: "/placeholder.svg?height=300&width=300",
      percentage: "75% coverage area",
      description: "Our most popular option, choose 75% thread coverage for contrasting texture",
      buttonText: "FREE QUOTE",
    },
    {
      image: "/placeholder.svg?height=300&width=300",
      percentage: "100% coverage area",
      description: "Choose 100% thread coverage if you're looking for the closest color match to your design.",
      buttonText: "FREE QUOTE",
    },
  ],
  onMainHeadingChange = () => { },
  onOptionChange = () => { },
}) => {
  return (
    <>
      <section className="coverage-section">
        <div className="coverage-container">
          {mainHeading && (
            <div className="text-center mb-12">
              {isEditing ? (
                <input
                  type="text"
                  value={mainHeading}
                  onChange={(e) => onMainHeadingChange(e.target.value)}
                  className="text-3xl font-bold text-center w-full mb-4 p-2 border rounded"
                />
              ) : (
                <h2 className="text-3xl font-bold mb-4">{mainHeading}</h2>
              )}
            </div>
          )}

          <div className="coverage-grid">
            <div className="coverage-card">
              <div className="coverage-image-wrapper">
                <Image
                  src={options[0].image || "/placeholder.svg?height=300&width=300"}
                  alt="50% coverage area example"
                  width={300}
                  height={300}
                  className="coverage-image"
                />
              </div>
              <div className="coverage-content">
                <h3 className="coverage-percentage">
                  {isEditing ? (
                    <input
                      type="text"
                      value={options[0].percentage}
                      onChange={(e) => onOptionChange(0, "percentage", e.target.value)}
                      className="w-full text-center p-1 border rounded"
                    />
                  ) : (
                    options[0].percentage
                  )}
                </h3>
                <p className="coverage-description">
                  {isEditing ? (
                    <textarea
                      value={options[0].description}
                      onChange={(e) => onOptionChange(0, "description", e.target.value)}
                      className="w-full h-24 p-2 border rounded"
                    />
                  ) : (
                    options[0].description
                  )}
                </p>
                <button className="quote-button">
                  {isEditing ? (
                    <input
                      type="text"
                      value={options[0].buttonText}
                      onChange={(e) => onOptionChange(0, "buttonText", e.target.value)}
                      className="w-full text-center p-1 border rounded bg-white text-black"
                    />
                  ) : (
                    options[0].buttonText
                  )}
                </button>
              </div>
            </div>

            <div className="coverage-card">
              <div className="coverage-image-wrapper">
                <Image
                  src={options[1].image || "/placeholder.svg?height=300&width=300"}
                  alt="75% coverage area example"
                  width={300}
                  height={300}
                  className="coverage-image"
                />
              </div>
              <div className="coverage-content">
                <h3 className="coverage-percentage">
                  {isEditing ? (
                    <input
                      type="text"
                      value={options[1].percentage}
                      onChange={(e) => onOptionChange(1, "percentage", e.target.value)}
                      className="w-full text-center p-1 border rounded"
                    />
                  ) : (
                    options[1].percentage
                  )}
                </h3>
                <p className="coverage-description">
                  {isEditing ? (
                    <textarea
                      value={options[1].description}
                      onChange={(e) => onOptionChange(1, "description", e.target.value)}
                      className="w-full h-24 p-2 border rounded"
                    />
                  ) : (
                    options[1].description
                  )}
                </p>
                <button className="quote-button">
                  {isEditing ? (
                    <input
                      type="text"
                      value={options[1].buttonText}
                      onChange={(e) => onOptionChange(1, "buttonText", e.target.value)}
                      className="w-full text-center p-1 border rounded bg-white text-black"
                    />
                  ) : (
                    options[1].buttonText
                  )}
                </button>
              </div>
            </div>

            <div className="coverage-card">
              <div className="coverage-image-wrapper">
                <Image
                  src={options[2].image || "/placeholder.svg?height=300&width=300"}
                  alt="100% coverage area example"
                  width={300}
                  height={300}
                  className="coverage-image"
                />
              </div>
              <div className="coverage-content">
                <h3 className="coverage-percentage">
                  {isEditing ? (
                    <input
                      type="text"
                      value={options[2].percentage}
                      onChange={(e) => onOptionChange(2, "percentage", e.target.value)}
                      className="w-full text-center p-1 border rounded"
                    />
                  ) : (
                    options[2].percentage
                  )}
                </h3>
                <p className="coverage-description">
                  {isEditing ? (
                    <textarea
                      value={options[2].description}
                      onChange={(e) => onOptionChange(2, "description", e.target.value)}
                      className="w-full h-24 p-2 border rounded"
                    />
                  ) : (
                    options[2].description
                  )}
                </p>
                <button className="quote-button">
                  {isEditing ? (
                    <input
                      type="text"
                      value={options[2].buttonText}
                      onChange={(e) => onOptionChange(2, "buttonText", e.target.value)}
                      className="w-full text-center p-1 border rounded bg-white text-black"
                    />
                  ) : (
                    options[2].buttonText
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .coverage-section {
            padding: 2rem;
            background: #ffffff;
        }

        .coverage-container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .coverage-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
        }

        @media (min-width: 768px) {
            .coverage-section {
                padding: 4rem 2rem;
            }
            
            .coverage-grid {
                grid-template-columns: repeat(3, 1fr);
                gap: 2.5rem;
            }
        }

        .coverage-card {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: column;
            border: 1px solid #f0f0f0;
            position: relative;
        }

        .coverage-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
                        0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border-color: #fe7224;
        }

        .coverage-image-wrapper {
            position: relative;
            padding-bottom: 100%;
            background: #f8f9fa;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .coverage-image {
            position: absolute;
            width: 85%;
            height: 85%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            object-fit: contain;
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .coverage-card:hover .coverage-image {
            width: 90%;
            height: 90%;
        }

        .coverage-content {
            padding: 2rem;
            text-align: center;
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
            background: linear-gradient(to bottom, #ffffff, #fcfcfc);
        }

        .coverage-percentage {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
            position: relative;
            padding-bottom: 1rem;
            margin: 0;
        }

        .coverage-percentage::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 40px;
            height: 3px;
            background-color: #fe7224;
            border-radius: 2px;
            transition: width 0.3s ease;
        }

        .coverage-card:hover .coverage-percentage::after {
            width: 60px;
        }

        .coverage-description {
            color: #4b5563;
            line-height: 1.6;
            font-size: 0.95rem;
            margin: 0;
            flex-grow: 1;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .quote-button {
            display: inline-block;
            background-color: #fe7224;
            color: white;
            padding: 1rem 2rem;
            border-radius: 12px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            font-size: 0.95rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            position: relative;
            overflow: hidden;
        }

        .quote-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent);
            transform: translateX(-100%);
            transition: transform 0.6s ease;
        }

        .coverage-card:hover .quote-button {
            background-color: #e65a0c;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(254, 114, 36, 0.25);
        }

        .coverage-card:hover .quote-button::before {
            transform: translateX(100%);
        }

        /* Responsive adjustments */
        @media (max-width: 767px) {
            .coverage-section {
                padding: 1.5rem;
            }
            
            .coverage-content {
                padding: 1.5rem;
            }
            
            .coverage-percentage {
                font-size: 1.25rem;
            }
            
            .quote-button {
                padding: 0.875rem 1.75rem;
                font-size: 0.875rem;
            }
        }

        /* Touch device optimizations */
        @media (hover: none) {
            .coverage-card:hover {
                transform: none;
            }
            
            .coverage-card:active {
                transform: translateY(-4px);
            }
        }
      `}</style>
    </>
  )
}

