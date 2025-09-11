"use client"

import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"

import { columns, VoucherColumn } from "./columns"

interface VouchersClientProps {
  data: VoucherColumn[]
}

export const VouchersClient: React.FC<VouchersClientProps> = ({ data }) => {
  const params = useParams()
  const router = useRouter()

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Vouchers (${data.length})`} description="Manage vouchers for your store" />
        <Button onClick={() => router.push(`/${params.storeId}/vouchers/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="code" columns={columns} data={data} />
    </>
  )
}