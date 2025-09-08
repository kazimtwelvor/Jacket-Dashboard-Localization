"use client"

import type React from "react"
import type { Control } from "react-hook-form"
import type { ProductFormValues } from "../../product-form-schema"

interface GenderSectionProps {
  form?: any 
  control?: Control<ProductFormValues>
}

export const GenderSection: React.FC<GenderSectionProps> = ({ form, control }) => {
  const formControl = control || form?.control

  if (!formControl) {
    return null
  }

}
