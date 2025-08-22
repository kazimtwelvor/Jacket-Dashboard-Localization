"use client"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Edit,
  Trash2,
  Copy,
  Tag,
  Calendar,
  ShoppingBag,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ExternalLink,
} from "lucide-react"
import type { CategoryColumn } from "./columns"

interface CategoryDetailProps {
  category: CategoryColumn
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

export const CategoryDetail = ({ category, onClose, onEdit, onDelete }: CategoryDetailProps) => {
  const params = useParams()

  const onCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl w-full p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              <span className="truncate">{category.name}</span>
              {category.isActive !== false ? (
                <Badge
                  variant="outline"
                  className="ml-auto flex items-center gap-1 bg-green-500/10 text-green-600 border-green-200"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary" className="ml-auto flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Inactive
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          <Tabs defaultValue="details" className="flex-1 overflow-hidden">
            <div className="border-b px-6">
              <TabsList className="w-full justify-start -mb-px h-12 rounded-none bg-transparent p-0">
                <TabsTrigger
                  value="details"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-4"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="products"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-4"
                >
                  Products ({category.productCount})
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <TabsContent value="details" className="p-6 mt-0 h-full">
                <div className="space-y-6">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                    {category.imageUrl ? (
                      <Image
                        src={category.imageUrl || "/placeholder.svg?height=300&width=600"}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center bg-secondary/50">
                        <Tag className="h-12 w-12 text-muted-foreground opacity-50 mb-2" />
                        <span className="text-xl font-medium text-muted-foreground">{category.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Basic Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-0">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Name</h4>
                          <div className="flex items-center justify-between">
                            <p className="text-sm">{category.name}</p>
                            <Button variant="ghost" size="sm" onClick={() => onCopy(category.name)}>
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">Description</h4>
                          <p className="text-sm text-muted-foreground">
                            {category.description || "No description provided"}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">ID</h4>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground truncate font-mono bg-secondary/50 px-2 py-1 rounded">
                              {category.id}
                            </p>
                            <Button variant="ghost" size="sm" onClick={() => onCopy(category.id)}>
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Dates & Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-0">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Created</h4>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">{category.createdAt}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">Last Updated</h4>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">{category.updatedAt}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">Status</h4>
                          {category.isActive !== false ? (
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1 w-fit bg-green-500/10 text-green-600 border-green-200"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                              <XCircle className="h-3 w-3" />
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Billboard Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {category.billboardLabel ? (
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Billboard</h4>
                            <Badge variant="outline" className="font-normal text-xs">
                              {category.billboardLabel}
                            </Badge>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1">Billboard ID</h4>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground truncate font-mono bg-secondary/50 px-2 py-1 rounded">
                                {category.billboardId}
                              </p>
                              <Button variant="ghost" size="sm" onClick={() => onCopy(category.billboardId)}>
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          <div className="pt-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/${params.storeId}/billboards/${category.billboardId}`}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Billboard
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <FileText className="h-10 w-10 text-muted-foreground/30 mb-2" />
                          <p className="text-muted-foreground mb-4">No billboard associated with this category</p>
                          <Button variant="outline" size="sm" onClick={onEdit}>
                            Add Billboard
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="products" className="p-6 mt-0">
                {category.productCount > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Products in this category</h3>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/${params.storeId}/products?category=${category.id}`}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View All Products
                        </Link>
                      </Button>
                    </div>

                    {category.featuredProducts && category.featuredProducts.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {category.featuredProducts.map((product) => (
                          <Card key={product.id} className="overflow-hidden group">
                            <div className="relative aspect-square w-full overflow-hidden bg-muted">
                              <Image
                                src={product.image || "/placeholder.svg?height=200&width=200"}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                              />
                            </div>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <h3 className="font-medium line-clamp-1">{product.name}</h3>
                                <Badge variant="outline">{product.price}</Badge>
                              </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                              <Button variant="outline" size="sm" className="w-full" asChild>
                                <Link href={`/${params.storeId}/products/${product.id}`}>
                                  <ArrowUpRight className="h-4 w-4 mr-2" />
                                  View Product
                                </Link>
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-4">No product details available</div>
                    )}

                    {category.productCount > (category.featuredProducts?.length || 0) && (
                      <div className="flex justify-center mt-4">
                        <Button variant="outline" asChild>
                          <Link href={`/${params.storeId}/products?category=${category.id}`}>
                            View All {category.productCount} Products
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-medium">No products in this category</h3>
                    <p className="text-muted-foreground mt-1 mb-4 max-w-md">
                      This category doesn't have any products yet. Add products to this category to see them here.
                    </p>
                    <Button asChild>
                      <Link href={`/${params.storeId}/products/new?category=${category.id}`}>
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Add Products
                      </Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <SheetFooter className="p-6 border-t">
            <div className="flex justify-between w-full">
              <Button variant="destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
