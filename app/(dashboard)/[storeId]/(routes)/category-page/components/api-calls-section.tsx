"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useParams } from "next/navigation"

export const ApiCallsSection = () => {
  const [copied, setCopied] = useState<string | null>(null)
  const params = useParams()
  
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }
  
  const apiCalls = [
    {
      id: "get-all",
      title: "Get All Category Pages",
      endpoint: `/api/${params?.storeId}/category-pages`,
      method: "GET",
      description: "Fetch all category pages for this store",
      code: `fetch('/api/${params?.storeId}/category-pages')
  .then(response => response.json())
  .then(data => console.log(data))`
    },
    {
      id: "get-one",
      title: "Get Category Page by ID",
      endpoint: `/api/${params?.storeId}/category-pages/{id}`,
      method: "GET",
      description: "Fetch a specific category page by ID",
      code: `fetch('/api/${params?.storeId}/category-pages/{id}')
  .then(response => response.json())
  .then(data => console.log(data))`
    },
    {
      id: "get-by-slug",
      title: "Get Category Page by Slug",
      endpoint: `/api/${params?.storeId}/category-pages?slug={slug}`,
      method: "GET",
      description: "Fetch a category page by its slug",
      code: `fetch('/api/${params?.storeId}/category-pages?slug=your-slug')
  .then(response => response.json())
  .then(data => console.log(data))`
    },
    {
      id: "get-products",
      title: "Get Products by Category Filters",
      endpoint: `/api/${params?.storeId}/products?{apiSlug}`,
      method: "GET",
      description: "Fetch products using category page filters",
      code: `fetch('/api/${params?.storeId}/products?materials=leather&colors=black')
  .then(response => response.json())
  .then(data => console.log(data))`
    }
  ]
  
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>API Reference</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="get-all">
          <TabsList className="grid grid-cols-4 mb-4">
            {apiCalls.map(call => (
              <TabsTrigger key={call.id} value={call.id}>
                {call.title}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {apiCalls.map(call => (
            <TabsContent key={call.id} value={call.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="bg-primary px-2 py-1 text-xs text-primary-foreground rounded mr-2">
                    {call.method}
                  </span>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {call.endpoint}
                  </code>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleCopy(call.code, call.id)}
                >
                  {copied === call.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">{call.description}</p>
              
              <div className="bg-muted p-4 rounded-md">
                <pre className="text-xs overflow-x-auto">
                  <code>{call.code}</code>
                </pre>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}