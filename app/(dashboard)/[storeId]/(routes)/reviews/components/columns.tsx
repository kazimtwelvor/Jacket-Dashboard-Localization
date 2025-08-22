"use client"
import type { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

export type ReviewColumn = {
  id: string
  productName: string
  userName: string
  rating: number
  title: string
  comment: string
  isApproved: boolean
  createdAt: string
}

export const columns: ColumnDef<ReviewColumn>[] = [
  {
    accessorKey: "productName",
    header: "Product",
  },
  {
    accessorKey: "userName",
    header: "Customer",
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number
      return (
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
          ))}
          <span className="ml-2">{rating}/5</span>
        </div>
      )
    },
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "comment",
    header: "Comment",
    cell: ({ row }) => {
      const comment = row.getValue("comment") as string
      return <div className="max-w-[200px] truncate">{comment}</div>
    },
  },
  {
    accessorKey: "isApproved",
    header: "Status",
    cell: ({ row }) => {
      const isApproved = row.getValue("isApproved") as boolean
      return <Badge variant={isApproved ? "success" : "destructive"}>{isApproved ? "Approved" : "Pending"}</Badge>
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
]
