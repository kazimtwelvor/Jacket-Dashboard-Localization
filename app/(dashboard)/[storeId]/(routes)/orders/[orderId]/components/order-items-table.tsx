"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Trash, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface OrderItemsTableProps {
  orderItems: any[]
  products: any[]
  onAddItem: (product: any) => void
  onRemoveItem: (index: number) => void
  onUpdateItem: (index: number, field: string, value: any) => void
}

export const OrderItemsTable: React.FC<OrderItemsTableProps> = ({
  orderItems,
  products,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
}) => {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Product to Order</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Search products by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />
            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:bg-muted/50 transition"
                    onClick={() => {
                      onAddItem(product)
                      setOpen(false)
                    }}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-16 w-16 relative rounded-md overflow-hidden">
                        <Image
                          src={product.images?.[0]?.image?.url || product.images?.[0]?.url || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {product.sku || "N/A"}</p>
                        <p className="text-sm">${Number.parseFloat(String(product.price)).toFixed(2)}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {orderItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border rounded-md">
          <p className="text-muted-foreground mb-4">No items in this order yet</p>
          <Button type="button" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="h-12 w-12 relative rounded-md overflow-hidden">
                      <Image
                        src={item.product?.images?.[0]?.image?.url || item.product?.images?.[0]?.url || "/placeholder.svg"}
                        alt={item.product?.name || "Product"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.product?.name}</div>
                    <div className="text-sm text-muted-foreground">SKU: {item.product?.sku || "N/A"}</div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.price}
                      onChange={(e) => onUpdateItem(index, "price", Number.parseFloat(e.target.value))}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => onUpdateItem(index, "quantity", Number.parseInt(e.target.value))}
                      className="w-20"
                      min={1}
                    />
                  </TableCell>
                  <TableCell>${(Number.parseFloat(String(item.price)) * item.quantity).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button type="button" variant="ghost" size="icon" onClick={() => onRemoveItem(index)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
