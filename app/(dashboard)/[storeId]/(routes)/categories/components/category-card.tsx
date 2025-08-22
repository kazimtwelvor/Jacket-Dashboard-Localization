"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash, MoreHorizontal, Tag, ShoppingBag } from "lucide-react"
import type { CategoryColumn } from "./columns"
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

interface CategoryCardProps {
  category: CategoryColumn
  onClick: () => void
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/${params.storeId}/categories/${category.id}`)
      router.refresh()
      toast.success("Category deleted successfully.")
    } catch {
      toast.error("Make sure you removed all products using this category first.")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/${params.storeId}/categories/${category.id}`)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen(true)
  }

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
      <Card
        className="overflow-hidden hover:shadow-md transition-all cursor-pointer group border-2 border-transparent hover:border-primary/20"
        onClick={onClick}
      >
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {category.imageUrl ? (
            <Image
              src={category.imageUrl || "/placeholder.svg"}
              alt={category.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-secondary/50">
              <Tag className="h-10 w-10 text-muted-foreground opacity-50 mb-2" />
              <span className="text-muted-foreground ml-2">{category.name}</span>
            </div>
          )}
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
          {category.isActive === false && (
            <div className="absolute top-2 left-2">
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                Inactive
              </Badge>
            </div>
          )}
        </div>
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold line-clamp-1">{category.name}</CardTitle>
            <Badge variant={category.productCount > 0 ? "default" : "outline"} className="ml-2 shrink-0">
              {category.productCount} {category.productCount === 1 ? "product" : "products"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 text-sm text-muted-foreground">
          {category.billboardLabel ? (
            <div className="flex items-center">
              <span className="truncate">{category.billboardLabel}</span>
            </div>
          ) : (
            <span className="italic text-muted-foreground/70">No billboard</span>
          )}
        </CardContent>
        {category.featuredProducts.length > 0 && (
          <CardFooter className="p-4 pt-0 flex gap-2">
            <div className="flex -space-x-2 overflow-hidden">
              {category.featuredProducts.slice(0, 3).map((product) => (
                <div
                  key={product.id}
                  className="relative h-8 w-8 rounded-full overflow-hidden border border-background ring-2 ring-background"
                >
                  {product.image ? (
                    <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full bg-secondary flex items-center justify-center">
                      <ShoppingBag className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {category.productCount > 3 && (
                <div className="relative h-8 w-8 rounded-full bg-secondary flex items-center justify-center border border-background ring-2 ring-background">
                  <span className="text-xs font-medium">+{category.productCount - 3}</span>
                </div>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </>
  )
}
