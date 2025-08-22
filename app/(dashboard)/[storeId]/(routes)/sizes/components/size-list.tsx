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
import type { SizeColumn } from "./columns"

interface SizeListProps {
  data: SizeColumn[]
  onSelect: (size: SizeColumn) => void
  selectedItems: string[]
  onToggleSelect: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export const SizeList = ({ data, onSelect, selectedItems, onToggleSelect, onEdit, onDelete }: SizeListProps) => {
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
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((size) => (
            <TableRow
              key={size.id}
              className={`cursor-pointer ${selectedItems.includes(size.id) ? "bg-muted/50" : ""}`}
              onClick={() => onSelect(size)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox checked={selectedItems.includes(size.id)} onCheckedChange={() => onToggleSelect(size.id)} />
              </TableCell>
              <TableCell>
                <div className="font-medium">{size.name}</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{size.value}</div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{size.createdAt}</span>
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
                    <DropdownMenuItem onClick={() => onSelect(size)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(size.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Size
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(size.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Size
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
