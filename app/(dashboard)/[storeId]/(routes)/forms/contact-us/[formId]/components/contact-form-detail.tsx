"use client"

import { ArrowLeft, Mail, User, Calendar, MessageSquare, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface ContactFormData {
  id: string
  firstName: string
  lastName: string
  email: string
  subject: string
  message: string
  agreeToPrivacyPolicy: boolean
  status: string
  createdAt: string
  createdAtFull?: Date
  type: string
}

interface ContactFormDetailProps {
  data: ContactFormData
}

export const ContactFormDetail = ({ data }: ContactFormDetailProps) => {
  const router = useRouter()

  return (
    <>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Heading title="Contact Form Details" description="View contact form submission" />
      </div>
      <Separator />
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">First Name</label>
                <p className="text-sm">{data.firstName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Name</label>
                <p className="text-sm">{data.lastName}</p>
              </div>
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
              <MessageSquare className="h-5 w-5" />
              Message Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Subject</label>
              <p className="text-sm">{data.subject}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Message</label>
              <p className="text-sm whitespace-pre-wrap">{data.message}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Submission Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Privacy Policy Agreement</label>
              <div className="flex items-center gap-2">
                <Badge variant={data.agreeToPrivacyPolicy ? "default" : "destructive"}>
                  {data.agreeToPrivacyPolicy ? "Agreed" : "Not Agreed"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="flex items-center gap-2">
                <Badge variant={data.status === "PENDING" ? "secondary" : data.status === "IN_PROGRESS" ? "default" : data.status === "RESOLVED" ? "outline" : "destructive"}>
                  {data.status?.replace("_", " ") || "PENDING"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Submitted On</label>
              <p className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {data.createdAt}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Submitted At</label>
              <p className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {data.createdAtFull ? data.createdAtFull.toLocaleTimeString() : new Date(data.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}