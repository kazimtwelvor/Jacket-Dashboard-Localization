"use client"

import type React from "react"

import * as z from "zod"
import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Heading } from "@/components/ui/heading"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  siteKey: z.string().min(1, "Site key is required"),
  secretKey: z.string().min(1, "Secret key is required"),
  enabled: z.boolean().default(false),
  version: z.enum(["v2", "v3"]).default("v3"),
  threshold: z
    .string()
    .regex(/^0\.\d+$/, "Threshold must be a decimal between 0.0 and 1.0")
    .optional(),
  enabledOnLogin: z.boolean().default(true),
  enabledOnRegister: z.boolean().default(true),
})

type RecaptchaFormValues = z.infer<typeof formSchema>

interface RecaptchaFormProps {
  initialData: any | null
  storeId: string
}

export const RecaptchaForm: React.FC<RecaptchaFormProps> = ({ initialData, storeId }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const defaultValues = initialData
    ? {
        siteKey: initialData.siteKey || "",
        secretKey: initialData.secretKey || "",
        enabled: initialData.enabled || false,
        version: initialData.version || "v3",
        threshold: initialData.threshold ? initialData.threshold.toString() : "0.5",
        enabledOnLogin: initialData.enabledOnLogin ?? true,
        enabledOnRegister: initialData.enabledOnRegister ?? true,
      }
    : {
        siteKey: "",
        secretKey: "",
        enabled: false,
        version: "v3",
        threshold: "0.5",
        enabledOnLogin: true,
        enabledOnRegister: true,
      }

  const form = useForm<RecaptchaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const onSubmit = async (data: RecaptchaFormValues) => {
    try {
      setLoading(true)

      const formattedData = {
        ...data,
        threshold: data.threshold ? Number.parseFloat(data.threshold) : undefined,
      }

      if (initialData) {
        await axios.patch(`/api/${storeId}/recaptcha`, formattedData)
      } else {
        await axios.post(`/api/${storeId}/recaptcha`, formattedData)
      }

      router.refresh()
      toast.success("reCAPTCHA settings saved")
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title="reCAPTCHA Settings" description="Configure Google reCAPTCHA for your store" />
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="grid grid-cols-1 gap-8">
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable reCAPTCHA</FormLabel>
                    <FormDescription>Turn on reCAPTCHA protection for your store</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} disabled={loading} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>reCAPTCHA Version</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select version" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="v2">reCAPTCHA v2</SelectItem>
                      <SelectItem value="v3">reCAPTCHA v3</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>v2 shows a checkbox, v3 runs in the background and returns a score</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("version") === "v3" && (
              <FormField
                control={form.control}
                name="threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Score Threshold</FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder="0.5" {...field} />
                    </FormControl>
                    <FormDescription>
                      Score from 0.0 to 1.0, where 1.0 is very likely a good interaction. Default is 0.5.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="md:grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="siteKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Key</FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder="6Ldxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" {...field} />
                    </FormControl>
                    <FormDescription>The site key from Google reCAPTCHA admin console</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secretKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secret Key</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="6Ldxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>The secret key from Google reCAPTCHA admin console</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="enabledOnLogin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable on Login</FormLabel>
                      <FormDescription>Require reCAPTCHA verification on login page</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={loading} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enabledOnRegister"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable on Register</FormLabel>
                      <FormDescription>Require reCAPTCHA verification on registration page</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={loading} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button disabled={loading} className="ml-auto" type="submit">
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </Form>
      <Separator className="my-4" />
      <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
        <h3 className="text-sm font-medium text-yellow-800">How to set up Google reCAPTCHA</h3>
        <ol className="mt-2 text-sm text-yellow-700 list-decimal list-inside space-y-1">
          <li>
            Go to{" "}
            <a
              href="https://www.google.com/recaptcha/admin"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Google reCAPTCHA Admin Console
            </a>
          </li>
          <li>Sign in with your Google account</li>
          <li>Click on the "+" button to create a new site</li>
          <li>Enter a label for your site (e.g., "My Store")</li>
          <li>Select the reCAPTCHA type (v2 or v3)</li>
          <li>Add your domain(s) to the list of allowed domains</li>
          <li>Accept the terms of service and click "Submit"</li>
          <li>Copy the Site Key and Secret Key and paste them in the form above</li>
        </ol>
      </div>
    </>
  )
}
