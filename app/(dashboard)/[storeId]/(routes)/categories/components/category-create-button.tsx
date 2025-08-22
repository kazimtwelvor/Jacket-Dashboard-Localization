"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface CategoryCreateButtonProps {
  onClick: () => void
}

export const CategoryCreateButton = ({ onClick }: CategoryCreateButtonProps) => {
  return (
    <Button onClick={onClick}>
      <Plus className="h-4 w-4 mr-2" />
      New Category
    </Button>
  )
}
