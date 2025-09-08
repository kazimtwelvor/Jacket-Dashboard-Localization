import prismadb from "@/lib/prismadb"

import { BlogForm } from "./components/blog-form"

const BlogPage = async ({ params }: { params: { blogId: string } }) => {
  const blog = await prismadb.blog.findUnique({
    where: {
      id: params.blogId,
    },
  })

  let transformedBlog = null

  if (blog) {
    const content = blog.content as any

    transformedBlog = {
      id: blog.id,
      title: content.metadata?.title || content.hero?.title || "",
      slug: content.metadata?.slug || "",
      subtitle: content.metadata?.subtitle || "",
      bannerImage: content.hero?.bannerImage || "",
      content: content.mainContent?.content || "",
      isPublished: content.metadata?.isPublished || false,
      author: content.hero?.author || "",
      date: content.hero?.date || "",
      category: content.hero?.category || "",
      readTime: content.hero?.readTime || "",
      socialLinks: content.hero?.socialLinks || {},
      contentSection: content.contentSection || {},
      guideContent: {
        title: content.guideContent?.title || "",
        steps:
          content.guideContent?.steps?.map((step: any) => {
            const { id, ...stepWithoutId } = step
            return stepWithoutId
          }) || [],
        keyTakeaways: content.guideContent?.keyTakeaways || {},
      },
    }
  }

  return <BlogForm initialData={transformedBlog} />
}

export default BlogPage
