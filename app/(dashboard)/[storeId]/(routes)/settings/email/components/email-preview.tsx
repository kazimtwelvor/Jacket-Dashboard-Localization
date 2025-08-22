"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { previewEmail } from "../actions"

interface EmailPreviewProps {
  storeId: string
}

export const EmailPreview = ({ storeId }: EmailPreviewProps) => {
  const [loading, setLoading] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [activeTemplate, setActiveTemplate] = useState("order-confirmation")
  const { toast } = useToast()

  const templates = [
    { id: "order-confirmation", name: "Order Confirmation" },
    { id: "shipping-update", name: "Shipping Update" },
    { id: "welcome", name: "Welcome Email" },
    { id: "password-reset", name: "Password Reset" },
    { id: "abandoned-cart", name: "Abandoned Cart" },
    { id: "review-request", name: "Review Request" },
    { id: "account-verification", name: "Account Verification" },
    { id: "low-stock-alert", name: "Low Stock Alert" },
    { id: "new-order-notification", name: "New Order Notification" },
  ]

  const handlePreview = async () => {
    try {
      setLoading(true)
      const result = await previewEmail(storeId, activeTemplate)

      if (result.success) {
        setPreviewHtml(result.html)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate preview",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Email Template Preview</CardTitle>
        <CardDescription>Preview how your email templates will look to recipients</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTemplate} onValueChange={setActiveTemplate}>
          <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-4">
            {templates.map((template) => (
              <TabsTrigger key={template.id} value={template.id}>
                {template.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex justify-end mb-4">
            <Button onClick={handlePreview} disabled={loading}>
              {loading ? "Generating..." : "Generate Preview"}
            </Button>
          </div>

          <div className="border rounded-md overflow-hidden bg-white">
            {loading ? (
              <div className="p-4">
                <Skeleton className="h-[600px] w-full" />
              </div>
            ) : previewHtml ? (
              <iframe srcDoc={previewHtml} className="w-full h-[600px] border-0" title="Email Preview" />
            ) : (
              <div className="flex items-center justify-center h-[600px] text-gray-500">
                Click "Generate Preview" to see how this email template will look
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">
          Note: Actual emails may appear slightly different in various email clients
        </div>
      </CardFooter>
    </Card>
  )
}
