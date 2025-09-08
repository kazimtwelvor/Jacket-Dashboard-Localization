"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash, MoreHorizontal } from "lucide-react"
import type { SizeColumn } from "./columns"
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

interface SizeCardProps {
  size: SizeColumn
  onClick: () => void
}

export const SizeCard: React.FC<SizeCardProps> = ({ size, onClick }) => {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/${params.storeId}/sizes/${size.id}`)
      router.refresh()
      toast.success("Size deleted successfully.")
    } catch {
      toast.error("Make sure you removed all products using this size first.")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/${params.storeId}/sizes/${size.id}`)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen(true)
  }

  const isCommonSize = ["S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL"].includes(size.value)

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
      <Card
        className="overflow-hidden hover:shadow-md transition-all cursor-pointer group border-2 border-transparent hover:border-primary/20"
        onClick={onClick}
      >
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">{size.name}</CardTitle>
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
          <div className="w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
            <span className="text-3xl font-bold">{size.value}</span>
          </div>
          <div className="text-sm text-muted-foreground">{isCommonSize ? "Common Size" : "Special Size"}</div>
        </CardContent>
        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">Created on {size.createdAt}</CardFooter>
      </Card>
    </>
  )
}
