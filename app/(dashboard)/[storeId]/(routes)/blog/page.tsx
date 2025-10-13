"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { format } from "date-fns"
import { BlogClient } from "./components/client"
import { useDashboardCountry } from "@/hooks/use-dashboard-country"
import axios from "axios"
import { toast } from "react-hot-toast"

const BlogsPage = () => {
  const params = useParams()
  const { getCountryCode, selectedCountry } = useDashboardCountry()
  const [blogs, setBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true)
        const countryCode = getCountryCode()
        const url = `/api/${params?.storeId}/blog?cn=${countryCode}`
        
        console.log('[BLOG_CLIENT] Fetching blogs with country:', countryCode)
        
        const response = await axios.get(url)
        const data = response.data

        const formattedBlogs = data.map((item: any) => ({
          id: item.id,
          title: item.title || "Untitled",
          slug: item.slug || "",
          isPublished: item.isPublished || false,
          createdAt: format(new Date(item.createdAt), "MMMM do, yyyy"),
        }))

        setBlogs(formattedBlogs)
      } catch (error) {
        console.error('Failed to fetch blogs:', error)
        toast.error("Failed to load blogs")
      } finally {
        setLoading(false)
      }
    }

    if (params?.storeId) {
      fetchBlogs()
    }
  }, [params?.storeId, selectedCountry?.countryCode])

  if (loading) {
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          Loading blogs...
        </div>
      </div>
    )
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BlogClient data={blogs} />
      </div>
    </div>
  )
}

export default BlogsPage
