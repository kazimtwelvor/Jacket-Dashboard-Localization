"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Calendar,
  CheckCircle2,
  Edit,
  ExternalLink,
  ImageIcon,
  Info,
  LayoutDashboard,
  ShoppingBag,
  Tag,
  XCircle,
} from "lucide-react"
import type { CategoryColumn } from "./columns"

interface CategoryDetailModalProps {
  isOpen: boolean
  onClose: () => void
  category: CategoryColumn | null
  onEdit?: () => void
}

export const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({ isOpen, onClose, category, onEdit }) => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("details")

  if (!category) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {category.name}
            {category.isActive !== false ? (
              <Badge variant="outline" className="ml-2 bg-green-500/10 text-green-600 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="ml-2 bg-secondary/10 text-muted-foreground border-secondary">
                <XCircle className="h-3 w-3 mr-1" />
                Inactive
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="details"
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details" className="flex items-center gap-1">
              <Info className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-1">
              <ShoppingBag className="h-4 w-4" />
              Products ({category.productCount})
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-1">
              <LayoutDashboard className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto pr-2">
            <TabsContent value="details" className="mt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Tag className="h-4 w-4 mr-2" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID:</span>
                      <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{category.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span>
                        {category.isActive !== false ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-secondary/10 text-muted-foreground border-secondary">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                        {new Date(category.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Products:</span>
                      <span className="flex items-center">
                        <ShoppingBag className="h-3 w-3 mr-1 text-muted-foreground" />
                        {category.productCount}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Media
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {category.imageUrl ? (
                      <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                        <Image
                          src={category.imageUrl || "/placeholder.svg"}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-32 bg-muted rounded-md">
                        <ImageIcon className="h-8 w-8 text-muted-foreground opacity-50 mb-2" />
                        <span className="text-muted-foreground text-sm">No image available</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Billboard
                  </CardTitle>
                  <CardDescription>The billboard displayed at the top of this category page</CardDescription>
                </CardHeader>
                <CardContent>
                  {category.billboardLabel ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Billboard:</span>
                        <span className="font-medium">{category.billboardLabel}</span>
                      </div>

                      {/* We could add billboard preview here if available */}
                      <div className="bg-muted h-24 rounded-md flex items-center justify-center relative overflow-hidden">
                        <span className="text-xl font-bold text-white z-10">{category.billboardLabel}</span>
                        <div className="absolute inset-0 bg-black/50"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-24 bg-muted rounded-md">
                      <LayoutDashboard className="h-8 w-8 text-muted-foreground opacity-50 mb-2" />
                      <span className="text-muted-foreground text-sm">No billboard assigned</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="mt-0">
              {category.productCount > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* This would be populated with actual products */}
                  {Array.from({ length: Math.min(6, category.productCount) }).map((_, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="relative aspect-square w-full bg-muted">
                        <div className="flex items-center justify-center h-full">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground opacity-50" />
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <h4 className="font-medium truncate">Product {index + 1}</h4>
                        <p className="text-sm text-muted-foreground">$99.99</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 bg-muted rounded-md">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground opacity-50 mb-2" />
                  <span className="text-muted-foreground">No products in this category</span>
                  <Button variant="outline" size="sm" className="mt-4">
                    Add Product
                  </Button>
                </div>
              )}

              {category.productCount > 6 && (
                <div className="mt-4 flex justify-center">
                  <Button variant="outline">View All {category.productCount} Products</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <Card>
                <CardContent className="p-0 overflow-hidden">
                  <div className="relative aspect-video w-full bg-muted">
                    {category.billboardLabel && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <h2 className="text-2xl md:text-4xl font-bold text-white">{category.billboardLabel}</h2>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-4">{category.name}</h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {Array.from({ length: Math.min(8, Math.max(4, category.productCount)) }).map((_, index) => (
                        <div key={index} className="space-y-2">
                          <div className="aspect-square bg-muted rounded-md"></div>
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="flex items-center justify-between border-t pt-4 mt-4">
          <div>
            <Button variant="outline" size="sm" asChild>
              <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center">
                <ExternalLink className="h-3 w-3 mr-1" />
                View on Store
              </a>
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {onEdit && (
              <Button onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
