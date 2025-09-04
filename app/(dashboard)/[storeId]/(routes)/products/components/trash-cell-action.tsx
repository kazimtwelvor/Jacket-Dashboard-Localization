"use client"

import type React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { Trash2, RotateCcw, MoreHorizontal } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Checkbox } from "@/components/ui/checkbox"

import type { TrashProductColumn } from "./trash-columns"

interface TrashCellActionProps {
  data: TrashProductColumn
}

export const TrashCellAction: React.FC<TrashCellActionProps> = ({ data }) => {
  const router = useRouter()
  const params = useParams()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteImages, setDeleteImages] = useState(false)

  const onRestore = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/${params?.storeId}/products/${data.id}/restore`, {
        method: "PATCH",
      })

      if (!response.ok) {
        throw new Error("Failed to restore product")
      }

      router.refresh()
      toast.success("Product restored.")
    } catch (error) {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/${params?.storeId}/products/${data.id}/permanent?deleteImages=${deleteImages}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to permanently delete product")
      }

      router.refresh()
      toast.success("Product permanently deleted.")
    } catch (error) {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
      setOpen(false)
      setDeleteImages(false)
    }
  }

  return (
    <>
      <Modal
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently delete this product from your store."
        isOpen={open}
        onClose={() => setOpen(false)}
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="delete-images"
              checked={deleteImages}
              onCheckedChange={(checked) => setDeleteImages(checked as boolean)}
            />
            <label htmlFor="delete-images" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Do you want to delete the images as well?
            </label>
          </div>
          <div className="flex items-center justify-end w-full pt-6 space-x-2">
            <Button disabled={loading} variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={loading} variant="destructive" onClick={onDelete}>
              Continue
            </Button>
          </div>
        </div>
      </Modal>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={onRestore} disabled={loading}>
            <RotateCcw className="mr-2 h-4 w-4" /> Restore
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setOpen(true)}
            disabled={loading}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
