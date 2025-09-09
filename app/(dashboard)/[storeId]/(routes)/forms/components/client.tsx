"use client"

import { Plus, FileText, Mail, Users, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/ui/data-table"
import { contactColumns } from "./contact-columns"
import { newsletterColumns } from "./newsletter-columns"
import { allFormsColumns } from "./all-forms-columns"
import { toast } from "react-hot-toast"

import { useParams, useRouter } from "next/navigation"

interface FormsClientProps {
  contactForms: any[]
  newsletterForms: any[]
  allForms: any[]
}

export const FormsClient = ({ contactForms: initialContactForms, newsletterForms: initialNewsletterForms, allForms: initialAllForms }: FormsClientProps) => {
  const [activeTab, setActiveTab] = useState("all")
  const [contactForms, setContactForms] = useState(initialContactForms)
  const [newsletterForms, setNewsletterForms] = useState(initialNewsletterForms)
  const [allForms, setAllForms] = useState(initialAllForms)
  const [isLoading, setIsLoading] = useState(false)

  const params = useParams()
  const router = useRouter()

  const fetchForms = async () => {
    if (!params?.storeId) return
    
    setIsLoading(true)
    try {
      const [contactResponse, newsletterResponse] = await Promise.all([
        fetch(`/api/${params.storeId}/forms/contact-forms`),
        fetch(`/api/${params.storeId}/forms/newsletter-forms`)
      ])

      if (contactResponse.ok && newsletterResponse.ok) {
        const contactData = await contactResponse.json()
        const newsletterData = await newsletterResponse.json()

        const formattedContactForms = contactData.map((form: any) => ({
          ...form,
          type: "contact" as const,
          createdAt: form.createdAt,
          status: form.status || "PENDING"
        }))

        const formattedNewsletterForms = newsletterData.map((form: any) => ({
          ...form,
          name: form.email,
          type: "newsletter" as const,
          createdAt: form.createdAt,
          status: form.status || "ACTIVE"
        }))

        const newAllForms = [...formattedContactForms, ...formattedNewsletterForms]

        setContactForms(formattedContactForms)
        setNewsletterForms(formattedNewsletterForms)
        setAllForms(newAllForms)
      }
    } catch (error) {
      toast.error("Failed to refresh forms")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const handleFocus = () => {
      fetchForms()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [params?.storeId])

  useEffect(() => {
    fetchForms()
  }, [params?.storeId])

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title="Forms" description="Manage form submissions" />
      </div>
      <Separator />
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allForms.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Forms</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactForms.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Newsletter Forms</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newsletterForms.length}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({allForms.length})</TabsTrigger>
          <TabsTrigger value="contact">Contact Us ({contactForms.length})</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter ({newsletterForms.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">All Forms</h3>
          </div>
          <DataTable columns={allFormsColumns} data={allForms} searchKey="email" />
        </TabsContent>
        
        <TabsContent value="contact" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Contact Us Forms</h3>
            <Button onClick={() => router.push(`/${params?.storeId}/forms/contact-us/new`)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </div>
          <DataTable columns={contactColumns} data={contactForms as any} searchKey="email" />
        </TabsContent>
        
        <TabsContent value="newsletter" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Newsletter Subscriptions</h3>
            <Button onClick={() => router.push(`/${params?.storeId}/forms/newsletter/new`)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </div>
          <DataTable columns={newsletterColumns} data={newsletterForms as any} searchKey="email" />
        </TabsContent>
      </Tabs>
      

    </>
  )
}