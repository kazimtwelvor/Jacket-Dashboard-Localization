"use client"

import type React from "react"

import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { ApiList } from "@/components/ui/api-list"

import { columns, type BlogColumn } from "./columns"

interface BlogClientProps {
  data: BlogColumn[]
}

export const BlogClient: React.FC<BlogClientProps> = ({ data }) => {
  const router = useRouter()
  const params = useParams()

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Blogs (${data.length})`} description="Manage blogs for your store" />
        <Button onClick={() => router.push(`/${params.storeId}/blog/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="title" columns={columns} data={data} />
      <Heading title="API" description="API calls for Blogs" />
      <Separator />
      <ApiList entityName="blog" entityIdName="blogId" />
    </>
  )
}
