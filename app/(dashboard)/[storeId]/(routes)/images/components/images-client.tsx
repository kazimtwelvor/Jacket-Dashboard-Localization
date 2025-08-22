"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageDetailSidebar } from "@/components/ui/image-detail-sidebar"
import { AlertModal } from "@/components/modals/alert-modal"
import { ImagePlus, RefreshCw, Trash2, Loader2 } from "lucide-react"

interface GalleryImage {
  name: string
  url: string
  path: string
  size: number
  lastModified: string
  uploadedBy?: string
  uploadedOn?: string
  dimensions?: { width: number; height: number }
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

  const fetchImages = async (url: string) => {
    if (!url) return

    setIsLoading(true)
    try {
      const baseUrl = url.endsWith("/") ? url.slice(0, -1) : url
      const response = await fetch(`${baseUrl}/api/images`)

      if (!response.ok) {
        throw new Error(`Failed to fetch images: ${response.status}`)
      }

      const data = await response.json()

      // Add mock data for demonstration
      const enhancedImages = (data.images || []).map((img: GalleryImage) => ({
        ...img,
        uploadedBy: "Admin User",
        uploadedOn: new Date().toISOString(),
        dimensions: { width: 1920, height: 1080 },
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
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update local state
      const updatedImages = images.filter((img) => {
        const baseUrl = storeUrl?.endsWith("/") ? storeUrl.slice(0, -1) : storeUrl
        const fullUrl = `${baseUrl}${img.url}`
        return fullUrl !== imageUrl
      })

      setImages(updatedImages)
      setIsDetailSidebarOpen(false)
      toast.success("Image deleted successfully")
    } catch (error) {
      console.error("Error deleting image:", error)
      toast.error("Failed to delete image")
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedImages.length === 0) return

    try {
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
      setSelectedImages([])
    } else {
      // Select all
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
      let successCount = 0
      const newImages: GalleryImage[] = []

      for (const file of files) {
        try {
          const formData = new FormData()
          formData.append("file", file)

          // Format the URL properly - ensure it doesn't have trailing slashes
          const baseUrl = storeUrl.endsWith("/") ? storeUrl.slice(0, -1) : storeUrl
          const uploadUrl = `${baseUrl}/api/upload`

          const response = await fetch(uploadUrl, {
            method: "POST",
            body: formData,
            mode: "cors",
            credentials: "omit",
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => null)
            console.error(`Upload failed for ${file.name}:`, response.status, errorData)
            continue
          }

          const data = await response.json()
          console.log("Upload successful:", data)

          // Add the new image to our local state
          newImages.push({
            name: file.name,
            url: data.url,
            path: data.url,
            size: file.size,
            lastModified: new Date().toISOString(),
            uploadedBy: "Current User",
            uploadedOn: new Date().toISOString(),
            dimensions: { width: 1920, height: 1080 }, // Mock dimensions
          })

          successCount++
        } catch (fileError) {
          console.error(`Error uploading ${file.name}:`, fileError)
        }
      }

      // Update images state with new uploads
      if (newImages.length > 0) {
        setImages((prev) => [...newImages, ...prev])
      }

      // Show consolidated success message
      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} image${successCount > 1 ? "s" : ""}`)
        setActiveTab("browse") // Switch to browse tab after upload
      }
    } catch (error) {
      console.error("Error in batch upload:", error)
      toast.error(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsUploading(false)
      // Reset the file input
      if (e.target) {
        e.target.value = ""
      }
    }
  }

  return (
    <div className={`relative ${isDetailSidebarOpen ? "pr-0 sm:pr-[400px]" : ""} transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <Heading title="Image Gallery" description="Manage all your store images in one place" />
        <div className="flex items-center gap-2">
          <Button onClick={refreshGallery} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {selectedImages.length > 0 && (
            <Button onClick={() => setIsDeleteModalOpen(true)} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedImages.length})
            </Button>
          )}
        </div>
      </div>
      <Separator />

      <Tabs defaultValue="browse" className="mt-6" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="browse">Browse Media</TabsTrigger>
          <TabsTrigger value="upload">Upload Media</TabsTrigger>
        </TabsList>

        <div className="py-4 flex items-center justify-between">
          <Input
            placeholder="Search media items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />

          {activeTab === "browse" && filteredImages.length > 0 && (
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                {selectedImages.length === filteredImages.length ? "Deselect All" : "Select All"}
              </Button>

              {selectedImages.length > 0 && <Badge variant="secondary">{selectedImages.length} selected</Badge>}
            </div>
          )}
        </div>

        <TabsContent value="browse" className="min-h-[500px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-[500px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading media...</span>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[500px] text-muted-foreground">
              <p>No images found.</p>
              <Button variant="link" onClick={() => setActiveTab("upload")} className="mt-2">
                Upload your first image
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-1 pb-4">
                {filteredImages.map((image, index) => {
                  const baseUrl = storeUrl?.endsWith("/") ? storeUrl.slice(0, -1) : storeUrl
                  const fullUrl = `${baseUrl}${image.url}`
                  const isSelected = selectedImages.includes(fullUrl)

                  return (
                    <div
                      key={index}
                      className={`border rounded-md overflow-hidden transition-colors ${
                        isSelected ? "border-primary border-2 ring-2 ring-primary/20" : "hover:border-primary/60"
                      }`}
                      onClick={() => {
                        setSelectedImage(fullUrl)
                        setIsDetailSidebarOpen(true)
                      }}
                    >
                      <div className="relative aspect-square bg-muted cursor-pointer">
                        <div className="absolute top-2 left-2 z-10">
                          <Checkbox
                            checked={isSelected}
                            className={`h-5 w-5 ${isSelected ? "bg-primary border-primary" : "bg-white/80"}`}
                            onClick={(e) => {
                              e.stopPropagation() // Prevent opening sidebar when checkbox is clicked
                              handleImageSelect(fullUrl)
                            }}
                            onCheckedChange={() => handleImageSelect(fullUrl)}
                          />
                        </div>

                        <Image
                          src={fullUrl || "/placeholder.svg"}
                          alt={image.name}
                          fill
                          className={`object-cover ${isSelected ? "opacity-90" : ""}`}
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />

                        {isSelected && <div className="absolute inset-0 bg-primary/10 pointer-events-none" />}
                      </div>
                      <div className="p-2 text-xs">
                        <p className="font-medium truncate">{image.name}</p>
                        <p className="text-muted-foreground">{formatFileSize(image.size)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="upload" className="min-h-[500px]">
          <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-primary/50 transition-colors max-w-2xl w-full">
              <ImagePlus className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Drag and drop or click to upload</h3>
              <p className="text-sm text-muted-foreground mt-2">Supports JPG, PNG, GIF, WEBP up to 10MB</p>
              <Button
                variant="outline"
                size="lg"
                className="mt-4"
                disabled={isUploading || !storeUrl}
                onClick={() => document.getElementById("gallery-file-upload")?.click()}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Select Files"
                )}
              </Button>
              <input
                id="gallery-file-upload"
                type="file"
                accept="image/*"
                onChange={onUpload}
                disabled={isUploading || !storeUrl}
                style={{ display: "none" }}
                multiple
              />
            </div>

            {isUploading && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Your images are being uploaded, please wait...</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Image Detail Sidebar */}
      <ImageDetailSidebar
        isOpen={isDetailSidebarOpen}
        onClose={() => setIsDetailSidebarOpen(false)}
        imageUrl={selectedImage}
        storeUrl={storeUrl}
        onDelete={handleDeleteImage}
      />

      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteSelected}
        loading={false}
      />
    </div>
  )
}
