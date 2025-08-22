"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tag, MoreHorizontal, Edit, Trash2, Eye, ShoppingBag, CheckCircle2, XCircle, Calendar } from "lucide-react"
import type { CategoryColumn } from "./columns"

interface CategoryGridProps {
  data: CategoryColumn[]
  onSelect: (category: CategoryColumn) => void
  selectedItems: string[]
  onToggleSelect: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export const CategoryGrid = ({
  data,
  onSelect,
  selectedItems,
  onToggleSelect,
  onEdit,
  onDelete,
}: CategoryGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {data.map((category) => (
        <CategoryGridItem
          key={category.id}
          category={category}
          onSelect={onSelect}
          isSelected={selectedItems.includes(category.id)}
          onToggleSelect={onToggleSelect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

interface CategoryGridItemProps {
  category: CategoryColumn
  onSelect: (category: CategoryColumn) => void
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

const CategoryGridItem = ({
  category,
  onSelect,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
}: CategoryGridItemProps) => {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger selection when clicking on dropdown or checkbox
    if ((e.target as HTMLElement).closest('[data-no-select="true"]')) {
      return
    }
    onSelect(category)
  }

  return (
    <Card
      className={`
        overflow-hidden transition-all cursor-pointer group relative
        ${isSelected ? "ring-2 ring-primary" : "hover:border-primary/20"}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="absolute top-2 left-2 z-10" data-no-select="true">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(category.id)}
          className="h-5 w-5 bg-background/80 backdrop-blur-sm border-muted-foreground/30"
        />
      </div>

      <div className="absolute top-2 right-2 z-10" data-no-select="true">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onSelect(category)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(category.id)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Category
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(category.id)} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Category
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl || "/placeholder.svg?height=200&width=300"}
            alt={category.name}
            fill
            className={`
              object-cover 
              ${isHovered ? "scale-105" : "scale-100"} 
              transition-transform duration-300
            `}
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-secondary/50">
            <Tag className="h-10 w-10 text-muted-foreground opacity-50 mb-2" />
            <span className="text-muted-foreground">{category.name}</span>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute bottom-2 left-2">
          {category.isActive !== false ? (
            <Badge className="flex items-center gap-1 bg-green-500/80 text-white backdrop-blur-sm">
              <CheckCircle2 className="h-3 w-3" />
              Active
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1 bg-secondary/80 backdrop-blur-sm">
              <XCircle className="h-3 w-3" />
              Inactive
            </Badge>
          )}
        </div>

        {/* Product count badge */}
        <div className="absolute bottom-2 right-2">
          <Badge variant={category.productCount > 0 ? "default" : "outline"} className="bg-primary/80 backdrop-blur-sm">
            <ShoppingBag className="h-3 w-3 mr-1" />
            {category.productCount}
          </Badge>
        </div>
      </div>

      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold line-clamp-1">{category.name}</h3>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 text-sm text-muted-foreground">
        {category.billboardLabel ? (
          <div className="flex items-center">
            <span className="truncate">{category.billboardLabel}</span>
          </div>
        ) : (
          <span className="italic text-muted-foreground/70">No billboard</span>
        )}

        <div className="flex items-center mt-1 text-xs">
          <Calendar className="h-3 w-3 mr-1 text-muted-foreground/70" />
          <span>{category.createdAt}</span>
        </div>
      </CardContent>

      {category.featuredProducts && category.featuredProducts.length > 0 && (
        <CardFooter className="p-4 pt-0 flex gap-2">
          <div className="flex -space-x-2 overflow-hidden">
            {category.featuredProducts.slice(0, 3).map((product, index) => (
              <div
                key={index}
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
  )
}
