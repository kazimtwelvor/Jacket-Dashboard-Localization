"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { AlertModal } from "@/components/modals/alert-modal"
import { useStoreAdmin } from "@/hooks/use-store-admin"

interface BulkActionsProps {
  selectedIds: string[]
  onClearSelection: () => void
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedIds,
  onClearSelection,
}) => {
  const params = useParams()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { isStoreAdmin, isLoading } = useStoreAdmin(params.storeId as string)

  console.log('BulkActions - selectedIds:', selectedIds.length, 'isStoreAdmin:', isStoreAdmin, 'isLoading:', isLoading)

  const onBulkDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/${params.storeId}/orders/bulk-delete`, {
        data: { orderIds: selectedIds }
      })
      router.refresh()
      onClearSelection()
      toast.success(`${selectedIds.length} orders deleted successfully`)
    } catch (error) {
      toast.error("Failed to delete orders. Only store owners can perform this action.")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  if (selectedIds.length === 0) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
        <span className="text-sm text-muted-foreground">
          {selectedIds.length} order{selectedIds.length > 1 ? 's' : ''} selected - Checking permissions...
        </span>
      </div>
    )
  }

  if (!isStoreAdmin) {
    return (
      <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
        <span className="text-sm text-muted-foreground">
          {selectedIds.length} order{selectedIds.length > 1 ? 's' : ''} selected - Only store owners can delete orders
        </span>
      </div>
    )
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onBulkDelete}
        loading={loading}
        title={`Delete ${selectedIds.length} orders?`}
        description="This action cannot be undone. This will permanently delete the selected orders and all associated data."
      />
      <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
        <span className="text-sm text-muted-foreground">
          {selectedIds.length} order{selectedIds.length > 1 ? 's' : ''} selected
        </span>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setOpen(true)}
          disabled={loading}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Selected
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearSelection}
        >
          Clear Selection
        </Button>
      </div>
    </>
  )
}