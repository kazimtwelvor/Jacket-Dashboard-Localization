"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"

const POCKET_OPTIONS = [
  "Side Pockets",
  "Chest Pockets",
  "Patch Pockets",
  "Welt Pockets",
  "Flap Pockets",
  "Zippered Pockets"
]

export const PocketSelector = ({ form }: { form: any }) => {
  return (
    <FormField
      control={form.control}
      name="pockets"
      render={() => (
        <FormItem>
          <FormLabel>Pocket Types</FormLabel>
          <div className="grid grid-cols-2 gap-2">
            {POCKET_OPTIONS.map((pocket) => (
              <FormField
                key={pocket}
                control={form.control}
                name="pockets"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(pocket)}
                        onCheckedChange={(checked) => {
                          const current = field.value || []
                          if (checked) {
                            field.onChange([...current, pocket])
                          } else {
                            field.onChange(current.filter((item: string) => item !== pocket))
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">{pocket}</FormLabel>
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