"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ImagePlus } from "lucide-react"
import ImageUpload from "@/components/ui/image-upload"

interface ProductCard {
  image: string
  title: string
  tagText: string
  features: string[]
  buttonText: string
}

interface QuotationSectionProps {
  isEditing?: boolean
  mainHeading: string
  subHeading: string
  products: ProductCard[]
  onMainHeadingChange: (value: string) => void
  onSubHeadingChange: (value: string) => void
  onProductChange: (index: number, field: keyof ProductCard, value: string | string[]) => void
  onProductImageChange: (index: number, url: string) => void
  onProductImageRemove: (index: number) => void
  isUploading: boolean
}

export const QuotationSection: React.FC<QuotationSectionProps> = ({
  isEditing = false,
  mainHeading,
  subHeading,
  products = [],
  onMainHeadingChange,
  onSubHeadingChange,
  onProductChange,
  onProductImageChange,
  onProductImageRemove,
  isUploading,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    width: "",
    height: "",
    quantity: "",
    category: "",
    backingType: "",
    contactNo: "",
    instructions: "",
  })

  const [autoFlipIndex, setAutoFlipIndex] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Auto-flip cards on mobile
  useEffect(() => {
    if (!isMobile) return

    let currentIndex = 0
    const interval = setInterval(() => {
      setAutoFlipIndex(currentIndex)
      currentIndex = (currentIndex + 1) % (products?.length || 6)
    }, 3000)

    return () => clearInterval(interval)
  }, [isMobile, products?.length])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
    // Reset form
    setFormData({
      name: "",
      email: "",
      width: "",
      height: "",
      quantity: "",
      category: "",
      backingType: "",
      contactNo: "",
      instructions: "",
    })
  }

  // Default products if none provided
  const defaultProducts = [
    {
      image: "https://d2.fineyst.com/wp-content/uploads/2025/02/1731559237846Custom-PVC-Patches.jpg",
      title: "PVC Patches",
      tagText: "FREE QUOTE",
      features: ["Waterproof & Durable", "3D Raised Effect", "Weather Resistant"],
      buttonText: "Get Free Quote",
    },
    {
      image: "https://d2.fineyst.com/wp-content/uploads/2025/02/1731559357727Custom-Embroidered-Patches.jpg",
      title: "Embroidered Patches",
      tagText: "FREE QUOTE",
      features: ["Classic Look", "Premium Stitching", "Lasting Quality"],
      buttonText: "Get Free Quote",
    },
    {
      image: "https://d2.fineyst.com/wp-content/uploads/2025/02/1731559442020Custom-Embroidered-Printed-Patches.jpg",
      title: "Printed Patches",
      tagText: "FREE QUOTE",
      features: ["Full Color Design", "Detailed Artwork", "Quick Production"],
      buttonText: "Get Free Quote",
    },
    {
      image: "https://d2.fineyst.com/wp-content/uploads/2025/02/UmgpwlAWQhuerX7XibS3OA.webp",
      title: "Hook & Loop Patches",
      tagText: "FREE QUOTE",
      features: ["Easy Application", "Military Grade", "Removable Design"],
      buttonText: "Get Free Quote",
    },
    {
      image: "https://d2.fineyst.com/wp-content/uploads/2025/02/Image_Editor-5.png",
      title: "Name Patches",
      tagText: "FREE QUOTE",
      features: ["Personalized Design", "Multiple Styles", "Custom Fonts"],
      buttonText: "Get Free Quote",
    },
    {
      image: "https://d2.fineyst.com/wp-content/uploads/2025/02/eVuRk2-5Q7Kk3lBmpryySg.webp",
      title: "Leather Patches",
      tagText: "FREE QUOTE",
      features: ["Premium Leather", "Vintage Look", "Luxury Feel"],
      buttonText: "Get Free Quote",
    },
  ]

  // Use provided products or default ones
  const displayProducts = products.length > 0 ? products : defaultProducts

  return (
    <div className="w-full py-16 px-4 bg-white">
      {isEditing ? (
        <div className="space-y-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quotation Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="quotation-heading">Main Heading</Label>
                <Input
                  id="quotation-heading"
                  value={mainHeading}
                  onChange={(e) => onMainHeadingChange(e.target.value)}
                  placeholder="Enter main heading"
                />
              </div>
              <div>
                <Label htmlFor="quotation-subheading">Sub Heading</Label>
                <Input
                  id="quotation-subheading"
                  value={subHeading}
                  onChange={(e) => onSubHeadingChange(e.target.value)}
                  placeholder="Enter sub heading"
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {displayProducts.map((product, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>Product {index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <ImagePlus className="h-5 w-5" />
                      <div>
                        <h3 className="text-base font-bold">
                          Product Image <span className="text-red-500">*</span>
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative w-40 h-24 overflow-hidden rounded-md border">
                        <Image
                          fill
                          className="object-cover"
                          alt="Product preview"
                          src={product.image || "/placeholder.svg?height=300&width=300"}
                        />
                      </div>
                      <div>
                        <ImageUpload
                          value={product.image ? [product.image] : []}
                          disabled={isUploading}
                          onChange={(url) => onProductImageChange(index, url)}
                          onRemove={() => onProductImageRemove(index)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`product-${index}-title`}>Title</Label>
                    <Input
                      id={`product-${index}-title`}
                      value={product.title}
                      onChange={(e) => onProductChange(index, "title", e.target.value)}
                      placeholder="Enter product title"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`product-${index}-tag`}>Tag Text</Label>
                    <Input
                      id={`product-${index}-tag`}
                      value={product.tagText}
                      onChange={(e) => onProductChange(index, "tagText", e.target.value)}
                      placeholder="Enter tag text"
                    />
                  </div>

                  <div>
                    <Label>Features (one per line)</Label>
                    <Textarea
                      value={product.features.join("\n")}
                      onChange={(e) => onProductChange(index, "features", e.target.value.split("\n"))}
                      placeholder="Enter features (one per line)"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`product-${index}-button`}>Button Text</Label>
                    <Input
                      id={`product-${index}-button`}
                      value={product.buttonText}
                      onChange={(e) => onProductChange(index, "buttonText", e.target.value)}
                      placeholder="Enter button text"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-orange-500">{mainHeading}</h2>
        <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">{subHeading}</p>

        <div className="flex flex-col xl:flex-row gap-8">
          {/* Left side - Patches Showcase */}
          <div className="w-full xl:w-1/2">
            <div className="patches-showcase">
              <div className="patches-gallery">
                {displayProducts.map((product, index) => (
                  <div key={index} className={`patch-card ${autoFlipIndex === index ? "auto-flip" : ""}`}>
                    <div className="patch-card-inner">
                      <div className="patch-front">
                        <div className="patch-image">
                          <div className="shine-effect"></div>
                          <div className="patch-overlay">
                            <span className="hover-text">View Details</span>
                          </div>
                          <Image
                            src={product.image || "/placeholder.svg?height=300&width=300"}
                            alt={product.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="patch-label">
                          <h3>{product.title}</h3>
                          <span className="quote-tag">{product.tagText}</span>
                        </div>
                      </div>
                      <div className="patch-back">
                        <h4>{product.title}</h4>
                        <ul className="feature-list">
                          {product.features.map((feature, featureIndex) => (
                            <li key={featureIndex}>✓ {feature}</li>
                          ))}
                        </ul>
                        <a href="#" className="quote-button">
                          {product.buttonText}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="w-full xl:w-1/2 bg-gray-100 p-8 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-4">GET QUOTE</h3>
            <p className="text-sm text-gray-600 mb-6">
              We require few things to get begin on your order for custom patches.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder=""
                    required
                    className="mt-1 bg-white border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder=""
                    required
                    className="mt-1 bg-white border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="width" className="text-sm">
                    Width
                  </Label>
                  <Input
                    id="width"
                    value={formData.width}
                    onChange={(e) => handleChange("width", e.target.value)}
                    placeholder="Width"
                    className="mt-1 bg-white border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <Label htmlFor="height" className="text-sm">
                    Height
                  </Label>
                  <Input
                    id="height"
                    value={formData.height}
                    onChange={(e) => handleChange("height", e.target.value)}
                    placeholder="Height"
                    className="mt-1 bg-white border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <Label htmlFor="quantity" className="text-sm">
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    value={formData.quantity}
                    onChange={(e) => handleChange("quantity", e.target.value)}
                    placeholder="Quantity"
                    className="mt-1 bg-white border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-sm">
                    Select Category
                  </Label>
                  <div className="relative mt-1">
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleChange("category", e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm"
                    >
                      <option value="">Select Category</option>
                      <option value="pvc">PVC Patches</option>
                      <option value="embroidered">Embroidered Patches</option>
                      <option value="printed">Printed Patches</option>
                      <option value="hook-loop">Hook & Loop Patches</option>
                      <option value="name">Name Patches</option>
                      <option value="leather">Leather Patches</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="backing" className="text-sm">
                    Select Backing Type
                  </Label>
                  <div className="relative mt-1">
                    <select
                      id="backing"
                      value={formData.backingType}
                      onChange={(e) => handleChange("backingType", e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm"
                    >
                      <option value="">Select Backing Type</option>
                      <option value="no-backing">No Backing</option>
                      <option value="velcro-hook">Velcro Hook</option>
                      <option value="plastic">Plastic</option>
                      <option value="iron-on">Iron On</option>
                      <option value="adhesive">Adhesive</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact" className="text-sm">
                    Contact No.
                  </Label>
                  <Input
                    id="contact"
                    value={formData.contactNo}
                    onChange={(e) => handleChange("contactNo", e.target.value)}
                    placeholder=""
                    className="mt-1 bg-white border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <Label htmlFor="file" className="text-sm">
                    Upload Design
                  </Label>
                  <div className="mt-1 flex items-center">
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer bg-white border border-gray-300 rounded-md py-2 px-3 flex items-center justify-center text-sm text-gray-700 hover:bg-gray-50 w-full"
                    >
                      <span>Choose File</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="instructions" className="text-sm">
                  Instructions
                </Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => handleChange("instructions", e.target.value)}
                  placeholder=""
                  rows={4}
                  className="mt-1 bg-white border border-gray-300 rounded-md"
                />
              </div>

              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 py-2">
                SUBMIT
              </Button>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        :root {
          --primary: #fe7224;
          --card: #ffffff;
          --text: #334155;
          --shadow-sm: 0 4px 6px -1px rgba(254, 114, 36, 0.1);
          --shadow-md: 0 20px 25px -5px rgba(254, 114, 36, 0.1);
          --shadow-lg: 0 25px 50px -12px rgba(254, 114, 36, 0.25);
        }

        .patches-showcase {
          width: 100%;
          max-width: 100%;
          height: auto;
          min-height: 500px;
          background: #ffffff;
          border-radius: 30px;
          padding: 20px;
          position: relative;
          box-shadow: var(--shadow-md);
          margin: 0 auto;
        }

        .patches-gallery {
          display: grid;
          grid-template-columns: 1fr;
          gap: 15px;
          height: 100%;
        }

        .patch-card {
          position: relative;
          width: 100%;
          height: 300px;
          cursor: pointer;
          margin-bottom: 15px;
          animation: fadeInUp 0.5s ease forwards;
        }

        .patch-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 1s ease;
          transform-style: preserve-3d;
        }

        .patch-card:hover .patch-card-inner,
        .patch-card:focus .patch-card-inner {
          transform: rotateY(180deg);
        }

        .patch-front,
        .patch-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: 20px;
          overflow: hidden;
        }

        .patch-front {
          background: var(--card);
          box-shadow: var(--shadow-sm);
        }

        .patch-back {
          background: #ffffff;
          transform: rotateY(180deg);
          padding: 15px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          border: 2px solid var(--primary);
        }

        .patch-image {
          position: relative;
          width: 100%;
          height: 70%;
          overflow: hidden;
        }

        .patch-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(254, 114, 36, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
        }

        .patch-card:hover .patch-overlay,
        .patch-card:focus .patch-overlay {
          opacity: 1;
        }

        .hover-text {
          color: white;
          font-size: 14px;
          font-weight: 600;
        }

        .patch-label {
          padding: 12px;
          text-align: center;
        }

        .patch-label h3 {
          color: var(--text);
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 8px 0;
        }

        .quote-tag {
          display: inline-block;
          padding: 4px 12px;
          background: var(--primary);
          color: white;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }

        .feature-list {
          list-style: none;
          padding: 0;
          margin: 15px 0;
          text-align: left;
        }

        .feature-list li {
          margin: 8px 0;
          font-size: 13px;
          color: var(--text);
        }

        .quote-button {
          background: var(--primary);
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          text-decoration: none;
          font-weight: 500;
          font-size: 13px;
          transition: all 0.3s ease;
          box-shadow: var(--shadow-sm);
        }

        .quote-button:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
          background: #ff8541;
        }

        .shine-effect {
          position: absolute;
          top: -100%;
          left: -100%;
          width: 300%;
          height: 300%;
          background: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.1) 45%,
            rgba(255, 255, 255, 0.5) 50%,
            rgba(255, 255, 255, 0.1) 55%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shine 3s infinite;
          pointer-events: none;
          z-index: 1;
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          80%,
          100% {
            transform: translateX(100%) translateY(100%) rotate(45deg);
          }
        }

        /* Back side content */
        .patch-back h4 {
          color: var(--primary);
          font-size: 16px;
          margin: 0 0 15px 0;
        }

        /* Animation keyframes */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Apply animations to cards */
        .patch-card:nth-child(1) {
          animation-delay: 0.1s;
        }
        .patch-card:nth-child(2) {
          animation-delay: 0.2s;
        }
        .patch-card:nth-child(3) {
          animation-delay: 0.3s;
        }
        .patch-card:nth-child(4) {
          animation-delay: 0.4s;
        }
        .patch-card:nth-child(5) {
          animation-delay: 0.5s;
        }
        .patch-card:nth-child(6) {
          animation-delay: 0.6s;
        }

        /* Touch device support */
        @media (hover: none) {
          .patch-overlay {
            opacity: 0.5;
          }

          .patch-card:active .patch-card-inner {
            transform: rotateY(180deg);
          }
        }

        /* Tablet styles */
        @media screen and (min-width: 768px) {
          .patches-gallery {
            grid-template-columns: repeat(2, 1fr);
          }

          .patch-card {
            height: 280px;
          }

          .patch-back {
            padding: 15px;
          }

          .feature-list li {
            font-size: 12px;
          }
        }

        /* Desktop styles - keep original design */
        @media screen and (min-width: 1024px) {
          .patches-showcase {
            width: 100%;
            max-width: 100%;
            height: auto;
          }

          .patches-gallery {
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(2, 1fr);
          }

          .patch-card {
            height: 250px;
            margin-bottom: 0;
          }

          .patch-back {
            padding: 15px;
          }

          .feature-list li {
            font-size: 12px;
          }
        }

        /* Extra large screens */
        @media screen and (min-width: 1280px) {
          .patches-showcase {
            max-width: 100%;
          }
          
          .patch-card {
            height: 280px;
          }
        }

        /* Add this to your existing CSS */
        @media screen and (max-width: 767px) {
          .patch-card.auto-flip .patch-card-inner {
            transform: rotateY(180deg);
          }
          
          /* Disable hover/touch flip on mobile since we're using auto-flip */
          .patch-card:hover .patch-card-inner,
          .patch-card:active .patch-card-inner {
            transform: none;
          }
        }
      `}</style>
    </div>
  )
}
