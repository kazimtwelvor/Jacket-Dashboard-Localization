"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronUp } from "lucide-react"
import { EditableText } from "./editable-text"
import { CountryMultiSelector } from "@/components/ui/country-multi-selector"

interface BlogSettingsProps {
  slug: string
  isPublished: boolean
  countryIds?: string[]
  isExpanded: boolean
  onToggleExpand: () => void
  onSaveText: (field: string, value: string) => void
  onPublishChange: (value: boolean) => void
  onCountryChange: (value: string[]) => void
}

export const BlogSettings: React.FC<BlogSettingsProps> = ({
  slug,
  isPublished,
  countryIds,
  isExpanded,
  onToggleExpand,
  onSaveText,
  onPublishChange,
  onCountryChange,
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Settings</h3>
          <Button type="button" variant="ghost" size="sm" onClick={onToggleExpand} className="p-0 h-8 w-8">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Countries</label>
              <CountryMultiSelector
                value={countryIds || []}
                onChange={onCountryChange}
                placeholder="Select countries for this blog post"
              />
              <p className="text-xs text-gray-500 mt-1">Select countries where this blog post is available. Leave empty for global availability.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Slug</label>
                <EditableText field="slug" value={slug} onSave={onSaveText} className="mt-1 border rounded-md p-2" />
                <p className="text-xs text-gray-500 mt-1">This will be used for the URL of your blog post</p>
              </div>
              <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <Checkbox checked={isPublished} onCheckedChange={(checked) => onPublishChange(!!checked)} />
                <div className="space-y-1 leading-none">
                  <p className="font-medium">Published</p>
                  <p className="text-xs text-gray-500">This blog post will be visible on your site</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
