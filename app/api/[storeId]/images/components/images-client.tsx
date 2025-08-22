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

  // Fetch the store URL from the database
  useEffect(() => {
    const fetchStoreUrl = async () => {
      try {
        if (!storeId) return

        console.log(`Fetching store URL for storeId: ${storeId}`)
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

        // Validate and format the URL from the database
        let url = storeData.url || "http://localhost:3001"

        // Make sure the URL has a protocol
        if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
          url = `http://${url}`
        }

        console.log(`Store URL set to: ${url}`)
        setStoreUrl(url)

        // Fetch images once we have the store URL
        fetchImages(url)
      } catch (error) {
        console.error("Error fetching store URL:", error)
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

  // Update the fetchImages function to handle the new schema
  const fetchImages = async (url: string) => {
    if (!url) return

    setIsLoading(true)
    try {
      const baseUrl = url.endsWith("/") ? url.slice(0, -1) : url
      const imagesUrl = `${baseUrl}/api/images`
      
      console.log(`Fetching images from: ${imagesUrl}`)
      
      const response = await fetch(imagesUrl, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
        // Explicitly set mode to cors to ensure proper cross-origin requests
        mode: "cors",
        // Don't send cookies or other credentials
        credentials: "omit",
      })

      console.log(`Images API response status: ${response.status}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Failed to fetch images: ${response.status}`, errorText)
        throw new Error(`Failed to fetch images: ${response.status}`)
      }

      const data = await response.json()
      console.log(`Fetched ${data.images?.length || 0} images`)

      // Process the images with additional data if needed
      const enhancedImages = (data.images || []).map((img: GalleryImage) => ({
        ...img,
        uploadedBy: img.uploadedBy || "Admin User",
        uploadedOn: img.uploadedOn || new Date().toISOString(),
        dimensions: img.dimensions || { width: 1920, height: 1080 },
        usedInProducts: img.usedInProducts || [],
      }))

      setImages(enhancedImages)
    } catch (error) {
      console.error("Error fetching images:", error)
      toast.error("Failed to fetch images. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const refreshGallery = () => {
    if (storeUrl) {
      console.log("Refreshing gallery...")
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
    console.log(`Toggling selection for image: ${imageUrl}`)
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
    console.log(`Viewing details for image: ${fullUrl}`)
    setSelectedImage(fullUrl)
    setIsDetailSidebarOpen(true)
  }

  // Update the handleDeleteImage function to handle the new schema
  const handleDeleteImage = async (imageUrl: string) => {
    try {
      console.log(`Attempting to delete image: ${imageUrl}`)
      
      // Format the URL properly for the API call
      const baseUrl = storeUrl?.endsWith("/") ? storeUrl.slice(0, -1) : storeUrl
      const deleteUrl = `${baseUrl}/api/[storeId]/images/delete`
      
      console.log(`Sending delete request to: ${deleteUrl}`)
      
      const response = await fetch(deleteUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
        // Explicitly set mode to cors to ensure proper cross-origin requests
        mode: "cors",
        // Don't send cookies or other credentials
        credentials: "omit",
      })

      console.log(`Delete API response status: ${response.status}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("Delete image error:", errorData)

        if (errorData.error === "image_in_use") {
          toast.error(`Cannot delete image as it is used by ${errorData.products} products`)
          return
        }
        throw new Error(`Failed to delete image: ${response.status}`)
      }

      // Update local state
      const updatedImages = images.filter((img) => {
        const fullUrl = `${baseUrl}${img.url}`
        return fullUrl !== imageUrl
      })

      setImages(updatedImages)
      setIsDetailSidebarOpen(false)
      toast.success("Image deleted successfully")
      console.log("Image deleted successfully")
    } catch (error) {
      console.error("Error deleting image:", error)
      toast.error(`Failed to delete image: ${error.message}`)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedImages.length === 0) return

    try {
      console.log(`Deleting ${selectedImages.length} selected images`)
      // In a real implementation, you would call your API to delete the images
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update local state by removing selected images
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
      console.error("Error deleting images:", error)
      toast.error("Failed to delete images")
    }
  }

  const toggleSelectAll = () => {
    if (selectedImages.length === filteredImages.length) {
      // Deselect all
      console.log("Deselecting all images")
      setSelectedImages([])
    } else {
      // Select all
      console.log("Selecting all images")
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
      console.log(`Uploading ${files.length} files to store: ${storeUrl}`)
      
      const successCount = 0
      const newImages: GalleryImage[] = []

      for (const file of files) {
        try {
          console.log(`Preparing to upload file: ${file.name}, size: ${file.size}, type: ${file.type}`)
          
          
        } catch (uploadError) {
          console.error(`Error uploading file ${file.name}:`, uploadError)
          toast.error(`Failed to upload ${file.name}. Please try again.`)
        }
      }

      // Refresh the gallery after all uploads are complete
      fetchImages(storeUrl)
      toast.success(`${successCount} of ${files.length} images uploaded successfully`)
    } catch (error) {
      console.error("Error uploading images:", error)
      toast.error("Failed to upload images. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }
