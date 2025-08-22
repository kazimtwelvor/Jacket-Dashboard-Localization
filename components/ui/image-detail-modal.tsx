// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import Image from "next/image"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Separator } from "@/components/ui/separator"
// import { Copy, Download, Trash2, Wand2, ExternalLink, Save, Loader2 } from "lucide-react"
// import { toast } from "react-hot-toast"
// import { formatDistanceToNow } from "date-fns"

// interface ImageDetailModalProps {
//   isOpen: boolean
//   onClose: () => void
//   imageUrl: string | null
//   storeUrl: string | null
//   onDelete: (imageUrl: string) => void
// }

// interface ImageMetadata {
//   name: string
//   type: string
//   size: number
//   dimensions: { width: number; height: number }
//   uploadedOn: string
//   lastModified: string
//   uploadedBy: string
//   uploadedById: string
//   uploadedTo: string
//   path: string
//   altText: string
//   title: string
//   caption: string
//   description: string
//   excludeFromSitemap: boolean
// }

// export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
//   isOpen,
//   onClose,
//   imageUrl,
//   storeUrl,
//   onDelete,
// }) => {
//   const [metadata, setMetadata] = useState<ImageMetadata | null>(null)
//   const [isLoading, setIsLoading] = useState(false)
//   const [isSaving, setIsSaving] = useState(false)
//   const [activeTab, setActiveTab] = useState("details")
//   const [seoData, setSeoData] = useState({
//     altText: "",
//     title: "",
//     caption: "",
//     description: "",
//     excludeFromSitemap: false,
//   })

//   // Fetch image metadata when the imageUrl changes
//   useEffect(() => {
//     const fetchImageMetadata = async () => {
//       if (!imageUrl || !storeUrl) return

//       setIsLoading(true)
//       try {
//         // Format the store URL properly
//         const baseUrl = storeUrl.endsWith("/") ? storeUrl.slice(0, -1) : storeUrl
//         const apiUrl = `${baseUrl}/api/images/metadata?url=${encodeURIComponent(imageUrl)}`

//         const response = await fetch(apiUrl)

//         if (!response.ok) {
//           throw new Error(`Failed to fetch metadata: ${response.status}`)
//         }

//         const data = await response.json()
//         setMetadata(data)

//         // Set SEO data from the metadata
//         setSeoData({
//           altText: data.altText || "",
//           title: data.title || "",
//           caption: data.caption || "",
//           description: data.description || "",
//           excludeFromSitemap: data.excludeFromSitemap || false,
//         })
//       } catch (error) {
//         console.error("Error fetching image metadata:", error)
//         toast.error("Failed to load image details")
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     if (isOpen && imageUrl) {
//       fetchImageMetadata()
//     }
//   }, [imageUrl, storeUrl, isOpen])

//   const handleSave = async () => {
//     if (!metadata || !storeUrl || !imageUrl) return

//     setIsSaving(true)

//     try {
//       // Format the store URL properly
//       const baseUrl = storeUrl.endsWith("/") ? storeUrl.slice(0, -1) : storeUrl
//       const apiUrl = `${baseUrl}/api/images/metadata/save`

//       const saveData = {
//         ...metadata,
//         ...seoData,
//       }

//       const response = await fetch(apiUrl, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(saveData),
//       })

//       if (!response.ok) {
//         throw new Error(`Failed to save metadata: ${response.status}`)
//       }

//       toast.success("Image details saved successfully")
//     } catch (error) {
//       toast.error("Failed to save image details")
//       console.error("Error saving image details:", error)
//     } finally {
//       setIsSaving(false)
//     }
//   }

//   const handleGenerateAlt = () => {
//     if (!metadata?.name) return

//     // Generate a more descriptive alt text based on filename
//     const generatedAlt = metadata.name
//       .replace(/\.[^/.]+$/, "") // Remove file extension
//       .replace(/-/g, " ") // Replace hyphens with spaces
//       .split("_")
//       .join(" ") // Replace underscores with spaces
//       .split(" ")
//       .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(" ")

//     setSeoData({
//       ...seoData,
//       altText: generatedAlt,
//     })

//     toast.success("Generated alternative text")
//   }

//   const handleCopyUrl = () => {
//     if (imageUrl) {
//       navigator.clipboard.writeText(imageUrl)
//       toast.success("URL copied to clipboard")
//     }
//   }

//   const handleDownload = () => {
//     if (imageUrl && metadata?.name) {
//       const link = document.createElement("a")
//       link.href = imageUrl
//       link.download = metadata.name
//       document.body.appendChild(link)
//       link.click()
//       document.body.removeChild(link)
//     }
//   }

//   const handleDelete = () => {
//     if (imageUrl && confirm("Are you sure you want to delete this image? This action cannot be undone.")) {
//       onDelete(imageUrl)
//       onClose()
//     }
//   }

//   const formatFileSize = (bytes: number) => {
//     if (bytes < 1024) return bytes + " B"
//     else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
//     else return (bytes / 1048576).toFixed(1) + " MB"
//   }

//   const getUploadedTimeAgo = (dateString: string) => {
//     try {
//       return formatDistanceToNow(new Date(dateString), { addSuffix: true })
//     } catch (e) {
//       return "Unknown date"
//     }
//   }

//   if (!imageUrl) return null

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
//         <DialogHeader>
//           <DialogTitle>Image Details</DialogTitle>
//         </DialogHeader>

//         {isLoading ? (
//           <div className="flex-1 flex items-center justify-center">
//             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
//             <span className="ml-2 text-muted-foreground">Loading image data...</span>
//           </div>
//         ) : metadata ? (
//           <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-6">
//             {/* Image Preview */}
//             <div className="w-full md:w-2/5 flex flex-col">
//               <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
//                 <Image
//                   src={imageUrl || "/placeholder.svg"}
//                   alt={seoData.altText || "Image preview"}
//                   fill
//                   className="object-contain"
//                   sizes="(max-width: 768px) 100vw, 40vw"
//                 />
//               </div>

//               <div className="mt-4 flex flex-wrap gap-2">
//                 <Button size="sm" variant="outline" onClick={handleCopyUrl}>
//                   <Copy className="h-4 w-4 mr-2" />
//                   Copy URL
//                 </Button>
//                 <Button size="sm" variant="outline" onClick={handleDownload}>
//                   <Download className="h-4 w-4 mr-2" />
//                   Download
//                 </Button>
//                 <Button size="sm" variant="outline" onClick={() => window.open(imageUrl, "_blank")}>
//                   <ExternalLink className="h-4 w-4 mr-2" />
//                   View
//                 </Button>
//                 <Button size="sm" variant="destructive" onClick={handleDelete}>
//                   <Trash2 className="h-4 w-4 mr-2" />
//                   Delete
//                 </Button>
//               </div>
//             </div>

//             {/* Image Details */}
//             <div className="w-full md:w-3/5 overflow-y-auto">
//               <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
//                 <TabsList className="w-full">
//                   <TabsTrigger value="details" className="flex-1">
//                     Details
//                   </TabsTrigger>
//                   <TabsTrigger value="seo" className="flex-1">
//                     SEO & Accessibility
//                   </TabsTrigger>
//                 </TabsList>

//                 <TabsContent value="details" className="space-y-4 mt-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <Label className="text-xs text-muted-foreground">Uploaded on</Label>
//                       <p className="text-sm font-medium">
//                         {new Date(metadata.uploadedOn).toLocaleDateString()} (
//                         {getUploadedTimeAgo(metadata.uploadedOn)})
//                       </p>
//                     </div>
//                     <div>
//                       <Label className="text-xs text-muted-foreground">Uploaded by</Label>
//                       <p className="text-sm font-medium">{metadata.uploadedBy}</p>
//                     </div>
//                     <div>
//                       <Label className="text-xs text-muted-foreground">Uploaded to</Label>
//                       <p className="text-sm font-medium">{metadata.uploadedTo}</p>
//                     </div>
//                     <div>
//                       <Label className="text-xs text-muted-foreground">File name</Label>
//                       <p className="text-sm font-medium truncate">{metadata.name}</p>
//                     </div>
//                     <div>
//                       <Label className="text-xs text-muted-foreground">File type</Label>
//                       <p className="text-sm font-medium">{metadata.type}</p>
//                     </div>
//                     <div>
//                       <Label className="text-xs text-muted-foreground">File size</Label>
//                       <p className="text-sm font-medium">{formatFileSize(metadata.size)}</p>
//                     </div>
//                     <div>
//                       <Label className="text-xs text-muted-foreground">Dimensions</Label>
//                       <p className="text-sm font-medium">
//                         {metadata.dimensions.width} × {metadata.dimensions.height} pixels
//                       </p>
//                     </div>
//                     <div>
//                       <Label className="text-xs text-muted-foreground">Last modified</Label>
//                       <p className="text-sm font-medium">
//                         {new Date(metadata.lastModified).toLocaleDateString()} (
//                         {getUploadedTimeAgo(metadata.lastModified)})
//                       </p>
//                     </div>
//                   </div>

//                   <Separator />

//                   <div>
//                     <Label className="text-xs text-muted-foreground">File URL</Label>
//                     <div className="flex mt-1">
//                       <Input value={imageUrl} readOnly className="text-xs font-mono" />
//                       <Button variant="outline" size="sm" className="ml-2" onClick={handleCopyUrl}>
//                         <Copy className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 </TabsContent>

//                 <TabsContent value="seo" className="space-y-4 mt-4">
//                   <div className="space-y-4">
//                     <div>
//                       <div className="flex justify-between items-center">
//                         <Label htmlFor="alt-text">Alternative Text</Label>
//                         <Button variant="outline" size="sm" onClick={handleGenerateAlt} className="h-7 px-2 text-xs">
//                           <Wand2 className="h-3 w-3 mr-1" />
//                           Generate Alt
//                         </Button>
//                       </div>
//                       <Input
//                         id="alt-text"
//                         value={seoData.altText}
//                         onChange={(e) => setSeoData({ ...seoData, altText: e.target.value })}
//                         className="mt-1"
//                       />
//                       <p className="text-xs text-muted-foreground mt-1">
//                         Describe the purpose of the image. Leave empty if the image is purely decorative.
//                       </p>
//                     </div>

//                     <div>
//                       <Label htmlFor="title">Title</Label>
//                       <Input
//                         id="title"
//                         value={seoData.title}
//                         onChange={(e) => setSeoData({ ...seoData, title: e.target.value })}
//                         className="mt-1"
//                       />
//                     </div>

//                     <div>
//                       <Label htmlFor="caption">Caption</Label>
//                       <Input
//                         id="caption"
//                         value={seoData.caption}
//                         onChange={(e) => setSeoData({ ...seoData, caption: e.target.value })}
//                         className="mt-1"
//                       />
//                     </div>

//                     <div>
//                       <Label htmlFor="description">Description</Label>
//                       <Textarea
//                         id="description"
//                         value={seoData.description}
//                         onChange={(e) => setSeoData({ ...seoData, description: e.target.value })}
//                         className="mt-1"
//                         rows={3}
//                       />
//                     </div>

//                     <div className="flex items-center space-x-2">
//                       <Checkbox
//                         id="exclude-sitemap"
//                         checked={seoData.excludeFromSitemap}
//                         onCheckedChange={(checked) =>
//                           setSeoData({ ...seoData, excludeFromSitemap: checked as boolean })
//                         }
//                       />
//                       <Label htmlFor="exclude-sitemap" className="text-sm font-normal">
//                         Exclude this attachment from sitemap
//                       </Label>
//                     </div>
//                   </div>
//                 </TabsContent>
//               </Tabs>
//             </div>
//           </div>
//         ) : (
//           <div className="flex-1 flex items-center justify-center">
//             <p className="text-muted-foreground">No image details found</p>
//           </div>
//         )}

//         <div className="flex justify-end gap-2 mt-4">
//           <Button variant="outline" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button onClick={handleSave} disabled={isSaving}>
//             {isSaving ? (
//               <>
//                 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                 Saving...
//               </>
//             ) : (
//               <>
//                 <Save className="h-4 w-4 mr-2" />
//                 Save Changes
//               </>
//             )}
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }
