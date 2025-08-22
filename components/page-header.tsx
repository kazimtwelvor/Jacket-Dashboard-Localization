import type React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export const PageHeader = ({ title, description, children, className }: PageHeaderProps) => {
  return (
    <div className={cn("flex items-center justify-between px-6 py-4 border-b", className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {children && <div>{children}</div>}
    </div>
  )
}
