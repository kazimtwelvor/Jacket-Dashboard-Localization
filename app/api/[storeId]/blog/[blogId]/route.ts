import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"

export async function GET(req: Request, { params }: { params: { blogId: string } }) {
  try {
    if (!params.blogId) {
      return new NextResponse("Blog ID is required", { status: 400 })
    }

    const blog = await prismadb.blog.findUnique({
      where: {
        id: params.blogId,
      },
    })

    return NextResponse.json(blog)
  } catch (error) {
    console.log("[BLOG_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { storeId: string; blogId: string } }) {
  try {
    const { userId } = await auth()
    const body = await req.json()

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 })
    }

    if (!body.title) {
      return new NextResponse("Title is required", { status: 400 })
    }

    if (!body.slug) {
      return new NextResponse("Slug is required", { status: 400 })
    }

    if (!params.blogId) {
      return new NextResponse("Blog ID is required", { status: 400 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 })
    }

    const existingBlogBySlug = await prismadb.blog.findFirst({
      where: {
        storeId: params.storeId,
        content: {
          path: ["metadata", "slug"],
          equals: body.slug,
        },
        NOT: {
          id: params.blogId,
        },
      },
    })

    if (existingBlogBySlug) {
      return new NextResponse("Slug already exists", { status: 400 })
    }

    const trimmedTitle = body.title.trim()
    const allBlogs = await prismadb.blog.findMany({
      where: {
        storeId: params.storeId,
        NOT: {
          id: params.blogId,
        },
      },
      select: {
        id: true,
        content: true,
      },
    })

    const existingBlogByTitle = allBlogs.find((blog) => {
      const content = blog.content as any
      const blogTitle = content?.metadata?.title
      return blogTitle && blogTitle.toLowerCase().trim() === trimmedTitle.toLowerCase()
    })

    console.log("[BLOG_PATCH] Title check:", { 
      title: trimmedTitle, 
      storeId: params.storeId, 
      blogId: params.blogId,
      existingBlogByTitle: existingBlogByTitle ? { id: existingBlogByTitle.id } : null 
    })

    if (existingBlogByTitle) {
      console.log("[BLOG_PATCH] Title already exists, returning error")
      return new NextResponse("Title already exists", { status: 400 })
    }

    console.log("[BLOG_PATCH] Raw body data for problematic steps:", {
      step8: body.guideContent?.steps?.[7],
      step9: body.guideContent?.steps?.[8],
      step10: body.guideContent?.steps?.[9],
      step11: body.guideContent?.steps?.[10],
      step12: body.guideContent?.steps?.[11],
      step13: body.guideContent?.steps?.[12],
      step16: body.guideContent?.steps?.[15],
      step17: body.guideContent?.steps?.[16],
      step18: body.guideContent?.steps?.[17],
    })

    const processedSteps =
      body.guideContent?.steps
        ?.filter((step: any) => step.isActive !== false) 
        .map((step: any, index: number) => {
          const processedStep: any = {
            id: `step-${index + 1}`,
            title: step.title || "",
            subtitle: step.subtitle || "",
            content: Array.isArray(step.content) ? step.content : step.content ? [step.content] : [],
            image: step.image || "",
            isActive: step.isActive !== false,
            buttonText: step.buttonText || "Learn more",
            buttonLink: step.buttonLink || "",
          }

          const problematicSteps = [7, 8, 9, 10, 11, 12, 15, 16, 17] // 0-indexed

          if (Array.isArray(step.images)) {
            // Filter out invalid image URLs
            processedStep.images = step.images.map((img: string) => {
              if (img && img !== "undefined" && !img.startsWith("guideContent.steps.")) {
                return img
              }
              return ""
            })

            // Extra logging for problematic steps
            if (problematicSteps.includes(index)) {
              console.log(`[BLOG_PATCH] Processed Step ${index + 1} images:`, JSON.stringify(processedStep.images))
            }
          } else if (problematicSteps.includes(index)) {
            // Initialize empty images array for problematic steps if it doesn't exist
            processedStep.images = []
            console.log(`[BLOG_PATCH] Initialized empty images array for Step ${index + 1}`)
          }

          // Add step-specific fields based on step type/index
          switch (index) {
            case 7: // Step 8 - Content Distribution
              processedStep.cardTitles = step.cardTitles || ["Social Media", "Email Marketing", "Content Syndication"]
              processedStep.cardDescriptions = step.cardDescriptions || [
                "Reach your audience where they are",
                "Direct to inbox, direct to conversion",
                "Expand your reach",
              ]
              break
            case 8: // Step 9 - Video Marketing
              // Ensure we have the image field
              if (!processedStep.image && processedStep.images && processedStep.images[0]) {
                processedStep.image = processedStep.images[0]
              }
              break
            case 9: // Step 10 - Interactive Content
              processedStep.cardTitles = step.cardTitles || [
                "Interactive Quizzes",
                "ROI Calculators",
                "Interactive Infographics",
              ]
              processedStep.cardDescriptions = step.cardDescriptions || [
                "Engage and qualify leads",
                "Demonstrate value clearly",
                "Visualize complex data",
              ]
              break
            case 10: // Step 11 - Content Personalization
              // Ensure we have the image field
              if (!processedStep.image && processedStep.images && processedStep.images[0]) {
                processedStep.image = processedStep.images[0]
              }
              break
            case 11: // Step 12 - Visual Storytelling
              processedStep.imageLabels = step.imageLabels || [
                "Brand Storytelling",
                "Data Visualization",
                "Infographics",
                "Motion Graphics",
                "Photography",
              ]
              break
            case 12: // Step 13 - Content Optimization
              processedStep.cardTitles = step.cardTitles || ["Before Optimization", "After Optimization"]
              processedStep.metrics = step.metrics || {
                before: ["Low engagement rate (1.2%)", "High bounce rate (78%)", "Poor conversion (0.5%)"],
                after: ["High engagement rate (4.8%)", "Low bounce rate (32%)", "Strong conversion (2.7%)"],
              }
              break
            case 15: // Step 16 - Content Localization
              processedStep.timelineItems = step.timelineItems || [
                {
                  title: "Market Research",
                  description:
                    "Understand local preferences, cultural nuances, and market-specific needs to inform your localization strategy.",
                },
                {
                  title: "Translation & Adaptation",
                  description:
                    "Professional translation and cultural adaptation of your content to ensure it resonates with local audiences.",
                },
                {
                  title: "Local SEO & Distribution",
                  description:
                    "Optimize your localized content for local search engines and distribute through region-specific channels.",
                },
              ]
              break
            case 16: // Step 17 - Analytics Dashboard
              processedStep.metrics = step.metrics || {
                titles: ["Traffic", "Engagement", "Conversions"],
                values: ["+24%", "+18%", "+32%"],
              }
              break
            case 17: // Step 18 - Content Showcase
              processedStep.imageLabels = step.imageLabels || [
                "E-commerce Content Strategy",
                "SaaS Blog Strategy",
                "Healthcare Content",
                "Travel Blog",
                "Financial Services",
                "Food & Beverage Campaign",
              ]
              processedStep.buttonText = step.buttonText || "View All Case Studies"
              break
            default:
              // For other steps, preserve any custom fields they might have
              if (step.cardTitles) {
                processedStep.cardTitles = step.cardTitles
              }
              if (step.cardDescriptions) {
                processedStep.cardDescriptions = step.cardDescriptions
              }
              if (step.imageLabels) {
                processedStep.imageLabels = step.imageLabels
              }
              // For other steps, preserve any custom fields they might have
              Object.keys(step).forEach((key) => {
                if (!processedStep[key] && key !== "id") {
                  processedStep[key] = step[key]
                }
              })
          }

          return processedStep
        }) || []

    // Structure all form data into a single content JSON object with section IDs
    const contentJson = {
      metadata: {
        id: "metadata-1",
        title: body.title,
        slug: body.slug,
        subtitle: body.subtitle || "",
        isPublished: body.isPublished || false,
      },
      hero: {
        id: "section-1",
        title: body.title,
        author: body.author || "",
        date: body.date || "",
        bannerImage: body.bannerImage || "",
        category: body.category || "",
        readTime: body.readTime || "",
        socialLinks: body.socialLinks || {},
      },
      contentSection: {
        id: "section-2",
        title: body.contentSection?.title || "",
        text: body.contentSection?.text || "",
        mainImage: body.contentSection?.mainImage || "",
        smallImageTop: body.contentSection?.smallImageTop || "",
        smallImageBottom: body.contentSection?.smallImageBottom || "",
        subtitleHeading: body.contentSection?.subtitleHeading || "",
        subtitleText: body.contentSection?.subtitleText || "",
      },
      guideContent: {
        id: "section-3",
        title: body.guideContent?.title || "Complete Guide",
        steps: processedSteps,
        // Only include keyTakeaways if it's active
        ...(body.guideContent?.keyTakeaways?.isActive !== false
          ? {
              keyTakeaways: {
                id: "section-4",
                title: body.guideContent?.keyTakeaways?.title || "Key Takeaways",
                whatYouLearned: body.guideContent?.keyTakeaways?.whatYouLearned || {
                  title: "What You've Learned",
                  items: [],
                },
                nextSteps: body.guideContent?.keyTakeaways?.nextSteps || {
                  title: "Next Steps",
                  description: "",
                  items: [],
                },
              },
            }
          : {}),
      },
    }

    // Add this before the blog update call
    console.log("[BLOG_PATCH] Problematic steps before save:", {
      step8: processedSteps[7]?.images,
      step9: processedSteps[8]?.image,
      step10: processedSteps[9]?.images,
      step11: processedSteps[10]?.image,
      step12: processedSteps[11]?.images,
      step13: processedSteps[12]?.images,
      step16: processedSteps[15]?.images,
      step17: processedSteps[16]?.images,
      step18: processedSteps[17]?.images,
    })

    const blog = await prismadb.blog.update({
      where: {
        id: params.blogId,
      },
      data: {
        content: contentJson,
      },
    })

    return NextResponse.json(blog)
  } catch (error) {
    console.log("[BLOG_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { storeId: string; blogId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 })
    }

    if (!params.blogId) {
      return new NextResponse("Blog ID is required", { status: 400 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 })
    }

    const blog = await prismadb.blog.delete({
      where: {
        id: params.blogId,
      },
    })

    return NextResponse.json(blog)
  } catch (error) {
    console.log("[BLOG_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
