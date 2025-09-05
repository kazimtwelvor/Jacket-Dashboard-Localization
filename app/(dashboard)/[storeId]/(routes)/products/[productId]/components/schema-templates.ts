
export interface SchemaTemplate {
  id: string
  name: string
  description: string
  additionalFields?: string[]
  template: any
}

export const SCHEMA_TEMPLATES: SchemaTemplate[] = [
  {
    id: "default",
    name: "Default Product",
    description: "Basic product schema for general products",
    template: {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: "{{name}}",
      description: "{{description}}",
      sku: "{{sku}}",
      image: "{{image}}",
      brand: {
        "@type": "Brand",
        name: "{{brandName}}",
      },
      offers: {
        "@type": "Offer",
        url: "{{url}}",
        priceCurrency: "USD",
        price: "{{price}}",
        availability: "{{availability}}",
      },
    },
  },
  {
    id: "clothing",
    name: "Clothing",
    description: "Apparel, fashion items, accessories",
    additionalFields: ["material", "color", "size"],
    template: {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: "{{name}}",
      description: "{{description}}",
      sku: "{{sku}}",
      image: "{{image}}",
      brand: {
        "@type": "Brand",
        name: "{{brandName}}",
      },
      offers: {
        "@type": "Offer",
        url: "{{url}}",
        priceCurrency: "USD",
        price: "{{price}}",
        availability: "{{availability}}",
      },
      category: "Clothing",
      material: "{{material}}",
      color: "{{color}}",
    },
  },
  {
    id: "electronics",
    name: "Electronics",
    description: "Gadgets, devices, appliances",
    additionalFields: ["model", "manufacturer"],
    template: {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: "{{name}}",
      description: "{{description}}",
      sku: "{{sku}}",
      image: "{{image}}",
      brand: {
        "@type": "Brand",
        name: "{{brandName}}",
      },
      offers: {
        "@type": "Offer",
        url: "{{url}}",
        priceCurrency: "USD",
        price: "{{price}}",
        availability: "{{availability}}",
      },
      category: "Electronics",
      model: "{{model}}",
      manufacturer: {
        "@type": "Organization",
        name: "{{manufacturer}}",
      },
    },
  },
  {
    id: "book",
    name: "Book",
    description: "Books, e-books, publications",
    additionalFields: ["author", "publisher", "isbn", "numberOfPages"],
    template: {
      "@context": "https://schema.org/",
      "@type": "Book",
      name: "{{name}}",
      description: "{{description}}",
      sku: "{{sku}}",
      image: "{{image}}",
      author: {
        "@type": "Person",
        name: "{{author}}",
      },
      publisher: {
        "@type": "Organization",
        name: "{{publisher}}",
      },
      isbn: "{{isbn}}",
      numberOfPages: "{{numberOfPages}}",
      offers: {
        "@type": "Offer",
        url: "{{url}}",
        priceCurrency: "USD",
        price: "{{price}}",
        availability: "{{availability}}",
      },
    },
  },
  {
    id: "food",
    name: "Food",
    description: "Food products, ingredients",
    additionalFields: ["nutrition"],
    template: {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: "{{name}}",
      description: "{{description}}",
      sku: "{{sku}}",
      image: "{{image}}",
      brand: {
        "@type": "Brand",
        name: "{{brandName}}",
      },
      offers: {
        "@type": "Offer",
        url: "{{url}}",
        priceCurrency: "USD",
        price: "{{price}}",
        availability: "{{availability}}",
      },
      category: "Food",
      nutrition: {
        "@type": "NutritionInformation",
        servingSize: "{{servingSize}}",
      },
    },
  },
  {
    id: "software",
    name: "Software",
    description: "Applications, digital products",
    additionalFields: ["applicationCategory", "operatingSystem"],
    template: {
      "@context": "https://schema.org/",
      "@type": "SoftwareApplication",
      name: "{{name}}",
      description: "{{description}}",
      sku: "{{sku}}",
      image: "{{image}}",
      applicationCategory: "{{applicationCategory}}",
      operatingSystem: "{{operatingSystem}}",
      offers: {
        "@type": "Offer",
        url: "{{url}}",
        priceCurrency: "USD",
        price: "{{price}}",
        availability: "{{availability}}",
      },
    },
  },
]


export function getTemplateById(id: string): SchemaTemplate | undefined {
  return SCHEMA_TEMPLATES.find((template) => template.id === id)
}


export function fillTemplate(template: any, data: Record<string, any>): any {
  const result = JSON.parse(JSON.stringify(template))

  function replacePlaceholders(obj: any): any {
    if (typeof obj === "string") {
      return obj.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        if (key === "image" && Array.isArray(data[key])) {
          return data[key].length > 0 ? data[key][0] : ""
        }

        if (Array.isArray(data[key])) {
          return data[key].join(", ")
        }

        return data[key] !== undefined ? data[key] : match
      })
    } else if (Array.isArray(obj)) {
      return obj.map(replacePlaceholders)
    } else if (obj !== null && typeof obj === "object") {
      const newObj: Record<string, any> = {}
      for (const key in obj) {
        newObj[key] = replacePlaceholders(obj[key])
      }
      return newObj
    }
    return obj
  }

  if (Array.isArray(data.image) && data.image.length > 0) {
    result.image = data.image
  }

  return replacePlaceholders(result)
}
