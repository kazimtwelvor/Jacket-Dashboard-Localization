"use client"

import type React from "react"

import type { UseFormReturn } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

interface CashOnDeliverySettingsProps {
  form: UseFormReturn<any>
  loading: boolean
}

export const CashOnDeliverySettings: React.FC<CashOnDeliverySettingsProps> = ({ form, loading }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-medium">Cash on Delivery</h3>
        <p className="text-sm text-muted-foreground">Configure Cash on Delivery payment option for your customers.</p>
      </div>

      <FormField
        control={form.control}
        name="cashOnDeliveryEnabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Enable Cash on Delivery</FormLabel>
              <FormDescription>Allow customers to pay with cash when their order is delivered</FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} disabled={loading} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cashOnDeliveryFee"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Fee</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                step="0.01"
                disabled={loading || !form.watch("cashOnDeliveryEnabled")}
                placeholder="0.00"
                {...field}
              />
            </FormControl>
            <FormDescription>Additional fee to charge for Cash on Delivery orders (optional)</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
