"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import type { UseFormReturn } from "react-hook-form"
import { ImagePlus, X } from "lucide-react"
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { ProductFormValues } from "../../product-form-schema"

interface SeoSocialSectionProps {
  form: UseFormReturn<ProductFormValues>
}

export const SeoSocialSection: React.FC<SeoSocialSectionProps> = ({ form }) => {
  const [socialImage, setSocialImage] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="border rounded-md p-4">
        <h3 className="font-medium mb-2">Social Media Preview</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Customize how your product appears when shared on social media.
        </p>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="seo.metaTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Social Title</FormLabel>
                <FormControl>
                  <Input
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter social title"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Defaults to the meta title if left empty.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="seo.metaDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Social Description</FormLabel>
                <FormControl>
                  <Textarea
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                    placeholder="Enter social description"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Defaults to the meta description if left empty.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <div className="text-sm font-medium">Social Image</div>
            <div className="mt-2 border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
              {socialImage ? (
                <div className="relative w-full aspect-[1200/630] mb-4">
                  <Image
                    src={socialImage || "/placeholder.svg"}
                    alt="Social preview"
                    fill
                    className="object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -right-2 -top-2 h-6 w-6"
                    onClick={() => setSocialImage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    Drag & drop or click to upload an image (1200 x 630px recommended)
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="social-image-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          if (typeof reader.result === "string") {
                            setSocialImage(reader.result)
                          }
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => document.getElementById("social-image-upload")?.click()}
                  >
                    Upload Image
                  </Button>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Defaults to the featured image if left empty.</p>
          </div>

          <div className="mt-6 border rounded-md p-4">
            <h4 className="font-medium mb-4">Social Preview</h4>
            <div className="border rounded-md overflow-hidden">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 border-b">
                <div className="text-xs text-blue-600 dark:text-blue-400">facebook.com</div>
              </div>
              <div className="p-0">
                {(socialImage || form.watch("images")?.[0]) && (
                  <div className="relative w-full aspect-[1200/630]">
                    <Image
                      src={
                        socialImage ||
                        form.watch("images")?.[0] ||
                        "/placeholder.svg?height=630&width=1200" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg"
                      }
                      alt="Social preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-3">
                  <div className="text-sm text-gray-500 uppercase mb-1">
                    {typeof window !== "undefined" ? window?.location?.host : "yourstore.com"}
                  </div>
                  <h5 className="text-base font-medium text-blue-700 dark:text-blue-400 mb-1">
                    {form.watch("seo.metaTitle") || form.watch("name") || "Product Title"}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {form.watch("seo.metaDescription") ||
                      form.watch("description")?.substring(0, 160) ||
                      "Product description will appear here. Make sure to add a compelling meta description."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
