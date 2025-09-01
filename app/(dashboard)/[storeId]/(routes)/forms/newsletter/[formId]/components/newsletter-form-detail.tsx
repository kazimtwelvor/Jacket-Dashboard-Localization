"use client"

import { ArrowLeft, Calendar, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"

interface NewsletterFormData {
  id: string
  email: string
  status: string
  createdAt: string
  createdAtFull?: Date
  type: string
}

interface NewsletterFormDetailProps {
  data: NewsletterFormData
}

export const NewsletterFormDetail = ({ data }: NewsletterFormDetailProps) => {
  const router = useRouter()

  return (
    <>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Heading title="Newsletter Form Details" description="View newsletter subscription details" />
      </div>
      <Separator />
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Subscription Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Email Address</label>
              <p className="text-sm">{data.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="flex items-center gap-2">
                <Badge variant={data.status === "ACTIVE" ? "default" : data.status === "INACTIVE" ? "secondary" : "destructive"}>
                  {data.status?.replace("_", " ") || "ACTIVE"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Subscription Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Subscribed On</label>
              <p className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {data.createdAtFull ? data.createdAtFull.toLocaleDateString() : new Date(data.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Subscribed At</label>
              <p className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {data.createdAtFull ? data.createdAtFull.toLocaleTimeString() : new Date(data.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Form ID</label>
              <p className="text-sm font-mono">{data.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}