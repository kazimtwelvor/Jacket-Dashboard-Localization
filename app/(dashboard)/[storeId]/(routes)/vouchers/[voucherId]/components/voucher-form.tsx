"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams, useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { Trash } from "lucide-react"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Heading } from "@/components/ui/heading"
import { AlertModal } from "@/components/modals/alert-modal"
import { CountryMultiSelector } from "@/components/ui/country-multi-selector"
import { useDashboardCountry } from "@/hooks/use-dashboard-country"

const formSchema = z.object({
  code: z.string().min(1, "Code is required"),
  type: z.enum(["PERCENTAGE", "FIXED", "BUY_X_GET_Y"]),
  value: z.coerce.number().min(0, "Value must be positive"),
  minOrderAmount: z.coerce.number().optional(),
  maxDiscount: z.coerce.number().optional(),
  usageLimit: z.coerce.number().optional(),
  isActive: z.boolean().default(true),
  validUntil: z.string().optional(),
  description: z.string().optional(),
  buyQuantity: z.coerce.number().optional(),
  getQuantity: z.coerce.number().optional(),
  countryIds: z.array(z.string()).default([]),
})

type VoucherFormValues = z.infer<typeof formSchema>

interface VoucherFormProps {
  initialData?: any
}

export const VoucherForm: React.FC<VoucherFormProps> = ({ initialData }) => {
  const params = useParams()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { getCountryId } = useDashboardCountry()

  const title = initialData ? "Edit voucher" : "Create voucher"
  const description = initialData ? "Edit a voucher" : "Add a new voucher"
  const toastMessage = initialData ? "Voucher updated." : "Voucher created."
  const action = initialData ? "Save changes" : "Create"

  const form = useForm<VoucherFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      value: parseFloat(String(initialData.value)),
      minOrderAmount: initialData.minOrderAmount ? parseFloat(String(initialData.minOrderAmount)) : undefined,
      maxDiscount: initialData.maxDiscount ? parseFloat(String(initialData.maxDiscount)) : undefined,
      validUntil: initialData.validUntil ? new Date(initialData.validUntil).toISOString().split('T')[0] : undefined,
      countryIds: initialData.voucherCountries?.map((vc: any) => vc.countryId) || (getCountryId() ? [getCountryId()] : []),
    } : {
      code: "",
      type: "PERCENTAGE",
      value: 0,
      isActive: true,
      countryIds: getCountryId() ? [getCountryId()] : [],
    }
  })

  const watchType = form.watch("type")

  const generateCode = () => {
    const type = form.getValues("type")
    const value = form.getValues("value")
    let code = "FJ-"
    
    if (type === "PERCENTAGE") {
      code += `${value}%`
    } else if (type === "FIXED") {
      code += `${value}`
    } else if (type === "BUY_X_GET_Y") {
      const buyQty = form.getValues("buyQuantity") || 2
      const getQty = form.getValues("getQuantity") || 1
      code += `BUY${buyQty}GET${getQty}`
    }
    
    form.setValue("code", code)
  }

  const onSubmit = async (data: VoucherFormValues) => {
    try {
      setLoading(true)
      const url = initialData 
        ? `/api/${params.storeId}/vouchers/${params.voucherId}`
        : `/api/${params.storeId}/vouchers`
      
      const response = await fetch(url, {
        method: initialData ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Something went wrong")

      router.refresh()
      router.push(`/${params.storeId}/vouchers`)
      toast.success(toastMessage)
    } catch (error) {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await fetch(`/api/${params.storeId}/vouchers/${params.voucherId}`, {
        method: "DELETE",
      })
      router.refresh()
      router.push(`/${params.storeId}/vouchers`)
      toast.success("Voucher deleted.")
    } catch (error) {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <FormField
            control={form.control}
            name="countryIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Countries</FormLabel>
                <CountryMultiSelector
                  value={field.value || []}
                  onChange={field.onChange}
                  disabled={loading}
                  placeholder="Select countries for this voucher"
                />
                <FormDescription>
                  Select countries where this voucher is valid. Leave empty for global vouchers.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voucher Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select voucher type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage Discount</SelectItem>
                      <SelectItem value="FIXED">Fixed Amount Discount</SelectItem>
                      <SelectItem value="BUY_X_GET_Y">Buy X Get Y Free</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {watchType === "PERCENTAGE" ? "Percentage (%)" : "Amount ($)"}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      disabled={loading} 
                      placeholder={watchType === "PERCENTAGE" ? "30" : "100"} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-end">
              <Button type="button" variant="outline" onClick={generateCode}>
                Generate Code
              </Button>
            </div>
          </div>

          {watchType === "BUY_X_GET_Y" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="buyQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buy Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" disabled={loading} placeholder="2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="getQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Get Quantity (Free)</FormLabel>
                    <FormControl>
                      <Input type="number" disabled={loading} placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Voucher Code</FormLabel>
                <FormControl>
                  <Input disabled={loading} placeholder="FJ-30%" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="minOrderAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Order Amount ($)</FormLabel>
                  <FormControl>
                    <Input type="number" disabled={loading} placeholder="50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {watchType === "PERCENTAGE" && (
              <FormField
                control={form.control}
                name="maxDiscount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Discount ($)</FormLabel>
                    <FormControl>
                      <Input type="number" disabled={loading} placeholder="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="usageLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usage Limit</FormLabel>
                  <FormControl>
                    <Input type="number" disabled={loading} placeholder="100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="validUntil"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valid Until</FormLabel>
                <FormControl>
                  <Input type="date" disabled={loading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea disabled={loading} placeholder="Voucher description..." {...field} />
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
                    Enable or disable this voucher
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  )
}