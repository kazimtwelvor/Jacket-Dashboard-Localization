"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import type { ColorColumn } from "./columns"

interface ColorListProps {
  data: ColorColumn[]
  onSelect: (color: ColorColumn) => void
  selectedItems: string[]
  onToggleSelect: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export const ColorList = ({ data, onSelect, selectedItems, onToggleSelect, onEdit, onDelete }: ColorListProps) => {
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
            <TableHead>Value</TableHead>
            <TableHead>Preview</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((color) => (
            <TableRow
              key={color.id}
              className={`cursor-pointer ${selectedItems.includes(color.id) ? "bg-muted/50" : ""}`}
              onClick={() => onSelect(color)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox checked={selectedItems.includes(color.id)} onCheckedChange={() => onToggleSelect(color.id)} />
              </TableCell>
              <TableCell>
                <div className="font-medium">{color.name}</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{color.value}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: color.value }}></div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{color.createdAt}</span>
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
                    <DropdownMenuItem onClick={() => onSelect(color)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(color.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Color
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(color.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Color
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
