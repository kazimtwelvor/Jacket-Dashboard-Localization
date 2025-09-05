// import type React from "react"
// import { LayoutDashboard, Settings, ImageIcon, Tag, Truck, LayoutTemplate } from "lucide-react"

// import type { MainNavItem } from "@/types"

// interface MainNavProps extends React.HTMLAttributes<HTMLElement> {
//   params: { storeId: string }
// }

// export const MainNav = ({ params, ...props }: MainNavProps) => {
//   const pathname = typeof window !== "undefined" ? window.location.pathname : ""

//   const routes: MainNavItem[] = [
//     {
//       href: `/${params.storeId}`,
//       label: "Dashboard",
//       icon: LayoutDashboard,
//       active: pathname === `/${params.storeId}`,
//     },
//     {
//       label: "Content",
//       items: [
//         {
//           href: `/${params.storeId}/billboards`,
//           label: "Billboards",
//           active: pathname === `/${params.storeId}/billboards`,
//           icon: ImageIcon,
//         },
//         {
//           href: `/${params.storeId}/page-builder`,
//           label: "Page Builder",
//           active:
//             pathname === `/${params.storeId}/page-builder` || pathname.includes(`/${params.storeId}/page-builder/`),
//           icon: <LayoutTemplate className="mr-2 h-4 w-4" />,
//         },
//         {
//           href: `/${params.storeId}/categories`,
//           label: "Categories",
//           active: pathname === `/${params.storeId}/categories`,
//           icon: Tag,
//         },
//         {
//           href: `/${params.storeId}/products`,
//           label: "Products",
//           active: pathname === `/${params.storeId}/products`,
//           icon: Truck,
//         },
//       ],
//     },
//     {
//       label: "Settings",
//       items: [
//         {
//           href: `/${params.storeId}/settings`,
//           label: "Store Settings",
//           active: pathname === `/${params.storeId}/settings`,
//           icon: Settings,
//         },
//       ],
//     },
//   ]

//   return (
//     <nav className="flex items-center space-x-4 lg:space-x-6" {...props}>
//       {routes.map((route) =>
//         route.items ? (
//           <div key={route.label} className="relative">
//             <button className="flex items-center text-sm font-medium transition-colors hover:text-primary">
//               {route.label}
//             </button>
//             {/* Add dropdown menu here */}
//           </div>
//         ) : (
//           <a key={route.href} href={route.href} className="text-sm font-medium transition-colors hover:text-primary">
//             {route.label}
//           </a>
//         ),
//       )}
//     </nav>
//   )
// }

// "use client"

// import { useState } from "react"
// import { useParams, useRouter } from "next/navigation"
// import axios from "axios"
// import toast from "react-hot-toast"

// import { Button } from "@/components/ui/button"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { Copy, Eye, MoreHorizontal, Trash } from "lucide-react"
// import type { ReviewColumn } from "./columns"

// import AlertModal from "@/components/modals/alert-modal"
// import { ReviewModal } from "./review-modal"

// interface CellActionProps {
//   data: ReviewColumn
// }

// export default function CellAction({ data }: CellActionProps) {
//   const [loading, setLoading] = useState(false)
//   const [open, setOpen] = useState(false)
//   const [showReview, setShowReview] = useState(false)
//   const router = useRouter()
//   const params = useParams()

//   const onCopy = (id: string) => {
//     navigator.clipboard.writeText(id)
//     toast.success("Review ID copied to the clipboard.")
//   }

//   const onDelete = async () => {
//     try {
//       setLoading(true)
//       await axios.delete(`/api/${params.storeId}/reviews/${data.id}`)
//       router.refresh()
//       toast.success("Review deleted")
//     } catch (error: any) {
//       toast.error("Something went wrong.")
//     } finally {
//       setLoading(false)
//       setOpen(false)
//     }
//   }

//   return (
//     <>
//       <AlertModal isOpen={open} onClose={() => setOpen(false)} loading={loading} onConfirm={onDelete} />
//       <ReviewModal isOpen={showReview} onClose={() => setShowReview(false)} review={data} />
//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <Button variant="ghost" className="h-8 w-8 p-0">
//             <span className="sr-only">Open menu</span>
//             <MoreHorizontal className="h-4 w-4" />
//           </Button>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent align="end">
//           <DropdownMenuLabel>Actions</DropdownMenuLabel>
//           <DropdownMenuItem onClick={() => setShowReview(true)}>
//             <Eye className="mr-2 h-4 w-4" />
//             View Details
//           </DropdownMenuItem>
//           <DropdownMenuItem onClick={() => onCopy(data.id)}>
//             <Copy className="mr-2 h-4 w-4" />
//             Copy ID
//           </DropdownMenuItem>
//           <DropdownMenuItem onClick={() => setOpen(true)}>
//             <Trash className="mr-2 h-4 w-4" />
//             Delete
//           </DropdownMenuItem>
//         </DropdownMenuContent>
//       </DropdownMenu>
//     </>
//   )
// }

"use client"

import type React from "react"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()
  const params = useParams()

  const routes = [
    {
      href: `/${params?.storeId}`,
      label: "Overview",
      active: pathname === `/${params?.storeId}`,
    },
    // {
    //   href: `/${params.storeId}/billboards`,
    //   label: "Billboards",
    //   active: pathname === `/${params.storeId}/billboards`,
    // },
    {
      href: `/${params?.storeId}/categories`,
      label: "Categories",
      active: pathname === `/${params?.storeId}/categories`,
    },
    {
      href: `/${params?.storeId}/sizes`,
      label: "Sizes",
      active: pathname === `/${params?.storeId}/sizes`,
    },
    {
      href: `/${params?.storeId}/colors`,
      label: "Colors",
      active: pathname === `/${params?.storeId}/colors`,
    },
    {
      href: `/${params?.storeId}/products`,
      label: "Products",
      active: pathname === `/${params?.storeId}/products`,
    },
    {
      href: `/${params?.storeId}/orders`,
      label: "Orders",
      active: pathname === `/${params?.storeId}/orders`,
    },
    {
      href: `/${params?.storeId}/settings`,
      label: "Settings",
      active: pathname === `/${params?.storeId}/settings`,
    },
    {
      href: `/accept-invitation`,
      label: "Accept Invitation",
      active: pathname === `/accept-invitation`,
    },
  ]

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            route.active ? "text-black dark:text-white" : "text-muted-foreground",
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  )
}
