// "use client"

// import type React from "react"

// import { useState } from "react"
// import { Copy, Edit, Trash, Eye } from "lucide-react"
// import { useParams, useRouter } from "next/navigation"
// import { useToast } from "@/hooks/use-toast"
// import { Button } from "@/components/ui/button"
// import { AlertModal } from "@/components/modals/alert-modal"

// import type { ProductColumn } from "../types"

// interface CellActionProps {
//   data: ProductColumn
// }

// export const CellAction: React.FC<CellActionProps> = ({ data }) => {
//   const [loading, setLoading] = useState(false)
//   const [open, setOpen] = useState(false)
//   const router = useRouter()
//   const params = useParams()
//   const { toast } = useToast()

//   const onCopy = (id: string) => {
//     navigator.clipboard.writeText(id)
//     toast({
//       title: "Copied!",
//       description: "Product ID copied to clipboard.",
//     })
//   }

//   const onDelete = async () => {
//     try {
//       setLoading(true)

//       // Use the dedicated trash endpoint instead of DELETE
//       const response = await fetch(`/api/${params.storeId}/products/${data.id}/trash`, {
//         method: "POST",
//       })

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}))
//         console.error("Error moving product to trash:", errorData)
//         throw new Error("Failed to move product to trash")
//       }

//       router.refresh()
//       toast({
//         title: "Success",
//         description: "Product moved to trash successfully.",
//       })
//     } catch (error) {
//       console.error("Error in onDelete:", error)
//       toast({
//         title: "Error",
//         description: "Something went wrong. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setLoading(false)
//       setOpen(false)
//     }
//   }

//   const onDuplicate = async () => {
//     try {
//       setLoading(true)
//       const response = await fetch(`/api/${params.storeId}/products/${data.id}/duplicate`, {
//         method: "POST",
//       })

//       if (!response.ok) {
//         throw new Error("Failed to duplicate product")
//       }

//       router.refresh()
//       toast({
//         title: "Success",
//         description: "Product duplicated successfully.",
//       })
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Something went wrong. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const onPreview = () => {
//     window.open(`/preview/${params.storeId}/products/${data.id}`, "_blank")
//   }

//   return (
//     <>
//       <AlertModal
//         isOpen={open}
//         onClose={() => setOpen(false)}
//         onConfirm={onDelete}
//         loading={loading}
//         title="Move to trash?"
//         description="This product will be moved to trash. You can restore it later or delete it permanently from the trash."
//       />
//       <div className="flex items-center gap-2">
//         <Button
//           variant="ghost"
//           size="sm"
//           className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
//           onClick={() => router.push(`/${params.storeId}/products/${data.id}`)}
//         >
//           <Edit className="h-3 w-3 mr-1" />
//           Edit
//         </Button>
//         <Button
//           variant="ghost"
//           size="sm"
//           className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
//           onClick={() => setOpen(true)}
//         >
//           <Trash className="h-3 w-3 mr-1" />
//           Trash
//         </Button>
//         <Button
//           variant="ghost"
//           size="sm"
//           className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
//           onClick={onPreview}
//         >
//           <Eye className="h-3 w-3 mr-1" />
//           View
//         </Button>
//         <Button
//           variant="ghost"
//           size="sm"
//           className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
//           onClick={onDuplicate}
//         >
//           <Copy className="h-3 w-3 mr-1" />
//           Duplicate
//         </Button>
//       </div>
//     </>
//   )
// }


"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Copy, Edit, Trash, Eye } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { AlertModal } from "@/components/modals/alert-modal"

import type { ProductColumn } from "../types"

interface CellActionProps {
  data: ProductColumn
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [frontendUrl, setFrontendUrl] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  // Try to get the frontend URL when the component mounts
  useEffect(() => {
    // This is a workaround to access environment variables in client components
    const getFrontendUrl = async () => {
      try {
        const response = await fetch("/api/config/frontend-url")
        if (response.ok) {
          const { url } = await response.json()
          setFrontendUrl(url)
          console.log("Frontend URL loaded:", url)
        } else {
          console.warn("Failed to load frontend URL from API")
        }
      } catch (error) {
        console.error("Error fetching frontend URL:", error)
      }
    }

    getFrontendUrl()
  }, [])

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id)
    toast({
      title: "Copied!",
      description: "Product ID copied to clipboard.",
    })
  }

  const onDelete = async () => {
    try {
      setLoading(true)

      // Use the dedicated trash endpoint instead of DELETE
      const response = await fetch(`/api/${params.storeId}/products/${data.id}/trash`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Error moving product to trash:", errorData)
        throw new Error("Failed to move product to trash")
      }

      router.refresh()
      toast({
        title: "Success",
        description: "Product moved to trash successfully.",
      })
    } catch (error) {
      console.error("Error in onDelete:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  const onDuplicate = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/${params.storeId}/products/${data.id}/duplicate`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to duplicate product")
      }

      router.refresh()
      toast({
        title: "Success",
        description: "Product duplicated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const onPreview = () => {
    // Hardcoded URL for testing - replace with your actual frontend URL
    const hardcodedUrl = "http://192.168.100.114:3001"

    // Use the hardcoded URL with the product ID
    const previewUrl = `${hardcodedUrl}/product/${data.id}`
    console.log("Opening preview URL:", previewUrl)
    window.open(previewUrl, "_blank")

    // Log environment variable for debugging
    console.log("Environment variable:", process.env.NEXT_PUBLIC_FRONTEND_STORE_URL)
    console.log("Frontend URL from state:", frontendUrl)
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
        title="Move to trash?"
        description="This product will be moved to trash. You can restore it later or delete it permanently from the trash."
      />
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={() => router.push(`/${params.storeId}/products/${data.id}`)}
        >
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={() => setOpen(true)}
        >
          <Trash className="h-3 w-3 mr-1" />
          Trash
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={onPreview}
        >
          <Eye className="h-3 w-3 mr-1" />
          View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={onDuplicate}
        >
          <Copy className="h-3 w-3 mr-1" />
          Duplicate
        </Button>
      </div>
    </>
  )
}
