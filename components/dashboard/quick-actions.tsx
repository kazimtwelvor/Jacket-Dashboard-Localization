"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Tag, ShoppingBag, Settings } from "lucide-react"
import Link from "next/link"

interface QuickActionsProps {
  storeId?: string
  className?: string
}

export function QuickActions({ storeId, className }: QuickActionsProps) {
  const actions = [
    {
      title: "Add Product",
      description: "Create a new product",
      icon: <Package className="h-5 w-5" />,
      href: `/${storeId}/products/new`,
      color: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    },
    {
      title: "Add Category",
      description: "Create a new category",
      icon: <Tag className="h-5 w-5" />,
      href: `/${storeId}/categories/new`,
      color: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
    },
    {
      title: "View Orders",
      description: "Manage your orders",
      icon: <ShoppingBag className="h-5 w-5" />,
      href: `/${storeId}/orders`,
      color: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
    },
    {
      title: "Store Settings",
      description: "Configure your store",
      icon: <Settings className="h-5 w-5" />,
      href: `/${storeId}/settings`,
      color: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
    },
  ]

  return (
    <div className={`grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {actions.map((action, index) => (
        <Link key={index} href={action.href}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${action.color}`}>
                {action.icon}
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-base">{action.title}</CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
