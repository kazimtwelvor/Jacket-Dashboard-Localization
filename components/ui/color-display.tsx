"use client"

import type React from "react"

interface ColorDisplayProps {
  color1: string
  color2?: string | null
  size?: "sm" | "md" | "lg"
  className?: string
}

export const ColorDisplay: React.FC<ColorDisplayProps> = ({ 
  color1, 
  color2, 
  size = "md", 
  className = "" 
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }

  // Use custom className if provided, otherwise use size classes
  const finalClassName = className.includes('w-') && className.includes('h-') 
    ? className 
    : `${sizeClasses[size]} ${className}`

  if (!color2) {
    return (
      <div 
        className={`${finalClassName} border rounded-full`} 
        style={{ backgroundColor: color1 }} 
      />
    )
  }
  
  return (
    <div className={`${finalClassName} border rounded-full overflow-hidden relative`}>
      <div 
        className="absolute inset-0" 
        style={{ 
          background: `linear-gradient(135deg, ${color1} 50%, ${color2} 50%)` 
        }} 
      />
    </div>
  )
}