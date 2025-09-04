"use client"

import { useState } from "react"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import ImageUpload from "@/components/ui/image-upload"
import { Button } from "@/components/ui/button"
import { ImageIcon, Info, Trash2 } from "lucide-react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useFormContext } from "react-hook-form"
import type { ProductFormValues } from "../../product-form-schema"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useParams } from "next/navigation"
import { ImageDetailSidebar } from "@/components/ui/image-detail-sidebar"

interface SortableImageProps {
  url: string
  onRemove: (url: string) => void
  onViewDetails: (url: string) => void
  metadata?: any
}

const SortableImage = ({ url, onRemove, onViewDetails, metadata }: SortableImageProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: url })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const filename = url.split("/").pop() || url

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative w-full max-w-[200px] aspect-square rounded-md overflow-hidden border border-gray-200 group cursor-move"
    >
      <img
        src={url || "/placeholder.svg"}
        alt={metadata?.altText || "Product"}
        className="w-full h-full object-cover"
      />

      <div className="absolute top-2 right-2 flex gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="h-6 w-6 rounded-full bg-white hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onViewDetails(url)
                }}
              >
                <Info className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View image details</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onRemove(url)
          }}
          size="icon"
          variant="destructive"
          className="h-6 w-6 rounded-full"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs py-1 px-2 truncate">
        {filename}
      </div>
    </div>
  )
}

