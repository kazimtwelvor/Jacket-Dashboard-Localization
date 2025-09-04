"use client"

import type React from "react"

import { useState, useCallback, ElementType } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HeroBanner } from "./hero-banner"
import { TwoColumnContent } from "./two-column-content"
import { ProductOptionsTabs } from "./product-options-tabs"
import { QuotationSection } from "./quotation-section"
import { ProcessSteps } from "./process-steps"
import { FAQSection } from "./faq-section"
import { SatisfactionBanner } from "./satisfaction-banner"
import { toast } from "react-hot-toast"
import { CoverageOptions } from "./coverage-options"

interface CustomTemplateProps {
  isEditing?: boolean
}

const convertTemplateToPageBuilderElements = (templateData: any): ElementType[] => {
  const elements: ElementType[] = []
  const generateId = () => Math.random().toString(36).substr(2, 9)

  if (templateData.title) {
    elements.push({
      id: generateId(),
      type: "hero",
      content: templateData.title,
      styles: {
        backgroundImage:
          templateData.bannerImage?.length > 0
            ? `url(${templateData.bannerImage[0]})`
            : "url(https://source.unsplash.com/random/1920x1080/?store)",
      },
    })
  }

  if (templateData.mainHeading) {
    const container: ElementType = {
      id: generateId(),
      type: "container",
      content: "",
      children: [
        {
          id: generateId(),
          type: "heading",
          content: templateData.mainHeading,
          styles: {
            textAlign: "center",
            fontSize: "2rem",
            marginBottom: "2rem",
          },
        },
        {
          id: generateId(),
          type: "text",
          content: templateData.leftColumnTitle,
          styles: {
            fontWeight: "bold",
            fontSize: "1.5rem",
          },
        },
        {
          id: generateId(),
          type: "text",
          content: templateData.leftColumnContent,
          styles: {},
        },
        {
          id: generateId(),
          type: "text",
          content: templateData.rightColumnTitle,
          styles: {
            fontWeight: "bold",
            fontSize: "1.5rem",
          },
        },
        {
          id: generateId(),
          type: "text",
          content: templateData.rightColumnContent,
          styles: {},
        },
      ],
      styles: {
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
      },
    }
    elements.push(container)
  }

  if (templateData.coverageHeading) {
    const coverageContainer: ElementType = {
      id: generateId(),
      type: "container",
      content: "",
      children: [
        {
          id: generateId(),
          type: "heading",
          content: templateData.coverageHeading,
          styles: {
            textAlign: "center",
            fontSize: "2rem",
            marginBottom: "2rem",
          },
        },
      ],
      styles: {
        padding: "2rem",
        backgroundColor: "#f9fafb",
      },
    }

    templateData.coverageOptions?.forEach((option: any) => {
      coverageContainer.children?.push({
        id: generateId(),
        type: "product-card",
        content: option.percentage,
        productData: {
          price: "",
          rating: 5,
          category: option.description,
          stock: 100,
          sale: false,
          salePrice: "",
          variants: [],
        },
        styles: {
          width: "100%",
        },
      })
    })

    elements.push(coverageContainer)
  }

  if (templateData.productOptionsHeading) {
    elements.push({
      id: generateId(),
      type: "product-grid",
      content: templateData.productOptionsHeading,
      settings: {
        columns: 3,
        gap: "1rem",
        layout: "grid",
      },
      styles: {
        padding: "2rem",
      },
    })
  }

  if (templateData.quotationHeading) {
    elements.push({
      id: generateId(),
      type: "heading",
      content: templateData.quotationHeading,
      styles: {
        textAlign: "center",
        fontSize: "2rem",
        marginBottom: "1rem",
      },
    })

    if (templateData.quotationSubHeading) {
      elements.push({
        id: generateId(),
        type: "text",
        content: templateData.quotationSubHeading,
        styles: {
          textAlign: "center",
          marginBottom: "2rem",
        },
      })
    }
  }

  if (templateData.step1Title) {
    const stepsContainer: ElementType = {
      id: generateId(),
      type: "container",
      content: "",
      children: [
        {
          id: generateId(),
          type: "heading",
          content: "Our Process",
          styles: {
            textAlign: "center",
            fontSize: "2rem",
            marginBottom: "2rem",
          },
        },
        {
          id: generateId(),
          type: "text",
          content: `Step 1: ${templateData.step1Title}`,
          styles: {
            fontWeight: "bold",
            fontSize: "1.5rem",
          },
        },
        {
          id: generateId(),
          type: "text",
          content: templateData.step1Content,
          styles: {},
        },
        {
          id: generateId(),
          type: "text",
          content: `Step 2: ${templateData.step2Title}`,
          styles: {
            fontWeight: "bold",
            fontSize: "1.5rem",
          },
        },
        {
          id: generateId(),
          type: "text",
          content: templateData.step2Content,
          styles: {},
        },
        {
          id: generateId(),
          type: "text",
          content: `Step 3: ${templateData.step3Title}`,
          styles: {
            fontWeight: "bold",
            fontSize: "1.5rem",
          },
        },
        {
          id: generateId(),
          type: "text",
          content: templateData.step3Content,
          styles: {},
        },
      ],
      styles: {
        padding: "2rem",
        backgroundColor: "#f9fafb",
      },
    }
    elements.push(stepsContainer)
  }

  if (templateData.faqTitle) {
    elements.push({
      id: generateId(),
      type: "faq",
      content: templateData.faqTitle,
      styles: {
        padding: "2rem",
      },
    })
  }

  if (templateData.bannerHeading) {
    elements.push({
      id: generateId(),
      type: "newsletter",
      content: `${templateData.bannerHeading} ${templateData.bannerHighlightedText} ${templateData.bannerEndText}`,
      styles: {
        padding: "2rem",
      },
    })
  }

  elements.push({
    id: generateId(),
    type: "contact",
    content: "Contact Us",
    styles: {
      padding: "2rem",
    },
  })

  return elements
}


