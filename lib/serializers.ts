
export function serializeDecimalFields<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj }

  const decimalFields = ["price", "salePrice", "menuOrder"]

  for (const field of decimalFields) {
    if (field in result && result[field] !== null && typeof result[field] === "object" && "toString" in result[field]) {
      result[field] = result[field].toString()
    }
  }

  return result
}


export function serializeCollection<T extends Record<string, any>>(collection: T[]): T[] {
  return collection.map((item) => serializeDecimalFields(item))
}

