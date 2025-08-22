"use client"

import { useParams } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Edit, Trash2, Copy, Palette, Calendar, ShoppingBag } from "lucide-react"
import type { ColorColumn } from "./columns"

interface ColorDetailProps {
  color: ColorColumn
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

export const ColorDetail = ({ color, onClose, onEdit, onDelete }: ColorDetailProps) => {
  const params = useParams()

  const onCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Determine if this is a light or dark color
  const isLightColor = (hexColor: string) => {
    // Remove the hash if it exists
    hexColor = hexColor.replace("#", "")

    // Convert to RGB
    const r = Number.parseInt(hexColor.substr(0, 2), 16)
    const g = Number.parseInt(hexColor.substr(2, 2), 16)
    const b = Number.parseInt(hexColor.substr(4, 2), 16)

    // Calculate brightness (using the formula for relative luminance)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000

    // Return true if the color is light (brightness > 128)
    return brightness > 128
  }

  const isLight = isLightColor(color.value)
  const textColor = isLight ? "text-black" : "text-white"

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md w-full p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <span className="truncate">{color.name}</span>
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
                  Products
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <TabsContent value="details" className="p-6 mt-0 h-full">
                <div className="space-y-6">
                  <div className="flex justify-center mb-6">
                    <div
                      className="w-32 h-32 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: color.value }}
                    >
                      <span className={`text-xl font-bold ${textColor}`}>{color.value}</span>
                    </div>
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Name</h4>
                        <div className="flex items-center justify-between">
                          <p className="text-sm">{color.name}</p>
                          <Button variant="ghost" size="sm" onClick={() => onCopy(color.name)}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Value</h4>
                        <div className="flex items-center justify-between">
                          <p className="text-sm">{color.value}</p>
                          <Button variant="ghost" size="sm" onClick={() => onCopy(color.value)}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Type</h4>
                        <p className="text-sm">{isLight ? "Light Color" : "Dark Color"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">ID</h4>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground truncate font-mono bg-secondary/50 px-2 py-1 rounded">
                            {color.id}
                          </p>
                          <Button variant="ghost" size="sm" onClick={() => onCopy(color.id)}>
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
                        Dates
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Created</h4>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{color.createdAt}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="products" className="p-6 mt-0">
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium">No products using this color</h3>
                  <p className="text-muted-foreground mt-1 mb-4 max-w-md">
                    Products using this color will appear here once they are created.
                  </p>
                </div>
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
