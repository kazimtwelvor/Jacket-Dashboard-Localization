"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-hot-toast"
import { CountryFormSelector } from "@/components/ui/country-selector"
import { useDashboardCountry } from "@/hooks/use-dashboard-country"

export const NewsletterFormNew = () => {
  const router = useRouter()
  const params = useParams()
  const { getCountryId } = useDashboardCountry()
  const [formData, setFormData] = useState({
    email: "",
    status: "ACTIVE",
    countryId: getCountryId() || ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`/api/${params.storeId}/forms/newsletter-forms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success("Newsletter subscription created successfully")
        router.back()
      } else {
        toast.error("Failed to create newsletter subscription")
      }
    } catch (error) {
      toast.error("Failed to create newsletter subscription")
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Heading title="New Newsletter Subscription" description="Create a new newsletter subscription" />
      </div>
      <Separator />
      
      <Card>
        <CardHeader>
          <CardTitle>Newsletter Subscription Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="countryId">Country</Label>
              <CountryFormSelector
                value={formData.countryId}
                onChange={(value) => handleChange("countryId", value)}
                placeholder="Select a country (optional)"
                useFormControl={false}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="UNSUBSCRIBED">Unsubscribed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}