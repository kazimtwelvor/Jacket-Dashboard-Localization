"use client"

import type React from "react"

import { Card } from "@/components/ui/card"

interface OverviewProps {
  data: any[]
}

export const Overview: React.FC<OverviewProps> = ({ data }) => {
  return <Card className="bg-card/50 backdrop-blur-sm border-border/50">{/* Your existing overview content */}</Card>
}
