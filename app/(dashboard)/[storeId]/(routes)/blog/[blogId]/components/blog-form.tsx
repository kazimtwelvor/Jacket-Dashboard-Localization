"use client"

import type React from "react"

import * as z from "zod"
import axios from "axios"
import { useState, useCallback, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { Trash } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Heading } from "@/components/ui/heading"
import { AlertModal } from "@/components/modals/alert-modal"

// Import our custom components
import { BlogHeroSection } from "./blog-hero-section"
import { BlogContentSection } from "./blog-content-section"
import { BlogSettings } from "./blog-settings"
import { BlogGuideContent } from "./blog-guide-content"

// Update the form schema to include isActive field for steps and keyTakeaways
const formSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  subtitle: z.string().optional(),
  bannerImage: z.string().optional(),
  isPublished: z.boolean().default(false),
  author: z.string().default(""),
  date: z.string().default(""),
  category: z.string().default(""),
  readTime: z.string().default(""),
  socialLinks: z
    .object({
      instagram: z.string().default("https://instagram.com"),
      twitter: z.string().default("https://twitter.com"),
      facebook: z.string().default("https://facebook.com"),
      youtube: z.string().default("https://youtube.com"),
      pinterest: z.string().default("https://pinterest.com"),
      linkedin: z.string().default("https://linkedin.com"),
    })
    .default({
      instagram: "https://instagram.com",
      twitter: "https://twitter.com",
      facebook: "https://facebook.com",
      youtube: "https://youtube.com",
      pinterest: "https://pinterest.com",
      linkedin: "https://linkedin.com",
    }),
  contentSection: z
    .object({
      title: z.string().default("Lorem Ipsum Dolor Sit Amet"),
      text: z
        .string()
        .default(
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus.",
        ),
      mainImage: z.string().default(""),
      smallImageTop: z.string().default(""),
      smallImageBottom: z.string().default(""),
      subtitleHeading: z.string().default("Lorem Ipsum Dolor Sit Amet"),
      subtitleText: z
        .string()
        .default(
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor.",
        ),
    })
    .default({
      title: "Lorem Ipsum Dolor Sit Amet",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus.",
      mainImage: "",
      smallImageTop: "",
      smallImageBottom: "",
      subtitleHeading: "Lorem Ipsum Dolor Sit Amet",
      subtitleText:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor.",
    }),
  guideContent: z
    .object({
      title: z.string().default("Complete Guide"),
      steps: z
        .array(
          z.object({
            title: z.string(),
            subtitle: z.string(),
            content: z.array(z.string()),
            image: z.string().optional(),
            images: z.array(z.string()).optional(),
            imageLabels: z.array(z.string()).optional(),
            cardTitles: z.array(z.string()).optional(),
            cardDescriptions: z.array(z.string()).optional(),
            buttonText: z.string().optional(),
            isActive: z.boolean().default(true), // Add isActive field with default true
            timelineItems: z
              .array(
                z.object({
                  title: z.string(),
                  description: z.string(),
                }),
              )
              .optional(),
            metrics: z
              .object({
                before: z.array(z.string()).optional(),
                after: z.array(z.string()).optional(),
                titles: z.array(z.string()).optional(),
                values: z.array(z.string()).optional(),
              })
              .optional(),
          }),
        )
        .default([]),
      keyTakeaways: z
        .object({
          title: z.string().default("Key Takeaways"),
          isActive: z.boolean().default(true), // Add isActive field with default true
          whatYouLearned: z
            .object({
              title: z.string().default("What You've Learned"),
              items: z
                .array(z.string())
                .default([
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                ]),
            })
            .default({
              title: "What You've Learned",
              items: [
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
              ],
            }),
          nextSteps: z
            .object({
              title: z.string().default("Next Steps"),
              description: z
                .string()
                .default("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris:"),
              items: z
                .array(z.string())
                .default([
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                ]),
            })
            .default({
              title: "Next Steps",
              description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris:",
              items: [
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
              ],
            }),
        })
        .default({
          title: "Key Takeaways",
          isActive: true, // Add default value
          whatYouLearned: {
            title: "What You've Learned",
            items: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            ],
          },
          nextSteps: {
            title: "Next Steps",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris:",
            items: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            ],
          },
        }),
    })
    .default({
      title: "Complete Guide",
      steps: [],
      keyTakeaways: {
        title: "Key Takeaways",
        isActive: true,
        whatYouLearned: {
          title: "What You've Learned",
          items: [
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          ],
        },
        nextSteps: {
          title: "Next Steps",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris:",
          items: [
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          ],
        },
      },
    }),
})