export const ImagesSection = ({ isUploading }: { isUploading: boolean }) => {
  const form = useFormContext<ProductFormValues>()
  const [selectedImageForDetail, setSelectedImageForDetail] = useState<string | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedImageMetadata, setSelectedImageMetadata] = useState<any>(null)
  const params = useParams()

  const handleMainImageMetadataChange = (metadata: any) => {
    console.log("Main image metadata changed:", metadata)
    form.setValue("mainImageMetadata", metadata, { shouldDirty: true })
  }

  const handleGalleryImageMetadataChange = (metadata: any, index: number) => {
    console.log(`Gallery image ${index} metadata changed:`, metadata)

    const currentMetadata = form.getValues("imagesMetadata") || []

    const newMetadata = [...currentMetadata]
    while (newMetadata.length <= index) {
      newMetadata.push({})
    }
    newMetadata[index] = metadata

    form.setValue("imagesMetadata", newMetadata, { shouldDirty: true })
  }

  const handleViewDetails = (imageUrl: string) => {
    console.log("View details clicked for:", imageUrl)

    const isMainImage = form.getValues("mainImage") === imageUrl

    if (isMainImage) {
      const metadata = form.getValues("mainImageMetadata")
      console.log("Main image metadata:", metadata)
      setSelectedImageMetadata(metadata)
    } else {
      const galleryImages = form.getValues("images") || []
      const index = galleryImages.indexOf(imageUrl)

      if (index !== -1) {
        const imagesMetadata = form.getValues("imagesMetadata") || []
        const metadata = imagesMetadata[index] || {}
        console.log(`Gallery image ${index} metadata:`, metadata)
        setSelectedImageMetadata(metadata)
      } else {
        console.log("Image not found in gallery")
        setSelectedImageMetadata(null)
      }
    }

    setSelectedImageForDetail(imageUrl)
    setIsDetailModalOpen(true)
  }

  const handleDeleteImage = (imageUrl: string) => {
    if (form.getValues("mainImage") === imageUrl) {
      form.setValue("mainImage", "", { shouldDirty: true, shouldValidate: true })
      form.setValue("mainImageMetadata", null, { shouldDirty: true })
    }
    else {
      const currentImages = form.getValues("images") || []
      const index = currentImages.indexOf(imageUrl)

      if (index !== -1) {
        const currentMetadata = form.getValues("imagesMetadata") || []
        const newMetadata = [...currentMetadata]
        newMetadata.splice(index, 1)
        form.setValue("imagesMetadata", newMetadata, { shouldDirty: true })
      }

      const updatedImages = currentImages.filter((currentUrl) => currentUrl !== imageUrl)
      form.setValue("images", updatedImages, { shouldDirty: true, shouldValidate: true })
    }
    setIsDetailModalOpen(false)
  }

  const handleMetadataChange = (metadata: any) => {
    if (!selectedImageForDetail) return

    const isMainImage = form.getValues("mainImage") === selectedImageForDetail

    if (isMainImage) {
      handleMainImageMetadataChange(metadata)
    } else {
      const galleryImages = form.getValues("images") || []
      const index = galleryImages.indexOf(selectedImageForDetail)

      if (index !== -1) {
        handleGalleryImageMetadataChange(metadata, index)
      }
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragStart = () => {
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const images = form.getValues("images")
      const oldIndex = images.indexOf(active.id)
      const newIndex = images.indexOf(over.id)

      const newOrder = arrayMove(images, oldIndex, newIndex)
      form.setValue("images", newOrder, { shouldDirty: true, shouldValidate: true })

      const imagesMetadata = form.getValues("imagesMetadata") || []
      if (imagesMetadata.length > 0) {
        const newMetadataOrder = arrayMove(imagesMetadata, oldIndex, newIndex)
        form.setValue("imagesMetadata", newMetadataOrder, { shouldDirty: true })
      }
    }
  }

  const handleAddMultipleImages = (urls: string[]) => {
    const currentImages = form.getValues("images") || []
    const newImages = urls.filter((url) => !currentImages.includes(url))

    if (newImages.length > 0) {
      const updatedImages = [...currentImages, ...newImages]
      form.setValue("images", updatedImages, { shouldDirty: true, shouldValidate: true })
    }
  }

  const getGalleryImageMetadata = (url: string) => {
    const galleryImages = form.getValues("images") || []
    const index = galleryImages.indexOf(url)

    if (index !== -1) {
      const imagesMetadata = form.getValues("imagesMetadata") || []
      return imagesMetadata[index] || null
    }
    return null
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Product Images</h3>
            </div>
            <p className="text-sm text-muted-foreground">Upload high-quality images of your product</p>

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="mainImage"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-3">
                      <FormLabel className="text-base font-medium flex items-center gap-1">
                        Main Product Image <span className="text-red-500">*</span>
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        This will be the main thumbnail image displayed in product listings and at the top of the
                        product page.
                      </p>

                      <FormControl>
                        <div className="flex items-center justify-between">
                          <div className="w-full max-w-[200px]">
                            <ImageUpload
                              value={field.value ? [field.value] : []}
                              disabled={isUploading}
                              onChange={(url) => {
                                field.onChange(url)
                              }}
                              onRemove={() => field.onChange("")}
                              multiple={false}
                              onViewDetails={handleViewDetails}
                              metadata={form.getValues("mainImageMetadata")}
                              onMetadataChange={handleMainImageMetadataChange}
                            />
                          </div>
                        </div>
                      </FormControl>

                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-base font-medium">Gallery Images</FormLabel>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Add additional product images to showcase different angles and details. These will appear in the
                        product gallery. Drag images to change their order.
                      </p>

                      <FormControl>
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                        >
                          <div className="space-y-4">
                            {field.value.length > 0 && (
                              <SortableContext items={field.value} strategy={verticalListSortingStrategy}>
                                <div className="flex flex-wrap gap-3">
                                  {field.value.map((url, index) => {
                                    const metadata = form.getValues("imagesMetadata")?.[index] || null
                                    return (
                                      <SortableImage
                                        key={url}
                                        url={url}
                                        metadata={metadata}
                                        onRemove={(url) => {
                                          const updatedImages = field.value.filter((current) => current !== url)
                                          field.onChange(updatedImages)
                                        }}
                                        onViewDetails={handleViewDetails}
                                      />
                                    )
                                  })}
                                </div>
                              </SortableContext>
                            )}

                            <div className="max-w-[200px]">
                              <ImageUpload
                                value={[]}
                                disabled={isUploading}
                                onChange={(url) => {
                                  if (!field.value.includes(url)) {
                                    const updatedImages = [...field.value, url]
                                    field.onChange(updatedImages)
                                  }
                                }}
                                onRemove={(url) => {
                                  const currentImages = field.value || []
                                  const index = currentImages.indexOf(url)

                                  if (index !== -1) {
                                    const currentMetadata = form.getValues("imagesMetadata") || []
                                    const newMetadata = [...currentMetadata]
                                    newMetadata.splice(index, 1)
                                    form.setValue("imagesMetadata", newMetadata, { shouldDirty: true })
                                  }
                                  field.onChange(field.value.filter((current) => current !== url))
                                }}
                                multiple={true}
                                onMultipleSelect={handleAddMultipleImages}
                                onViewDetails={handleViewDetails}
                                selectedImageForDetail={selectedImageForDetail}
                                isDetailModalOpen={isDetailModalOpen}
                                setIsDetailModalOpen={setIsDetailModalOpen}
                                onDeleteImage={handleDeleteImage}
                                metadata={
                                  selectedImageForDetail && field.value.includes(selectedImageForDetail)
                                    ? getGalleryImageMetadata(selectedImageForDetail)
                                    : null
                                }
                                onMetadataChange={(metadata) => {
                                  const currentImages = field.value || []
                                  if (selectedImageForDetail) {
                                    const index = currentImages.indexOf(selectedImageForDetail)
                                    if (index !== -1) {
                                      handleGalleryImageMetadataChange(metadata, index)
                                    }
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </DndContext>
                      </FormControl>

                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isDetailModalOpen && selectedImageForDetail && (
        <ImageDetailSidebar
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          imageUrl={selectedImageForDetail}
          storeUrl={null}
          onDelete={handleDeleteImage}
          initialMetadata={selectedImageMetadata}
          onMetadataChange={handleMetadataChange}
        />
      )}
    </>
  )
}
