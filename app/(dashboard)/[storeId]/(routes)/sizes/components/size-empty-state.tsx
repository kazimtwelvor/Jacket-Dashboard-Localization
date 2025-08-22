"use client"

import { Button } from "@/components/ui/button"
import { FileQuestion, RefreshCw, PlusCircle, Search } from "lucide-react"

interface SizeEmptyStateProps {
  searchQuery?: string
  onReset: () => void
  onCreate: () => void
}

export const SizeEmptyState = ({ searchQuery, onReset, onCreate }: SizeEmptyStateProps) => {
  if (searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium">No sizes found</h3>
        <p className="text-muted-foreground mt-1 mb-4 max-w-md">
          No sizes match your search for "{searchQuery}". Try a different search term or clear your filters.
        </p>
        <Button onClick={onReset}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileQuestion className="h-12 w-12 text-muted-foreground/30 mb-4" />
      <h3 className="text-lg font-medium">No sizes yet</h3>
      <p className="text-muted-foreground mt-1 mb-4 max-w-md">
        You haven't created any sizes yet. Sizes help you categorize your products by their dimensions.
      </p>
      <Button onClick={onCreate}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Create Your First Size
      </Button>
    </div>
  )
}