type BlogFormValues = z.infer<typeof formSchema>

// Update the BlogFormProps interface to include isActive fields
interface BlogFormProps {
  initialData: {
    id?: string
    title?: string
    slug?: string
    subtitle?: string
    bannerImage?: string
    content?: string
    isPublished?: boolean
    author?: string
    date?: string
    category?: string
    readTime?: string
    socialLinks?: {
      instagram?: string
      twitter?: string
      facebook?: string
      youtube?: string
      pinterest?: string
      linkedin?: string
    }
    contentSection?: {
      title?: string
      text?: string
      mainImage?: string
      smallImageTop?: string
      smallImageBottom?: string
      subtitleHeading?: string
      subtitleText?: string
    }
    guideContent?: {
      title?: string
      steps?: {
        title?: string
        subtitle?: string
        content?: string[]
        image?: string
        images?: string[]
        imageLabels?: string[]
        cardTitles?: string[]
        cardDescriptions?: string[]
        buttonText?: string
        isActive?: boolean // Add isActive field
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
      keyTakeaways?: {
        title?: string
        isActive?: boolean // Add isActive field
        whatYouLearned?: {
          title?: string
          items?: string[]
        }
        nextSteps?: {
          title?: string
          description?: string
          items?: string[]
        }
      }
    }
  } | null
}

// Update the BlogForm component to pass the toggle handlers to BlogGuideContent
export const BlogForm: React.FC<BlogFormProps> = ({ initialData }) => {
  const params = useParams()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    settings: false,
  })
  const [formData, setFormData] = useState<BlogFormValues | null>(null)
  const [autoSaveDisabled, setAutoSaveDisabled] = useState(true)

  const title = initialData ? "Edit blog post" : "Create blog post"
  const description = initialData ? "Edit your blog post." : "Add a new blog post"
  const toastMessage = initialData ? "Blog post updated." : "Blog post created."
  const action = initialData ? "Save changes" : "Create"

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "How to Create Iron-on Patches",
      slug: "how-to-create-iron-on-patches",
      subtitle: "",
      bannerImage: "/blog-header.png",
      content: "",
      isPublished: false,
      author: "Author Name",
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      category: "Arts and Crafts",
      readTime: "5 min read",
      socialLinks: {
        instagram: "https://instagram.com",
        twitter: "https://twitter.com",
        facebook: "https://facebook.com",
        youtube: "https://youtube.com",
        pinterest: "https://pinterest.com",
        linkedin: "https://linkedin.com",
      },
      contentSection: {
        title: "Lorem Ipsum Dolor Sit Amet",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus.",
        mainImage: "",
        smallImageTop: "",
        smallImageBottom: "",
        subtitleHeading: "Lorem Ipsum Dolor Sit Amet",
        subtitleText:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor.",
      },
      guideContent: {
        title: "Complete Guide",
        steps: [
          {
            title: "1. Content strategy",
            subtitle: "Find the science. Own the fun.",
            content: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.",
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum.",
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras mattis consectetur purus sit amet fermentum.",
            ],
            image: "",
            isActive: true,
          },
          {
            title: "2. Content creation",
            subtitle: "Best in class or bust.",
            content: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.",
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum.",
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras mattis consectetur purus sit amet fermentum.",
            ],
            isActive: true,
          },
          {
            title: "3. Scalable link acquisition",
            subtitle: "Unblockable links.",
            content: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.",
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum.",
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras mattis consectetur purus sit amet fermentum.",
            ],
            isActive: true,
          },
          {
            title: "4. SEO consulting",
            subtitle: "Maximize your SEO.",
            content: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.",
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum.",
            ],
            image: "",
            isActive: true,
          },
          {
            title: "5. Content Analytics",
            subtitle: "Measure what matters.",
            content: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.",
            ],
            image: "",
            isActive: true,
          },
          {
            title: "6. Social Media Marketing",
            subtitle: "Engage and convert.",
            content: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.",
            ],
            images: ["", "", ""],
            isActive: true,
          },
          {
            title: "7. Email Marketing",
            subtitle: "Direct to inbox, direct to conversion.",
            content: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.",
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum.",
            ],
            image: "",
            isActive: true,
          },
          {
            title: "8. Content Distribution",
            subtitle: "Right content, right place, right time.",
            content: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.",
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum.",
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras mattis consectetur purus sit amet fermentum.",
            ],
            images: ["", "", ""],
            isActive: true,
          },
          {
            title: "9. Video Marketing",
            subtitle: "Engage, explain, entertain.",
            content: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.",
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum.",
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras mattis consectetur purus sit amet fermentum.",
            ],
            image: "",
            isActive: true,
          },
          {
            title: "10. Interactive Content",
            subtitle: "Engage your audience like never before.",
            content: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.",
            ],
            images: ["", "", ""],
            cardTitles: ["Interactive Quizzes", "ROI Calculators", "Interactive Infographics"],
            cardDescriptions: ["Engage and qualify leads", "Demonstrate value clearly", "Visualize complex data"],
            isActive: true,
          },
          {
            title: "11. Content Personalization",
            subtitle: "Deliver the right message to the right person.",
            content: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.",
            ],
            image: "",
            buttonText: "Learn more",
            isActive: true,
          },
          {
            title: "12. Visual Storytelling",
            subtitle: "Capture attention and drive emotion.",
            content: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.",
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum.",
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras mattis consectetur purus sit amet fermentum.",
            ],
            images: ["", "", "", "", ""],
            imageLabels: ["Brand Storytelling", "Data Visualization", "Infographics", "Motion Graphics", "Photography"],
            isActive: true,
          },
          {
            title: "13. Content Optimization",
            subtitle: "Transform good content into great content.",
            content: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.",
            ],
            images: ["", ""],
            metrics: {
              before: ["Low engagement rate (1.2%)", "High bounce rate (78%)", "Poor conversion (0.5%)"],
              after: ["High engagement rate (4.8%)", "Low bounce rate (32%)", "Strong conversion (2.7%)"],
            },
            isActive: true,
          },
          {
            title: "14. 3D Image Experience",
            subtitle: "Create immersive, interactive experiences.",
            content: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.",
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum.",
            ],
            image: "",
            buttonText: "Explore 3D services",
            isActive: true,
          },
          {
            title: "15. Content Auditing",
            subtitle: "Identify opportunities to improve your content performance.",
            content: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.",
            ],
            images: ["", "", "", ""],
            cardTitles: ["Content Inventory", "Performance Analysis", "Gap Analysis", "Recommendations"],
            cardDescriptions: [
              "Catalog and organize all your existing content assets",
              "Evaluate content performance against key metrics",
              "Identify missing content opportunities in your strategy",
              "Actionable insights to improve your content strategy",
            ],
            isActive: true,
          },
          {
            title: "16. Content Localization",
            subtitle: "Expand your global reach with content that resonates with local audiences.",
            content: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.",
            ],
            images: ["", "", ""],
            timelineItems: [
              {
                title: "Market Research",
                description:
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.",
              },
              {
                title: "Translation & Adaptation",
                description:
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.",
              },
              {
                title: "Local SEO & Distribution",
                description:
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.",
              },
            ],
            isActive: true,
          },
          {
            title: "17. Analytics Dashboard",
            subtitle: "Visualize your content performance with our interactive analytics dashboard.",
            content: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.",
            ],
            images: ["", "", ""],
            metrics: {
              titles: ["Traffic", "Engagement", "Conversions"],
              values: ["+24%", "+18%", "+32%"],
            },
            isActive: true,
          },
          {
            title: "18. Content Showcase",
            subtitle: "Explore our portfolio of successful content marketing campaigns.",
            content: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.",
            ],
            images: ["", "", "", "", "", ""],
            imageLabels: [
              "E-commerce Content Strategy",
              "SaaS Blog Strategy",
              "Healthcare Content",
              "Travel Blog",
              "Financial Services",
              "Food & Beverage Campaign",
            ],
            isActive: true,
          },
        ],
        keyTakeaways: {
          title: "Key Takeaways",
          isActive: true,
          whatYouLearned: {
            title: "What You've Learned",
            items: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            ],
          },
          nextSteps: {
            title: "Next Steps",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris:",
            items: [
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            ],
          },
        },
      },
    },
  })

  // Initialize step 6 images array if it doesn't exist
  useEffect(() => {
    const step6 = form.getValues("guideContent.steps.5")
    if (step6 && (!step6.images || !Array.isArray(step6.images))) {
      form.setValue("guideContent.steps.5.images", ["", "", ""], {
        shouldValidate: false,
        shouldDirty: true,
      })
    }
  }, [form])

  // Add a handler for toggle changes
  const handleToggleStep = useCallback(
    (index: number, value: boolean) => {
      const steps = [...form.getValues("guideContent.steps")]
      steps[index].isActive = value
      form.setValue("guideContent.steps", steps, { shouldValidate: true })
    },
    [form],
  )

  // Handler for key takeaways toggle
  const handleToggleKeyTakeaways = useCallback(
    (value: boolean) => {
      form.setValue("guideContent.keyTakeaways.isActive", value, { shouldValidate: true })
    },
    [form],
  )

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const onSubmit = async (data: BlogFormValues) => {
    try {
      setLoading(true)
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/blog/${params.blogId}`, data)
      } else {
        await axios.post(`/api/${params.storeId}/blog`, data)
      }
      router.refresh()
      router.push(`/${params.storeId}/blog`)
      toast.success(toastMessage)
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || "Something went wrong."
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/${params.storeId}/blog/${params.blogId}`)
      router.refresh()
      router.push(`/${params.storeId}/blog`)
      toast.success("Blog post deleted.")
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || "Something went wrong."
      toast.error(errorMessage)
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  // Handler for text field changes - completely rewritten to avoid auto-save
  const handleSaveText = useCallback(
    (field: string, value: string) => {
      // Just update the form value without triggering validation or submission
      form.setValue(field as any, value, {
        shouldValidate: false,
        shouldDirty: false,
        shouldTouch: false,
      })
    },
    [form],
  )

  // Update the handleSaveImage function to fix the issues with specific steps
  const handleSaveImage = useCallback(
    (field: string, url: string) => {
      console.log("BlogForm: Saving image:", field, url) // Add logging for debugging

      // CRITICAL: Validate URL to prevent field paths being saved as URLs
      if (!url) {
        console.log("BlogForm: Empty URL, skipping save")
        return
      }

      // Check for invalid URLs - field paths, undefined, or non-URL strings
      if (
        url.startsWith("guideContent.") ||
        url === "undefined" ||
        url.includes(".steps.") ||
        url.includes(".images.")
      ) {
        console.error("BlogForm: Invalid URL detected:", url)
        toast.error("Invalid image URL format")
        return
      }

      try {
        // Special handling for step 15 (Content Auditing)
        if (field.includes("guideContent.steps.14.images")) {
          console.log("BlogForm: Special handling for step 15 (Content Auditing)")

          // If we're receiving an array directly, use it
          if (Array.isArray(url)) {
            console.log("BlogForm: Received array directly for step 15:", url)
            form.setValue("guideContent.steps.14.images", url, {
              shouldValidate: false,
              shouldDirty: true,
              shouldTouch: true,
            })
            return
          }

          // Otherwise, extract the index and update the array
          const imageMatch = field.match(/images\.(\d+)/)
          if (imageMatch && imageMatch[1]) {
            const imageIndex = Number.parseInt(imageMatch[1], 10)
            console.log(`BlogForm: Processing image for step 15, image index ${imageIndex}:`, url)

            // Get current images array or initialize it
            const currentStep = form.getValues("guideContent.steps.14") || {}
            const currentImages = Array.isArray(currentStep.images) ? [...currentStep.images] : ["", "", "", ""]

            // Ensure the array is large enough
            while (currentImages.length <= imageIndex) {
              currentImages.push("")
            }

            // Update the specific index
            currentImages[imageIndex] = url
            console.log(`BlogForm: Updated step 15 images array:`, currentImages)

            // Update the entire step with the new images array
            const updatedStep = { ...currentStep, images: currentImages }
            form.setValue("guideContent.steps.14", updatedStep, {
              shouldValidate: false,
              shouldDirty: true,
              shouldTouch: true,
            })
            return
          }
        }

        // Extract step index and image index from the field path
        const stepMatch = field.match(/steps\.(\d+)/)
        const imageMatch = field.match(/images\.(\d+)/)

        if (stepMatch && stepMatch[1]) {
          const stepIndex = Number.parseInt(stepMatch[1], 10)
          const currentStepPath = `guideContent.steps.${stepIndex}`
          const currentStep = form.getValues(currentStepPath as any) || {}

          // Handle array fields (images array)
          if (imageMatch && imageMatch[1]) {
            const imageIndex = Number.parseInt(imageMatch[1], 10)
            console.log(`BlogForm: Processing image for step ${stepIndex}, image index ${imageIndex}:`, url)

            // Get current images array or initialize it
            const currentImages = Array.isArray(currentStep.images) ? [...currentStep.images] : []

            // Ensure the array is large enough
            while (currentImages.length <= imageIndex) {
              currentImages.push("")
            }

            // Update the specific index
            currentImages[imageIndex] = url
            console.log(`BlogForm: Updated step ${stepIndex} images array:`, currentImages)

            // Update the entire step with the new images array
            const updatedStep = { ...currentStep, images: currentImages }
            form.setValue(currentStepPath as any, updatedStep, {
              shouldValidate: false,
              shouldDirty: true,
              shouldTouch: true,
            })
          }
          // Handle single image field
          else if (field.includes(".image")) {
            console.log(`BlogForm: Setting single image for step ${stepIndex}:`, url)
            const updatedStep = { ...currentStep, image: url }
            form.setValue(currentStepPath as any, updatedStep, {
              shouldValidate: false,
              shouldDirty: true,
              shouldTouch: true,
            })
          }
          // Fallback for any other field
          else {
            console.log(`BlogForm: Setting field ${field} directly:`, url)
            form.setValue(field as any, url, {
              shouldValidate: false,
              shouldDirty: true,
              shouldTouch: true,
            })
          }
        }
        // Handle non-step fields
        else {
          console.log(`BlogForm: Setting non-step field ${field} directly:`, url)
          form.setValue(field as any, url, {
            shouldValidate: false,
            shouldDirty: true,
            shouldTouch: true,
          })
        }
      } catch (error) {
        console.error("Error in handleSaveImage:", error)
        toast.error("Failed to save image")
      }
    },
    [form],
  )

  // Handler for publish status change
  const handlePublishChange = useCallback(
    (value: boolean) => {
      form.setValue("isPublished", value, {
        shouldValidate: false,
        shouldDirty: false,
        shouldTouch: false,
      })
    },
    [form],
  )

  // Manual save button handler
  const handleManualSave = async () => {
    try {
      setLoading(true)
      const data = form.getValues()
      console.log("Saving data:", data)

      // Log the specific step 15 data
      if (data.guideContent?.steps?.[14]) {
        console.log("Step 15 data before save:", {
          title: data.guideContent.steps[14].title,
          subtitle: data.guideContent.steps[14].subtitle,
          content: data.guideContent.steps[14].content,
          images: data.guideContent.steps[14].images,
        })
      }

      if (initialData) {
        await axios.patch(`/api/${params.storeId}/blog/${params.blogId}`, data)
        toast.success("Blog post updated.")
      } else {
        await axios.post(`/api/${params.storeId}/blog`, data)
        toast.success("Blog post created.")
      }
    } catch (error: any) {
      console.error("Save error:", error)
      const errorMessage = error.response?.data || error.message || "Failed to save blog post."
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        <div className="flex items-center gap-2">
          {initialData && (
            <Button disabled={loading} variant="destructive" size="sm" onClick={() => setOpen(true)} type="button">
              <Trash className="h-4 w-4" />
            </Button>
          )}
          <Button disabled={loading} onClick={handleManualSave} type="button">
            Save Changes
          </Button>
        </div>
      </div>
      <Separator />

      <Form {...form}>
        <form
          onSubmit={(e) => {
            // Always prevent default form submission
            e.preventDefault()
            e.stopPropagation()
            return false
          }}
          className="space-y-8 w-full mt-6"
        >
          {/* Settings Section */}
          <BlogSettings
            slug={form.watch("slug")}
            isPublished={form.watch("isPublished")}
            isExpanded={expandedSections.settings}
            onToggleExpand={() => toggleSection("settings")}
            onSaveText={handleSaveText}
            onPublishChange={handlePublishChange}
          />

          {/* Live Editor */}
          <div className="border rounded-md overflow-hidden bg-white shadow-sm">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
              <h3 className="font-medium">Blog Editor</h3>
              <div className="text-sm text-gray-500">Click on any element to edit</div>
            </div>
            <div className="overflow-auto">
              {/* Blog Hero Section */}
              <BlogHeroSection
                title={form.watch("title")}
                author={form.watch("author")}
                date={form.watch("date")}
                bannerImage={form.watch("bannerImage") || ""}
                category={form.watch("category")}
                readTime={form.watch("readTime")}
                socialLinks={form.watch("socialLinks")}
                onSaveText={handleSaveText}
                onSaveImage={handleSaveImage}
              />

              {/* Content Section */}
              <main className="container mx-auto px-4 py-8 max-w-5xl">
                <BlogContentSection
                  title={form.watch("contentSection.title")}
                  text={form.watch("contentSection.text")}
                  mainImage={form.watch("contentSection.mainImage")}
                  smallImageTop={form.watch("contentSection.smallImageTop")}
                  smallImageBottom={form.watch("contentSection.smallImageBottom")}
                  subtitleHeading={form.watch("contentSection.subtitleHeading")}
                  subtitleText={form.watch("contentSection.subtitleText")}
                  onSaveText={handleSaveText}
                  onSaveImage={handleSaveImage}
                />

                {/* Guide Content Section */}
                <BlogGuideContent
                  title={form.watch("guideContent.title")}
                  steps={form.watch("guideContent.steps")}
                  keyTakeaways={form.watch("guideContent.keyTakeaways")}
                  onSaveText={handleSaveText}
                  onSaveImage={handleSaveImage}
                  onToggleStep={handleToggleStep}
                  onToggleKeyTakeaways={handleToggleKeyTakeaways}
                />
              </main>
            </div>
          </div>
        </form>
      </Form>
    </>
  )
}
