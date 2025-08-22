"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, ChevronDown, Trash2, X } from "lucide-react"

interface CategoryBulkActionsProps {
  selectedCount: number
  onDelete: () => void
  onSelectAll: () => void
  onClearSelection: () => void
  allSelected: boolean
}

export const CategoryBulkActions = ({
  selectedCount,
  onDelete,
  onSelectAll,
  onClearSelection,
  allSelected,
}: CategoryBulkActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="rounded-md">
        {selectedCount} selected
      </Badge>

      <Button variant="outline" size="sm" onClick={onClearSelection}>
        <X className="h-4 w-4 mr-1" />
        Clear
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Actions
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={onSelectAll}>
            <CheckSquare className="h-4 w-4 mr-2" />
            {allSelected ? "Deselect All" : "Select All"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
