"use client"

import type React from "react"

import type { UseFormReturn } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface BankTransferSettingsProps {
  form: UseFormReturn<any>
  loading: boolean
}

export const BankTransferSettings: React.FC<BankTransferSettingsProps> = ({ form, loading }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-medium">Bank Transfer</h3>
        <p className="text-sm text-muted-foreground">Configure Bank Transfer payment option for your customers.</p>
      </div>

      <FormField
        control={form.control}
        name="bankTransferEnabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Enable Bank Transfer</FormLabel>
              <FormDescription>Allow customers to pay via bank transfer</FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} disabled={loading} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bankTransferDetails"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bank Account Details</FormLabel>
            <FormControl>
              <Textarea
                disabled={loading || !form.watch("bankTransferEnabled")}
                placeholder="Enter your bank account details that will be shown to customers"
                className="resize-y min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Include account number, bank name, routing number, and any special instructions
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
