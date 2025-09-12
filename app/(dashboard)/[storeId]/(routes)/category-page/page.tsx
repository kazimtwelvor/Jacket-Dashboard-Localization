"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Plus, Filter } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./components/columns"
import { ApiCallsSection } from "./components/api-calls-section"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from "axios"
import { toast } from "react-hot-toast"

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [categoryPages, setCategoryPages] = useState([])
  const [bestFilter, setBestFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [accessVerified, setAccessVerified] = useState(false)


  useEffect(() => {
    const checkAccess = async () => {
      try {
        const storeAdminResponse = await axios.get(`/api/${params?.storeId}/check-store-admin`)
        const isStoreAdmin = storeAdminResponse?.data?.isStoreAdmin
        const storeResponse = await axios.get(`/api/${params?.storeId}/store-access`)
        const isOwner = storeResponse?.data?.isOwner
        console.log(isStoreAdmin + "SA", isOwner + "O")
        if (!isStoreAdmin && !isOwner) {
          router.push('/unauthorized')
          return
        }

        setAccessVerified(true)
      } catch (error) {
        console.error('Access check failed:', error)
        router.push('/unauthorized')
        return
      }
    }

    checkAccess()
  }, [params?.storeId, router])

  useEffect(() => {
    if (!accessVerified) return

    const fetchCategoryPages = async () => {
      try {
        setLoading(true)
        let url = `/api/${params?.storeId}/category-pages`
        const params_array = ["includeAll=true"]

        if (bestFilter === "best") {
          params_array.push("isBest=true")
        } else if (bestFilter === "regular") {
          params_array.push("isBest=false")
        }

        if (statusFilter === "draft") {
          params_array.push("status=DRAFT")
        } else if (statusFilter === "published") {
          params_array.push("status=PUBLISHED")
        }

        url += "?" + params_array.join("&")

        const response = await axios.get(url)
        setCategoryPages(response.data)
      } catch (error) {
        toast.error("Failed to load category pages")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryPages()
  }, [params?.storeId, bestFilter, statusFilter, accessVerified])

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title={`Category Pages (${categoryPages.length})`}
            description="Manage your category pages"
          />
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => router.push(`/${params?.storeId}/category-page/new`)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </div>
        </div>
        <Separator />
        {loading ? (
          <div>Loading category pages...</div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={categoryPages}
              searchKey="name"
            />
            <ApiCallsSection />
          </>
        )}
      </div>
    </div>
  )
}