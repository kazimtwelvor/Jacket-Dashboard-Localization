"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash, MoreHorizontal } from "lucide-react"
import type { ColorColumn } from "./columns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertModal } from "@/components/modals/alert-modal"
import { toast } from "react-hot-toast"
import axios from "axios"
import { ColorDisplay } from "@/components/ui/color-display"

interface ColorCardProps {
  color: ColorColumn
  onClick: () => void
}

export const ColorCard: React.FC<ColorCardProps> = ({ color, onClick }) => {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/${params?.storeId}/colors/${color.id}`)
      router.refresh()
      toast.success("Color deleted successfully.")
    } catch {
      toast.error("Make sure you removed all products using this color first.")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/${params?.storeId}/colors/${color.id}`)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen(true)
  }

  const isLightColor = (hexColor: string) => {
    hexColor = hexColor.replace("#", "")

    const r = Number.parseInt(hexColor.substr(0, 2), 16)
    const g = Number.parseInt(hexColor.substr(2, 2), 16)
    const b = Number.parseInt(hexColor.substr(4, 2), 16)

    const brightness = (r * 299 + g * 587 + b * 114) / 1000

    return brightness > 128
  }

  const isLight = isLightColor(color.value)
  const textColor = isLight ? "text-black" : "text-white"

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
      <Card
        className="overflow-hidden hover:shadow-md transition-all cursor-pointer group border-2 border-transparent hover:border-primary/20"
        onClick={onClick}
      >
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">{color.name}</CardTitle>
            <div className="absolute top-2 right-2 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center mb-4">
            <div className="mb-2">
              <ColorDisplay 
                color1={color.value} 
                color2={color.value2}
                size="lg"
                className="w-24 h-24"
              />
            </div>
            <span className="text-sm font-mono">
              {color.value2 ? `${color.value} + ${color.value2}` : color.value}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {color.value2 ? "Dual Color" : (isLight ? "Light Color" : "Dark Color")}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">Created on {color.createdAt}</CardFooter>
      </Card>
    </>
  )
}
