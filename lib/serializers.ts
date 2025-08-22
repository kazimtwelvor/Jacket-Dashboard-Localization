/**
 * Serializes Prisma Decimal objects to strings to prevent hydration errors
 * when passing data from Server Components to Client Components
 */
export function serializeDecimalFields<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj }

  // Handle Decimal fields that are commonly used in products
  const decimalFields = ["price", "salePrice", "menuOrder", "ratingValue", "reviewCount"]

  for (const field of decimalFields) {
    if (field in result && result[field] !== null && typeof result[field] === "object" && "toString" in result[field]) {
      result[field] = result[field].toString()
    }
  }

  return result
}

/**
 * Serializes an array of objects containing Decimal fields
 */
export function serializeCollection<T extends Record<string, any>>(collection: T[]): T[] {
  return collection.map((item) => serializeDecimalFields(item))
}

