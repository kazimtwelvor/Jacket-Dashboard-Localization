"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ImagePlus, Trash, Info } from "lucide-react"
import { useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { ImageGalleryModal } from "./image-gallery-modal"
import { ImageDetailSidebar } from "./image-detail-sidebar"

interface ImageUploadProps {
  disabled?: boolean
  onChange: (value: string) => void
  onRemove: (value: string) => void
  value: string[]
  multiple?: boolean
  onMultipleSelect?: (values: string[]) => void
  onViewDetails?: (imageUrl: string) => void
  selectedImageForDetail?: string | null
  isDetailModalOpen?: boolean
  setIsDetailModalOpen?: (isOpen: boolean) => void
  onDeleteImage?: (imageUrl: string) => void
  metadata?: {
    altText?: string
    title?: string
    caption?: string
    description?: string
    excludeFromSitemap?: boolean
  } | null
  onMetadataChange?: (metadata: any) => void
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
  multiple = true,
  onMultipleSelect,
  onViewDetails,
  selectedImageForDetail,
  isDetailModalOpen,
  setIsDetailModalOpen,
  onDeleteImage,
  metadata,
  onMetadataChange,
}) => {
  const [isMounted, setIsMounted] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [storeUrl, setStoreUrl] = useState<string | null>(null)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [localSelectedImageForDetail, setLocalSelectedImageForDetail] = useState<string | null>(null)
  const [localIsDetailModalOpen, setLocalIsDetailModalOpen] = useState(false)
  const params = useParams()
  const storeId = params?.storeId as string
  const [showImageDetails, setShowImageDetails] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const effectiveSelectedImage = selectedImageForDetail || localSelectedImageForDetail
  const effectiveIsDetailModalOpen = isDetailModalOpen !== undefined ? isDetailModalOpen : localIsDetailModalOpen
  const effectiveSetIsDetailModalOpen = setIsDetailModalOpen || setLocalIsDetailModalOpen
  useEffect(() => {
    const fetchStoreUrl = async () => {
      try {
        if (!storeId) return

        const response = await fetch(`/api/stores/${storeId}?t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch store: ${response.status}`)
        }

        const storeData = await response.json()
        let url = storeData.url || "http://localhost:3001"
        if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
          url = `http://${url}`
        }

        setStoreUrl(url)
      } catch (error) {
        toast.error("Failed to fetch store URL. Using default.")
        setStoreUrl("http://localhost:3001") // Fallback
      }
    }

    if (storeId) {
      fetchStoreUrl()
    }
  }, [storeId])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    if (!storeUrl) {
      toast.error("Store URL not available. Please try again.")
      return
    }

    setIsUploading(true)

    try {
      const files = Array.from(e.target.files)
      let successCount = 0
      const uploadedUrls: string[] = []

      for (const file of files) {
        try {
          const formData = new FormData()
          formData.append("file", file)

          const baseUrl = storeUrl.endsWith("/") ? storeUrl.slice(0, -1) : storeUrl
          const uploadUrl = `${baseUrl}/api/${storeId}/upload`

          const response = await fetch(uploadUrl, {
            method: "POST",
            body: formData,
            mode: "cors",
            credentials: "omit",
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => null)
            continue
          }

          const data = await response.json()

          const imageUrl = data.url.startsWith("http") ? data.url : `${baseUrl}${data.url}`
          uploadedUrls.push(imageUrl)
          successCount++
        } catch (fileError) {
        }
      }

      if (uploadedUrls.length > 0) {
        if (multiple && onMultipleSelect) {
          onMultipleSelect(uploadedUrls)
        } else if (uploadedUrls.length === 1) {
          onChange(uploadedUrls[0])
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} image${successCount > 1 ? "s" : ""}`)
      }

      setIsGalleryOpen(false)
    } catch (error) {
      toast.error(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsUploading(false)
      if (e.target) {
        e.target.value = ""
      }
    }
  }

  const handleOpenGallery = () => {
    if (!storeUrl) {
      toast.error("Store URL not available. Please try again.")
      return
    }
    setIsGalleryOpen(true)
  }

  const handleViewDetails = (imageUrl: string) => {
    if (onViewDetails) {
      onViewDetails(imageUrl)
    } else {
      setLocalSelectedImageForDetail(imageUrl)
      setLocalIsDetailModalOpen(true)
    }
  }

  const handleDeleteImage = async (imageUrl: string) => {
    if (onDeleteImage) {
      onDeleteImage(imageUrl)
    } else {
      // Default behavior
      onRemove(imageUrl)
      effectiveSetIsDetailModalOpen(false)
    }
  }

  const handleGallerySelect = (selectedUrl: string | string[]) => {
    if (Array.isArray(selectedUrl)) {
      if (multiple && onMultipleSelect) {
        const absoluteUrls = selectedUrl.map((url) => {
          if (url.startsWith("http")) return url
          const baseUrl = storeUrl?.endsWith("/") ? storeUrl.slice(0, -1) : storeUrl || ""
          return url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`
        })
        onMultipleSelect(absoluteUrls)
      } else if (selectedUrl.length > 0) {
        let url = selectedUrl[0]
        if (!url.startsWith("http") && storeUrl) {
          const baseUrl = storeUrl.endsWith("/") ? storeUrl.slice(0, -1) : storeUrl
          url = url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`
        }
        onChange(url)
      }
    } else {
      let url = selectedUrl
      if (!url.startsWith("http") && storeUrl) {
        const baseUrl = storeUrl.endsWith("/") ? storeUrl.slice(0, -1) : storeUrl
        url = url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`
      }
      onChange(url)
    }
  }

  if (!isMounted) {
    return null
  }

  const getFilenameFromUrl = (url: string) => {
    const parts = url.split("/")
    return parts[parts.length - 1]
  }

  const handleViewDetailsWrapper = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setShowImageDetails(true)

    if (value.length === 1 && value[0] === imageUrl && metadata) {
    } else if (value.length > 1) {
      const index = value.indexOf(imageUrl)
      if (index !== -1 && onMetadataChange) {
      }
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
            <div className="z-10 absolute top-2 right-2 flex gap-1">
              <Button
                type="button"
                onClick={() => handleViewDetailsWrapper(url)}
                variant="secondary"
                size="icon"
                className="bg-white/80 hover:bg-white"
              >
                <Info className="h-4 w-4" />
              </Button>
              <Button type="button" onClick={() => onRemove(url)} variant="destructive" size="icon">
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <Image
              fill
              className="object-cover"
              alt={getFilenameFromUrl(url)}
              src={url && url.startsWith("http") ? url : "/placeholder.svg"}
              sizes="(max-width: 200px) 100vw, 200px"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-1 text-xs truncate">
              {getFilenameFromUrl(url)}
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Button type="button" disabled={disabled || !storeUrl} variant="secondary" onClick={handleOpenGallery}>
          <ImagePlus className="h-4 w-4 mr-2" />
          {isUploading ? "Uploading..." : storeUrl ? "Select or Upload Images" : "Loading store..."}
        </Button>

        {/* Gallery Modal */}
        <ImageGalleryModal
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          onSelect={handleGallerySelect}
          storeUrl={storeUrl}
          onUpload={onUpload}
          isUploading={isUploading}
          multiSelect={multiple}
          onViewDetails={handleViewDetails}
        />

        {/* Image Detail Modal */}
        {showImageDetails && selectedImage && (
          <ImageDetailSidebar
            isOpen={showImageDetails}
            onClose={() => setShowImageDetails(false)}
            imageUrl={selectedImage}
            storeUrl={storeUrl || window.location.href}
            onDelete={onRemove}
            initialMetadata={metadata}
            onMetadataChange={onMetadataChange}
          />
        )}
      </div>
    </div>
  )
}

export default ImageUpload
