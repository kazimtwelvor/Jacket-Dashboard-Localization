"use client"
import type React from "react"
import { useState, useRef } from "react"
import {
  Heading,
  Type,
  ImageIcon,
  Layout,
  ShoppingCart,
  Tag,
  Grid,
  Star,
  Palette,
  Settings2,
  X,
  Plus,
  MoveHorizontal,
  DollarSign,
  Save,
  Newspaper,
  Calendar,
  User,
  MessageSquare,
  Heart,
  Eye,
  Clock,
  Mail,
  MapPin,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Menu,
  Filter,
  SlidersHorizontal,
  ArrowLeft,
  ExternalLink,
  ListOrdered,
  Shield,
  Quote,
  HelpCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"

import { HeroBanner } from "../../templates/[templateId]/components/hero-banner"
import { ProcessSteps } from "../../templates/[templateId]/components/process-steps"
import { TwoColumnContent } from "../../templates/[templateId]/components/two-column-content"
import { SatisfactionBanner } from "../../templates/[templateId]/components/satisfaction-banner"
import { ProductOptionsTabs } from "../../templates/[templateId]/components/product-options-tabs"

import { CoverageOptions } from "../../templates/[templateId]/components/coverage-options"
import { QuotationSection } from "../../templates/[templateId]/components/quotation-section"
import { FAQSection } from "../../templates/[templateId]/components/faq-section"

type ElementType = {
  id: string
  type:
    | "heading"
    | "text"
    | "image"
    | "product-card"
    | "product-grid"
    | "cart"
    | "hero"
    | "container"
    | "blog-post"
    | "blog-grid"
    | "newsletter"
    | "testimonial"
    | "features"
    | "faq"
    | "contact"
    | "social-proof"
    | "category-grid"
    | "mega-menu"
    | "footer"
    | "search-bar"
    | "filter-sidebar"
    | "hero-banner"
    | "process-steps"
    | "two-column-content"
    | "satisfaction-banner"
    | "product-options-tabs"
    | "coverage-options"
    | "quotation-section"
    | "faq-section"
  content: string
  children?: ElementType[]
  styles?: {
    [key: string]: string
  }
  productData?: {
    price?: string
    rating?: number
    sale?: boolean
    salePrice?: string
    category?: string
    stock?: number
    variants?: string[]
  }
  blogData?: {
    author?: string
    date?: string
    category?: string
    readTime?: string
    comments?: number
    likes?: number
    views?: number
    tags?: string[]
  }
  settings?: {
    columns?: number
    gap?: string
    layout?: "grid" | "list" | "masonry"
    animation?: "fade" | "slide" | "zoom"
    responsive?: {
      mobile?: boolean
      tablet?: boolean
      desktop?: boolean
    }
  }
  heroBannerData?: {
    bannerImage: string[]
    title: string
    subtitle: string
    description: string
  }
  processStepsData?: {
    mainImage: string
    step1Title: string
    step1Content: string
    step2Title: string
    step2Content: string
    step3Title: string
    step3Content: string
  }
  twoColumnData?: {
    mainHeading: string
    leftColumnTitle: string
    leftColumnContent: string
    leftColumnSecondTitle: string
    leftColumnSecondContent: string
    rightColumnTitle: string
    rightColumnContent: string
    rightColumnSecondTitle: string
    rightColumnSecondContent: string
  }
  satisfactionBannerData?: {
    heading: string
    highlightedText: string
    endText: string
    subtext: string
    emailLabel: string
    emailValue: string
    phoneLabel: string
    phoneValue: string
  }
  productOptionsData?: {
    mainHeading: string
    mainDescription: string
    backingOptions: Array<{
      image: string
      title: string
      description: string
      buttonText: string
    }>
    borderOptions: Array<{
      image: string
      title: string
      description: string
      buttonText: string
    }>
    threadOptions: Array<{
      image: string
      title: string
      description: string
      buttonText: string
    }>
  }
  coverageOptionsData?: {
    mainHeading: string
    options: Array<{
      image: string
      percentage: string
      description: string
      buttonText: string
    }>
  }
  quotationSectionData?: {
    mainHeading: string
    subHeading: string
    products: Array<{
      image: string
      title: string
      tagText: string
      features: string[]
      buttonText: string
    }>
  }
  faqSectionData?: {
    heading: string
    description: string
    faqs: Array<{
      id: string
      icon: string
      question: string
      answer: string
    }>
  }
}

interface PageBuilderProps {
  onClose: () => void
  onSave: (elements: ElementType[]) => void
  onPublish?: (elements: ElementType[]) => void
  initialContent?: ElementType[]
}

export const PageBuilder: React.FC<PageBuilderProps> = ({ onClose, onSave, onPublish, initialContent = [] }) => {
  const params = useParams()
  const [elements, setElements] = useState<ElementType[]>(initialContent)
  const [selectedElement, setSelectedElement] = useState<ElementType | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [history, setHistory] = useState<ElementType[][]>([initialContent])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const dragItem = useRef<any>(null)
  const dragNode = useRef<any>(null)

  const components = [
    {
      category: "Basic",
      items: [
        { type: "heading", icon: <Heading size={24} />, label: "Heading" },
        { type: "text", icon: <Type size={24} />, label: "Text Block" },
        { type: "image", icon: <ImageIcon size={24} />, label: "Image" },
        { type: "container", icon: <Layout size={24} />, label: "Container" },
      ],
    },
    {
      category: "E-commerce",
      items: [
        { type: "product-card", icon: <Tag size={24} />, label: "Product Card" },
        { type: "product-grid", icon: <Grid size={24} />, label: "Product Grid" },
        { type: "cart", icon: <ShoppingCart size={24} />, label: "Cart Section" },
        { type: "category-grid", icon: <Filter size={24} />, label: "Category Grid" },
        { type: "filter-sidebar", icon: <SlidersHorizontal size={24} />, label: "Filter Sidebar" },
      ],
    },
    {
      category: "Blog",
      items: [
        { type: "blog-post", icon: <Newspaper size={24} />, label: "Blog Post" },
        { type: "blog-grid", icon: <Grid size={24} />, label: "Blog Grid" },
      ],
    },
    {
      category: "Marketing",
      items: [
        { type: "hero", icon: <Palette size={24} />, label: "Hero Section" },
        { type: "newsletter", icon: <Mail size={24} />, label: "Newsletter" },
        { type: "testimonial", icon: <MessageSquare size={24} />, label: "Testimonial" },
        { type: "social-proof", icon: <Star size={24} />, label: "Social Proof" },
      ],
    },
    {
      category: "Layout",
      items: [
        { type: "mega-menu", icon: <Menu size={24} />, label: "Mega Menu" },
        { type: "footer", icon: <Layout size={24} />, label: "Footer" },
        { type: "features", icon: <Grid size={24} />, label: "Features Grid" },
        { type: "faq", icon: <MessageSquare size={24} />, label: "FAQ Section" },
        { type: "contact", icon: <Phone size={24} />, label: "Contact Section" },
      ],
    },
    {
      category: "Custom Templates",
      items: [
        { type: "hero-banner", icon: <ImageIcon size={24} />, label: "Hero Banner" },
        { type: "process-steps", icon: <ListOrdered size={24} />, label: "Process Steps" },
        { type: "two-column-content", icon: <Layout size={24} />, label: "Two Column Content" },
        { type: "satisfaction-banner", icon: <Star size={24} />, label: "Satisfaction Banner" },
        { type: "product-options-tabs", icon: <Palette size={24} />, label: "Product Options Tabs" },
        { type: "coverage-options", icon: <Shield size={24} />, label: "Coverage Options" },
        { type: "quotation-section", icon: <Quote size={24} />, label: "Quotation Section" },
        { type: "faq-section", icon: <HelpCircle size={24} />, label: "FAQ Section" },
      ],
    },
  ]

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const addToHistory = (newElements: ElementType[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    setHistory([...newHistory, newElements])
    setHistoryIndex(historyIndex + 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setElements(history[historyIndex - 1])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setElements(history[historyIndex + 1])
    }
  }

  const handlePreview = () => {
    const previewUrl = `/preview/${params?.storeId}/pages/preview?content=${encodeURIComponent(JSON.stringify(elements))}`
    window.open(previewUrl, "_blank")
  }

  const getDefaultContent = (type: string) => {
    switch (type) {
      case "heading":
        return "New Heading"
      case "text":
        return "New Text Block"
      case "image":
        return "https://source.unsplash.com/random/800x400"
      case "product-card":
        return "Premium Product"
      case "product-grid":
        return "Featured Products"
      case "cart":
        return "Shopping Cart"
      case "hero":
        return "Welcome to Our Store"
      case "blog-post":
        return "Blog Post Title"
      case "blog-grid":
        return "Latest Articles"
      case "newsletter":
        return "Subscribe to Our Newsletter"
      case "testimonial":
        return "Customer Testimonial"
      case "features":
        return "Our Features"
      case "faq":
        return "Frequently Asked Questions"
      case "contact":
        return "Contact Us"
      case "container":
        return ""
      case "hero-banner":
        return "Custom Hero Banner"
      case "process-steps":
        return "Our Process"
      case "two-column-content":
        return "Two Column Content"
      case "satisfaction-banner":
        return "Customer Satisfaction"
      case "product-options-tabs":
        return "Product Options"
      case "coverage-options":
        return "Coverage Options"
      case "quotation-section":
        return "Client Testimonials"
      case "faq-section":
        return "Frequently Asked Questions"
      default:
        return ""
    }
  }

  const getDefaultHeroBannerData = () => ({
    bannerImage: [],
    title: "Welcome to Our Store",
    subtitle: "Premium Quality Products",
    description: "Discover our amazing collection of products at affordable prices.",
  })

  const getDefaultProcessStepsData = () => ({
    mainImage: "",
    step1Title: "Step 1: Design",
    step1Content: "Create your custom design with our easy-to-use tools.",
    step2Title: "Step 2: Review",
    step2Content: "Review your design and make any necessary adjustments.",
    step3Title: "Step 3: Order",
    step3Content: "Place your order and we'll handle the rest.",
  })

  const getDefaultTwoColumnData = () => ({
    mainHeading: "About Our Products",
    leftColumnTitle: "Quality Materials",
    leftColumnContent: "We use only the highest quality materials in all our products.",
    leftColumnSecondTitle: "Sustainable Practices",
    leftColumnSecondContent: "Our manufacturing process is environmentally friendly and sustainable.",
    rightColumnTitle: "Expert Craftsmanship",
    rightColumnContent: "Each product is crafted by skilled artisans with years of experience.",
    rightColumnSecondTitle: "Attention to Detail",
    rightColumnSecondContent: "We pay close attention to every detail to ensure perfection.",
  })

  const getDefaultSatisfactionBannerData = () => ({
    heading: "We guarantee ",
    highlightedText: "100% satisfaction",
    endText: "with every purchase",
    subtext: "If you're not completely satisfied, we'll make it right or refund your money.",
    emailLabel: "Email Us",
    emailValue: "support@example.com",
    phoneLabel: "Call Us",
    phoneValue: "1-800-123-4567",
  })

  const getDefaultProductOptionsData = () => ({
    mainHeading: "Product Options",
    mainDescription: "Choose from our wide range of customization options",
    backingOptions: [
      {
        image: "",
        title: "Standard Backing",
        description: "Our standard backing option is perfect for most applications.",
        buttonText: "Select Option",
      },
      {
        image: "",
        title: "Premium Backing",
        description: "Upgrade to our premium backing for added durability.",
        buttonText: "Select Option",
      },
    ],
    borderOptions: [
      {
        image: "",
        title: "Classic Border",
        description: "A timeless border design that complements any style.",
        buttonText: "Select Option",
      },
      {
        image: "",
        title: "Modern Border",
        description: "A contemporary border design for a sleek look.",
        buttonText: "Select Option",
      },
    ],
    threadOptions: [
      {
        image: "",
        title: "Standard Thread",
        description: "Our standard thread option available in multiple colors.",
        buttonText: "Select Option",
      },
      {
        image: "",
        title: "Metallic Thread",
        description: "Add a touch of elegance with our metallic thread option.",
        buttonText: "Select Option",
      },
    ],
  })

  const getDefaultCoverageOptionsData = () => ({
    mainHeading: "Coverage Options",
    options: [
      {
        image: "",
        percentage: "50% Coverage",
        description: "Basic protection for essential needs with affordable premiums.",
        buttonText: "Select Plan",
      },
      {
        image: "",
        percentage: "75% Coverage",
        description: "Enhanced protection with additional benefits for comprehensive coverage.",
        buttonText: "Select Plan",
      },
      {
        image: "",
        percentage: "100% Coverage",
        description: "Complete protection with all benefits included for total peace of mind.",
        buttonText: "Select Plan",
      },
    ],
  })

  const getDefaultQuotationSectionData = () => ({
    mainHeading: "Custom Patches",
    subHeading: "Get your custom patches with our premium quality materials and craftsmanship",
    products: [
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
    ],
  })

  const getDefaultFAQSectionData = () => ({
    heading: "Frequently Asked Questions",
    description: "Find answers to common questions about our products and services",
    faqs: [
      {
        id: "faq1",
        icon: "❓",
        question: "How do I place an order?",
        answer:
          "You can place an order through our website by selecting the product you want and clicking the 'Add to Cart' button. Then follow the checkout process.",
      },
      {
        id: "faq2",
        icon: "💳",
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, PayPal, and bank transfers. All payments are securely processed.",
      },
      {
        id: "faq3",
        icon: "🚚",
        question: "How long does shipping take?",
        answer:
          "Shipping typically takes 3-5 business days for domestic orders and 7-14 business days for international orders.",
      },
    ],
  })

  const getDefaultBlogData = () => ({
    author: "John Doe",
    date: new Date().toLocaleDateString(),
    category: "General",
    readTime: "5 min",
    comments: 0,
    likes: 0,
    views: 0,
    tags: ["news", "updates"],
  })

  const getDefaultProductData = (type: string) => {
    if (type === "product-card") {
      return {
        price: "99.99",
        rating: 4.5,
        sale: false,
        salePrice: "",
        category: "General",
        stock: 100,
        variants: ["Small", "Medium", "Large"],
      }
    }
    return undefined
  }

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("type", type)
    setIsDragging(true)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const type = e.dataTransfer.getData("type") as ElementType["type"]
    const newElement: ElementType = {
      id: generateId(),
      type,
      content: getDefaultContent(type),
      children: type === "container" || type === "product-grid" || type === "blog-grid" ? [] : undefined,
      styles: {},
      productData: getDefaultProductData(type),
      blogData: type === "blog-post" ? getDefaultBlogData() : undefined,
      settings: {
        columns: 3,
        gap: "1rem",
        layout: "grid",
        animation: "fade",
        responsive: {
          mobile: true,
          tablet: true,
          desktop: true,
        },
      },
    }

    if (type === "hero-banner") {
      newElement.heroBannerData = getDefaultHeroBannerData()
    } else if (type === "process-steps") {
      newElement.processStepsData = getDefaultProcessStepsData()
    } else if (type === "two-column-content") {
      newElement.twoColumnData = getDefaultTwoColumnData()
    } else if (type === "satisfaction-banner") {
      newElement.satisfactionBannerData = getDefaultSatisfactionBannerData()
    } else if (type === "product-options-tabs") {
      newElement.productOptionsData = getDefaultProductOptionsData()
    } else if (type === "coverage-options") {
      newElement.coverageOptionsData = getDefaultCoverageOptionsData()
    } else if (type === "quotation-section") {
      newElement.quotationSectionData = getDefaultQuotationSectionData()
    } else if (type === "faq-section") {
      newElement.faqSectionData = getDefaultFAQSectionData()
    }

    const newElements = [...elements, newElement]
    setElements(newElements)
    addToHistory(newElements)
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleElementClick = (element: ElementType) => {
    setSelectedElement(element)
  }

  const updateElement = (id: string, updates: Partial<ElementType>) => {
    const newElements = elements.map((el) => (el.id === id ? { ...el, ...updates } : el))
    setElements(newElements)
    addToHistory(newElements)
    if (selectedElement?.id === id) {
      setSelectedElement((prev) => (prev ? { ...prev, ...updates } : prev))
    }
  }

  const deleteElement = (id: string) => {
    const newElements = elements.filter((el) => el.id !== id)
    setElements(newElements)
    addToHistory(newElements)
    setSelectedElement(null)
  }

  const renderBlogPost = (element: ElementType) => {
    const { blogData } = element
    return (
      <article className="bg-white rounded-lg shadow-lg overflow-hidden">
        <img
          src="https://source.unsplash.com/random/800x400/?blog"
          alt={`Blog post image for ${element.content}`}
          className="w-full h-48 object-cover"
        />
        <div className="p-6">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <User size={16} className="mr-2" />
            <span>{blogData?.author}</span>
            <Calendar size={16} className="ml-4 mr-2" />
            <span>{blogData?.date}</span>
            <Clock size={16} className="ml-4 mr-2" />
            <span>{blogData?.readTime}</span>
          </div>
          <h2 className="text-xl font-bold mb-2">{element.content}</h2>
          <p className="text-gray-600 mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Heart size={16} className="mr-1" />
                {blogData?.likes}
              </span>
              <span className="flex items-center">
                <MessageSquare size={16} className="mr-1" />
                {blogData?.comments}
              </span>
              <span className="flex items-center">
                <Eye size={16} className="mr-1" />
                {blogData?.views}
              </span>
            </div>
          </div>
        </div>
      </article>
    )
  }

  const renderProductCard = (element: ElementType) => {
    const { productData } = element
    return (
      <div className="relative group overflow-hidden rounded-lg shadow-lg bg-white">
        <div className="aspect-w-1 aspect-h-1">
          <img
            src="https://source.unsplash.com/random/400x400/?product"
            alt={`Product image for ${element.content}`}
            className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-200"
          />
        </div>
        {productData?.sale && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md">SALE</div>
        )}
        <div className="p-4">
          <div className="text-sm text-gray-500 mb-1">{productData?.category}</div>
          <h3 className="text-lg font-semibold">{element.content}</h3>
          <div className="flex items-center mt-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill={i < (productData?.rating || 0) ? "currentColor" : "none"} />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">{productData?.rating} / 5</span>
          </div>
          <div className="mt-2 flex items-center">
            {productData?.sale ? (
              <>
                <span className="text-gray-400 line-through">${productData.price}</span>
                <span className="ml-2 text-red-500 font-bold">${productData.salePrice}</span>
              </>
            ) : (
              <span className="text-gray-900 font-bold">${productData?.price}</span>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {productData?.stock && productData.stock > 0 ? (
              <span className="text-green-500">{productData.stock} in stock</span>
            ) : (
              <span className="text-red-500">Out of stock</span>
            )}
          </div>
          {productData?.variants && (
            <div className="mt-2 flex gap-2">
              {productData.variants.map((variant, index) => (
                <button key={index} className="px-2 py-1 text-sm border rounded hover:bg-gray-100">
                  {variant}
                </button>
              ))}
            </div>
          )}
          <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
            Add to Cart
          </button>
        </div>
      </div>
    )
  }

  const renderElement = (element: ElementType) => {
    const baseStyles = {
      ...element.styles,
      cursor: "pointer",
      position: "relative" as const,
      padding: "8px",
      margin: "4px",
      border: selectedElement?.id === element.id ? "2px solid #60a5fa" : "2px dashed #e5e7eb",
    }

    switch (element.type) {
      case "heading":
        return (
          <h2 style={baseStyles} onClick={() => handleElementClick(element)} className="text-2xl font-bold">
            {element.content}
          </h2>
        )
      case "text":
        return (
          <p style={baseStyles} onClick={() => handleElementClick(element)} className="text-gray-600">
            {element.content}
          </p>
        )
      case "image":
        return (
          <div style={baseStyles} onClick={() => handleElementClick(element)}>
            <img
              src={element.content || "/placeholder.svg"}
              alt={`Image: ${element.content || "Content image"}`}
              className="w-full h-auto rounded-lg"
            />
          </div>
        )
      case "blog-post":
        return (
          <div style={baseStyles} onClick={() => handleElementClick(element)} className="w-full">
            {renderBlogPost(element)}
          </div>
        )
      case "blog-grid":
        return (
          <div
            style={baseStyles}
            onClick={() => handleElementClick(element)}
            className={`grid grid-cols-1 ${
              element.settings?.columns === 2
                ? "md:grid-cols-2"
                : element.settings?.columns === 3
                  ? "md:grid-cols-2 lg:grid-cols-3"
                  : "md:grid-cols-2 lg:grid-cols-4"
            } gap-6`}
          >
            {[1, 2, 3].map((_, i) => (
              <div key={i}>
                {renderBlogPost({
                  ...element,
                  id: `${element.id}-${i}`,
                  content: `Blog Post ${i + 1}`,
                  blogData: {
                    author: "John Doe",
                    date: new Date().toLocaleDateString(),
                    readTime: "5 min",
                    comments: Math.floor(Math.random() * 50),
                    likes: Math.floor(Math.random() * 100),
                    views: Math.floor(Math.random() * 1000),
                    category: "Category",
                    tags: ["tag1", "tag2"],
                  },
                })}
              </div>
            ))}
          </div>
        )
      case "product-card":
        return (
          <div style={baseStyles} onClick={() => handleElementClick(element)} className="w-full sm:w-72">
            {renderProductCard(element)}
          </div>
        )
      case "product-grid":
        return (
          <div
            style={baseStyles}
            onClick={() => handleElementClick(element)}
            className={`grid grid-cols-1 ${
              element.settings?.columns === 2
                ? "sm:grid-cols-2"
                : element.settings?.columns === 3
                  ? "sm:grid-cols-2 lg:grid-cols-3"
                  : "sm:grid-cols-2 lg:grid-cols-4"
            } gap-6`}
          >
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="w-full">
                {renderProductCard({
                  ...element,
                  id: `${element.id}-${i}`,
                  content: `Product ${i + 1}`,
                  productData: {
                    price: "99.99",
                    rating: 4.5,
                    sale: i === 1,
                    salePrice: "79.99",
                    category: "Category",
                    stock: Math.floor(Math.random() * 100),
                    variants: ["S", "M", "L"],
                  },
                })}
              </div>
            ))}
          </div>
        )
      case "newsletter":
        return (
          <div
            style={baseStyles}
            onClick={() => handleElementClick(element)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-8 text-center"
          >
            <h2 className="text-3xl font-bold mb-4">{element.content}</h2>
            <p className="mb-6">Stay updated with our latest news and promotions.</p>
            <div className="flex max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-l-lg text-gray-900"
              />
              <button className="px-6 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-r-lg hover:bg-yellow-400 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        )
      case "testimonial":
        return (
          <div
            style={baseStyles}
            onClick={() => handleElementClick(element)}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center mb-4">
              <img
                src="https://source.unsplash.com/random/100x100/?portrait"
                alt="Customer portrait"
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h3 className="font-semibold">{element.content}</h3>
                <p className="text-gray-500">Happy Customer</p>
              </div>
            </div>
            <p className="text-gray-600 italic">
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua."
            </p>
            <div className="flex text-yellow-400 mt-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>
          </div>
        )
      case "contact":
        return (
          <div
            style={baseStyles}
            onClick={() => handleElementClick(element)}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold mb-6">{element.content}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <MapPin size={20} className="mr-2" />
                  123 Store Street, City, Country
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone size={20} className="mr-2" />
                  +1 234 567 890
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail size={20} className="mr-2" />
                  contact@store.com
                </div>
                <div className="flex space-x-4 text-gray-600">
                  <Facebook size={24} className="hover:text-blue-600 cursor-pointer" />
                  <Twitter size={24} className="hover:text-blue-400 cursor-pointer" />
                  <Instagram size={24} className="hover:text-pink-600 cursor-pointer" />
                  <Youtube size={24} className="hover:text-red-600 cursor-pointer" />
                </div>
              </div>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                ></textarea>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        )
      case "hero":
        return (
          <div
            style={baseStyles}
            onClick={() => handleElementClick(element)}
            className="relative h-96 rounded-lg overflow-hidden"
          >
            <img
              src="https://source.unsplash.com/random/1920x1080/?store"
              alt="Hero background image"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-center">
              <div className="max-w-3xl px-4">
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">{element.content}</h1>
                <p className="text-lg text-white mb-8">Discover our amazing collection of products</p>
                <div className="flex justify-center space-x-4">
                  <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Shop Now
                  </button>
                  <button className="px-8 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      case "cart":
        return (
          <div
            style={baseStyles}
            onClick={() => handleElementClick(element)}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <ShoppingCart className="mr-2" /> {element.content}
            </h2>
            <div className="space-y-4">
              {[1, 2].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 border-b pb-4">
                  <img
                    src={`https://source.unsplash.com/random/100x100/?product-${i + 1}`}
                    alt={`Product ${i + 1} thumbnail`}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">Sample Product {i + 1}</h3>
                    <p className="text-gray-600">Quantity: 1</p>
                    <div className="flex items-center mt-2">
                      <button className="text-gray-500 hover:text-red-500">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">$99.99</div>
                    <div className="flex items-center mt-2">
                      <button className="px-2 py-1 border rounded-l hover:bg-gray-100">-</button>
                      <span className="px-4 py-1 border-t border-b">1</span>
                      <button className="px-2 py-1 border rounded-r hover:bg-gray-100">+</button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Subtotal</span>
                  <span>$199.98</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Shipping</span>
                  <span>$9.99</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tax</span>
                  <span>$20.00</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-4">
                  <span>Total</span>
                  <span>$229.97</span>
                </div>
              </div>
              <button className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors">
                Proceed to Checkout
              </button>
            </div>
          </div>
        )
      case "container":
        return (
          <div
            style={{
              ...baseStyles,
              minHeight: "100px",
              backgroundColor: "#f9fafb",
            }}
            onClick={() => handleElementClick(element)}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="flex flex-wrap"
          >
            {element.children?.map((child) => renderElement(child))}
          </div>
        )
      case "hero-banner":
        return (
          <div style={baseStyles} onClick={() => handleElementClick(element)} className="w-full">
            <HeroBanner
              isEditing={false}
              bannerImage={element.heroBannerData?.bannerImage || []}
              title={element.heroBannerData?.title || ""}
              subtitle={element.heroBannerData?.subtitle || ""}
              description={element.heroBannerData?.description || ""}
              isUploading={false}
              onBannerImageChange={() => {}}
              onBannerImageRemove={() => {}}
              onTitleChange={() => {}}
              onSubtitleChange={() => {}}
              onDescriptionChange={() => {}}
            />
          </div>
        )
      case "process-steps":
        return (
          <div style={baseStyles} onClick={() => handleElementClick(element)} className="w-full">
            <ProcessSteps
              isEditing={false}
              mainImage={element.processStepsData?.mainImage || ""}
              step1Title={element.processStepsData?.step1Title || ""}
              step1Content={element.processStepsData?.step1Content || ""}
              step2Title={element.processStepsData?.step2Title || ""}
              step2Content={element.processStepsData?.step2Content || ""}
              step3Title={element.processStepsData?.step3Title || ""}
              step3Content={element.processStepsData?.step3Content || ""}
              onMainImageChange={() => {}}
              onMainImageRemove={() => {}}
              onStep1TitleChange={() => {}}
              onStep1ContentChange={() => {}}
              onStep2TitleChange={() => {}}
              onStep2ContentChange={() => {}}
              onStep3TitleChange={() => {}}
              onStep3ContentChange={() => {}}
              isUploading={false}
            />
          </div>
        )
      case "two-column-content":
        return (
          <div style={baseStyles} onClick={() => handleElementClick(element)} className="w-full">
            <TwoColumnContent
              isEditing={false}
              mainHeading={element.twoColumnData?.mainHeading || ""}
              leftColumnTitle={element.twoColumnData?.leftColumnTitle || ""}
              leftColumnContent={element.twoColumnData?.leftColumnContent || ""}
              leftColumnSecondTitle={element.twoColumnData?.leftColumnSecondTitle || ""}
              leftColumnSecondContent={element.twoColumnData?.leftColumnSecondContent || ""}
              rightColumnTitle={element.twoColumnData?.rightColumnTitle || ""}
              rightColumnContent={element.twoColumnData?.rightColumnContent || ""}
              rightColumnSecondTitle={element.twoColumnData?.rightColumnSecondTitle || ""}
              rightColumnSecondContent={element.twoColumnData?.rightColumnSecondContent || ""}
              onMainHeadingChange={() => {}}
              onLeftColumnTitleChange={() => {}}
              onLeftColumnContentChange={() => {}}
              onLeftColumnSecondTitleChange={() => {}}
              onLeftColumnSecondContentChange={() => {}}
              onRightColumnTitleChange={() => {}}
              onRightColumnContentChange={() => {}}
              onRightColumnSecondTitleChange={() => {}}
              onRightColumnSecondContentChange={() => {}}
            />
          </div>
        )
      case "satisfaction-banner":
        return (
          <div style={baseStyles} onClick={() => handleElementClick(element)} className="w-full">
            <SatisfactionBanner
              isEditing={false}
              heading={element.satisfactionBannerData?.heading || ""}
              highlightedText={element.satisfactionBannerData?.highlightedText || ""}
              endText={element.satisfactionBannerData?.endText || ""}
              subtext={element.satisfactionBannerData?.subtext || ""}
              emailLabel={element.satisfactionBannerData?.emailLabel || ""}
              emailValue={element.satisfactionBannerData?.emailValue || ""}
              phoneLabel={element.satisfactionBannerData?.phoneLabel || ""}
              phoneValue={element.satisfactionBannerData?.phoneValue || ""}
              onHeadingChange={() => {}}
              onHighlightedTextChange={() => {}}
              onEndTextChange={() => {}}
              onSubtextChange={() => {}}
              onEmailLabelChange={() => {}}
              onEmailValueChange={() => {}}
              onPhoneLabelChange={() => {}}
              onPhoneValueChange={() => {}}
            />
          </div>
        )
      case "product-options-tabs":
        return (
          <div style={baseStyles} onClick={() => handleElementClick(element)} className="w-full">
            <ProductOptionsTabs
              isEditing={false}
              mainHeading={element.productOptionsData?.mainHeading || ""}
              mainDescription={element.productOptionsData?.mainDescription || ""}
              backingOptions={element.productOptionsData?.backingOptions || []}
              borderOptions={element.productOptionsData?.borderOptions || []}
              threadOptions={element.productOptionsData?.threadOptions || []}
              onMainHeadingChange={() => {}}
              onMainDescriptionChange={() => {}}
              onOptionChange={() => {}}
              onOptionImageChange={() => {}}
              onOptionImageRemove={() => {}}
              isUploading={false}
            />
          </div>
        )
      case "coverage-options":
        return (
          <div style={baseStyles} onClick={() => handleElementClick(element)} className="w-full">
            <CoverageOptions
              isEditing={false}
              mainHeading={element.coverageOptionsData?.mainHeading || ""}
              options={element.coverageOptionsData?.options || []}
              onMainHeadingChange={() => {}}
              onOptionChange={() => {}}
              onOptionImageChange={() => {}}
              onOptionImageRemove={() => {}}
              isUploading={false}
              onOption1ImageChange={() => {}}
              onOption2ImageChange={() => {}}
              onOption3ImageChange={() => {}}
              onOption1ImageRemove={() => {}}
              onOption2ImageRemove={() => {}}
              onOption3ImageRemove={() => {}}
            />
          </div>
        )
      case "quotation-section":
        return (
          <div style={baseStyles} onClick={() => handleElementClick(element)} className="w-full">
            <QuotationSection
              isEditing={false}
              mainHeading={element.quotationSectionData?.mainHeading || "Custom Patches"}
              subHeading={
                element.quotationSectionData?.subHeading ||
                "Get your custom patches with our premium quality materials and craftsmanship"
              }
              products={element.quotationSectionData?.products || []}
              onMainHeadingChange={() => {}}
              onSubHeadingChange={() => {}}
              onProductChange={() => {}}
              onProductImageChange={() => {}}
              onProductImageRemove={() => {}}
              isUploading={false}
            />
          </div>
        )
      case "faq-section":
        return (
          <div style={baseStyles} onClick={() => handleElementClick(element)} className="w-full">
            <FAQSection
              isEditing={false}
              title={element.faqSectionData?.heading || ""}
              description={element.faqSectionData?.description || ""}
              faqs={element.faqSectionData?.faqs || []}
              onTitleChange={() => {}}
              onDescriptionChange={() => {}}
              onFAQChange={() => {}}
              onFAQListItemChange={() => {}}
              onAddFAQListItem={() => {}}
              onRemoveFAQListItem={() => {}}
              onAddFAQ={() => {}}
              onRemoveFAQ={() => {}}
            />
          </div>
        )
      default:
        return null
    }
  }


  const PropertyEditor = ({ element }: { element: ElementType }) => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Content</label>
          <input
            type="text"
            value={element.content}
            onChange={(e) => updateElement(element.id, { content: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {element.type === "product-card" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={element.productData?.price || ""}
                  onChange={(e) =>
                    updateElement(element.id, {
                      productData: { ...element.productData, price: e.target.value },
                    })
                  }
                  className="pl-8 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Rating</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={element.productData?.rating || 0}
                onChange={(e) =>
                  updateElement(element.id, {
                    productData: { ...element.productData, rating: Number.parseFloat(e.target.value) },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                value={element.productData?.category || ""}
                onChange={(e) =>
                  updateElement(element.id, {
                    productData: { ...element.productData, category: e.target.value },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <input
                type="number"
                min="0"
                value={element.productData?.stock || 0}
                onChange={(e) =>
                  updateElement(element.id, {
                    productData: { ...element.productData, stock: Number.parseInt(e.target.value) },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="sale"
                checked={element.productData?.sale || false}
                onChange={(e) =>
                  updateElement(element.id, {
                    productData: { ...element.productData, sale: e.target.checked },
                  })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="sale" className="ml-2 block text-sm text-gray-700">
                On Sale
              </label>
            </div>

            {element.productData?.sale && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Sale Price</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={element.productData?.salePrice || ""}
                    onChange={(e) =>
                      updateElement(element.id, {
                        productData: { ...element.productData, salePrice: e.target.value },
                      })
                    }
                    className="pl-8 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {element.type === "blog-post" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Author</label>
              <input
                type="text"
                value={element.blogData?.author || ""}
                onChange={(e) =>
                  updateElement(element.id, {
                    blogData: { ...element.blogData, author: e.target.value },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                value={element.blogData?.category || ""}
                onChange={(e) =>
                  updateElement(element.id, {
                    blogData: { ...element.blogData, category: e.target.value },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Read Time</label>
              <input
                type="text"
                value={element.blogData?.readTime || ""}
                onChange={(e) =>
                  updateElement(element.id, {
                    blogData: { ...element.blogData, readTime: e.target.value },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {(element.type === "product-grid" || element.type === "blog-grid") && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Columns</label>
              <select
                value={element.settings?.columns || 3}
                onChange={(e) =>
                  updateElement(element.id, {
                    settings: { ...element.settings, columns: Number.parseInt(e.target.value) },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value={2}>2 Columns</option>
                <option value={3}>3 Columns</option>
                <option value={4}>4 Columns</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Layout</label>
              <select
                value={element.settings?.layout || "grid"}
                onChange={(e) =>
                  updateElement(element.id, {
                    settings: { ...element.settings, layout: e.target.value as "grid" | "list" | "masonry" },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="grid">Grid</option>
                <option value="list">List</option>
                <option value="masonry">Masonry</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gap</label>
              <select
                value={element.settings?.gap || "1rem"}
                onChange={(e) =>
                  updateElement(element.id, {
                    settings: { ...element.settings, gap: e.target.value },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="0.5rem">Small</option>
                <option value="1rem">Medium</option>
                <option value="2rem">Large</option>
              </select>
            </div>
          </>
        )}

        {element.type !== "container" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Animation</label>
              <select
                value={element.settings?.animation || "fade"}
                onChange={(e) =>
                  updateElement(element.id, {
                    settings: { ...element.settings, animation: e.target.value as "fade" | "slide" | "zoom" },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
                <option value="zoom">Zoom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Responsive</label>
              <div className="mt-2 space-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={element.settings?.responsive?.mobile || false}
                    onChange={(e) =>
                      updateElement(element.id, {
                        settings: {
                          ...element.settings,
                          responsive: {
                            ...element.settings?.responsive,
                            mobile: e.target.checked,
                          },
                        },
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Mobile</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={element.settings?.responsive?.tablet || false}
                    onChange={(e) =>
                      updateElement(element.id, {
                        settings: {
                          ...element.settings,
                          responsive: {
                            ...element.settings?.responsive,
                            tablet: e.target.checked,
                          },
                        },
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Tablet</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={element.settings?.responsive?.desktop || false}
                    onChange={(e) =>
                      updateElement(element.id, {
                        settings: {
                          ...element.settings,
                          responsive: {
                            ...element.settings?.responsive,
                            desktop: e.target.checked,
                          },
                        },
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Desktop</span>
                </label>
              </div>
            </div>
          </>
        )}

        {element.type !== "container" && element.type !== "product-grid" && element.type !== "blog-grid" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Font Size</label>
              <input
                type="number"
                value={Number.parseInt(element.styles?.fontSize || "16")}
                onChange={(e) =>
                  updateElement(element.id, {
                    styles: { ...element.styles, fontSize: `${e.target.value}px` },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Color</label>
              <input
                type="color"
                value={element.styles?.color || "#000000"}
                onChange={(e) =>
                  updateElement(element.id, {
                    styles: { ...element.styles, color: e.target.value },
                  })
                }
                className="mt-1 block w-full"
              />
            </div>
          </>
        )}

        {element.type === "hero-banner" && (
          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium text-sm mb-3">Hero Banner Properties</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600">Title</label>
                <input
                  type="text"
                  value={element.heroBannerData?.title || ""}
                  onChange={(e) =>
                    updateElement(element.id, {
                      heroBannerData: { ...element.heroBannerData, title: e.target.value } as any,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600">Subtitle</label>
                <input
                  type="text"
                  value={element.heroBannerData?.subtitle || ""}
                  onChange={(e) =>
                    updateElement(element.id, {
                      heroBannerData: { ...element.heroBannerData, subtitle: e.target.value } as any,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600">Description</label>
                <textarea
                  value={element.heroBannerData?.description || ""}
                  onChange={(e) =>
                    updateElement(element.id, {
                      heroBannerData: { ...element.heroBannerData, description: e.target.value } as any,
                    })
                  }
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600">Banner Image URL</label>
                <input
                  type="text"
                  value={element.heroBannerData?.bannerImage?.[0] || ""}
                  onChange={(e) =>
                    updateElement(element.id, {
                      heroBannerData: { ...element.heroBannerData, bannerImage: [e.target.value] } as any,
                    })
                  }
                  placeholder="Enter image URL"
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {element.type === "process-steps" && (
          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium text-sm mb-3">Process Steps Properties</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600">Main Image URL</label>
                <input
                  type="text"
                  value={element.processStepsData?.mainImage || ""}
                  onChange={(e) =>
                    updateElement(element.id, {
                      processStepsData: { ...element.processStepsData, mainImage: e.target.value } as any,
                    })
                  }
                  placeholder="Enter image URL"
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600">Step 1 Title</label>
                  <input
                    type="text"
                    value={element.processStepsData?.step1Title || ""}
                    onChange={(e) =>
                      updateElement(element.id, {
                        processStepsData: { ...element.processStepsData, step1Title: e.target.value } as any,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Step 1 Content</label>
                  <textarea
                    value={element.processStepsData?.step1Content || ""}
                    onChange={(e) =>
                      updateElement(element.id, {
                        processStepsData: { ...element.processStepsData, step1Content: e.target.value } as any,
                      })
                    }
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600">Step 2 Title</label>
                  <input
                    type="text"
                    value={element.processStepsData?.step2Title || ""}
                    onChange={(e) =>
                      updateElement(element.id, {
                        processStepsData: { ...element.processStepsData, step2Title: e.target.value } as any,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Step 2 Content</label>
                  <textarea
                    value={element.processStepsData?.step2Content || ""}
                    onChange={(e) =>
                      updateElement(element.id, {
                        processStepsData: { ...element.processStepsData, step2Content: e.target.value } as any,
                      })
                    }
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600">Step 3 Title</label>
                  <input
                    type="text"
                    value={element.processStepsData?.step3Title || ""}
                    onChange={(e) =>
                      updateElement(element.id, {
                        processStepsData: { ...element.processStepsData, step3Title: e.target.value } as any,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Step 3 Content</label>
                  <textarea
                    value={element.processStepsData?.step3Content || ""}
                    onChange={(e) =>
                      updateElement(element.id, {
                        processStepsData: { ...element.processStepsData, step3Content: e.target.value } as any,
                      })
                    }
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {element.type === "two-column-content" && (
          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium text-sm mb-3">Two Column Content Properties</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600">Main Heading</label>
                <input
                  type="text"
                  value={element.twoColumnData?.mainHeading || ""}
                  onChange={(e) =>
                    updateElement(element.id, {
                      twoColumnData: { ...element.twoColumnData, mainHeading: e.target.value } as any,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="border-t border-gray-200 pt-2">
                <h4 className="text-xs font-medium text-gray-700 mb-2">Left Column</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-600">Title</label>
                    <input
                      type="text"
                      value={element.twoColumnData?.leftColumnTitle || ""}
                      onChange={(e) =>
                        updateElement(element.id, {
                          twoColumnData: { ...element.twoColumnData, leftColumnTitle: e.target.value } as any,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600">Content</label>
                    <textarea
                      value={element.twoColumnData?.leftColumnContent || ""}
                      onChange={(e) =>
                        updateElement(element.id, {
                          twoColumnData: { ...element.twoColumnData, leftColumnContent: e.target.value } as any,
                        })
                      }
                      rows={2}
                      className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600">Second Title</label>
                    <input
                      type="text"
                      value={element.twoColumnData?.leftColumnSecondTitle || ""}
                      onChange={(e) =>
                        updateElement(element.id, {
                          twoColumnData: { ...element.twoColumnData, leftColumnSecondTitle: e.target.value } as any,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600">Second Content</label>
                    <textarea
                      value={element.twoColumnData?.leftColumnSecondContent || ""}
                      onChange={(e) =>
                        updateElement(element.id, {
                          twoColumnData: { ...element.twoColumnData, leftColumnSecondContent: e.target.value } as any,
                        })
                      }
                      rows={2}
                      className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-2">
                <h4 className="text-xs font-medium text-gray-700 mb-2">Right Column</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-600">Title</label>
                    <input
                      type="text"
                      value={element.twoColumnData?.rightColumnTitle || ""}
                      onChange={(e) =>
                        updateElement(element.id, {
                          twoColumnData: { ...element.twoColumnData, rightColumnTitle: e.target.value } as any,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600">Content</label>
                    <textarea
                      value={element.twoColumnData?.rightColumnContent || ""}
                      onChange={(e) =>
                        updateElement(element.id, {
                          twoColumnData: { ...element.twoColumnData, rightColumnContent: e.target.value } as any,
                        })
                      }
                      rows={2}
                      className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600">Second Title</label>
                    <input
                      type="text"
                      value={element.twoColumnData?.rightColumnSecondTitle || ""}
                      onChange={(e) =>
                        updateElement(element.id, {
                          twoColumnData: { ...element.twoColumnData, rightColumnSecondTitle: e.target.value } as any,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600">Second Content</label>
                    <textarea
                      value={element.twoColumnData?.rightColumnSecondContent || ""}
                      onChange={(e) =>
                        updateElement(element.id, {
                          twoColumnData: { ...element.twoColumnData, rightColumnSecondContent: e.target.value } as any,
                        })
                      }
                      rows={2}
                      className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {element.type === "satisfaction-banner" && (
          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium text-sm mb-3">Satisfaction Banner Properties</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600">Heading</label>
                <input
                  type="text"
                  value={element.satisfactionBannerData?.heading || ""}
                  onChange={(e) =>
                    updateElement(element.id, {
                      satisfactionBannerData: { ...element.satisfactionBannerData, heading: e.target.value } as any,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600">Highlighted Text</label>
                <input
                  type="text"
                  value={element.satisfactionBannerData?.highlightedText || ""}
                  onChange={(e) =>
                    updateElement(element.id, {
                      satisfactionBannerData: { ...element.satisfactionBannerData, highlightedText: e.target.value } as any,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600">End Text</label>
                <input
                  type="text"
                  value={element.satisfactionBannerData?.endText || ""}
                  onChange={(e) =>
                    updateElement(element.id, {
                      satisfactionBannerData: { ...element.satisfactionBannerData, endText: e.target.value } as any,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600">Subtext</label>
                <textarea
                  value={element.satisfactionBannerData?.subtext || ""}
                  onChange={(e) =>
                    updateElement(element.id, {
                      satisfactionBannerData: { ...element.satisfactionBannerData, subtext: e.target.value } as any,
                    })
                  }
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600">Email Label</label>
                  <input
                    type="text"
                    value={element.satisfactionBannerData?.emailLabel || ""}
                    onChange={(e) =>
                      updateElement(element.id, {
                        satisfactionBannerData: { ...element.satisfactionBannerData, emailLabel: e.target.value } as any,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Email Value</label>
                  <input
                    type="text"
                    value={element.satisfactionBannerData?.emailValue || ""}
                    onChange={(e) =>
                      updateElement(element.id, {
                        satisfactionBannerData: { ...element.satisfactionBannerData, emailValue: e.target.value } as any,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600">Phone Label</label>
                  <input
                    type="text"
                    value={element.satisfactionBannerData?.phoneLabel || ""}
                    onChange={(e) =>
                      updateElement(element.id, {
                        satisfactionBannerData: { ...element.satisfactionBannerData, phoneLabel: e.target.value } as any,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Phone Value</label>
                  <input
                    type="text"
                    value={element.satisfactionBannerData?.phoneValue || ""}
                    onChange={(e) =>
                      updateElement(element.id, {
                        satisfactionBannerData: { ...element.satisfactionBannerData, phoneValue: e.target.value } as any,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {element.type === "product-options-tabs" && (
          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium text-sm mb-3">Product Options Properties</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600">Main Heading</label>
                <input
                  type="text"
                  value={element.productOptionsData?.mainHeading || ""}
                  onChange={(e) =>
                    updateElement(element.id, {
                      productOptionsData: { ...element.productOptionsData, mainHeading: e.target.value } as any,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600">Main Description</label>
                <textarea
                  value={element.productOptionsData?.mainDescription || ""}
                  onChange={(e) =>
                    updateElement(element.id, {
                      productOptionsData: { ...element.productOptionsData, mainDescription: e.target.value } as any,
                    })
                  }
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="border-t border-gray-200 pt-2">
                <h4 className="text-xs font-medium text-gray-700 mb-2">Backing Options</h4>
                {element.productOptionsData?.backingOptions.map((option, index) => (
                  <div key={index} className="border p-2 rounded mb-2">
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-600">Title</label>
                        <input
                          type="text"
                          value={option.title}
                          onChange={(e) => {
                            const newOptions = [...(element.productOptionsData?.backingOptions || [])]
                            newOptions[index] = { ...newOptions[index], title: e.target.value }
                            updateElement(element.id, {
                              productOptionsData: { ...element.productOptionsData, backingOptions: newOptions } as any,
                            })
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600">Description</label>
                        <textarea
                          value={option.description}
                          onChange={(e) => {
                            const newOptions = [...(element.productOptionsData?.backingOptions || [])]
                            newOptions[index] = { ...newOptions[index], description: e.target.value }
                            updateElement(element.id, {
                              productOptionsData: { ...element.productOptionsData, backingOptions: newOptions } as any,
                            })
                          }}
                          rows={2}
                          className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600">Image URL</label>
                        <input
                          type="text"
                          value={option.image}
                          onChange={(e) => {
                            const newOptions = [...(element.productOptionsData?.backingOptions || [])]
                            newOptions[index] = { ...newOptions[index], image: e.target.value }
                            updateElement(element.id, {
                              productOptionsData: { ...element.productOptionsData, backingOptions: newOptions } as any,
                            })
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {element.type === "coverage-options" && (
          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium text-sm mb-3">Coverage Options Properties</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600">Main Heading</label>
                <input
                  type="text"
                  value={element.coverageOptionsData?.mainHeading || ""}
                  onChange={(e) =>
                    updateElement(element.id, {
                      coverageOptionsData: { ...element.coverageOptionsData, mainHeading: e.target.value } as any,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="border-t border-gray-200 pt-2">
                <h4 className="text-xs font-medium text-gray-700 mb-2">Options</h4>
                {element.coverageOptionsData?.options.map((option, index) => (
                  <div key={index} className="border p-2 rounded mb-2">
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-600">Percentage</label>
                        <input
                          type="text"
                          value={option.percentage}
                          onChange={(e) => {
                            const newOptions = [...(element.coverageOptionsData?.options || [])]
                            newOptions[index] = { ...newOptions[index], percentage: e.target.value }
                            updateElement(element.id, {
                              coverageOptionsData: { ...element.coverageOptionsData, options: newOptions } as any,
                            })
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600">Description</label>
                        <textarea
                          value={option.description}
                          onChange={(e) => {
                            const newOptions = [...(element.coverageOptionsData?.options || [])]
                            newOptions[index] = { ...newOptions[index], description: e.target.value }
                            updateElement(element.id, {
                              coverageOptionsData: { ...element.coverageOptionsData, options: newOptions } as any,
                            })
                          }}
                          rows={2}
                          className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600">Image URL</label>
                        <input
                          type="text"
                          value={option.image}
                          onChange={(e) => {
                            const newOptions = [...(element.coverageOptionsData?.options || [])]
                            newOptions[index] = { ...newOptions[index], image: e.target.value }
                            updateElement(element.id, {
                              coverageOptionsData: { ...element.coverageOptionsData, options: newOptions } as any,
                            })
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {element.type === "faq-section" && (
          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium text-sm mb-3">FAQ Section Properties</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600">Heading</label>
                <input
                  type="text"
                  value={element.faqSectionData?.heading || ""}
                  onChange={(e) =>
                    updateElement(element.id, {
                      faqSectionData: { ...element.faqSectionData, heading: e.target.value } as any,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600">Description</label>
                <textarea
                  value={element.faqSectionData?.description || ""}
                  onChange={(e) =>
                    updateElement(element.id, {
                      faqSectionData: { ...element.faqSectionData, description: e.target.value } as any,
                    })
                  }
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="border-t border-gray-200 pt-2">
                <h4 className="text-xs font-medium text-gray-700 mb-2">FAQs</h4>
                {element.faqSectionData?.faqs?.map((faq, index) => (
                  <div key={index} className="border p-2 rounded mb-2">
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-600">Question</label>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => {
                            const newFaqs = [...(element.faqSectionData?.faqs || [])]
                            newFaqs[index] = { ...newFaqs[index], question: e.target.value }
                            updateElement(element.id, {
                              faqSectionData: { ...element.faqSectionData, faqs: newFaqs } as any,
                            })
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600">Answer</label>
                        <textarea
                          value={faq.answer}
                          onChange={(e) => {
                            const newFaqs = [...(element.faqSectionData?.faqs || [])]
                            newFaqs[index] = { ...newFaqs[index], answer: e.target.value }
                            updateElement(element.id, {
                              faqSectionData: { ...element.faqSectionData, faqs: newFaqs } as any,
                            })
                          }}
                          rows={2}
                          className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newFaqs = [
                      ...(element.faqSectionData?.faqs || []),
                      { 
                        id: `faq-${Date.now()}`, 
                        icon: "❓", 
                        question: "New Question", 
                        answer: "New Answer" 
                      },
                    ]
                    updateElement(element.id, {
                      faqSectionData: { ...element.faqSectionData, faqs: newFaqs } as any,
                    })
                  }}
                  className="mt-2 w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                >
                  <Plus size={16} className="mr-2" /> Add FAQ
                </button>
              </div>
            </div>
          </div>
        )}

        {element.type === "quotation-section" && (
          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium text-sm mb-3">Quotation Section Properties</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600">Main Heading</label>
                <input
                  type="text"
                  value={element.quotationSectionData?.mainHeading || ""}
                  onChange={(e) =>
                    updateElement(element.id, {
                      quotationSectionData: { ...element.quotationSectionData, mainHeading: e.target.value } as any,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600">Sub Heading</label>
                <input
                  type="text"
                  value={element.quotationSectionData?.subHeading || ""}
                  onChange={(e) =>
                    updateElement(element.id, {
                      quotationSectionData: { ...element.quotationSectionData, subHeading: e.target.value } as any,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="border-t border-gray-200 pt-2">
                <h4 className="text-xs font-medium text-gray-700 mb-2">Patch Products</h4>
                {(element.quotationSectionData?.products || []).map((product, index) => (
                  <div key={index} className="border p-2 rounded mb-2">
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-600">Title</label>
                        <input
                          type="text"
                          value={product.title}
                          onChange={(e) => {
                            const newProducts = [...(element.quotationSectionData?.products || [])]
                            newProducts[index] = { ...newProducts[index], title: e.target.value }
                            updateElement(element.id, {
                              quotationSectionData: { ...element.quotationSectionData, products: newProducts } as any,
                            })
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600">Tag Text</label>
                        <input
                          type="text"
                          value={product.tagText}
                          onChange={(e) => {
                            const newProducts = [...(element.quotationSectionData?.products || [])]
                            newProducts[index] = { ...newProducts[index], tagText: e.target.value }
                            updateElement(element.id, {
                              quotationSectionData: { ...element.quotationSectionData, products: newProducts } as any,
                            })
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600">Button Text</label>
                        <input
                          type="text"
                          value={product.buttonText}
                          onChange={(e) => {
                            const newProducts = [...(element.quotationSectionData?.products || [])]
                            newProducts[index] = { ...newProducts[index], buttonText: e.target.value }
                            updateElement(element.id, {
                              quotationSectionData: { ...element.quotationSectionData, products: newProducts } as any,
                            })
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>  
                      <div>
                        <label className="block text-xs text-gray-600">Image URL</label>
                        <input
                          type="text"
                          value={product.image}
                          onChange={(e) => {
                            const newProducts = [...(element.quotationSectionData?.products || [])]
                            newProducts[index] = { ...newProducts[index], image: e.target.value }
                            updateElement(element.id, {
                              quotationSectionData: { ...element.quotationSectionData, products: newProducts } as any,
                            })
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600">Features (one per line)</label>
                        <textarea
                          value={(product.features || []).join("\n")}
                          onChange={(e) => {
                            const newProducts = [...(element.quotationSectionData?.products || [])]
                            newProducts[index] = {
                              ...newProducts[index],
                              features: e.target.value.split("\n").filter((line) => line.trim() !== ""),
                            }
                            updateElement(element.id, {
                              quotationSectionData: { ...element.quotationSectionData, products: newProducts } as any,
                            })
                          }}
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newProducts = [
                      ...(element.quotationSectionData?.products || []),
                      {
                        image: "/placeholder.svg?height=300&width=300",
                        title: "New Patch Type",
                        tagText: "FREE QUOTE",
                        features: ["Feature 1", "Feature 2", "Feature 3"],
                        buttonText: "Get Free Quote",
                      },
                    ]
                    updateElement(element.id, {
                      quotationSectionData: { ...element.quotationSectionData, products: newProducts } as any,
                    })
                  }}
                  className="mt-2 w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                >
                  <Plus size={16} className="mr-2" /> Add Patch Type
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => deleteElement(element.id)}
          className="mt-4 flex items-center justify-center w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          <X size={16} className="mr-2" /> Delete Element
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="sticky top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-2 z-50 flex items-center justify-between">
        <div className="flex items-center">
          <Button onClick={onClose} variant="outline" size="sm" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h2 className="text-lg font-semibold">Page Builder</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsMobile(!isMobile)}
            variant={isMobile ? "secondary" : "outline"}
            size="sm"
            className="px-2"
            title="Mobile View"
          >
            Mobile
          </Button>
          <Button
            onClick={() => setIsTablet(!isTablet)}
            variant={isTablet ? "secondary" : "outline"}
            size="sm"
            className="px-2"
            title="Tablet View"
          >
            Tablet
          </Button>
          <Button onClick={undo} variant="outline" size="sm" className="px-2" title="Undo" disabled={historyIndex <= 0}>
            Undo
          </Button>
          <Button
            onClick={redo}
            variant="outline"
            size="sm"
            className="px-2"
            title="Redo"
            disabled={historyIndex >= history.length - 1}
          >
            Redo
          </Button>
          <Button onClick={() => onSave(elements)} variant="outline" className="flex items-center">
            <Save size={16} className="mr-2" />
            Save Draft
          </Button>
          <Button onClick={handlePreview} variant="outline" className="flex items-center">
            <ExternalLink size={16} className="mr-2" />
            Preview
          </Button>
          {onPublish && (
            <Button onClick={() => onPublish(elements)} className="flex items-center">
              <Eye size={16} className="mr-2" />
              Publish
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-white border-r border-gray-200 overflow-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Plus size={20} className="mr-2" /> Page Components
            </h2>
            <div className="space-y-6">
              {components.map((category) => (
                <div key={category.category}>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">{category.category}</h3>
                  <div className="space-y-2">
                    {category.items.map((component) => (
                      <div
                        key={component.type}
                        draggable
                        onDragStart={(e) => handleDragStart(e, component.type)}
                        className="flex items-center p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100"
                      >
                        {component.icon}
                        <span className="ml-2">{component.label}</span>
                        <MoveHorizontal size={16} className="ml-auto text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4" onDrop={handleDrop} onDragOver={handleDragOver}>
          <div
            className={`mx-auto bg-white rounded-lg shadow-lg min-h-[calc(100vh-8rem)] p-8 transition-all duration-300 ${
              isMobile ? "max-w-sm" : isTablet ? "max-w-2xl" : "max-w-6xl"
            }`}
          >
            {elements.map((element) => renderElement(element))}
            {elements.length === 0 && (
              <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg p-12">
                Drag and drop components here to build your page
              </div>
            )}
          </div>
        </div>

        <div className="w-64 bg-white border-l border-gray-200 overflow-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Settings2 size={20} className="mr-2" /> Properties
            </h2>
            {selectedElement ? (
              <PropertyEditor element={selectedElement} />
            ) : (
              <div className="text-gray-400 text-center">Select an element to edit its properties</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
