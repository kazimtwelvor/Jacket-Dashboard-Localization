import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"
import { checkApiPermission } from "@/lib/api-permissions"
import { Permission } from "@/types/permissions"

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
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

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    const permissionCheck = await checkApiPermission(params.storeId, Permission.CREATE_BLOGS, 'POST')
    if (permissionCheck.error) {
      return permissionCheck.error
    }
    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied. You don't have permission to create blogs.", { status: 403 })
    }

    const existingBlogsBySlug = await prismadb.blog.findMany({
      where: {
        storeId: params.storeId,
        content: {
          path: ["metadata", "slug"],
          equals: body.slug,
        },
      },
      include: {
        blogCountries: true
      }
    })

    for (const existingBlog of existingBlogsBySlug) {
      const existingCountryIds = existingBlog.blogCountries.map(bc => bc.countryId)
      const newCountryId = body.countryId
      
      if (newCountryId && existingCountryIds.includes(newCountryId)) {
        return new NextResponse(`A blog with slug "${body.slug}" already exists for the selected country. Please use a different slug.`, { status: 400 })
      }
    }

    const trimmedTitle = body.title.trim()
    const allBlogs = await prismadb.blog.findMany({
      where: {
        storeId: params.storeId,
      },
      select: {
        id: true,
        content: true,
        blogCountries: true
      },
    })

    const existingBlogByTitle = allBlogs.find((blog) => {
      const content = blog.content as any
      const blogTitle = content?.metadata?.title
      const titleMatches = blogTitle && blogTitle.toLowerCase().trim() === trimmedTitle.toLowerCase()
      
      if (titleMatches) {
        const existingCountryIds = blog.blogCountries.map(bc => bc.countryId)
        const newCountryId = body.countryId
        
        if (newCountryId && existingCountryIds.includes(newCountryId)) {
          return true
        }
      }
      
      return false
    })

    if (existingBlogByTitle) {
      return new NextResponse(`A blog with title "${trimmedTitle}" already exists for the selected country. Please use a different title.`, { status: 400 })
    }

    const processedSteps =
      body.guideContent?.steps?.map((step: any, index: number) => {
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

        switch (index) {
          case 9: 
            processedStep.cards = step.cards || [
              { title: "Interactive Quizzes", description: "Engage and qualify leads" },
              { title: "ROI Calculators", description: "Demonstrate value clearly" },
              { title: "Interactive Infographics", description: "Visualize complex data" },
            ]
            break
          case 12: 
            processedStep.cardTitles = step.cardTitles || ["Before Optimization", "After Optimization"]
            processedStep.metrics = step.metrics || {
              before: ["Low engagement rate (1.2%)", "High bounce rate (78%)", "Poor conversion (0.5%)"],
              after: ["High engagement rate (4.8%)", "Low bounce rate (32%)", "Strong conversion (2.7%)"],
            }
            break
          case 14: 
            processedStep.images = step.images || ["", "", "", ""]
            processedStep.cardTitles = step.cardTitles || [
              "Content Inventory",
              "Performance Analysis",
              "Gap Analysis",
              "Recommendations",
            ]
            processedStep.cardDescriptions = step.cardDescriptions || [
              "Catalog and organize all your existing content assets",
              "Evaluate content performance against key metrics",
              "Identify missing content opportunities in your strategy",
              "Actionable insights to improve your content strategy",
            ]
            break
          case 15:
            processedStep.timelineItems = step.timelineItems || [
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
            ]
            break
          case 16:
            processedStep.metrics = step.metrics || {
              traffic: "+24%",
              engagement: "+18%",
              conversions: "+32%",
            }
            processedStep.smallImages = step.smallImages || {
              conversionMetrics: "",
              trafficAnalytics: "",
            }
            break
          case 17:
            processedStep.caseStudies = step.caseStudies || [
              {
                title: "E-commerce Content Strategy",
                tag: "E-commerce",
                description: "Increased organic traffic by 156% in 6 months",
                image: "",
              },
              {
                title: "SaaS Blog Strategy",
                description: "",
                image: "",
              },
              {
                title: "Healthcare Content",
                description: "",
                image: "",
              },
              {
                title: "Travel Blog",
                description: "",
                image: "",
              },
              {
                title: "Financial Services",
                description: "",
                image: "",
              },
              {
                title: "Food & Beverage Campaign",
                description: "Seasonal recipe content strategy",
                image: "",
              },
            ]
            processedStep.buttonText = step.buttonText || "View All Case Studies"
            break
          default:
            if (step.images) {
              processedStep.images = step.images
            }
            if (step.cardTitles) {
              processedStep.cardTitles = step.cardTitles
            }
            if (step.cardDescriptions) {
              processedStep.cardDescriptions = step.cardDescriptions
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
        keyTakeaways: {
          id: "section-4",
          title: body.guideContent?.keyTakeaways?.title || "Key Takeaways",
          isActive: body.guideContent?.keyTakeaways?.isActive !== false,
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
      },
    }

    const blog = await prismadb.blog.create({
      data: {
        storeId: params.storeId,
        content: contentJson,
        blogCountries: body.countryId ? {
          create: {
            countryId: body.countryId
          }
        } : undefined
      },
    })

    return NextResponse.json(blog)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const cn = searchParams.get("cn")

    let whereClause: any = {
      storeId: params.storeId,
    }

    if (cn) {
      const country = await prismadb.country.findUnique({
        where: { countryCode: cn.toLowerCase() }
      })
      if (country) {
        console.log(`[BLOG_GET] STRICT filtering by country: ${country.name} (${country.countryCode})`)
        // STRICT: Show ONLY blogs explicitly assigned to this country
        whereClause.blogCountries = {
          some: {
            countryId: country.id
          }
        }
      }
    }

    const blogs = await prismadb.blog.findMany({
      where: whereClause,
      include: {
        blogCountries: {
          include: {
            country: true
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const formattedBlogs = blogs.map((blog) => {
      const content = blog.content as any
      return {
        id: blog.id,
        title: content.metadata?.title || "Untitled",
        slug: content.metadata?.slug || "",
        isPublished: content.metadata?.isPublished || false,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
      }
    })

    return NextResponse.json(formattedBlogs)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}
