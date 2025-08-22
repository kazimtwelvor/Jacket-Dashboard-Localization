"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface ColorCreateButtonProps {
  onClick: () => void
}

export const ColorCreateButton = ({ onClick }: ColorCreateButtonProps) => {
  return (
    <Button onClick={onClick}>
      <Plus className="h-4 w-4 mr-2" />
      New Color
    </Button>
  )
}
