"use client"

import type React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Image } from "lucide-react"

interface SocialPreviewProps {
  ogTitle: string
  ogDescription: string
  twitterTitle: string
  twitterDescription: string
  imageUrl?: string
  siteName?: string
}

export const SocialPreview: React.FC<SocialPreviewProps> = ({
  ogTitle,
  ogDescription,
  twitterTitle,
  twitterDescription,
  imageUrl,
  siteName = "Your Store",
}) => {
  return (
    <Tabs defaultValue="facebook" className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="facebook">Facebook</TabsTrigger>
        <TabsTrigger value="twitter">Twitter</TabsTrigger>
      </TabsList>

      <TabsContent value="facebook">
        <div className="border rounded-md overflow-hidden">
          <div className="bg-[#f0f2f5] p-3">
            <div className="bg-white rounded-md overflow-hidden shadow-sm">
              <div className="h-48 bg-muted flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="p-3">
                <div className="text-[#385898] text-sm font-medium mb-1">{ogTitle || "Your Product Title"}</div>
                <div className="text-[#606770] text-xs mb-2">{siteName.toLowerCase()}.com</div>
                <div className="text-[#1c1e21] text-sm line-clamp-2">
                  {ogDescription ||
                    "Your product description will appear here. Make sure to write a compelling description to attract clicks."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="twitter">
        <div className="border rounded-md overflow-hidden">
          <div className="bg-[#f7f9fa] p-3">
            <div className="bg-white rounded-md overflow-hidden shadow-sm">
              <div className="h-48 bg-muted flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="p-3">
                <div className="text-[#0f1419] text-sm font-medium mb-1">{twitterTitle || "Your Product Title"}</div>
                <div className="text-[#536471] text-xs mb-2">{siteName.toLowerCase()}.com</div>
                <div className="text-[#0f1419] text-sm line-clamp-2">
                  {twitterDescription ||
                    "Your product description will appear here. Make sure to write a compelling description to attract clicks."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
