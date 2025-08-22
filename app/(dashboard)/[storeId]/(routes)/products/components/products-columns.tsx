import type { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"
import { User } from "lucide-react"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type ProductColumn = {
  id: string
  name: string
  price: string
  isFeatured: boolean
  isArchived: boolean
  size: string
  color: string
  category: string
  createdAt: string
  createdByName: string
}

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "isArchived",
    header: "Archived",
  },
  {
    accessorKey: "isFeatured",
    header: "Featured",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "size",
    header: "Size",
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        {row.original.color}
        <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: row.original.color }} />
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    accessorKey: "createdByName",
    header: "Created By",
    cell: ({ row }) => {
      const createdBy = row.original.createdByName || "Unknown"
      return (
        <div className="flex items-center">
          <User className="h-4 w-4 text-muted-foreground mr-2" />
          <span className="text-sm">{createdBy}</span>
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
]
