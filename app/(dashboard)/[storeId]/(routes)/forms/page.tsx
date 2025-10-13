"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { FormsClient } from "./components/client"
import { useDashboardCountry } from "@/hooks/use-dashboard-country"
import axios from "axios"
import { toast } from "react-hot-toast"

const FormsPage = () => {
  const params = useParams()
  const { getCountryCode, selectedCountry } = useDashboardCountry()
  const [contactForms, setContactForms] = useState<any[]>([])
  const [newsletterForms, setNewsletterForms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Wait for client-side hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !params?.storeId) return

    const fetchForms = async () => {
      try {
        setLoading(true)
        const countryCode = getCountryCode() || 'us' // Fallback to 'us' if empty
        
        console.log('[FORMS_CLIENT] ===== FETCHING FORMS =====')
        console.log('[FORMS_CLIENT] Mounted:', mounted)
        console.log('[FORMS_CLIENT] Selected country:', selectedCountry)
        console.log('[FORMS_CLIENT] Country code from hook:', getCountryCode())
        console.log('[FORMS_CLIENT] Country code (with fallback):', countryCode)
        
        const contactUrl = `/api/${params?.storeId}/forms/contact-forms?cn=${countryCode}`
        const newsletterUrl = `/api/${params?.storeId}/forms/newsletter-forms?cn=${countryCode}`
        
        console.log('[FORMS_CLIENT] API URLs:')
        console.log(`  - Contact: ${contactUrl}`)
        console.log(`  - Newsletter: ${newsletterUrl}`)
        
        const [contactResponse, newsletterResponse] = await Promise.all([
          axios.get(contactUrl),
          axios.get(newsletterUrl)
        ])

        console.log('[FORMS_CLIENT] API Response:')
        console.log(`  - Contact forms received: ${contactResponse.data.length}`)
        console.log(`  - Newsletter forms received: ${newsletterResponse.data.length}`)
        console.log('[FORMS_CLIENT] Contact form countries:', contactResponse.data.slice(0, 3).map((f: any) => ({
          id: f.id.substring(0, 8),
          countryCode: f.country?.countryCode
        })))
        console.log('[FORMS_CLIENT] Newsletter form countries:', newsletterResponse.data.slice(0, 3).map((f: any) => ({
          id: f.id.substring(0, 8),
          countryCode: f.country?.countryCode
        })))

        const formattedContactForms = contactResponse.data.map((form: any) => ({
          ...form,
          type: "contact" as const,
          createdAt: form.createdAt,
          status: form.status || "PENDING"
        }))

        const formattedNewsletterForms = newsletterResponse.data.map((form: any) => ({
          ...form,
          name: form.email,
          type: "newsletter" as const,
          createdAt: form.createdAt,
          status: form.status || "ACTIVE"
        }))

        setContactForms(formattedContactForms)
        setNewsletterForms(formattedNewsletterForms)
        
        console.log('[FORMS_CLIENT] ===== FORMS UPDATED =====')
        console.log(`  - Total contact forms: ${formattedContactForms.length}`)
        console.log(`  - Total newsletter forms: ${formattedNewsletterForms.length}`)
      } catch (error) {
        console.error('Failed to fetch forms:', error)
        toast.error("Failed to load forms")
      } finally {
        setLoading(false)
      }
    }

    fetchForms()
  }, [params?.storeId, selectedCountry?.countryCode, mounted])

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        Loading forms...
      </div>
    )
  }

  const allForms = [...contactForms, ...newsletterForms]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <FormsClient 
        contactForms={contactForms}
        newsletterForms={newsletterForms}
        allForms={allForms}
      />
    </div>
  )
}

export default FormsPage