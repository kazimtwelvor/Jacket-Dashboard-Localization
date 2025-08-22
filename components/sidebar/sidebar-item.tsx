"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarItemProps {
  icon: LucideIcon
  label: string
  href: string
  isActive?: boolean
}

export const SidebarItem = ({ icon: Icon, label, href, isActive }: SidebarItemProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20",
        isActive && "text-slate-700 bg-slate-200/20 hover:bg-slate-200/20 hover:text-slate-700",
        "rounded-lg py-4",
      )}
    >
      <div className="flex items-center gap-x-2">
        <Icon size={20} className={cn("text-slate-500", isActive && "text-slate-700")} />
        {label}
      </div>
      <div
        className={cn("ml-auto opacity-0 border-2 border-slate-700 h-full transition-all", isActive && "opacity-100")}
      />
    </Link>
  )
}
