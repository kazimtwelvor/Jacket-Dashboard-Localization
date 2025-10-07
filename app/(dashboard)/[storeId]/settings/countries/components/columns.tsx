"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

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
import { Badge } from "@/components/ui/badge"

export type CountryColumn = {
  id: string
  name: string
  countryCode: string
  currency: string | null
  currencySymbol: string | null
  timezone: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
}

export const columns: ColumnDef<CountryColumn>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => <div className="text-center">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "countryCode",
    header: ({ column }) => {
      return (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Code
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => (
      <div className="text-center">
        <Badge variant="outline">
          {row.getValue("countryCode")}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "currency",
    header: () => <div className="text-center">Currency</div>,
    cell: ({ row }) => {
      const currency = row.getValue("currency") as string | null
      const symbol = row.original.currencySymbol
      return currency ? (
        <div className="flex items-center justify-center gap-2">
          <span>{currency}</span>
          {symbol && <span className="text-muted-foreground">({symbol})</span>}
        </div>
      ) : (
        <div className="text-center text-muted-foreground">-</div>
      )
    },
  },
  {
    accessorKey: "timezone",
    header: () => <div className="text-center">Timezone</div>,
    cell: ({ row }) => {
      const timezone = row.getValue("timezone") as string | null
      return timezone ? (
        <div className="text-center text-sm">{timezone}</div>
      ) : (
        <div className="text-center text-muted-foreground">-</div>
      )
    },
  },
  {
    accessorKey: "isActive",
    header: () => <div className="text-center">Status</div>,
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean
      return (
        <div className="text-center">
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "sortOrder",
    header: ({ column }) => {
      return (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Order
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => <div className="text-center">{row.getValue("sortOrder")}</div>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return <div className="text-center">{date.toLocaleDateString()}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const country = row.original

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
            <DropdownMenuItem
              onClick={() => {
                // @ts-ignore - onEdit is passed via table meta
                table.options.meta?.onEdit?.(country)
              }}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(country.id)}
            >
              Copy ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
