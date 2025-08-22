"use client"

import type React from "react"
import { useParams, useRouter } from "next/navigation"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/ui/data-table"
import { ApiList } from "@/components/ui/api-list"
import { columns } from "./columns"

interface PageClientProps {
  data: any[]
}

export const PageClient: React.FC<PageClientProps> = ({ data }) => {
  const router = useRouter()
  const params = useParams()

  return (
    <>
      <div className="rounded-md border">
        <DataTable searchKey="title" columns={columns} data={data} />
      </div>
      <Heading title="API" description="API calls for Pages" />
      <Separator />
      <ApiList entityName="pages" entityIdName="pageId" />
    </>
  )
}
