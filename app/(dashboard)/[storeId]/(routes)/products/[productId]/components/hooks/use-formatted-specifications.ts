import type { UseFormReturn } from "react-hook-form"
import type { ProductFormValues } from "../product-form-schema"

export const useFormattedSpecifications = (form: UseFormReturn<ProductFormValues>) => {
  const getFormattedSpecifications = () => {
    const specs = form.watch("specifications")
    const baseColor = form.watch("baseColor")
    let formattedText = "Product Specifications:\n\n"
    if (specs.externalMaterial.length > 0)
      formattedText += `External Material: ${specs.externalMaterial.join(", ")}\n\n`
    if (specs.internalMaterial.length > 0)
      formattedText += `Internal Material: ${specs.internalMaterial.join(", ")}\n\n`
    if (specs.collar.length > 0) formattedText += `Collar: ${specs.collar.join(", ")}\n\n`
    if (specs.closure.length > 0) formattedText += `Closure: ${specs.closure.join(", ")}\n\n`
    if (specs.cuffs.length > 0) formattedText += `Cuffs: ${specs.cuffs.join(", ")}\n\n`
    if (specs.pockets.length > 0) formattedText += `Pockets: ${specs.pockets.join(", ")}\n\n`
    if (specs.color.length > 0) {
      if (baseColor && baseColor.name) {
        formattedText += `Color: ${baseColor.name}\n\n`
      }
    }
    return formattedText.trim()
  }

  return { getFormattedSpecifications }
}