export const CustomTemplate: React.FC<CustomTemplateProps> = ({ isEditing = false }) => {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("edit")

  const [bannerImage, setBannerImage] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [title, setTitle] = useState<string>("Lorem Ipsum Headline")
  const [subtitle, setSubtitle] = useState<string>("Make a Statement with Our Products")
  const [description, setDescription] = useState<string>(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor.",
  )

  const [mainHeading, setMainHeading] = useState<string>("Why Choose Custom Products?")
  const [leftColumnTitle, setLeftColumnTitle] = useState<string>("Team Identity, Ranking, and Recognition")
  const [leftColumnContent, setLeftColumnContent] = useState<string>(
    "In the world of teamwork, visual recognition is crucial. Custom products serve as a badge of honor, distinguishing teams or players in the field. They're not just stylish; they're meaningful visual identifiers that enhance team identity and create a sense of belonging. Studies show that players who wear customized gear feel more connected to their teams, enhancing teamwork and morale. For competitive leagues, marking patches help identify player status, from rookies to seasoned veterans. A well-designed patch featuring a team's name, emblem, or mascot doesn't only build a reputation but also makes it instantly recognizable in the competitive play.",
  )
  const [leftColumnSecondTitle, setLeftColumnSecondTitle] = useState<string>("Building Team Cohesion")
  const [leftColumnSecondContent, setLeftColumnSecondContent] = useState<string>(
    "Products with graphic elements allow teams to express their values, aspirations, and identity in a visual form. Custom patches enable organizations to create a more immersive experience, giving players the chance to align with a squad or faction. If you want to establish a strong presence in the airsoft community, custom patches are the way to go. They help players form lasting connections and dominate the battlefield with a unique identity!",
  )

  const [rightColumnTitle, setRightColumnTitle] = useState<string>("Tactical Advantage and Functionality")
  const [rightColumnContent, setRightColumnContent] = useState<string>(
    "Beyond aesthetics, custom products offer practical advantages on the field. High-contrast identification patches make it easy to distinguish between allies and adversaries during nighttime operations. Reflective or glow-in-the-dark patches add another layer of visibility for night games, ensuring quick identification in low-light conditions. Custom Velcro patches provide flexibility, allowing players to swap designs based on different scenarios or roles. For instance, a sniper may wear a different patch than a front-line assault player. This modularity is particularly useful in dynamic game environments where adaptability is key.",
  )
  const [rightColumnSecondTitle, setRightColumnSecondTitle] = useState<string>("Motivational Elements")
  const [rightColumnSecondContent, setRightColumnSecondContent] = useState<string>(
    "Additionally, morale patches serve as motivation. Many teams use humorous or motivational designs to boost spirits and create camaraderie. Whether it's a patch with an inside joke, a team motto, or a symbol of achievement, these patches add a fun and personal touch to the game. Don't settle for generic gear—upgrade your products today and enhance your tactical advantages on the battlefield!",
  )

  const [coverageHeading, setCoverageHeading] = useState<string>("Create A Fully Customizable Product")
  const [coverageOptions, setCoverageOptions] = useState([
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
  ])

  const [productOptionsHeading, setProductOptionsHeading] = useState<string>("Embroidered Patches Options")
  const [productOptionsDescription, setProductOptionsDescription] = useState<string>(
    "Choosing the right backing for your custom embroidered patches ensures durability, ease of application, and versatility. Here are the best options to suit your needs:",
  )

  const [backingOptions, setBackingOptions] = useState([
    {
      image: "/placeholder.svg?height=300&width=300",
      title: "No Backing",
      description:
        "This option comes with no adhesive or fastener, allowing you to sew the patch directly onto any fabric for a permanent, long-lasting hold. Ideal for jackets, uniforms, and hats.",
      buttonText: "FREE QUOTE",
    },
    {
      image: "/placeholder.svg?height=300&width=300",
      title: "Velcro Hook",
      description:
        "The Velcro hook side features strong, interlocking hooks that securely attach to Velcro loop surfaces. This is a popular choice for military, tactical gear, and uniforms, offering quick removal and reattachment.",
      buttonText: "FREE QUOTE",
    },
    {
      image: "/placeholder.svg?height=300&width=300",
      title: "Plastic",
      description:
        "A stiff plastic layer is added to the back of the patch, providing extra durability and shape retention over time. Perfect for structured patches that need added support.",
      buttonText: "FREE QUOTE",
    },
  ])

  const [borderOptions, setBorderOptions] = useState([
    {
      image: "/placeholder.svg?height=300&width=300",
      title: "Merrowed Border",
      description:
        "Merrowed borders, named for the brand of sewing machine that creates them, produce the classic raised borders that are an industry standard. It adds a touch of elegance to clean, simple designs.",
      buttonText: "FREE QUOTE",
    },
    {
      image: "/placeholder.svg?height=300&width=300",
      title: "Heat Cut Border",
      description:
        "Hot cut patches, unlike standard rounded edge patches, feature sharp, detailed edges. This option is ideal if your patches have fine details and intricate design features.",
      buttonText: "FREE QUOTE",
    },
    {
      image: "/placeholder.svg?height=300&width=300",
      title: "Laser Cut Border",
      description:
        "There is no sewn border on these patches, and it depends on the look and feel you want them to have.",
      buttonText: "FREE QUOTE",
    },
  ])

  const [threadOptions, setThreadOptions] = useState([
    {
      image: "/placeholder.svg?height=300&width=300",
      title: "Reflective Thread",
      description:
        "Special thread that reflects light, making your patches visible in low-light conditions. Perfect for safety gear and nighttime visibility.",
      buttonText: "FREE QUOTE",
    },
    {
      image: "/placeholder.svg?height=300&width=300",
      title: "Gold Color Metallic Thread",
      description:
        "Luxurious gold-colored thread that adds a premium, shimmering effect to your patches. Ideal for high-end, decorative designs.",
      buttonText: "FREE QUOTE",
    },
    {
      image: "/placeholder.svg?height=300&width=300",
      title: "Glow in the Dark Thread",
      description:
        "Special thread that absorbs light and glows in darkness, creating a unique effect for nighttime visibility and special occasions.",
      buttonText: "FREE QUOTE",
    },
  ])

  const [showcaseProducts, setShowcaseProducts] = useState([
    {
      image: "/placeholder.svg?height=300&width=300",
      title: "PVC Patches",
      tagText: "FREE QUOTE",
      features: ["✓ Waterproof & Durable", "✓ 3D Raised Effect", "✓ Weather Resistant"],
      buttonText: "Get Free Quote",
    },
    {
      image: "/placeholder.svg?height=300&width=300",
      title: "Embroidered Patches",
      tagText: "FREE QUOTE",
      features: ["✓ Classic Look", "✓ Premium Stitching", "✓ Lasting Quality"],
      buttonText: "Get Free Quote",
    },
    {
      image: "/placeholder.svg?height=300&width=300",
      title: "Printed Patches",
      tagText: "FREE QUOTE",
      features: ["✓ Full Color Design", "✓ Detailed Artwork", "✓ Quick Production"],
      buttonText: "Get Free Quote",
    },
    {
      image: "/placeholder.svg?height=300&width=300",
      title: "Hook & Loop Patches",
      tagText: "FREE QUOTE",
      features: ["✓ Easy Application", "✓ Military Grade", "✓ Removable Design"],
      buttonText: "Get Free Quote",
    },
    {
      image: "/placeholder.svg?height=300&width=300",
      title: "Name Patches",
      tagText: "FREE QUOTE",
      features: ["✓ Personalized Design", "✓ Multiple Styles", "✓ Custom Fonts"],
      buttonText: "Get Free Quote",
    },
    {
      image: "/placeholder.svg?height=300&width=300",
      title: "Leather Patches",
      tagText: "FREE QUOTE",
      features: ["✓ Premium Leather", "✓ Vintage Look", "✓ Luxury Feel"],
      buttonText: "Get Free Quote",
    },
  ])

  const [quotationHeading, setQuotationHeading] = useState<string>("Get Free Quotation In Just Few Steps!")
  const [quotationSubHeading, setQuotationSubHeading] = useState<string>(
    "Your Ultimate Source for Personalized Patches",
  )

  const [processMainImage, setProcessMainImage] = useState<string>("/placeholder.svg?height=600&width=600")
  const [step1Title, setStep1Title] = useState<string>("Submit Your Design or Idea")
  const [step1Content, setStep1Content] = useState<string>(
    "Ready to create your custom patch? Upload your artwork or tell us about your idea now! Whether it's a unique logo, team insignia, or personal design, we're here to bring it to life. Not sure where to start? Contact us today for a free consultation.",
  )
  const [step2Title, setStep2Title] = useState<string>("Review Your Digital Proof")
  const [step2Content, setStep2Content] = useState<string>(
    "Once we have your design, we'll send you a digital proof within 24 hours. Review it, make changes, or approve it with just a few clicks. We'll work with you until it's exactly right. Need revisions? Let us know, and we'll make it happen quickly!",
  )
  const [step3Title, setStep3Title] = useState<string>("Production & Delivery")
  const [step3Content, setStep3Content] = useState<string>(
    "Once approved, your patches go into production. We offer the fastest turnaround times in the industry and guarantee delivery on time, just as you envisioned. Plus, enjoy free shipping on qualifying orders!",
  )

  const [bannerHeading, setBannerHeading] = useState("Every Custom Patch We Make is")
  const [bannerHighlightedText, setBannerHighlightedText] = useState("Backed by Our Outstanding")
  const [bannerEndText, setBannerEndText] = useState("Customer Service")
  const [bannerSubtext, setBannerSubtext] = useState(
    "Experience unmatched quality with our 100% satisfaction guarantee. Each patch is meticulously crafted to exceed your expectations.",
  )
  const [emailLabel, setEmailLabel] = useState("Email Us")
  const [emailValue, setEmailValue] = useState("info@custompatches.us.com")
  const [phoneLabel, setPhoneLabel] = useState("Call Toll-Free")
  const [phoneValue, setPhoneValue] = useState("1866-847-2824")

  const [faqTitle, setFaqTitle] = useState("Frequently Asked Questions")
  const [faqDescription, setFaqDescription] = useState("Everything you need to know about our custom patches")
  const [faqs, setFaqs] = useState([
    {
      id: "faq1",
      icon: "❓",
      question: "How do I use custom patches?",
      answer:
        "Custom patches can personalize clothing, uniforms, accessories, and promotional materials. Whether sewn, ironed, or attached with Velcro, they are perfect for branding, team identity, or adding a unique touch to jackets, hats, and bags. Order high-quality custom patches today and make your mark!",
      listItems: [],
    },
    {
      id: "faq2",
      icon: "📸",
      question: "How do I make a photo patch?",
      answer:
        "Creating a photo patch involves converting an image into an embroidered or printed design. Start by selecting a high-resolution image, use embroidery software to digitize it, and choose fabric, thread, or PVC materials for the best results. For professional-quality patches, it's best to work with custom patch experts. Upload your photo now, and we'll turn it into a stunning custom patch!",
      listItems: [],
    },
    {
      id: "faq3",
      icon: "🎨",
      question: 'What does "custom patch" mean?',
      answer:
        "A custom patch is a personalized embroidered, woven, or PVC patch designed to showcase logos, text, artwork, or branding. Unlike stock patches, these are made-to-order and can feature custom shapes, colors, and backing options like iron-on, Velcro, or adhesive. Create your custom patch today to stand out!",
      listItems: [],
    },
    {
      id: "faq4",
      icon: "🏠",
      question: "How to do patches at home?",
      answer:
        "You can create patches at home using fabric, embroidery floss, or heat-transfer vinyl. If hand-stitching, use a sturdy base fabric like twill. For an iron-on patch, apply a heat-transfer adhesive and press it onto clothing. Get custom patches made to your exact design for a professional look—start designing now!",
      listItems: [],
    },
    {
      id: "faq5",
      icon: "📌",
      question: "How do you apply patches?",
      answer: "Custom patches can be applied in multiple ways:",
      listItems: [
        "Iron-on – Use heat to bond the patch to fabric",
        "Sew-on – Hand-stitch or use a sewing machine for a permanent hold",
        "Velcro backing – Attach and remove as needed",
        "Adhesive backing – Peel and stick for temporary use",
      ],
    },
    {
      id: "faq6",
      icon: "👕",
      question: "How do I put patches on my clothes?",
      answer: "Depending on the patch type:",
      listItems: [
        "Iron-on – Place the patch on fabric, cover with a cloth, and press with an iron for 30 seconds",
        "Sew-on – Stitch it around the edges for durability",
        "Velcro or adhesive backing – Simply attach and adjust as needed",
      ],
    },
    {
      id: "faq7",
      icon: "🛠️",
      question: "What do I need to make custom patches?",
      answer: "To make a custom patch, you need:",
      listItems: [
        "Fabric base (twill, felt, or leather)",
        "Embroidery thread or PVC material",
        "Backing options (iron-on, Velcro, adhesive)",
        "Embroidery machine or digital printing setup",
      ],
    },
    {
      id: "faq8",
      icon: "💡",
      question: "What can I do with patches?",
      answer: "Custom patches are perfect for:",
      listItems: [
        "Branding and business promotions",
        "Uniforms for schools, military, and first responders",
        "Personalized fashion accessories (jackets, hats, bags)",
        "Commemorative events and giveaways",
        "Motorcycle clubs, sports teams, and music bands",
      ],
    },
  ])

  // FAQ handlers
  const handleAddFAQ = (faq: any) => {
    setFaqs((prevFaqs) => [...prevFaqs, faq])
  }

  const handleRemoveFAQ = (id: string) => {
    setFaqs((prevFaqs) => prevFaqs.filter((faq) => faq.id !== id))
  }

  const handleFAQChange = (id: string, field: string, value: string) => {
    setFaqs((prevFaqs) => prevFaqs.map((faq) => (faq.id === id ? { ...faq, [field]: value } : faq)))
  }

  const handleFAQListItemChange = (id: string, index: number, value: string) => {
    setFaqs((prevFaqs) =>
      prevFaqs.map((faq) => {
        if (faq.id === id && faq.listItems) {
          const updatedListItems = [...faq.listItems]
          updatedListItems[index] = value
          return { ...faq, listItems: updatedListItems }
        }
        return faq
      }),
    )
  }

  const handleAddFAQListItem = (id: string) => {
    setFaqs((prevFaqs) =>
      prevFaqs.map((faq) => {
        if (faq.id === id) {
          const listItems = faq.listItems || []
          return { ...faq, listItems: [...listItems, ""] }
        }
        return faq
      }),
    )
  }

  const handleRemoveFAQListItem = (id: string, index: number) => {
    setFaqs((prevFaqs) =>
      prevFaqs.map((faq) => {
        if (faq.id === id && faq.listItems) {
          const updatedListItems = [...faq.listItems]
          updatedListItems.splice(index, 1)
          return { ...faq, listItems: updatedListItems }
        }
        return faq
      }),
    )
  }

  const onUse = async () => {
    try {
      setIsLoading(true)
      await exportToPageBuilder()
    } catch (error) {
      console.error("Error using template:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBannerImageChange = (url: string) => {
    setBannerImage([url])
  }

  const handleBannerImageRemove = (url: string) => {
    setBannerImage(bannerImage.filter((val) => val !== url))
  }

  const handleCoverageOptionChange = (index: number, field: keyof (typeof coverageOptions)[0], value: string) => {
    setCoverageOptions((prev) => {
      const newOptions = [...prev]
      newOptions[index] = {
        ...newOptions[index],
        [field]: value,
      }
      return newOptions
    })
  }

  const handleCoverageOption1ImageChange = useCallback((url: string) => {
    setCoverageOptions((prev) => {
      const newOptions = [...prev]
      newOptions[0] = {
        ...newOptions[0],
        image: url,
      }
      return newOptions
    })
  }, [])

  const handleCoverageOption2ImageChange = useCallback((url: string) => {
    setCoverageOptions((prev) => {
      const newOptions = [...prev]
      newOptions[1] = {
        ...newOptions[1],
        image: url,
      }
      return newOptions
    })
  }, [])

  const handleCoverageOption3ImageChange = useCallback((url: string) => {
    setCoverageOptions((prev) => {
      const newOptions = [...prev]
      newOptions[2] = {
        ...newOptions[2],
        image: url,
      }
      return newOptions
    })
  }, [])

  const handleCoverageOption1ImageRemove = useCallback(() => {
    setCoverageOptions((prev) => {
      const newOptions = [...prev]
      newOptions[0] = {
        ...newOptions[0],
        image: "/placeholder.svg?height=300&width=300",
      }
      return newOptions
    })
  }, [])

  const handleCoverageOption2ImageRemove = useCallback(() => {
    setCoverageOptions((prev) => {
      const newOptions = [...prev]
      newOptions[1] = {
        ...newOptions[1],
        image: "/placeholder.svg?height=300&width=300",
      }
      return newOptions
    })
  }, [])

  const handleCoverageOption3ImageRemove = useCallback(() => {
    setCoverageOptions((prev) => {
      const newOptions = [...prev]
      newOptions[2] = {
        ...newOptions[2],
        image: "/placeholder.svg?height=300&width=300",
      }
      return newOptions
    })
  }, [])

  const handleProductOptionChange = (
    tabIndex: number,
    optionIndex: number,
    field: keyof (typeof backingOptions)[0],
    value: string,
  ) => {
    if (tabIndex === 0) {
      setBackingOptions((prev) => {
        const newOptions = [...prev]
        newOptions[optionIndex] = {
          ...newOptions[optionIndex],
          [field]: value,
        }
        return newOptions
      })
    } else if (tabIndex === 1) {
      setBorderOptions((prev) => {
        const newOptions = [...prev]
        newOptions[optionIndex] = {
          ...newOptions[optionIndex],
          [field]: value,
        }
        return newOptions
      })
    } else if (tabIndex === 2) {
      setThreadOptions((prev) => {
        const newOptions = [...prev]
        newOptions[optionIndex] = {
          ...newOptions[optionIndex],
          [field]: value,
        }
        return newOptions
      })
    }
  }

  const handleProductOptionImageChange = (tabIndex: number, optionIndex: number, url: string) => {
    if (tabIndex === 0) {
      setBackingOptions((prev) => {
        const newOptions = [...prev]
        newOptions[optionIndex] = {
          ...newOptions[optionIndex],
          image: url,
        }
        return newOptions
      })
    } else if (tabIndex === 1) {
      setBorderOptions((prev) => {
        const newOptions = [...prev]
        newOptions[optionIndex] = {
          ...newOptions[optionIndex],
          image: url,
        }
        return newOptions
      })
    } else if (tabIndex === 2) {
      setThreadOptions((prev) => {
        const newOptions = [...prev]
        newOptions[optionIndex] = {
          ...newOptions[optionIndex],
          image: url,
        }
        return newOptions
      })
    }
  }

  const handleProductOptionImageRemove = (tabIndex: number, optionIndex: number) => {
    if (tabIndex === 0) {
      setBackingOptions((prev) => {
        const newOptions = [...prev]
        newOptions[optionIndex] = {
          ...newOptions[optionIndex],
          image: "/placeholder.svg?height=300&width=300",
        }
        return newOptions
      })
    } else if (tabIndex === 1) {
      setBorderOptions((prev) => {
        const newOptions = [...prev]
        newOptions[optionIndex] = {
          ...newOptions[optionIndex],
          image: "/placeholder.svg?height=300&width=300",
        }
        return newOptions
      })
    } else if (tabIndex === 2) {
      setThreadOptions((prev) => {
        const newOptions = [...prev]
        newOptions[optionIndex] = {
          ...newOptions[optionIndex],
          image: "/placeholder.svg?height=300&width=300",
        }
        return newOptions
      })
    }
  }

  const handleShowcaseProductChange = (
    index: number,
    field: keyof (typeof showcaseProducts)[0],
    value: string | string[],
  ) => {
    setShowcaseProducts((prev) => {
      const newProducts = [...prev]
      newProducts[index] = {
        ...newProducts[index],
        [field]: value,
      }
      return newProducts
    })
  }

  const handleShowcaseProductImageChange = (index: number, url: string) => {
    setShowcaseProducts((prev) => {
      const newProducts = [...prev]
      newProducts[index] = {
        ...newProducts[index],
        image: url,
      }
      return newProducts
    })
  }

  const handleShowcaseProductImageRemove = (index: number) => {
    setShowcaseProducts((prev) => {
      const newProducts = [...prev]
      newProducts[index] = {
        ...newProducts[index],
        image: "/placeholder.svg?height=300&width=300",
      }
      return newProducts
    })
  }

  const exportToPageBuilder = async () => {
    try {
      setIsLoading(true)

      const templateData = {
        bannerImage,
        title,
        subtitle,
        description,
        mainHeading,
        leftColumnTitle,
        leftColumnContent,
        leftColumnSecondTitle,
        leftColumnSecondContent,
        rightColumnTitle,
        rightColumnContent,
        rightColumnSecondTitle,
        rightColumnSecondContent,
        coverageHeading,
        coverageOptions,
        productOptionsHeading,
        productOptionsDescription,
        backingOptions,
        borderOptions,
        threadOptions,
        quotationHeading,
        quotationSubHeading,
        showcaseProducts,
        processMainImage,
        step1Title,
        step1Content,
        step2Title,
        step2Content,
        step3Title,
        step3Content,
        bannerHeading,
        bannerHighlightedText,
        bannerEndText,
        bannerSubtext,
        emailLabel,
        emailValue,
        phoneLabel,
        phoneValue,
        faqTitle,
        faqDescription,
        faqs,
      }

      const pageBuilderElements = convertTemplateToPageBuilderElements(templateData)

      console.log("Template elements created:", pageBuilderElements)

      localStorage.setItem("templateElements", JSON.stringify(pageBuilderElements))

      router.push(`/${params.storeId}/pages/new?template=custom`)
    } catch (error) {
      console.error("Error exporting template:", error)
      toast.error("Error exporting template. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Heading title="Custom Template" description="Preview and use this template for your store" />
        <Button onClick={onUse} disabled={isLoading}>
          Use Template
        </Button>
      </div>
      <Separator />

      <Tabs defaultValue="edit" className="w-full" onValueChange={(value) => setActiveTab(value)}>
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="space-y-8">
          <HeroBanner
            isEditing={true}
            bannerImage={bannerImage}
            title={title}
            subtitle={subtitle}
            description={description}
            isUploading={isUploading}
            onBannerImageChange={handleBannerImageChange}
            onBannerImageRemove={handleBannerImageRemove}
            onTitleChange={setTitle}
            onSubtitleChange={setSubtitle}
            onDescriptionChange={setDescription}
          />

          <TwoColumnContent
            isEditing={true}
            mainHeading={mainHeading}
            leftColumnTitle={leftColumnTitle}
            leftColumnContent={leftColumnContent}
            leftColumnSecondTitle={leftColumnSecondTitle}
            leftColumnSecondContent={leftColumnSecondContent}
            rightColumnTitle={rightColumnTitle}
            rightColumnContent={rightColumnContent}
            rightColumnSecondTitle={rightColumnSecondTitle}
            rightColumnSecondContent={rightColumnSecondContent}
            onMainHeadingChange={setMainHeading}
            onLeftColumnTitleChange={setLeftColumnTitle}
            onLeftColumnContentChange={setLeftColumnContent}
            onLeftColumnSecondTitleChange={setLeftColumnSecondTitle}
            onLeftColumnSecondContentChange={setLeftColumnSecondContent}
            onRightColumnTitleChange={setRightColumnTitle}
            onRightColumnContentChange={setRightColumnContent}
            onRightColumnSecondTitleChange={setRightColumnSecondTitle}
            onRightColumnSecondContentChange={setRightColumnSecondContent}
          />

          <CoverageOptions
            isEditing={true}
            mainHeading={coverageHeading}
            options={coverageOptions}
            onMainHeadingChange={setCoverageHeading}
            onOptionChange={handleCoverageOptionChange}
            onOptionImageChange={(index, url) => {
              if (index === 0) handleCoverageOption1ImageChange(url)
              else if (index === 1) handleCoverageOption2ImageChange(url)
              else if (index === 2) handleCoverageOption3ImageChange(url)
            }}
            onOptionImageRemove={(index) => {
              if (index === 0) handleCoverageOption1ImageRemove()
              else if (index === 1) handleCoverageOption2ImageRemove()
              else if (index === 2) handleCoverageOption3ImageRemove()
            }}
            isUploading={isUploading}
            option1Image={coverageOptions[0].image}
            option2Image={coverageOptions[1].image}
            option3Image={coverageOptions[2].image}
            onOption1ImageChange={handleCoverageOption1ImageChange}
            onOption2ImageChange={handleCoverageOption2ImageChange}
            onOption3ImageChange={handleCoverageOption3ImageChange}
            onOption1ImageRemove={handleCoverageOption1ImageRemove}
            onOption2ImageRemove={handleCoverageOption2ImageRemove}
            onOption3ImageRemove={handleCoverageOption3ImageRemove}
          />

          <ProductOptionsTabs
            isEditing={true}
            mainHeading={productOptionsHeading}
            mainDescription={productOptionsDescription}
            backingOptions={backingOptions}
            borderOptions={borderOptions}
            threadOptions={threadOptions}
            onMainHeadingChange={setProductOptionsHeading}
            onMainDescriptionChange={setProductOptionsDescription}
            onOptionChange={handleProductOptionChange}
            onOptionImageChange={handleProductOptionImageChange}
            onOptionImageRemove={handleProductOptionImageRemove}
            isUploading={isUploading}
          />

          <QuotationSection
            isEditing={true}
            mainHeading={quotationHeading}
            subHeading={quotationSubHeading}
            products={showcaseProducts}
            onMainHeadingChange={setQuotationHeading}
            onSubHeadingChange={setQuotationSubHeading}
            onProductChange={handleShowcaseProductChange}
            onProductImageChange={handleShowcaseProductImageChange}
            onProductImageRemove={handleShowcaseProductImageRemove}
            isUploading={isUploading}
          />
          <ProcessSteps
            isEditing={true}
            mainImage={processMainImage}
            step1Title={step1Title}
            step1Content={step1Content}
            step2Title={step2Title}
            step2Content={step2Content}
            step3Title={step3Title}
            step3Content={step3Content}
            onMainImageChange={setProcessMainImage}
            onMainImageRemove={() => setProcessMainImage("/placeholder.svg?height=600&width=600")}
            onStep1TitleChange={setStep1Title}
            onStep1ContentChange={setStep1Content}
            onStep2TitleChange={setStep2Title}
            onStep2ContentChange={setStep2Content}
            onStep3TitleChange={setStep3Title}
            onStep3ContentChange={setStep3Content}
            isUploading={isUploading}
          />
          <SatisfactionBanner
            isEditing={true}
            heading={bannerHeading}
            highlightedText={bannerHighlightedText}
            endText={bannerEndText}
            subtext={bannerSubtext}
            emailLabel={emailLabel}
            emailValue={emailValue}
            phoneLabel={phoneLabel}
            phoneValue={phoneValue}
            onHeadingChange={setBannerHeading}
            onHighlightedTextChange={setBannerHighlightedText}
            onEndTextChange={setBannerEndText}
            onSubtextChange={setBannerSubtext}
            onEmailLabelChange={setEmailLabel}
            onEmailValueChange={setEmailValue}
            onPhoneLabelChange={setPhoneLabel}
            onPhoneValueChange={setPhoneValue}
          />

          <FAQSection
            isEditing={true}
            title={faqTitle}
            description={faqDescription}
            faqs={faqs}
            onTitleChange={setFaqTitle}
            onDescriptionChange={setFaqDescription}
            onFAQChange={handleFAQChange}
            onFAQListItemChange={handleFAQListItemChange}
            onAddFAQListItem={handleAddFAQListItem}
            onRemoveFAQListItem={handleRemoveFAQListItem}
            onAddFAQ={handleAddFAQ}
            onRemoveFAQ={handleRemoveFAQ}
          />
        </TabsContent>
        <TabsContent value="preview">
          <div className="border rounded-lg overflow-hidden bg-white">
            <HeroBanner
              isEditing={false}
              bannerImage={bannerImage}
              title={title}
              subtitle={subtitle}
              description={description}
              isUploading={isUploading}
              onBannerImageChange={handleBannerImageChange}
              onBannerImageRemove={handleBannerImageRemove}
              onTitleChange={setTitle}
              onSubtitleChange={setSubtitle}
              onDescriptionChange={setDescription}
            />

            <TwoColumnContent
              isEditing={false}
              mainHeading={mainHeading}
              leftColumnTitle={leftColumnTitle}
              leftColumnContent={leftColumnContent}
              leftColumnSecondTitle={leftColumnSecondTitle}
              leftColumnSecondContent={leftColumnSecondContent}
              rightColumnTitle={rightColumnTitle}
              rightColumnContent={rightColumnContent}
              rightColumnSecondTitle={rightColumnSecondTitle}
              rightColumnSecondContent={rightColumnSecondContent}
              onMainHeadingChange={setMainHeading}
              onLeftColumnTitleChange={setLeftColumnTitle}
              onLeftColumnContentChange={setLeftColumnContent}
              onLeftColumnSecondTitleChange={setLeftColumnSecondTitle}
              onLeftColumnSecondContentChange={setLeftColumnSecondContent}
              onRightColumnTitleChange={setRightColumnTitle}
              onRightColumnContentChange={setRightColumnContent}
              onRightColumnSecondTitleChange={setRightColumnSecondTitle}
              onRightColumnSecondContentChange={setRightColumnSecondContent}
            />

            <CoverageOptions
              isEditing={false}
              mainHeading={coverageHeading}
              options={coverageOptions}
              onMainHeadingChange={setCoverageHeading}
              onOptionChange={handleCoverageOptionChange}
              onOptionImageChange={(index, url) => {
                if (index === 0) handleCoverageOption1ImageChange(url)
                else if (index === 1) handleCoverageOption2ImageChange(url)
                else if (index === 2) handleCoverageOption3ImageChange(url)
              }}
              onOptionImageRemove={(index) => {
                if (index === 0) handleCoverageOption1ImageRemove()
                else if (index === 1) handleCoverageOption2ImageRemove()
                else if (index === 2) handleCoverageOption3ImageRemove()
              }}
              isUploading={isUploading}
              option1Image={coverageOptions[0].image}
              option2Image={coverageOptions[1].image}
              option3Image={coverageOptions[2].image}
              onOption1ImageChange={handleCoverageOption1ImageChange}
              onOption2ImageChange={handleCoverageOption2ImageChange}
              onOption3ImageChange={handleCoverageOption3ImageChange}
              onOption1ImageRemove={handleCoverageOption1ImageRemove}
              onOption2ImageRemove={handleCoverageOption2ImageRemove}
              onOption3ImageRemove={handleCoverageOption3ImageRemove}
            />

            <ProductOptionsTabs
              isEditing={false}
              mainHeading={productOptionsHeading}
              mainDescription={productOptionsDescription}
              backingOptions={backingOptions}
              borderOptions={borderOptions}
              threadOptions={threadOptions}
              onMainHeadingChange={setProductOptionsHeading}
              onMainDescriptionChange={setProductOptionsDescription}
              onOptionChange={handleProductOptionChange}
              onOptionImageChange={handleProductOptionImageChange}
              onOptionImageRemove={handleProductOptionImageRemove}
              isUploading={isUploading}
            />

            <QuotationSection
              isEditing={false}
              mainHeading={quotationHeading}
              subHeading={quotationSubHeading}
              products={showcaseProducts}
              onMainHeadingChange={setQuotationHeading}
              onSubHeadingChange={setQuotationSubHeading}
              onProductChange={handleShowcaseProductChange}
              onProductImageChange={handleShowcaseProductImageChange}
              onProductImageRemove={handleShowcaseProductImageRemove}
              isUploading={isUploading}
            />
            <ProcessSteps
              isEditing={false}
              mainImage={processMainImage}
              step1Title={step1Title}
              step1Content={step1Content}
              step2Title={step2Title}
              step2Content={step2Content}
              step3Title={step3Title}
              step3Content={step3Content}
              onMainImageChange={setProcessMainImage}
              onMainImageRemove={() => setProcessMainImage("/placeholder.svg?height=600&width=600")}
              onStep1TitleChange={setStep1Title}
              onStep1ContentChange={setStep1Content}
              onStep2TitleChange={setStep2Title}
              onStep2ContentChange={setStep2Content}
              onStep3TitleChange={setStep3Title}
              onStep3ContentChange={setStep3Content}
              isUploading={isUploading}
            />
            <SatisfactionBanner
              isEditing={false}
              heading={bannerHeading}
              highlightedText={bannerHighlightedText}
              endText={bannerEndText}
              subtext={bannerSubtext}
              emailLabel={emailLabel}
              emailValue={emailValue}
              phoneLabel={phoneLabel}
              phoneValue={phoneValue}
              onHeadingChange={setBannerHeading}
              onHighlightedTextChange={setBannerHighlightedText}
              onEndTextChange={setBannerEndText}
              onSubtextChange={setBannerSubtext}
              onEmailLabelChange={setEmailLabel}
              onEmailValueChange={setEmailValue}
              onPhoneLabelChange={setPhoneLabel}
              onPhoneValueChange={setPhoneValue}
            />

            <FAQSection
              isEditing={false}
              title={faqTitle}
              description={faqDescription}
              faqs={faqs}
              onTitleChange={setFaqTitle}
              onDescriptionChange={setFaqDescription}
              onFAQChange={handleFAQChange}
              onFAQListItemChange={handleFAQListItemChange}
              onAddFAQListItem={handleAddFAQListItem}
              onRemoveFAQListItem={handleRemoveFAQListItem}
              onAddFAQ={handleAddFAQ}
              onRemoveFAQ={handleRemoveFAQ}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

