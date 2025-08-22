"use client"

import type React from "react"

import type { UseFormReturn } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

interface PaypalSettingsProps {
  form: UseFormReturn<any>
  loading: boolean
}

export const PaypalSettings: React.FC<PaypalSettingsProps> = ({ form, loading }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-medium">PayPal Integration</h3>
        <p className="text-sm text-muted-foreground">
          Configure PayPal to accept payments through PayPal, credit cards, and debit cards.
        </p>

        <Alert variant="outline" className="bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-500 mr-2" />
          <AlertDescription className="text-blue-700">
            You can find your PayPal API credentials in your PayPal Developer Dashboard.
          </AlertDescription>
        </Alert>
      </div>

      <FormField
        control={form.control}
        name="paypalEnabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Enable PayPal</FormLabel>
              <FormDescription>Allow customers to pay with PayPal at checkout</FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} disabled={loading} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="paypalSandboxMode"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Sandbox Mode</FormLabel>
              <FormDescription>Use PayPal sandbox for testing. Turn off for live payments.</FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} disabled={loading} />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="grid gap-4">
        <FormField
          control={form.control}
          name="paypalClientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client ID</FormLabel>
              <FormControl>
                <Input disabled={loading} placeholder="PayPal Client ID" {...field} />
              </FormControl>
              <FormDescription>Your PayPal Client ID from the Developer Dashboard</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paypalClientSecret"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Secret</FormLabel>
              <FormControl>
                <Input disabled={loading} placeholder="PayPal Client Secret" type="password" {...field} />
              </FormControl>
              <FormDescription>Your PayPal Client Secret from the Developer Dashboard</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
