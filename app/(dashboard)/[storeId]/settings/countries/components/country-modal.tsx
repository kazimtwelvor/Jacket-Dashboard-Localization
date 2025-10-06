"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { toast } from "react-hot-toast"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { CountryColumn } from "./columns"

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  countryCode: z.string()
    .min(2, "Country code must be 2 characters")
    .max(2, "Country code must be 2 characters")
    .regex(/^[a-z]{2}$/, "Country code must be 2 lowercase letters"),
  currency: z.string()
    .optional()
    .refine((val) => !val || val.length === 3, "Currency code must be 3 characters")
    .refine((val) => !val || /^[A-Z]{3}$/.test(val), "Currency code must be 3 uppercase letters"),
  currencySymbol: z.string().max(5, "Currency symbol must be less than 5 characters").optional(),
  phoneCode: z.string()
    .optional()
    .refine((val) => !val || /^\+?[0-9]+$/.test(val), "Phone code must contain only numbers and optional + prefix"),
  timezone: z.string().max(50, "Timezone must be less than 50 characters").optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().min(0, "Sort order must be non-negative").default(0),
})

type CountryFormValues = z.infer<typeof formSchema>

interface CountryModalProps {
  isOpen: boolean
  onClose: () => void
  country?: CountryColumn | null
}

export const CountryModal: React.FC<CountryModalProps> = ({
  isOpen,
  onClose,
  country
}) => {
  const [loading, setLoading] = useState(false)
  const [checkingCode, setCheckingCode] = useState(false)

  const form = useForm<CountryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      countryCode: "",
      currency: "",
      currencySymbol: "",
      phoneCode: "",
      timezone: "",
      isActive: true,
      sortOrder: 0,
    },
  })

  useEffect(() => {
    if (country) {
      form.reset({
        name: country.name,
        countryCode: country.countryCode,
        currency: country.currency || "",
        currencySymbol: country.currencySymbol || "",
        phoneCode: country.phoneCode || "",
        timezone: country.timezone || "",
        isActive: country.isActive,
        sortOrder: country.sortOrder,
      })
    } else {
      form.reset({
        name: "",
        countryCode: "",
        currency: "",
        currencySymbol: "",
        phoneCode: "",
        timezone: "",
        isActive: true,
        sortOrder: 0,
      })
    }
  }, [country, form])

  const checkCountryCodeAvailability = async (code: string) => {
    if (!code || code.length !== 2) return true

    try {
      setCheckingCode(true)
      const response = await axios.post("/api/countries/check-code", {
        countryCode: code,
        countryId: country?.id
      })
      return response.data.available
    } catch (error) {
      console.error("Error checking country code:", error)
      return false
    } finally {
      setCheckingCode(false)
    }
  }

  const onSubmit = async (data: CountryFormValues) => {
    try {
      setLoading(true)

      // Check country code availability
      const isCodeAvailable = await checkCountryCodeAvailability(data.countryCode)
      if (!isCodeAvailable) {
        toast.error("Country code is already taken")
        return
      }

      if (country) {
        await axios.patch(`/api/countries/${country.id}`, data)
        toast.success("Country updated successfully")
      } else {
        await axios.post("/api/countries", data)
        toast.success("Country created successfully")
      }

      onClose()
    } catch (error: any) {
      console.error("Error saving country:", error)
      toast.error(error.response?.data || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {country ? "Edit Country" : "Create Country"}
          </DialogTitle>
          <DialogDescription>
            {country ? "Update country information" : "Add a new country to your system"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="Country name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="countryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country Code</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading || checkingCode}
                        placeholder="us, uk, ca"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.toLowerCase()
                          field.onChange(value)
                        }}
                        maxLength={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency Code</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="USD, EUR, GBP"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase()
                          field.onChange(value)
                        }}
                        maxLength={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currencySymbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency Symbol</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="$"
                        {...field}
                        maxLength={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phoneCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Code</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="+1, +44"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="America/New_York"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled={loading}
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Whether this country is active
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || checkingCode}>
                {loading ? "Saving..." : country ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
