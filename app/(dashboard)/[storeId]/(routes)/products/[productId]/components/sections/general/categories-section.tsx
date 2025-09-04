"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import { useFormContext, useWatch } from "react-hook-form"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { ProductFormValues } from "../../product-form-schema"

export const CategoriesSection = () => {
  const form = useFormContext<ProductFormValues>()

  const [openGender, setOpenGender] = useState(false)
  const [openMaterial, setOpenMaterial] = useState(false)
  const [openStyle, setOpenStyle] = useState(false)

  const materialValues = useWatch({
    control: form.control,
    name: "categories.material",
    defaultValue: [],
  })

  const externalMaterialValues = useWatch({
    control: form.control,
    name: "specifications.externalMaterial",
    defaultValue: [],
  })

  const styleValues = useWatch({
    control: form.control,
    name: "categories.style",
    defaultValue: [],
  })

  useEffect(() => {
    if (externalMaterialValues && materialValues) {
      const materialSet = new Set(materialValues)

      let needsUpdate = false

      for (const material of externalMaterialValues) {
        if (!materialSet.has(material)) {
          needsUpdate = true
          break
        }
      }

      if (needsUpdate) {
        console.log("Syncing material categories from external materials:", externalMaterialValues)
        form.setValue("categories.material", [...externalMaterialValues], {
          shouldValidate: true,
          shouldDirty: true,
        })
      }
    }
  }, [externalMaterialValues, form])

  const genderOptions = [
    { label: "Men", value: "men" },
    { label: "Women", value: "women" },
    { label: "Unisex", value: "unisex" },
    { label: "Kids", value: "kids" },
  ]

  const materialOptions = [
    "Cotton",
    "Polyester",
    "Wool",
    "Silk",
    "Linen",
    "Denim",
    "Leather",
    "Suede",
    "Canvas",
    "Nylon",
  ]

  const styleOptions = [
    "Casual",
    "Formal",
    "Sporty",
    "Vintage",
    "Bohemian",
    "Minimalist",
    "Streetwear",
    "Business",
    "Evening",
    "Athleisure",
  ]

  const handleMaterialSelect = (material: string) => {
    const currentValues = form.getValues("categories.material") || []
    const newValues = currentValues.includes(material)
      ? currentValues.filter((value) => value !== material)
      : [...currentValues, material]

    form.setValue("categories.material", newValues, {
      shouldValidate: true,
    })

    const currentExternalMaterial = form.getValues("specifications.externalMaterial") || []
    const newExternalMaterial =
      material in currentExternalMaterial
        ? currentExternalMaterial.filter((value) => value !== material)
        : [...currentExternalMaterial, material]

    form.setValue("specifications.externalMaterial", newExternalMaterial, {
      shouldValidate: true,
    })
  }

  const handleStyleSelect = (style: string) => {
    const currentValues = form.getValues("categories.style") || []
    const newValues = currentValues.includes(style)
      ? currentValues.filter((value) => value !== style)
      : [...currentValues, style]

    form.setValue("categories.style", newValues, {
      shouldValidate: true,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories & Attributes</CardTitle>
        <CardDescription>Assign categories and attributes to help customers find your product</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="categories.gender"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>
                Gender <span className="text-red-500 font-bold">*</span>
              </FormLabel>
              <Popover open={openGender} onOpenChange={setOpenGender}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openGender}
                      className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                    >
                      {field.value
                        ? genderOptions.find((option) => option.value === field.value)?.label
                        : "Select gender (required)"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search gender..." />
                    <CommandList>
                      <CommandEmpty>No gender found.</CommandEmpty>
                      <CommandGroup>
                        {genderOptions.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            onSelect={() => {
                              form.setValue("categories.gender", option.value, {
                                shouldValidate: true,
                              })
                              setOpenGender(false)
                            }}
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", option.value === field.value ? "opacity-100" : "opacity-0")}
                            />
                            {option.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categories.material"
          render={() => (
            <FormItem className="flex flex-col">
              <FormLabel>
                Material (Select all that apply) <span className="text-red-500 font-bold">*</span>
              </FormLabel>
              <Popover open={openMaterial} onOpenChange={setOpenMaterial}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openMaterial}
                      className={cn(
                        "w-full justify-between",
                        (!materialValues || materialValues.length === 0) && "text-muted-foreground",
                      )}
                    >
                      {materialValues && materialValues.length > 0
                        ? `${materialValues.length} selected`
                        : "Select materials (required)"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search materials..." />
                    <CommandList>
                      <CommandEmpty>No material found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {materialOptions.map((option) => (
                          <CommandItem
                            key={option}
                            onSelect={() => handleMaterialSelect(option)}
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              checked={materialValues.includes(option)}
                              onCheckedChange={() => handleMaterialSelect(option)}
                            />
                            {option}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <div className="flex flex-wrap gap-1 mt-2">
                {materialValues &&
                  materialValues.length > 0 &&
                  materialValues.map((material: string) => (
                    <div
                      key={material}
                      className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm flex items-center gap-1"
                    >
                      {material}
                    </div>
                  ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categories.style"
          render={() => (
            <FormItem className="flex flex-col">
              <FormLabel>
                Style (Select all that apply) <span className="text-red-500 font-bold">*</span>
              </FormLabel>
              <Popover open={openStyle} onOpenChange={setOpenStyle}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openStyle}
                      className={cn(
                        "w-full justify-between",
                        (!styleValues || styleValues.length === 0) && "text-muted-foreground",
                      )}
                    >
                      {styleValues && styleValues.length > 0
                        ? `${styleValues.length} selected`
                        : "Select styles (required)"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search styles..." />
                    <CommandList>
                      <CommandEmpty>No style found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {styleOptions.map((option) => (
                          <CommandItem
                            key={option}
                            onSelect={() => handleStyleSelect(option)}
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              checked={styleValues.includes(option)}
                              onCheckedChange={() => handleStyleSelect(option)}
                            />
                            {option}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <div className="flex flex-wrap gap-1 mt-2">
                {styleValues &&
                  styleValues.length > 0 &&
                  styleValues.map((style: string) => (
                    <div
                      key={style}
                      className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm flex items-center gap-1"
                    >
                      {style}
                    </div>
                  ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
