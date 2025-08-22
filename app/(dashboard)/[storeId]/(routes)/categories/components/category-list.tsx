"use client"

import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { MoreHorizontal, Edit, Trash2, Eye, CheckCircle2, XCircle, ShoppingBag } from "lucide-react"
import type { CategoryColumn } from "./columns"

interface CategoryListProps {
  data: CategoryColumn[]
  onSelect: (category: CategoryColumn) => void
  selectedItems: string[]
  onToggleSelect: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export const CategoryList = ({
  data,
  onSelect,
  selectedItems,
  onToggleSelect,
  onEdit,
  onDelete,
}: CategoryListProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedItems.length > 0 && selectedItems.length === data.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onToggleSelect(data.map((item) => item.id).join(","))
                  } else {
                    onToggleSelect(data.map((item) => item.id).join(","))
                  }
                }}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Billboard</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((category) => (
            <TableRow
              key={category.id}
              className={`cursor-pointer ${selectedItems.includes(category.id) ? "bg-muted/50" : ""}`}
              onClick={() => onSelect(category)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedItems.includes(category.id)}
                  onCheckedChange={() => onToggleSelect(category.id)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  {category.imageUrl ? (
                    <div className="relative h-10 w-10 rounded-md overflow-hidden">
                      <Image
                        src={category.imageUrl || "/placeholder.svg?height=40&width=40"}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center">
                      <span className="text-xs font-medium">{category.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{category.name}</p>
                    {category.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{category.description}</p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {category.billboardLabel ? (
                  <Badge variant="outline" className="font-normal">
                    {category.billboardLabel}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">None</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={category.productCount > 0 ? "default" : "outline"}
                  className="font-normal flex items-center w-fit gap-1"
                >
                  <ShoppingBag className="h-3 w-3" />
                  {category.productCount}
                </Badge>
              </TableCell>
              <TableCell>
                {category.isActive !== false ? (
                  <Badge className="font-normal flex items-center gap-1 w-fit bg-green-500/10 text-green-600 border-green-200">
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="font-normal flex items-center gap-1 w-fit">
                    <XCircle className="h-3 w-3" />
                    Inactive
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm">{category.createdAt}</span>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
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
                    <DropdownMenuItem
                      onClick={() => onDelete(category.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Category
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
