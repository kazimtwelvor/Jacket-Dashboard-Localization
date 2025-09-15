import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"
import { checkApiPermission } from "@/lib/api-permissions"
import { Permission } from "@/types/permissions"

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

    const permissionCheck = await checkApiPermission(params.storeId, Permission.EDIT_BLOGS, 'PATCH')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to edit blogs.", { status: 403 })
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

  

    if (existingBlogByTitle) {
      return new NextResponse("Title already exists", { status: 400 })
    }



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

          const problematicSteps = [7, 8, 9, 10, 11, 12, 15, 16, 17] 

          if (Array.isArray(step.images)) {
            processedStep.images = step.images.map((img: string) => {
              if (img && img !== "undefined" && !img.startsWith("guideContent.steps.")) {
                return img
              }
              return ""
            })

            if (problematicSteps.includes(index)) {
            }
          } else if (problematicSteps.includes(index)) {
            processedStep.images = []
          }

          switch (index) {
            case 7: 
              processedStep.cardTitles = step.cardTitles || ["Social Media", "Email Marketing", "Content Syndication"]
              processedStep.cardDescriptions = step.cardDescriptions || [
                "Reach your audience where they are",
                "Direct to inbox, direct to conversion",
                "Expand your reach",
              ]
              break
            case 8: 
              if (!processedStep.image && processedStep.images && processedStep.images[0]) {
                processedStep.image = processedStep.images[0]
              }
              break
            case 9:
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
            case 10: 
              if (!processedStep.image && processedStep.images && processedStep.images[0]) {
                processedStep.image = processedStep.images[0]
              }
              break
            case 11: 
              processedStep.imageLabels = step.imageLabels || [
                "Brand Storytelling",
                "Data Visualization",
                "Infographics",
                "Motion Graphics",
                "Photography",
              ]
              break
            case 12: 
              processedStep.cardTitles = step.cardTitles || ["Before Optimization", "After Optimization"]
              processedStep.metrics = step.metrics || {
                before: ["Low engagement rate (1.2%)", "High bounce rate (78%)", "Poor conversion (0.5%)"],
                after: ["High engagement rate (4.8%)", "Low bounce rate (32%)", "Strong conversion (2.7%)"],
              }
              break
            case 15:
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
            case 16: 
              processedStep.metrics = step.metrics || {
                titles: ["Traffic", "Engagement", "Conversions"],
                values: ["+24%", "+18%", "+32%"],
              }
              break
            case 17: 
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
              if (step.cardTitles) {
                processedStep.cardTitles = step.cardTitles
              }
              if (step.cardDescriptions) {
                processedStep.cardDescriptions = step.cardDescriptions
              }
              if (step.imageLabels) {
                processedStep.imageLabels = step.imageLabels
              }
              Object.keys(step).forEach((key) => {
                if (!processedStep[key] && key !== "id") {
                  processedStep[key] = step[key]
                }
              })
          }

          return processedStep
        }) || []

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

    const permissionCheck = await checkApiPermission(params.storeId, Permission.DELETE_BLOGS, 'DELETE')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to delete blogs.", { status: 403 })
    }

    const blog = await prismadb.blog.delete({
      where: {
        id: params.blogId,
      },
    })

    return NextResponse.json(blog)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
