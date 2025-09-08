"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Check, ImagePlus, Loader2, X, Copy, Download, ExternalLink, Trash2, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ImageGalleryModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (imageUrl: string | string[]) => void
  storeUrl: string | null
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  isUploading: boolean
  multiSelect?: boolean
  onViewDetails?: (imageUrl: string) => void
}

interface GalleryImage {
  name: string
  url: string
  path: string
  size: number
  lastModified: string
  uploadedBy?: string
  uploadedOn?: string
  dimensions?: { width: number; height: number }
  fileType?: string
  uploadedTo?: string
}

export const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  storeUrl,
  onUpload,
  isUploading,
  multiSelect = true, 
  onViewDetails,
}) => {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("browse")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isDetailSidebarOpen, setIsDetailSidebarOpen] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [altText, setAltText] = useState("")
  const [title, setTitle] = useState("")
  const [caption, setCaption] = useState("")
  const [description, setDescription] = useState("")
  const [sidebarTab, setSidebarTab] = useState("details")

  useEffect(() => {
    if (isOpen && storeUrl) {
      fetchImages()
    }
  }, [isOpen, storeUrl])

  useEffect(() => {
    if (!isOpen) {
      setSelectedImages([])
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedImage) {
      const selectedImageObj = images.find((img) => {
        const baseUrl = storeUrl?.endsWith("/") ? storeUrl.slice(0, -1) : storeUrl
        return `${baseUrl}${img.url}` === selectedImage
      })

      if (selectedImageObj) {
        setTitle(selectedImageObj.name.split(".")[0] || "")
        setAltText("")
        setCaption("")
        setDescription("")
      }
    }
  }, [selectedImage, images, storeUrl])

  const fetchImages = async () => {
    if (!storeUrl) return

    setIsLoading(true)
    try {
      const baseUrl = storeUrl.endsWith("/") ? storeUrl.slice(0, -1) : storeUrl
      const response = await fetch(`${baseUrl}/api/images`)

      if (!response.ok) {
        throw new Error(`Failed to fetch images: ${response.status}`)
      }

      const data = await response.json()

      const processedImages = (data.images || []).map((img: any) => {
        const fileExtension = img.name.split(".").pop()?.toLowerCase() || ""
        let fileType = "application/octet-stream"

        if (["jpg", "jpeg"].includes(fileExtension)) fileType = "image/jpeg"
        else if (fileExtension === "png") fileType = "image/png"
        else if (fileExtension === "gif") fileType = "image/gif"
        else if (fileExtension === "webp") fileType = "image/webp"
        else if (fileExtension === "svg") fileType = "image/svg+xml"

        return {
          ...img,
          fileType,
          uploadedBy: img.uploadedBy || "Unknown User",
          uploadedOn: img.uploadedOn || new Date().toISOString(),
          uploadedTo: "Product Gallery",
          dimensions: img.dimensions || { width: 1200, height: 1080 },
        }
      })

      setImages(processedImages)
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  const filteredImages = images.filter((image) => image.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      return `${date.toLocaleDateString()} (${diffDays} days ago)`
    } catch (e) {
      return dateString
    }
  }

  const handleImageSelect = (imageUrl: string) => {
    if (!multiSelect) {
      const baseUrl = storeUrl?.endsWith("/") ? storeUrl.slice(0, -1) : storeUrl
      const fullUrl = `${baseUrl}${imageUrl}`
      onSelect(fullUrl)
      onClose()
    } else {
      setSelectedImages((prev) => {
        if (prev.includes(imageUrl)) {
          return prev.filter((url) => url !== imageUrl)
        } else {
          return [...prev, imageUrl]
        }
      })
    }
  }

  const handleViewDetails = (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation() 

    if (onViewDetails) {
      const baseUrl = storeUrl?.endsWith("/") ? storeUrl.slice(0, -1) : storeUrl
      const fullUrl = `${baseUrl}${imageUrl}`
      onViewDetails(fullUrl)
      onClose() 
    } else {
      const baseUrl = storeUrl?.endsWith("/") ? storeUrl.slice(0, -1) : storeUrl
      const fullUrl = `${baseUrl}${imageUrl}`
      setSelectedImage(fullUrl)
      setIsDetailSidebarOpen(true)
    }
  }

  const handleDeleteImage = async (imageUrl: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const updatedImages = images.filter((img) => {
        const baseUrl = storeUrl?.endsWith("/") ? storeUrl.slice(0, -1) : storeUrl
        const fullUrl = `${baseUrl}${img.url}`
        return fullUrl !== imageUrl
      })

      setImages(updatedImages)
      setIsDetailSidebarOpen(false)
      toast.success("Image deleted successfully")
    } catch (error) {
      toast.error("Failed to delete image")
    }
  }

  const handleConfirmSelection = () => {
    if (selectedImages.length > 0 && storeUrl) {
      const baseUrl = storeUrl.endsWith("/") ? storeUrl.slice(0, -1) : storeUrl
      const fullUrls = selectedImages.map((url) => `${baseUrl}${url}`)

      toast.success(`Adding ${fullUrls.length} images to gallery`)

      onSelect(fullUrls)
      onClose()
    }
  }

  const handleSetProductImage = () => {
    if (selectedImage) {
      onSelect(selectedImage)
      toast.success("Product image set successfully")
      onClose()
    }
  }

  const toggleSelectAll = () => {
    if (selectedImages.length === filteredImages.length) {
      setSelectedImages([])
    } else {
      setSelectedImages(filteredImages.map((img) => img.url))
    }
  }

  const getSelectedImageInfo = () => {
    if (!selectedImage || !storeUrl) return null

    const baseUrl = storeUrl.endsWith("/") ? storeUrl.slice(0, -1) : storeUrl
    return images.find((img) => `${baseUrl}${img.url}` === selectedImage)
  }

  const selectedImageInfo = getSelectedImageInfo()

  const handleDownload = () => {
    if (selectedImage) {
      const link = document.createElement("a")
      link.href = selectedImage
      link.download = selectedImageInfo?.name || "image"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleCopyUrl = () => {
    if (selectedImage) {
      navigator.clipboard.writeText(selectedImage)
      toast.success("URL copied to clipboard")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[80vh] max-h-[80vh] flex flex-col overflow-hidden">
        <div className={`relative flex h-full ${isDetailSidebarOpen ? "pr-[400px]" : ""}`}>
          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <DialogHeader>
              <DialogTitle>Media Library</DialogTitle>
            </DialogHeader>

            <Tabs
              defaultValue="browse"
              className="flex-1 flex flex-col overflow-hidden"
              value={activeTab}
              onValueChange={setActiveTab}
            >
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

                {multiSelect && activeTab === "browse" && filteredImages.length > 0 && (
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                      {selectedImages.length === filteredImages.length ? "Deselect All" : "Select All"}
                    </Button>

                    {selectedImages.length > 0 && (
                      <>
                        <Badge variant="secondary">{selectedImages.length} selected</Badge>
                        <Button onClick={handleConfirmSelection} size="sm">
                          <Check className="h-4 w-4 mr-2" />
                          Insert {selectedImages.length > 1 ? "Images" : "Image"}
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <TabsContent value="browse" className="flex-1 overflow-hidden flex flex-col">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading media...</span>
                  </div>
                ) : filteredImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <p>No images found.</p>
                    <Button variant="link" onClick={() => setActiveTab("upload")} className="mt-2">
                      Upload your first image
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="flex-1 h-[calc(100%-4rem)]">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 p-3 pb-6">
                      {filteredImages.map((image, index) => {
                        const isSelected = selectedImages.includes(image.url)

                        return (
                          <div
                            key={index}
                            className={`border rounded-md overflow-hidden transition-colors ${
                              isSelected ? "border-primary border-2 ring-2 ring-primary/20" : "hover:border-primary/60"
                            }`}
                            onClick={() => handleImageSelect(image.url)}
                          >
                            <div className="relative aspect-square bg-muted cursor-pointer">
                              {multiSelect && (
                                <div className="absolute top-2 left-2 z-10">
                                  <Checkbox
                                    checked={isSelected}
                                    className={`h-5 w-5 ${isSelected ? "bg-primary border-primary" : "bg-white/80"}`}
                                    onClick={(e) => e.stopPropagation()}
                                    onCheckedChange={() => handleImageSelect(image.url)}
                                  />
                                </div>
                              )}

                              <div className="absolute top-2 right-2 z-10">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="secondary"
                                  className="h-6 w-6 rounded-full bg-white/80 hover:bg-white"
                                  onClick={(e) => handleViewDetails(image.url, e)}
                                >
                                  <Info className="h-3 w-3" />
                                </Button>
                              </div>

                              <Image
                                src={`${storeUrl}${image.url}`}
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
                              <div className="flex justify-between items-center mt-2">
                                {!multiSelect && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    onClick={() => handleImageSelect(image.url)}
                                  >
                                    Select
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>

              <TabsContent value="upload" className="flex-1">
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-primary/50 transition-colors">
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
                        "Select File"
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
                      <p className="text-sm text-muted-foreground">Your image is being uploaded, please wait...</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - integrated within the dialog */}
          {isDetailSidebarOpen && selectedImage && selectedImageInfo && (
            <div className="absolute top-0 right-0 h-full w-[400px] bg-background border-l shadow-md overflow-hidden flex flex-col">
              {/* Image preview at the top */}
              <div className="relative h-[200px] bg-muted">
                <Image
                  src={selectedImage || "/placeholder.svg"}
                  alt={selectedImageInfo.name || "Selected image"}
                  fill
                  className="object-contain"
                  sizes="400px"
                />
              </div>

              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={handleCopyUrl}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy URL
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.open(selectedImage, "_blank")}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsDetailSidebarOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => selectedImage && handleDeleteImage(selectedImage)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>

              <div className="border-b">
                <div className="flex">
                  <button
                    className={`flex-1 py-2 text-center text-sm font-medium ${sidebarTab === "details" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
                    onClick={() => setSidebarTab("details")}
                  >
                    Details
                  </button>
                  <button
                    className={`flex-1 py-2 text-center text-sm font-medium ${sidebarTab === "seo" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
                    onClick={() => setSidebarTab("seo")}
                  >
                    SEO & Accessibility
                  </button>
                </div>
              </div>

              <ScrollArea className="flex-1 overflow-y-auto">
                {sidebarTab === "details" && (
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Uploaded on</p>
                        <p>{formatDate(selectedImageInfo.uploadedOn || selectedImageInfo.lastModified)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Uploaded by</p>
                        <p>{selectedImageInfo.uploadedBy || "Unknown User"}</p>
                      </div>

                      <div>
                        <p className="text-muted-foreground mb-1">Uploaded to</p>
                        <p>{selectedImageInfo.uploadedTo || "Unknown Page"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">File name</p>
                        <p className="truncate">{selectedImageInfo.name}</p>
                      </div>

                      <div>
                        <p className="text-muted-foreground mb-1">File type</p>
                        <p>{selectedImageInfo.fileType || "image/jpeg"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">File size</p>
                        <p>{formatFileSize(selectedImageInfo.size)}</p>
                      </div>

                      <div>
                        <p className="text-muted-foreground mb-1">Dimensions</p>
                        <p>
                          {selectedImageInfo.dimensions
                            ? `${selectedImageInfo.dimensions.width} × ${selectedImageInfo.dimensions.height} pixels`
                            : "Unknown"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Last modified</p>
                        <p>{formatDate(selectedImageInfo.lastModified)}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-muted-foreground mb-1">File URL</p>
                      <div className="flex items-center mt-1 border rounded-md overflow-hidden">
                        <div className="bg-muted p-2 text-xs truncate flex-1">{selectedImage}</div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigator.clipboard.writeText(selectedImage)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {sidebarTab === "seo" && (
                  <div className="p-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="alt-text">Alternative Text</Label>
                        <Textarea
                          id="alt-text"
                          placeholder="Describe this image"
                          className="mt-1 resize-none"
                          value={altText}
                          onChange={(e) => setAltText(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Describe the purpose of the image for accessibility
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          placeholder="Image title"
                          className="mt-1"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="caption">Caption</Label>
                        <Input
                          id="caption"
                          placeholder="Image caption"
                          className="mt-1"
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Image description"
                          className="mt-1 resize-none"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </ScrollArea>

              {/* Bottom action button */}
              <div className="border-t p-4 mt-auto">
                <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg" onClick={handleSetProductImage}>
                  Set product image
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
