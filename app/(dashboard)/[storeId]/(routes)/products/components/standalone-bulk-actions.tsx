"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Edit, Copy, Trash2, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { AlertModal } from "@/components/modals/alert-modal"
import { bulkDeleteProducts, bulkDuplicateProducts } from "../actions/bulk-actions"

interface StandaloneBulkActionsProps {
  selectedRows: string[]
  storeId: string
  onClearSelection?: () => void
}

export const StandaloneBulkActions: React.FC<StandaloneBulkActionsProps> = ({
  selectedRows,
  storeId,
  onClearSelection,
}) => {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleBulkEdit = () => {
    if (selectedRows.length === 0) {
      toast.error("Please select at least one product")
      return
    }

    if (!storeId) {
      console.error("Store ID is missing")
      toast.error("Store ID is missing. Please refresh the page and try again.")
      return
    }

    try {
      const url = `/${storeId}/products/bulk-edit?ids=${selectedRows.join(",")}`
      console.log("Navigating to:", url)

      window.location.href = url
    } catch (error) {
      console.error("Navigation error:", error)
      toast.error("Navigation failed. Please try again.")
    }
  }

  const handleBulkDuplicate = async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select at least one product")
      return
    }

    try {
      setIsDuplicating(true)
      await bulkDuplicateProducts(selectedRows, storeId)
      toast.success(`${selectedRows.length} products duplicated`)
      router.refresh()
      if (onClearSelection) onClearSelection()
    } catch (error) {
      console.error("Error duplicating products:", error)
      toast.error("Failed to duplicate products")
    } finally {
      setIsDuplicating(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select at least one product")
      return
    }

    try {
      setIsDeleting(true)
      await bulkDeleteProducts(selectedRows, storeId)
      toast.success(`${selectedRows.length} products moved to trash`)
      router.refresh()
      if (onClearSelection) onClearSelection()
    } catch (error) {
      console.error("Error deleting products:", error)
      toast.error("Failed to delete products")
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <>
      <AlertModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        loading={isDeleting}
      />

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBulkEdit}
          disabled={selectedRows.length === 0}
          className="flex items-center gap-1"
        >
          <Edit className="h-4 w-4 mr-1" />
          <span>Bulk Edit</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleBulkDuplicate}
          disabled={selectedRows.length === 0 || isDuplicating}
          className="flex items-center gap-1"
        >
          {isDuplicating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
          <span>Duplicate</span>
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={selectedRows.length === 0 || isDeleting}
          className="flex items-center gap-1"
        >
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
          <span>Delete</span>
        </Button>
      </div>
    </>
  )
}
