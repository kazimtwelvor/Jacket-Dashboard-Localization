"use client"

import { ArrowLeft, Mail, User, Calendar, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface NewsletterFormData {
  id: string
  name: string
  email: string
  preferences: string
  createdAt: string
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
        <Heading title="Newsletter Subscription Details" description="View newsletter subscription" />
      </div>
      <Separator />
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Subscriber Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-sm">{data.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email Address</label>
              <p className="text-sm flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {data.email}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Subscription Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Email Frequency</label>
              <Badge variant="outline">{data.preferences}</Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Subscribed On</label>
              <p className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {data.createdAt}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}