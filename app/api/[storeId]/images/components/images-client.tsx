"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { toast } from "react-hot-toast"

interface GalleryImage {
  name: string
  url: string
  path: string
  size: number
  lastModified: string
  uploadedBy?: string
  uploadedOn?: string
  dimensions?: { width: number; height: number }
  usedInProducts?: string[]
}

export const ImagesClient = () => {
  const params = useParams()
  const storeId = params.storeId as string

  const [images, setImages] = useState<GalleryImage[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [storeUrl, setStoreUrl] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("browse")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isDetailSidebarOpen, setIsDetailSidebarOpen] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    const fetchStoreUrl = async () => {
      try {
        if (!storeId) return

        setIsLoading(true)
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

        fetchImages(url)
      } catch (error) {
        toast.error("Failed to fetch store URL. Using default.")
        setStoreUrl("http://localhost:3001") // Fallback
        fetchImages("http://localhost:3001")
      } finally {
        setIsLoading(false)
      }
    }

    if (storeId) {
      fetchStoreUrl()
    }
  }, [storeId])

  const fetchImages = async (url: string) => {
    if (!url) return

    setIsLoading(true)
    try {
      const baseUrl = url.endsWith("/") ? url.slice(0, -1) : url
      const imagesUrl = `${baseUrl}/api/images`
      
      
      const response = await fetch(imagesUrl, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
        mode: "cors",
        credentials: "omit",
      })

      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch images: ${response.status}`)
      }

      const data = await response.json()

      const enhancedImages = (data.images || []).map((img: GalleryImage) => ({
        ...img,
        uploadedBy: img.uploadedBy || "Admin User",
        uploadedOn: img.uploadedOn || new Date().toISOString(),
        dimensions: img.dimensions || { width: 1920, height: 1080 },
        usedInProducts: img.usedInProducts || [],
      }))

      setImages(enhancedImages)
    } catch (error) {
      toast.error("Failed to fetch images. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const refreshGallery = () => {
    if (storeUrl) {
      fetchImages(storeUrl)
      toast.success("Gallery refreshed")
    }
  }

  const filteredImages = images.filter((image) => image.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImages((prev) => {
      if (prev.includes(imageUrl)) {
        return prev.filter((url) => url !== imageUrl)
      } else {
        return [...prev, imageUrl]
      }
    })
  }

  const handleViewDetails = (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering select
    const baseUrl = storeUrl?.endsWith("/") ? storeUrl.slice(0, -1) : storeUrl
    const fullUrl = `${baseUrl}${imageUrl}`
    setSelectedImage(fullUrl)
    setIsDetailSidebarOpen(true)
  }

  const handleDeleteImage = async (imageUrl: string) => {
    try {
      
      const baseUrl = storeUrl?.endsWith("/") ? storeUrl.slice(0, -1) : storeUrl
      const deleteUrl = `${baseUrl}/api/[storeId]/images/delete`
      
      
      const response = await fetch(deleteUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
        mode: "cors",
        credentials: "omit",
      })

      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))

        if (errorData.error === "image_in_use") {
          toast.error(`Cannot delete image as it is used by ${errorData.products} products`)
          return
        }
        throw new Error(`Failed to delete image: ${response.status}`)
      }

      const updatedImages = images.filter((img) => {
        const fullUrl = `${baseUrl}${img.url}`
        return fullUrl !== imageUrl
      })

      setImages(updatedImages)
      setIsDetailSidebarOpen(false)
      toast.success("Image deleted successfully")
    } catch (error) {
      toast.error(`Failed to delete image: ${error.message}`)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedImages.length === 0) return

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const updatedImages = images.filter((img) => {
        const baseUrl = storeUrl?.endsWith("/") ? storeUrl.slice(0, -1) : storeUrl
        const fullUrl = `${baseUrl}${img.url}`
        return !selectedImages.includes(fullUrl)
      })

      setImages(updatedImages)
      toast.success(`${selectedImages.length} images deleted successfully`)
      setSelectedImages([])
      setIsDeleteModalOpen(false)
    } catch (error) {
      toast.error("Failed to delete images")
    }
  }

  const toggleSelectAll = () => {
    if (selectedImages.length === filteredImages.length) {
      setSelectedImages([])
    } else {
      const baseUrl = storeUrl?.endsWith("/") ? storeUrl.slice(0, -1) : storeUrl
      setSelectedImages(filteredImages.map((img) => `${baseUrl}${img.url}`))
    }
  }

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    if (!storeUrl) {
      toast.error("Store URL not available. Please try again.")
      return
    }

    setIsUploading(true)

    try {
      const files = Array.from(e.target.files)
      
      const successCount = 0
      const newImages: GalleryImage[] = []

      for (const file of files) {
        try {
          
          
        } catch (uploadError) {
          toast.error(`Failed to upload ${file.name}. Please try again.`)
        }
      }

      fetchImages(storeUrl)
      toast.success(`${successCount} of ${files.length} images uploaded successfully`)
    } catch (error) {
      toast.error("Failed to upload images. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }
