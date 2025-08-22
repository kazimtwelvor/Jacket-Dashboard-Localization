"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: string
  name: string
  price: string
  category: string
  image: string | null
}

interface TopProductsProps {
  products: Product[]
}

export function TopProducts({ products }: TopProductsProps) {
  if (!products || products.length === 0) {
    return <div className="text-center text-muted-foreground py-4">No products found</div>
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.id} className="flex items-center space-x-4">
          <Avatar className="h-12 w-12 rounded-md">
            <AvatarImage src={product.image || "/placeholder.svg?height=40&width=40"} alt={product.name} />
            <AvatarFallback className="rounded-md bg-primary/10 text-primary">
              {product.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{product.name}</p>
            <div className="flex items-center">
              <Badge variant="outline" className="mr-2 text-xs">
                {product.category}
              </Badge>
              <p className="text-sm text-muted-foreground">{product.price}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
