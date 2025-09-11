"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react"
import { toast } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertModal } from "@/components/modals/alert-modal"

import { VoucherColumn } from "./columns"

interface CellActionProps {
  data: VoucherColumn
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter()
  const params = useParams()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const onConfirm = async () => {
    try {
      setLoading(true)
      await fetch(`/api/${params.storeId}/vouchers/${data.id}`, {
        method: "DELETE",
      })
      toast.success("Voucher deleted.")
      router.refresh()
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  const onCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Voucher code copied to clipboard.")
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data.code)}>
            <Copy className="mr-2 h-4 w-4" /> Copy Code
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/${params.storeId}/vouchers/${data.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}