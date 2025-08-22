"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useParams } from "next/navigation"

interface ApiSlugDisplayProps {
  apiSlug: string
}

export const ApiSlugDisplay = ({ apiSlug }: ApiSlugDisplayProps) => {
  const [copied, setCopied] = useState(false)
  const params = useParams()
  
  const baseApiUrl = `/api/${params.storeId}/products`
  const fullApiUrl = `${baseApiUrl}?${apiSlug}`
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Integration</CardTitle>
        <CardDescription>
          Use these endpoints to fetch products for this category
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">API Endpoint</label>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleCopy(fullApiUrl)}
              className="h-8 px-2"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <Input 
            value={fullApiUrl} 
            readOnly 
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This endpoint returns products filtered by the selected attributes
          </p>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Query Parameters</label>
          </div>
          <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto">
            <code>{apiSlug || "No filters selected"}</code>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            These parameters are generated from the attributes you selected
          </p>
        </div>
      </CardContent>
    </Card>
  )
}