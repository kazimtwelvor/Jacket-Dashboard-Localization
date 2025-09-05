"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Edit, Copy, Trash, Eye, MoreHorizontal } from "lucide-react"
import { toast } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertModal } from "@/components/modals/alert-modal"
import { duplicateProduct } from "../actions/duplicate-product"
import type { ProductColumn } from "../types"

interface ProductListProps {
  products: ProductColumn[]
  storeId: string
  onSelectItems?: (ids: string[]) => void
}

export const ProductList = ({ products, storeId, onSelectItems }: ProductListProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const router = useRouter()

  const onEdit = (id: string) => {
    router.push(`/${storeId}/products/${id}`)
  }

  const onPreview = (id: string) => {
    window.open(`/preview/${storeId}/products/${id}`, "_blank")
  }

  const onDuplicate = async (id: string) => {
    try {
      setLoading(true)
      await duplicateProduct(id, storeId)
      router.refresh()
      toast.success("Product duplicated successfully")
    } catch (error) {
      toast.error("Failed to duplicate product")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    if (!productToDelete) return

    try {
      setLoading(true)
      const response = await fetch(`/api/${storeId}/products/${productToDelete}/trash`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to move product to trash")
      }

      router.refresh()
      toast.success("Product moved to trash")
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
      setOpen(false)
      setProductToDelete(null)
    }
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === products.length) {
      setSelectedItems([])
      onSelectItems?.([])
    } else {
      const allIds = products.map((product) => product.id)
      setSelectedItems(allIds)
      onSelectItems?.(allIds)
    }
  }

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) => {
      const newSelection = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]

      onSelectItems?.(newSelection)
      return newSelection
    })
  }

  const isValidSalePrice = (price: string | undefined | null): boolean => {
    if (!price) return false
    const numericPrice = Number.parseFloat(price.replace(/[^0-9.-]+/g, ""))
    return numericPrice > 0
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h3 className="text-lg font-medium">No products found</h3>
        <p className="text-sm text-muted-foreground mt-1">Try changing your filters or create a new product.</p>
      </div>
    )
  }

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedItems.length === products.length && products.length > 0}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(product.id)}
                    onCheckedChange={() => toggleSelectItem(product.id)}
                    aria-label={`Select ${product.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>
                  {isValidSalePrice(product.salePrice) ? (
                    <div className="flex flex-col">
                      <span className="text-green-600 font-medium">{product.salePrice}</span>
                      <span className="text-muted-foreground line-through text-xs">{product.price}</span>
                    </div>
                  ) : (
                    product.price
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={product.stockStatus === "instock" ? "default" : "destructive"}>
                    {product.stockStatus === "instock" ? "In Stock" : "Out of Stock"}
                  </Badge>
                  {product.isPublished ? (
                    <Badge variant="outline" className="ml-2">
                      Published
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="ml-2">
                      Draft
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => onEdit(product.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => onPreview(product.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(product.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onPreview(product.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDuplicate(product.id)} disabled={loading}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setProductToDelete(product.id)
                            setOpen(true)
                          }}
                          className="text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
