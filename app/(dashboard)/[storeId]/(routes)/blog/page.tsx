import { format } from "date-fns"

import prismadb from "@/lib/prismadb"
import { BlogClient } from "./components/client"

const BlogsPage = async ({ params }: { params: { storeId: string } }) => {
  const blogs = await prismadb.blog.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Transform the data to match the expected format in columns.tsx
  const formattedBlogs = blogs.map((item) => ({
    id: item.id,
    title: item.content.metadata?.title || "Untitled",
    slug: item.content.metadata?.slug || "",
    isPublished: item.content.metadata?.isPublished || false,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BlogClient data={formattedBlogs} />
      </div>
    </div>
  )
}

export default BlogsPage
