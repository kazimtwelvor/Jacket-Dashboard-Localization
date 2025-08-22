"use client"

import type React from "react"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ImagePlus } from "lucide-react"
import ImageUpload from "@/components/ui/image-upload"

interface HeroBannerProps {
  isEditing?: boolean
  bannerImage: string[]
  title: string
  subtitle: string
  description: string
  isUploading: boolean
  onBannerImageChange: (url: string) => void
  onBannerImageRemove: (url: string) => void
  onTitleChange: (title: string) => void
  onSubtitleChange: (subtitle: string) => void
  onDescriptionChange: (description: string) => void
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  isEditing = false,
  bannerImage,
  title,
  subtitle,
  description,
  isUploading,
  onBannerImageChange,
  onBannerImageRemove,
  onTitleChange,
  onSubtitleChange,
  onDescriptionChange,
}) => {
  return (
    <div className="relative w-full">
      {isEditing ? (
        <div className="space-y-4 mb-8">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ImagePlus className="h-5 w-5" />
                  <div>
                    <h3 className="text-base font-bold">
                      Banner Image <span className="text-red-500">*</span>
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative w-40 h-24 overflow-hidden rounded-md border">
                    <Image
                      fill
                      className="object-cover"
                      alt="Banner preview"
                      src={bannerImage[0] || "/placeholder.svg?height=500&width=1500"}
                    />
                  </div>
                  <div>
                    <ImageUpload
                      value={bannerImage}
                      disabled={isUploading}
                      onChange={(url) => onBannerImageChange(url)}
                      onRemove={(url) => onBannerImageRemove(url)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="Enter banner title"
                />
              </div>

              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => onSubtitleChange(e.target.value)}
                  placeholder="Enter banner subtitle"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  placeholder="Enter banner description"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="relative w-full h-[500px] overflow-hidden rounded-lg">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/70 to-transparent" />
        <Image
          src={bannerImage[0] || "/placeholder.svg?height=500&width=1500"}
          alt="Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center p-8 md:p-12 lg:p-16 max-w-3xl">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{title}</h2>
          <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-4">{subtitle}</h3>
          <p className="text-sm md:text-base text-white/90 mb-6 max-w-xl">{description}</p>
          <div>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
