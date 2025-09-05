"use client"

import type React from "react"

import { useState } from "react"
import { Copy, Edit, MoreHorizontal, Trash, Clipboard } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import axios from "axios"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { AlertModal } from "@/components/modals/alert-modal"

import type { ProductColumn } from "../types"

interface ProductsColumnActionsProps {
  data: ProductColumn
}

export const ProductsColumnActions: React.FC<ProductsColumnActionsProps> = ({ data }) => {
  const router = useRouter()
  const params = useParams()

  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id)
    toast.success("Product ID copied to clipboard.")
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/${params?.storeId}/products/${data.id}`)
      router.refresh()
      toast.success("Product deleted.")
    } catch (error) {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  const onDuplicate = async () => {
    try {
      setLoading(true)
      const response = await axios.post(`/api/${params?.storeId}/products/${data.id}/duplicate`)
      router.refresh()
      toast.success("Product duplicated successfully.")

      if (response.data?.id) {
        router.push(`/${params?.storeId}/products/${response.data.id}`)
      }
    } catch (error) {
      console.error("Error duplicating product:", error)
      toast.error("Failed to duplicate product.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push(`/${params?.storeId}/products/${data.id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDuplicate}>
            <Clipboard className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCopy(data.id)}>
            <Copy className="mr-2 h-4 w-4" />
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
