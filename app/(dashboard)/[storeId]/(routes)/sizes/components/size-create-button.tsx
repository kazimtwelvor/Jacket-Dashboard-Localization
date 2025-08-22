"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface SizeCreateButtonProps {
  onClick: () => void
}

export const SizeCreateButton = ({ onClick }: SizeCreateButtonProps) => {
  return (
    <Button onClick={onClick}>
      <Plus className="h-4 w-4 mr-2" />
      New Size
    </Button>
  )
}
