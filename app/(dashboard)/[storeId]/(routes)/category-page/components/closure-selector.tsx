"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"

const CLOSURE_OPTIONS = [
  "Zippered",
  "Button",
  "Hook",
  "Snap",
  "Velcro",
  "Drawstring",
  "Lace-Up"
]

export const ClosureSelector = ({ form }: { form: any }) => {
  return (
    <FormField
      control={form.control}
      name="closures"
      render={() => (
        <FormItem>
          <FormLabel>Closure Types</FormLabel>
          <div className="grid grid-cols-2 gap-2">
            {CLOSURE_OPTIONS.map((closure) => (
              <FormField
                key={closure}
                control={form.control}
                name="closures"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(closure)}
                        onCheckedChange={(checked) => {
                          const current = field.value || []
                          if (checked) {
                            field.onChange([...current, closure])
                          } else {
                            field.onChange(current.filter((item: string) => item !== closure))
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">{closure}</FormLabel>
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