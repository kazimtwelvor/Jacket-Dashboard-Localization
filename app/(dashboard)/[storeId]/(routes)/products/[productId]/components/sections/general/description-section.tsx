"use client"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import type { UseFormReturn } from "react-hook-form"
import {
  Wand2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  Link,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import type { ProductFormValues } from "../../product-form-schema"
import { useToast } from "@/hooks/use-toast"
import TiptapEditor from "./tiptap-editor"

interface DescriptionSectionProps {
  form: UseFormReturn<ProductFormValues>
}

type ImageAlignment = "left" | "center" | "right"

interface DescriptionImage {
  url: string
  link?: string
  alignment: ImageAlignment
  size: number 
}

export const DescriptionSection: React.FC<DescriptionSectionProps> = ({ form }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [canGenerate, setCanGenerate] = useState(false)
  const [showImageSelector, setShowImageSelector] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageLink, setImageLink] = useState("")
  const [imageAlignment, setImageAlignment] = useState<ImageAlignment>("center")
  const [imageSize, setImageSize] = useState<number>(100)
  const [descriptionText, setDescriptionText] = useState("")
  const [descriptionImages, setDescriptionImages] = useState<DescriptionImage[]>([])
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement | null>(null)

  const checkCanGenerate = (): boolean => {
    const formValues = form.getValues()
    const name = formValues.name
    const specs = formValues.specifications

    const hasName = Boolean(name && name.trim().length > 0)
    const hasColor = Boolean(specs && specs.color && Array.isArray(specs.color) && specs.color.length > 0)

    return hasName && hasColor
  }

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.includes("name") || name?.includes("specifications")) {
        const canGen = checkCanGenerate()
        setCanGenerate(canGen)
      }
    })

    setCanGenerate(checkCanGenerate())

    return () => subscription.unsubscribe()
  }, [form])

  useEffect(() => {
    const initialDescription = form.getValues("description") || ""
    setDescriptionText(initialDescription)
  }, [form])

  const handleGenerateDescription = async () => {
    const canGen = checkCanGenerate()
    setCanGenerate(canGen)

    if (!canGen) return

    try {
      setIsGenerating(true)
      const productInfo = {
        name: form.getValues("name"),
        specifications: form.getValues("specifications") || {},
      }

      const response = await fetch(`/api/${window.location.pathname.split("/")[1]}/products/generate-description`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productInfo),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const data = await response.json()

      setDescriptionText(data.description)
      updateDescriptionField(data.description, descriptionImages)

      toast({
        title: "Success",
        description: "Product description generated successfully!",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      toast({
        title: "Error",
        description: `Failed to generate description: ${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const addImageToDescription = () => {
    if (!selectedImage) return

    try {
      const newImages = [
        ...descriptionImages,
        {
          url: selectedImage,
          link: imageLink && imageLink.trim() !== "" ? imageLink : undefined,
          alignment: imageAlignment,
          size: imageSize,
        },
      ]

      setDescriptionImages(newImages)

      updateDescriptionField(descriptionText, newImages)

      toast({
        title: "Image Added",
        description: "The image has been added to your product description.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not add image to description. Please try again.",
        variant: "destructive",
      })
    }

    setSelectedImage(null)
    setImageLink("")
    setImageAlignment("center")
    setImageSize(100)

    setShowImageSelector(false)
  }

  const updateImageAlignment = (index: number, alignment: ImageAlignment) => {
    try {

      const newImages = [...descriptionImages]
      newImages[index] = {
        ...newImages[index],
        alignment: alignment,
      }

      setDescriptionImages(newImages)

      updateDescriptionField(descriptionText, newImages)

      toast({
        title: "Alignment Updated",
        description: `Image alignment changed to ${alignment}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update image alignment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateImageSize = (index: number, size: number) => {
    try {

      const newImages = [...descriptionImages]
      newImages[index] = {
        ...newImages[index],
        size: size,
      }

      setDescriptionImages(newImages)

      updateDescriptionField(descriptionText, newImages)

      toast({
        title: "Size Updated",
        description: `Image size changed to ${size}%.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update image size. Please try again.",
        variant: "destructive",
      })
    }
  }

  const removeImage = (index: number) => {
    try {
      const newImages = [...descriptionImages]
      newImages.splice(index, 1)
      setDescriptionImages(newImages)

      updateDescriptionField(descriptionText, newImages)

      toast({
        title: "Image Removed",
        description: "The image has been removed from your product description.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not remove image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const removeAllImages = () => {
    if (descriptionImages.length === 0) {
      toast({
        title: "No Images Found",
        description: "There are no images in the product description to remove.",
        variant: "destructive",
      })
      return
    }

    try {
      setDescriptionImages([])

      updateDescriptionField(descriptionText, [])

      toast({
        title: "Images Removed",
        description: "All images have been removed from the product description.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not remove images. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateDescriptionField = (text: string, images: DescriptionImage[]) => {
    try {
      let imagesHtml = ""

      images.forEach((img) => {
        let containerStyle = ""
        let imgStyle = ""

        switch (img.alignment) {
          case "left":
            containerStyle = "text-align: left; margin: 20px 0; clear: both;"
            imgStyle = `width: ${img.size}%; max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); float: left; margin-right: 20px; margin-bottom: 10px;`
            break
          case "right":
            containerStyle = "text-align: right; margin: 20px 0; clear: both;"
            imgStyle = `width: ${img.size}%; max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); float: right; margin-left: 20px; margin-bottom: 10px;`
            break
          case "center":
          default:
            containerStyle = "text-align: center; margin: 20px auto; clear: both;"
            imgStyle = `width: ${img.size}%; max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin: 0 auto; display: block;`
            break
        }

        const productTitle = form.getValues("name") || "Product"

        if (img.link) {
          const formattedLink = img.link.match(/^https?:\/\//) ? img.link : `https://${img.link}`
          imagesHtml += `<div style="${containerStyle}"><a href="${formattedLink}" target="_blank" rel="noopener noreferrer"><img src="${img.url}" alt="${productTitle}" style="${imgStyle}" /></a></div>`
        } else {
          imagesHtml += `<div style="${containerStyle}"><img src="${img.url}" alt="${productTitle}" style="${imgStyle}" /></div>`
        }
      })

      const combinedDescription = text + imagesHtml

      form.setValue("description", combinedDescription, { shouldDirty: true, shouldTouch: true })

    } catch (error) {
    }
  }

  const handleDescriptionChange = (value: string) => {
    setDescriptionText(value)
    updateDescriptionField(value, descriptionImages)
  }

  const getProductImages = () => {
    const mainImage = form.getValues("mainImage")
    const galleryImages = form.getValues("images") || []

    const allImages = [mainImage, ...galleryImages].filter(Boolean)
    return allImages
  }

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl)
  }

  const getSizeLabel = (size: number) => {
    if (size <= 25) return "Small"
    if (size <= 50) return "Medium"
    if (size <= 75) return "Large"
    return "Full Width"
  }

  useEffect(() => {
    const findForm = () => {
      let element = document.querySelector('[name="description"]')
      while (element && element.tagName !== "FORM") {
        element = element.parentElement
      }
      return element as HTMLFormElement
    }

    formRef.current = findForm()

    const handleSubmit = () => {
      updateDescriptionField(descriptionText, descriptionImages)
    }

    if (formRef.current) {
      formRef.current.addEventListener("submit", handleSubmit)
    }

    return () => {
      if (formRef.current) {
        formRef.current.removeEventListener("submit", handleSubmit)
      }
    }
  }, [descriptionText, descriptionImages])

  return (
    <div className="rounded-lg border-2 border-primary/10 p-6 bg-gradient-to-r from-background to-primary/5 dark:from-background dark:to-primary/10">
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between mb-4">
              <div>
                <FormLabel className="text-lg font-bold block text-foreground">
                  Full Description <span className="text-red-500">*</span>
                </FormLabel>
                <p className="text-sm text-muted-foreground">Provide a detailed description of your product</p>
              </div>
              <Badge variant="outline" className="font-normal bg-background text-foreground border-border">
                Step 9
              </Badge>
            </div>

            {!canGenerate && (
              <Alert variant="destructive" className="mb-4 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {!form.getValues("name") || form.getValues("name").trim() === ""
                    ? "Please enter a Product Name in Step 1"
                    : "Please select at least one Color in the Specifications section (Step 2)"}
                </AlertDescription>
              </Alert>
            )}

            {canGenerate && (
              <Alert className="mb-4 bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Ready to generate! Click the button below to create an AI-powered description
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className={`flex items-center gap-2 flex-1 justify-center ${
                    canGenerate
                      ? "bg-gradient-to-r from-primary/80 to-primary text-white hover:from-primary hover:to-primary/90"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                  onClick={handleGenerateDescription}
                  disabled={isGenerating || !canGenerate}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Generating AI Description...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-5 w-5 mr-2" />
                      Generate Description with Gemini AI
                    </>
                  )}
                </Button>

                <Dialog open={showImageSelector} onOpenChange={setShowImageSelector}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex items-center gap-2"
                      disabled={getProductImages().length === 0}
                    >
                      <ImageIcon className="h-5 w-5" />
                      Add Image
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add an image to your description</DialogTitle>
                    </DialogHeader>

                    <Tabs defaultValue="select" className="mt-4">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="select">Select Image</TabsTrigger>
                        <TabsTrigger value="options" disabled={!selectedImage}>
                          Image Options
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="select" className="mt-4">
                        <ScrollArea className="h-[300px]">
                          <div className="grid grid-cols-2 gap-4 p-2">
                            {getProductImages().map((imageUrl, index) => (
                              <div
                                key={index}
                                className={`relative border rounded-md overflow-hidden cursor-pointer transition-all ${
                                  selectedImage === imageUrl ? "ring-2 ring-primary ring-offset-2" : "hover:opacity-90"
                                }`}
                                onClick={() => handleImageSelect(imageUrl)}
                              >
                                <img
                                  src={imageUrl || "/placeholder.svg"}
                                  alt={`Product image ${index + 1}`}
                                  className="w-full h-40 object-cover"
                                />
                                {selectedImage === imageUrl && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                                    <Badge variant="secondary" className="bg-white">
                                      Selected
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            ))}
                            {getProductImages().length === 0 && (
                              <div className="col-span-2 p-8 text-center text-muted-foreground">
                                No images available. Please upload product images first.
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>

                      <TabsContent value="options" className="mt-4 space-y-4">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-base font-medium">Image Size</Label>
                            <div className="mt-2 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground flex items-center">
                                  <Minimize2 className="h-3 w-3 mr-1" />
                                  Small
                                </span>
                                <span className="text-sm font-medium">{imageSize}%</span>
                                <span className="text-sm text-muted-foreground flex items-center">
                                  Full Width
                                  <Maximize2 className="h-3 w-3 ml-1" />
                                </span>
                              </div>
                              <Slider
                                value={[imageSize]}
                                min={25}
                                max={100}
                                step={5}
                                onValueChange={(value) => setImageSize(value[0])}
                              />
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">
                                  Current size: {getSizeLabel(imageSize)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t">
                            <Label className="text-base font-medium">Image Alignment</Label>
                            <RadioGroup
                              value={imageAlignment}
                              onValueChange={(value) => setImageAlignment(value as ImageAlignment)}
                              className="flex flex-col space-y-1 mt-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="left" id="align-left" />
                                <Label htmlFor="align-left" className="flex items-center cursor-pointer">
                                  <AlignLeft className="h-4 w-4 mr-2" />
                                  Left aligned
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="center" id="align-center" />
                                <Label htmlFor="align-center" className="flex items-center cursor-pointer">
                                  <AlignCenter className="h-4 w-4 mr-2" />
                                  Center aligned
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="right" id="align-right" />
                                <Label htmlFor="align-right" className="flex items-center cursor-pointer">
                                  <AlignRight className="h-4 w-4 mr-2" />
                                  Right aligned
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          <div className="space-y-2 pt-2 border-t">
                            <Label htmlFor="image-link" className="flex items-center">
                              <Link className="h-4 w-4 mr-2" />
                              Add Link (Optional)
                            </Label>
                            <Input
                              id="image-link"
                              placeholder="https://example.com"
                              value={imageLink}
                              onChange={(e) => setImageLink(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Enter a URL to make the image clickable</p>
                          </div>
                        </div>

                        {selectedImage && (
                          <div className="pt-4 border-t">
                            <p className="text-sm font-medium mb-2">Preview:</p>
                            <div
                              className={`border rounded-md p-2 bg-gray-50 ${
                                imageAlignment === "left"
                                  ? "text-left"
                                  : imageAlignment === "right"
                                    ? "text-right"
                                    : "text-center"
                              }`}
                            >
                              <img
                                src={selectedImage || "/placeholder.svg"}
                                alt="Preview"
                                className={`rounded-md max-h-32 inline-block ${
                                  imageAlignment === "left"
                                    ? "float-left mr-4"
                                    : imageAlignment === "right"
                                      ? "float-right ml-4"
                                      : "mx-auto"
                                }`}
                                style={{ width: `${imageSize}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>

                    <DialogFooter className="mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSelectedImage(null)
                          setImageLink("")
                          setImageAlignment("center")
                          setImageSize(100)
                          setShowImageSelector(false)
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="button" onClick={addImageToDescription} disabled={!selectedImage}>
                        Add to Description
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={removeAllImages}
                >
                  <ImageIcon className="h-5 w-5" />
                  Remove Images
                </Button>
              </div>

              <FormControl>
                <TiptapEditor
                  value={descriptionText}
                  onChange={handleDescriptionChange}
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>

              {descriptionImages.length > 0 && (
                <div className="mt-4 border rounded-md p-4 bg-muted/50">
                  <h3 className="text-sm font-medium mb-3 text-foreground">Product Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {descriptionImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img.url || "/placeholder.svg"}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-auto rounded-md border"
                        />
                        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeImage(index)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute bottom-2 left-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-md p-2">
                          <div className="flex space-x-1">
                            <Button
                              type="button"
                              variant={img.alignment === "left" ? "default" : "outline"}
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateImageAlignment(index, "left")
                              }}
                            >
                              <AlignLeft className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant={img.alignment === "center" ? "default" : "outline"}
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateImageAlignment(index, "center")
                              }}
                            >
                              <AlignCenter className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant={img.alignment === "right" ? "default" : "outline"}
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateImageAlignment(index, "right")
                              }}
                            >
                              <AlignRight className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateImageSize(index, Math.max(25, img.size - 25))
                              }}
                            >
                              <Minimize2 className="h-3 w-3 mr-1" />
                              Smaller
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateImageSize(index, Math.min(100, img.size + 25))
                              }}
                            >
                              <Maximize2 className="h-3 w-3 mr-1" />
                              Larger
                            </Button>
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 flex flex-col items-end space-y-1">
                          <Badge variant="secondary">
                            {getSizeLabel(img.size)} ({img.size}%)
                          </Badge>
                          {img.link && (
                            <Badge variant="outline" className="bg-white">
                              <Link className="h-3 w-3 mr-1" />
                              Linked
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </div>
  )
}
