"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Copy, Archive, RotateCcw, Star, Trash, CheckCircle, XCircle } from "lucide-react"
import { toast } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { AlertModal } from "@/components/modals/alert-modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { bulkDeleteProducts, bulkUpdateProducts, bulkDuplicateProducts } from "../actions/bulk-actions"

interface ProductBulkActionsProps {
  selectedIds: string[]
  storeId: string
  onActionComplete?: () => void
}

export const ProductBulkActions = ({ selectedIds, storeId, onActionComplete }: ProductBulkActionsProps) => {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // Direct API call for bulk delete
  const handleBulkDelete = async () => {
    try {
      setLoading(true)

      // Use the server action instead of direct API call
      const result = await bulkDeleteProducts(selectedIds, storeId)

      if (result.success) {
        router.refresh()
        toast.success(`${selectedIds.length} products deleted`)
        if (onActionComplete) onActionComplete()
      } else {
        throw new Error("Failed to delete products")
      }
    } catch (error) {
      console.error("Error deleting products:", error)
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  const handleBulkUpdate = async (data: { [key: string]: any }) => {
    try {
      setLoading(true)

      // Use the server action instead of direct API call
      const result = await bulkUpdateProducts(selectedIds, storeId, data)

      if (result.success) {
        router.refresh()
        toast.success(`${selectedIds.length} products updated`)
        if (onActionComplete) onActionComplete()
      } else {
        throw new Error("Failed to update products")
      }
    } catch (error) {
      console.error("Error updating products:", error)
      toast.error("Failed to update products")
    } finally {
      setLoading(false)
    }
  }

  const handleBulkDuplicate = async () => {
    try {
      setLoading(true)

      // Use the server action instead of direct API call
      const result = await bulkDuplicateProducts(selectedIds, storeId)

      if (result.success) {
        router.refresh()
        toast.success(`${selectedIds.length} products duplicated`)
        if (onActionComplete) onActionComplete()
      } else {
        throw new Error("Failed to duplicate products")
      }
    } catch (error) {
      console.error("Error duplicating products:", error)
      toast.error("Failed to duplicate products")
    } finally {
      setLoading(false)
    }
  }

  if (selectedIds.length === 0) {
    return null
  }

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={handleBulkDelete} loading={loading} />
      <div className="flex items-center gap-2 bg-muted p-2 rounded-md mb-4">
        <span className="text-sm font-medium">
          {selectedIds.length} {selectedIds.length === 1 ? "product" : "products"} selected
        </span>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={loading}>
                {loading ? "Processing..." : "Bulk Actions"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Status Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleBulkUpdate({ isPublished: true })}>
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Publish
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkUpdate({ isPublished: false })}>
                <XCircle className="mr-2 h-4 w-4 text-gray-500" />
                Unpublish
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkUpdate({ isArchived: true })}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkUpdate({ isArchived: false })}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Unarchive
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Product Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleBulkUpdate({ isFeatured: true })}>
                <Star className="mr-2 h-4 w-4 text-yellow-500" />
                Mark as Featured
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkUpdate({ isFeatured: false })}>
                <Star className="mr-2 h-4 w-4" />
                Remove Featured
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBulkDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => setOpen(true)} className="text-destructive">
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (onActionComplete) onActionComplete()
              router.refresh()
            }}
            className="ml-2"
          >
            Clear Selection
          </Button>
        </div>
      </div>
    </>
  )
}
