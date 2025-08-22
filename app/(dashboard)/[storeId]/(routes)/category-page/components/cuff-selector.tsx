"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"

const CUFF_OPTIONS = [
  "Rib-Knitted",
  "Regular",
  "Button", 
  "Elastic"
]

export const CuffSelector = ({ form }: { form: any }) => {
  return (
    <FormField
      control={form.control}
      name="cuffs"
      render={() => (
        <FormItem>
          <FormLabel>Cuff Types</FormLabel>
          <div className="grid grid-cols-2 gap-2">
            {CUFF_OPTIONS.map((cuff) => (
              <FormField
                key={cuff}
                control={form.control}
                name="cuffs"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(cuff)}
                        onCheckedChange={(checked) => {
                          const current = field.value || []
                          if (checked) {
                            field.onChange([...current, cuff])
                          } else {
                            field.onChange(current.filter((item: string) => item !== cuff))
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">{cuff}</FormLabel>
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