"use client"

import type React from "react"
import type { Control } from "react-hook-form"
import type { ProductFormValues } from "../../product-form-schema"

interface GenderSectionProps {
  form?: any // For backward compatibility
  control?: Control<ProductFormValues>
}

export const GenderSection: React.FC<GenderSectionProps> = ({ form, control }) => {
  // Use control if provided, otherwise try to get it from form
  const formControl = control || form?.control

  if (!formControl) {
    console.error("GenderSection: No form control provided")
    return null
  }

  // return (
  //   <div className="space-y-4">
  //     <div>
  //       <h3 className="text-base font-medium">Gender</h3>
  //       <p className="text-sm text-muted-foreground">Select the gender category for this product</p>
  //     </div>

  //     {/* <FormField
  //       control={formControl}
  //       name="categories.gender"
  //       render={({ field }) => (
  //         <FormItem>
  //           <Select onValueChange={field.onChange} value={field.value || ""}>
  //             <FormControl>
  //               <SelectTrigger>
  //                 <SelectValue placeholder="Select gender" />
  //               </SelectTrigger>
  //             </FormControl>
  //             <SelectContent>
  //               {genderOptions.map((option) => (
  //                 <SelectItem key={option.value} value={option.value}>
  //                   {option.label}
  //                 </SelectItem>
  //               ))}
  //             </SelectContent>
  //           </Select>
  //           <FormMessage />
  //         </FormItem>
  //       )}
  //     /> */}
  //   </div>
  // )
}
