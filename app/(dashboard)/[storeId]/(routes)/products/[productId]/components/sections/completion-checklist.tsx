"use client"

import type React from "react"

import { Check, X } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import type { ProductFormValues } from "../product-form-schema"

interface CompletionChecklistProps {
  form: UseFormReturn<ProductFormValues>
}

export const CompletionChecklist: React.FC<CompletionChecklistProps> = ({ form }) => {
  const { watch } = form
  const name = watch("name")
  const images = watch("images") || []
  const description = watch("description")
  const regularPrice = watch("regularPrice")
  const sku = watch("sku")
  const categories = watch("categories")
  const seo = watch("seo")
  const specifications = watch("specifications")

  const checklistItems = [
    {
      id: "images",
      label: "Product Images",
      description: "Add at least one product image",
      isComplete: images.length > 0,
    },
    {
      id: "name",
      label: "Product Name",
      description: "Add a product name",
      isComplete: !!name && name.length > 0,
    },
    {
      id: "description",
      label: "Product Description",
      description: "Add a product description",
      isComplete: !!description && description.length > 0,
    },
    {
      id: "price",
      label: "Product Price",
      description: "Set a regular price",
      isComplete: !!regularPrice && regularPrice.length > 0,
    },
    {
      id: "sku",
      label: "Product SKU",
      description: "Add a unique SKU",
      isComplete: !!sku && sku.length > 0,
    },
    {
      key: "specs",
      label: "Specifications",
      value: Object.values(specifications).some((arr) => arr.length > 0),
    },
    { key: "gender", label: "Gender", value: !!categories?.gender },
    { key: "seo", label: "SEO", value: seo?.seoScore >= 80 },
    { key: "colors", label: "Colors", value: (categories?.variationColors || []).length > 0 },
    {
      id: "categories",
      label: "Categories",
      description: "Assign at least one category",
      isComplete:
        (!!categories?.material && categories.material.length > 0) ||
        (!!categories?.style && categories.style.length > 0),
    },
    {
      id: "sizes",
      label: "Available Sizes",
      description: "Select at least one available size",
      isComplete: !!categories?.sizes && categories.sizes.length > 0,
    },
  ]

  const completedItems = checklistItems.filter((item) => item.value || item.isComplete).length

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Completion Checklist</h3>
        <div className="flex items-center gap-2">
          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${(completedItems / checklistItems.length) * 100}%` }}
            ></div>
          </div>
          <span className="text-xs font-medium">
            {completedItems}/{checklistItems.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {checklistItems.map((item) => (
          <div
            key={item.key || item.id}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md ${
              item.value || item.isComplete
                ? "bg-green-50 border border-green-100 dark:bg-green-900/10 dark:border-green-900/30"
                : "bg-red-50 border border-red-100 dark:bg-red-900/10 dark:border-red-900/30"
            }`}
            role="status"
            aria-label={`${item.label} is ${item.value || item.isComplete ? "completed" : "incomplete"}`}
          >
            <div
              className={`flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-full ${
                item.value || item.isComplete ? "bg-green-500 text-white" : "bg-red-500 text-white"
              }`}
            >
              {item.value || item.isComplete ? (
                <Check className="h-2.5 w-2.5" aria-hidden="true" />
              ) : (
                <X className="h-2.5 w-2.5" aria-hidden="true" />
              )}
            </div>
            <span
              className={`text-xs font-medium ${
                item.value || item.isComplete ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
