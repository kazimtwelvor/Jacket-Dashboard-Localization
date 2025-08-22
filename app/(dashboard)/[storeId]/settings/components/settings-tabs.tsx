"use client"

import { useParams, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function SettingsTabs() {
  const pathname = usePathname()
  const params = useParams()

  const tabs = [
    {
      title: "General",
      href: `/${params.storeId}/settings`,
      active: pathname === `/${params.storeId}/settings`,
    },
    {
      title: "Members",
      href: `/${params.storeId}/settings/members`,
      active: pathname === `/${params.storeId}/settings/members`,
    },
    {
      title: "reCAPTCHA",
      href: `/${params.storeId}/settings/recaptcha`,
      active: pathname === `/${params.storeId}/settings/recaptcha`,
    },
  ]

  return (
    <div className="flex space-x-4 mb-6">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-md",
            tab.active ? "bg-black text-white" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
          )}
        >
          {tab.title}
        </Link>
      ))}
    </div>
  )
}
