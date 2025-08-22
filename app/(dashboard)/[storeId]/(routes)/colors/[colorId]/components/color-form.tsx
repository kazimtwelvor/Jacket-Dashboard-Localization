"use client"

import type React from "react"

import { useState } from "react"
import * as z from "zod"
import type { Color } from "@prisma/client"
import { Heading } from "@/components/ui/heading"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Trash } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "react-hot-toast"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"
import { AlertModal } from "@/components/modals/alert-modal"
import { ColorDisplay } from "@/components/ui/color-display"

interface SettingsFromProps {
  initialData: Color | null
}

const formSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(4).regex(/^#/, {
    message: "String must be a valid hex code",
  }),
  value2: z.string().optional().refine((val) => !val || (val.length >= 4 && val.startsWith("#")), {
    message: "String must be a valid hex code",
  }),
  hasTwoColors: z.boolean().default(false),
})

type ColorFormValues = z.infer<typeof formSchema>



export const ColorForm: React.FC<SettingsFromProps> = ({ initialData }) => {
  const params = useParams()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const title = initialData ? "Edit color" : "Create color"
  const description = initialData ? "Edit a color" : "Add a new color"
  const toastMessage = initialData ? "Color updated." : "Color created."
  const action = initialData ? "Save changes" : "Create"

  const form = useForm<ColorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      value: initialData.value,
      value2: initialData.value2 || "",
      hasTwoColors: !!initialData.value2,
    } : {
      name: "",
      value: "",
      value2: "",
      hasTwoColors: false,
    },
  })

  const onCancel = () => {
    router.push(`/${params.storeId}/attributes?tab=colors`)
  }

  const onSuccess = () => {
    router.push(`/${params.storeId}/attributes?tab=colors`)
  }

  const onSubmit = async (data: ColorFormValues) => {
    try {
      setLoading(true)
      const submitData = {
        name: data.name,
        value: data.value,
        value2: data.hasTwoColors ? data.value2 : null,
      }
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/colors/${params.colorId}`, submitData)
      } else {
        await axios.post(`/api/${params.storeId}/colors`, submitData)
      }
      router.refresh()
      onSuccess()
      toast.success(toastMessage)
    } catch (err) {
      console.error(err)
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/${params.storeId}/colors/${params.colorId}`)
      router.refresh()
      onCancel()
      toast.success("Color deleted.")
    } catch (err) {
      console.error(err)
      toast.error("Make sure you removed all products using this color first.")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button variant="destructive" size="sm" onClick={() => setOpen(true)} disabled={loading}>
            <Trash className="w-4 h-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Color name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Color</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-x-4">
                      <Input disabled={loading} placeholder="Color value" {...field} />
                      <ColorDisplay 
                        color1={field.value} 
                        color2={form.watch("hasTwoColors") ? form.watch("value2") : undefined}
                        size="lg"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="hasTwoColors"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Add second color (optional)</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            {form.watch("hasTwoColors") && (
              <FormField
                control={form.control}
                name="value2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Color</FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder="Second color value" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
      {/* <Separator /> */}
    </>
  )
}
