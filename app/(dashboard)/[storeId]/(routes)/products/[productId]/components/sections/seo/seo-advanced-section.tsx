"use client"

import type React from "react"

import type { UseFormReturn } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormDescription, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import type { ProductFormValues } from "../../product-form-schema"

interface SeoAdvancedSectionProps {
  form: UseFormReturn<ProductFormValues>
}

export const SeoAdvancedSection: React.FC<SeoAdvancedSectionProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="seo.noIndex"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>No Index</FormLabel>
              <FormDescription>Tell search engines not to show this page in search results.</FormDescription>
            </div>
          </FormItem>
        )}
      />

      <div className="border rounded-md p-4">
        <h3 className="font-medium mb-2">Canonical URL</h3>
        <p className="text-sm text-muted-foreground mb-4">
          If this page is a duplicate of another page, enter the canonical URL here.
        </p>
        <FormField
          control={form.control}
          name="seo.canonicalUrl"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="https://example.com/original-page"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
