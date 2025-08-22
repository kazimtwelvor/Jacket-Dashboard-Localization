"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"

export type PageColumn = {
  id: string
  title: string
  slug: string
  isPublished: boolean
  createdAt: string
}

export const columns: ColumnDef<PageColumn>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "isPublished",
    header: "Published",
    cell: ({ row }) => (
      <div className="flex items-center">
        {row.original.isPublished ? (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Published</span>
        ) : (
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Draft</span>
        )}
      </div>
    ),
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
