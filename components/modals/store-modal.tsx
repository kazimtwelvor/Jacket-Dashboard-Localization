"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { toast } from "react-hot-toast"

import { useStoreModal } from "@/hooks/use-store-modal"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSuperAdmin } from "@/hooks/use-super-admin"

const formSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  url: z.string().optional(),
})

export const StoreModal = () => {
  const storeModal = useStoreModal()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isSuperAdmin, isLoading: isSuperAdminLoading } = useSuperAdmin()

  useEffect(() => {
    if (!isSuperAdmin && !isSuperAdminLoading) {
      setError(
        "Only super administrators can create new stores. Please contact a super administrator if you need a new store.",
      )
    } else {
      setError(null)
    }
  }, [isSuperAdmin, isSuperAdminLoading])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      url: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      setError(null)

      if (!isSuperAdmin) {
        setError("You don't have permission to create a store.")
        return
      }

      const response = await axios.post("/api/stores/create", values)

      // This will refresh the page to show the new store
      window.location.assign(`/${response.data.id}`)
    } catch (error: any) {
      setError(error.response?.data || "Something went wrong")
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Create store"
      description="Add a new store to manage products and categories."
      isOpen={storeModal.isOpen}
      onClose={storeModal.onClose}
    >
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSuperAdminLoading ? (
        <div className="py-6 text-center">Checking permissions...</div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading || !isSuperAdmin} placeholder="E-Commerce" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Store URL</FormLabel>
                  <FormControl>
                    <Input disabled={loading || !isSuperAdmin} placeholder="example.com" {...field} />
                  </FormControl>
                  <FormDescription>Enter the website URL for this store (e.g., example.com)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-6 space-x-2 flex items-center justify-end w-full">
              <Button disabled={loading} variant="outline" onClick={storeModal.onClose}>
                Cancel
              </Button>
              <Button disabled={loading || !isSuperAdmin} type="submit">
                Continue
              </Button>
            </div>
          </form>
        </Form>
      )}
    </Modal>
  )
}
