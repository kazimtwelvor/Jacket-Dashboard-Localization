
interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export function validateSchema(schema: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  }

  try {
    const parsedSchema = JSON.parse(schema)

    if (!parsedSchema["@context"]) {
      result.warnings.push("Missing @context property (should be 'https://schema.org/')")
    }

    if (!parsedSchema["@type"]) {
      result.errors.push("Missing @type property")
      result.isValid = false
    }

    if (!parsedSchema.name) {
      result.errors.push("Missing name property")
      result.isValid = false
    }

    if (!parsedSchema.description) {
      result.warnings.push("Missing description property")
    }

    if (!parsedSchema.image) {
      result.warnings.push("Missing image property")
    } else if (Array.isArray(parsedSchema.image) && parsedSchema.image.length === 0) {
      result.warnings.push("Image array is empty")
    }

    if (!parsedSchema.offers) {
      result.warnings.push("Missing offers property")
    } else {
      if (!parsedSchema.offers.price) {
        result.errors.push("Missing price in offers")
        result.isValid = false
      }

      if (!parsedSchema.offers.priceCurrency) {
        result.warnings.push("Missing priceCurrency in offers")
      }

      if (!parsedSchema.offers.availability) {
        result.warnings.push("Missing availability in offers")
      }

      if (!parsedSchema.offers.url) {
        result.warnings.push("Missing URL in offers (recommended for better SEO)")
      }
    }

    if (!parsedSchema.brand) {
      result.warnings.push("Missing brand property")
    } else if (!parsedSchema.brand.name) {
      result.warnings.push("Missing name in brand")
    }

    if (parsedSchema["@type"] === "Book") {
      if (!parsedSchema.author) {
        result.warnings.push("Book is missing author property")
      }

      if (!parsedSchema.publisher) {
        result.warnings.push("Book is missing publisher property")
      }
    }

    if (parsedSchema["@type"] === "SoftwareApplication") {
      if (!parsedSchema.applicationCategory) {
        result.warnings.push("Software is missing applicationCategory property")
      }

      if (!parsedSchema.operatingSystem) {
        result.warnings.push("Software is missing operatingSystem property")
      }
    }
  } catch (e) {
    result.errors.push("Invalid JSON format")
    result.isValid = false
  }

  return result
}


export function getGoogleRichResultsTestUrl(url: string): string {
  return `https://search.google.com/test/rich-results?url=${encodeURIComponent(url)}&user_agent=2`
}


export function fixCommonSchemaIssues(schema: string): string {
  try {
    const parsedSchema = JSON.parse(schema)

    if (!parsedSchema["@context"]) {
      parsedSchema["@context"] = "https://schema.org/"
    }

    if (parsedSchema.offers && typeof parsedSchema.offers === "object") {
      if (!parsedSchema.offers["@type"]) {
        parsedSchema.offers["@type"] = "Offer"
      }

      if (!parsedSchema.offers.priceCurrency) {
        parsedSchema.offers.priceCurrency = "USD"
      }
    }

    if (parsedSchema.brand && typeof parsedSchema.brand === "object") {
      if (!parsedSchema.brand["@type"]) {
        parsedSchema.brand["@type"] = "Brand"
      }
    }

    return JSON.stringify(parsedSchema, null, 2)
  } catch (e) {
    return schema
  }
}
