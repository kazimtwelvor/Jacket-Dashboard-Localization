"use client"

import { useState } from "react"
import { Copy, Edit, MoreHorizontal, Trash, Eye } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@clerk/nextjs"
import { useRouter, useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CellActionProps {
  data: any
  type: "contact" | "newsletter"
}

export const CellAction: React.FC<CellActionProps> = ({ data, type }) => {
  const [loading, setLoading] = useState(false)
  const { sessionClaims } = useAuth()
  const router = useRouter()
  const params = useParams()
  
  const onConfirm = async () => {
    try {
      setLoading(true)
      const formType = type === "contact" ? "contact-forms" : "newsletter-forms"
      const response = await fetch(`/api/${params.storeId}/forms/${formType}/${data.id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        toast.success(`${type} form deleted.`)
        window.location.reload()
      } else {
        toast.error("Failed to delete form.")
      }
    } catch (error) {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id)
    toast.success("Form ID copied to clipboard.")
  }

  const onView = () => {
    const formType = type === "contact" ? "contact-us" : "newsletter"
    router.push(`/${params.storeId}/forms/${formType}/${data.id}/view`)
  }

  const onEdit = () => {
    const formType = type === "contact" ? "contact-us" : "newsletter"
    router.push(`/${params.storeId}/forms/${formType}/${data.id}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onCopy(data.id)}>
          <Copy className="mr-2 h-4 w-4" />
          Copy ID
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onView}>
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onConfirm} disabled={loading}>
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}