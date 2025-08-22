"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"

const COLLAR_OPTIONS = [
  "Rib-Knitted",
  "Shirt Style", 
  "Lapel",
  "Stand",
  "Hood",
  "Fur",
  "Shearling",
  "V-Neck"
]

export const CollarSelector = ({ form }: { form: any }) => {
  return (
    <FormField
      control={form.control}
      name="collars"
      render={() => (
        <FormItem>
          <FormLabel>Collar Types</FormLabel>
          <div className="grid grid-cols-2 gap-2">
            {COLLAR_OPTIONS.map((collar) => (
              <FormField
                key={collar}
                control={form.control}
                name="collars"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(collar)}
                        onCheckedChange={(checked) => {
                          const current = field.value || []
                          if (checked) {
                            field.onChange([...current, collar])
                          } else {
                            field.onChange(current.filter((item: string) => item !== collar))
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">{collar}</FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}