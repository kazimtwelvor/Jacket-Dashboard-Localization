"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Copy, Download, Trash2, Wand2, ExternalLink, Save, Loader2, X, AlertCircle } from "lucide-react"
import { toast } from "react-hot-toast"
import { formatDistanceToNow } from "date-fns"
import { useParams } from "next/navigation"

interface ImageDetailSidebarProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string | null
  storeUrl: string | null
  onDelete: (imageUrl: string) => void
  initialMetadata?: {
    altText?: string
    title?: string
    caption?: string
    description?: string
    excludeFromSitemap?: boolean
  } | null
  onMetadataChange?: (metadata: any) => void
}

interface ImageMetadata {
  name: string
  type: string
  size: number
  dimensions: { width: number; height: number }
  uploadedOn: string
  lastModified: string
  uploadedBy: string
  uploadedById: string
  uploadedTo: string
  path: string
  altText: string
  title: string
  caption: string
  description: string
  excludeFromSitemap: boolean
  imageId?: string 
}

const metadataCache = new Map<string, any>()

export const ImageDetailSidebar: React.FC<ImageDetailSidebarProps> = ({
  isOpen,
  onClose,
  imageUrl,
  storeUrl,
  onDelete,
  initialMetadata,
  onMetadataChange,
}) => {
  const params = useParams()
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [seoData, setSeoData] = useState({
    altText: "",
    title: "",
    caption: "",
    description: "",
    excludeFromSitemap: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [imageId, setImageId] = useState<string | null>(null)

  const createDefaultMetadata = (url: string) => {
    const filename = url.split("/").pop() || "image"
    return {
      name: filename,
      type: filename.endsWith(".png")
        ? "image/png"
        : filename.endsWith(".jpg") || filename.endsWith(".jpeg")
          ? "image/jpeg"
          : filename.endsWith(".webp")
            ? "image/webp"
            : filename.endsWith(".gif")
              ? "image/gif"
              : "image/jpeg",
      size: 0,
      dimensions: { width: 800, height: 600 },
      uploadedOn: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      uploadedBy: "Unknown",
      uploadedById: "",
      uploadedTo: "",
      path: url,
      altText: "",
      title: "",
      caption: "",
      description: "",
      excludeFromSitemap: false,
    }
  }

  const getStoreId = () => {
    if (params && params.storeId) {
      return params.storeId
    }

    if (!storeUrl) return null


  
    const uuidMatch = storeUrl.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)
    if (uuidMatch) {
      return uuidMatch[0]
    }

    const urlParts = storeUrl.split("/").filter(Boolean) // Remove empty segments

    const markers = ["dashboard", "store", "admin"]
    for (let i = 0; i < urlParts.length; i++) {
      if (markers.includes(urlParts[i]) && i + 1 < urlParts.length) {
        return urlParts[i + 1]
      }
    }

    if (urlParts.length >= 2 && !markers.includes(urlParts[0])) {
      return urlParts[1]
    }

    return null
  }

  useEffect(() => {
    const fetchImageMetadata = async () => {
      if (!imageUrl) return

      setIsLoading(true)
      setError(null)

      try {
        if (
          initialMetadata &&
          (initialMetadata.altText ||
            initialMetadata.title ||
            initialMetadata.caption ||
            initialMetadata.description ||
            initialMetadata.excludeFromSitemap)
        ) {
          setMetadata({
            ...createDefaultMetadata(imageUrl),
            ...initialMetadata,
          })
          setSeoData({
            altText: initialMetadata.altText || "",
            title: initialMetadata.title || "",
            caption: initialMetadata.caption || "",
            description: initialMetadata.description || "",
            excludeFromSitemap: initialMetadata.excludeFromSitemap || false,
          })
          setIsLoading(false)
          return
        }

        const storeId = getStoreId()

        if (storeId) {
          const timestamp = new Date().getTime()
          const apiUrl = `/api/${storeId}/images/metadata?url=${encodeURIComponent(imageUrl)}&t=${timestamp}`

          try {
            const response = await fetch(apiUrl, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
              },
              cache: "no-store",
            })


            if (response.ok) {
              const data = await response.json()

              if (data && Object.keys(data).length > 0) {
                setMetadata(data)
                setSeoData({
                  altText: data.altText || "",
                  title: data.title || "",
                  caption: data.caption || "",
                  description: data.description || "",
                  excludeFromSitemap: data.excludeFromSitemap || false,
                })

                if (data.imageId) {
                  setImageId(data.imageId)
                }

                setIsLoading(false)
                return
              }
            } else {
              try {
                const errorText = await response.text()
              } catch (textError) {
              }
              throw new Error(`API error: ${response.status}`)
            }
          } catch (apiError) {
            setError("Failed to load image details from server. Using default values.")
          }
        } else {
          setError("Could not determine store ID. Using default values.")
        }

        const defaultData = createDefaultMetadata(imageUrl)
        setMetadata(defaultData)
        setSeoData({
          altText: "",
          title: "",
          caption: "",
          description: "",
          excludeFromSitemap: false,
        })
      } catch (error) {
        setError("An error occurred while loading image details. Using default values.")

        if (!metadata) {
          const defaultData = createDefaultMetadata(imageUrl)
          setMetadata(defaultData)
          setSeoData({
            altText: "",
            title: "",
            caption: "",
            description: "",
            excludeFromSitemap: false,
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen && imageUrl) {
      fetchImageMetadata()
    }
  }, [imageUrl, storeUrl, isOpen, params, initialMetadata])

  const handleSave = async () => {
    if (!imageUrl) return

    setIsSaving(true)
    setError(null)

    try {
      // Update the metadata with SEO data
      const updatedMetadata = {
        ...(metadata || createDefaultMetadata(imageUrl)),
        ...seoData,
        lastModified: new Date().toISOString(),
        url: imageUrl, // Make sure to include the image URL
        imageId: imageId, // Include the image ID if available
      }

      if (onMetadataChange) {
        onMetadataChange(seoData)
      }

      const storeId = getStoreId()

      if (storeId) {
        const apiUrl = `/api/${storeId}/images/metadata/save`

        try {
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedMetadata),
          })


          if (response.ok) {
            const savedData = await response.json()

            if (savedData.id && (!imageId || imageId !== savedData.id)) {
              setImageId(savedData.id)

              updatedMetadata.imageId = savedData.id
            }

            setMetadata({
              ...updatedMetadata,
              altText: seoData.altText,
              title: seoData.title,
              caption: seoData.caption,
              description: seoData.description,
              excludeFromSitemap: seoData.excludeFromSitemap,
            })

            toast.success("Image details saved successfully")
          } else {
            try {
              const errorText = await response.text()
            } catch (textError) {
            }
            setError("Failed to save to server. Changes preserved locally.")
            toast.error("Failed to save to server. Changes preserved locally.")
          }
        } catch (apiError) {
          setError("Failed to save to server. Changes preserved locally.")
          toast.error("Failed to save to server. Changes preserved locally.")
        }
      } else {
        setError("Could not determine store ID. Changes preserved locally.")
        toast.error("Could not determine store ID. Changes preserved locally.")
      }
    } catch (error) {
      setError("An error occurred, but changes were saved locally")
      toast.error("An error occurred, but changes were saved locally")
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateAlt = () => {
    if (!metadata?.name) return

    const generatedAlt = metadata.name
      .replace(/\.[^/.]+$/, "") // Remove file extension
      .replace(/-/g, " ") // Replace hyphens with spaces
      .split("_")
      .join(" ") // Replace underscores with spaces
      .split(" ")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")

    setSeoData({
      ...seoData,
      altText: generatedAlt,
    })

    toast.success("Generated alternative text")
  }

  const handleCopyUrl = () => {
    if (imageUrl) {
      navigator.clipboard.writeText(imageUrl)
      toast.success("URL copied to clipboard")
    }
  }

  const handleDownload = () => {
    if (imageUrl && metadata?.name) {
      const link = document.createElement("a")
      link.href = imageUrl
      link.download = metadata.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleDelete = () => {
    if (imageUrl && confirm("Are you sure you want to delete this image? This action cannot be undone.")) {
      metadataCache.delete(imageUrl)
      onDelete(imageUrl)
      onClose()
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const getUploadedTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (e) {
      return "Unknown date"
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-background border-l shadow-lg z-50 flex flex-col overflow-hidden animate-in slide-in-from-right">
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">Attachment Details</h2>
      </div>

      {error && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {imageId && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-2 text-xs text-blue-700">Image ID: {imageId}</div>
      )}

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading image data...</span>
        </div>
      ) : metadata ? (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="relative aspect-video bg-muted rounded-md overflow-hidden mb-4">
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt={seoData.altText || "Image preview"}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Button size="sm" variant="outline" onClick={handleCopyUrl}>
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </Button>
              <Button size="sm" variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.open(imageUrl || "", "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button size="sm" variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>

            <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">
                  Details
                </TabsTrigger>
                <TabsTrigger value="seo" className="flex-1">
                  SEO & Accessibility
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Uploaded on</Label>
                    <p className="text-sm font-medium">
                      {new Date(metadata.uploadedOn).toLocaleDateString()} ({getUploadedTimeAgo(metadata.uploadedOn)})
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Uploaded by</Label>
                    <p className="text-sm font-medium">{metadata.uploadedBy}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Uploaded to</Label>
                    <p className="text-sm font-medium">{metadata.uploadedTo}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">File name</Label>
                    <p className="text-sm font-medium truncate">{metadata.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">File type</Label>
                    <p className="text-sm font-medium">{metadata.type}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">File size</Label>
                    <p className="text-sm font-medium">{formatFileSize(metadata.size)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Dimensions</Label>
                    <p className="text-sm font-medium">
                      {metadata.dimensions.width} × {metadata.dimensions.height} pixels
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Last modified</Label>
                    <p className="text-sm font-medium">
                      {new Date(metadata.lastModified).toLocaleDateString()} (
                      {getUploadedTimeAgo(metadata.lastModified)})
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-xs text-muted-foreground">File URL</Label>
                  <div className="flex mt-1">
                    <Input value={imageUrl || ""} readOnly className="text-xs font-mono" />
                    <Button variant="outline" size="sm" className="ml-2" onClick={handleCopyUrl}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center">
                      <Label htmlFor="alt-text">Alternative Text</Label>
                      <Button variant="outline" size="sm" onClick={handleGenerateAlt} className="h-7 px-2 text-xs">
                        <Wand2 className="h-3 w-3 mr-1" />
                        Generate Alt
                      </Button>
                    </div>
                    <Input
                      id="alt-text"
                      value={seoData.altText}
                      onChange={(e) => setSeoData({ ...seoData, altText: e.target.value })}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Describe the purpose of the image. Leave empty if the image is purely decorative.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={seoData.title}
                      onChange={(e) => setSeoData({ ...seoData, title: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="caption">Caption</Label>
                    <Input
                      id="caption"
                      value={seoData.caption}
                      onChange={(e) => setSeoData({ ...seoData, caption: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={seoData.description}
                      onChange={(e) => setSeoData({ ...seoData, description: e.target.value })}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="exclude-sitemap"
                      checked={seoData.excludeFromSitemap}
                      onCheckedChange={(checked) => setSeoData({ ...seoData, excludeFromSitemap: checked as boolean })}
                    />
                    <Label htmlFor="exclude-sitemap" className="text-sm font-normal">
                      Exclude this attachment from sitemap
                    </Label>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">No image details found</p>
        </div>
      )}

      <div className="p-4 border-t">
        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
