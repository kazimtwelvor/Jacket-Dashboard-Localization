// Helper function to apply filters to products
export const applyFilters = (products: any[], filters: any) => {
  return products.filter((product) => {
    // Status filter
    if (filters.status.length > 0) {
      if (filters.status.includes("published") && product.isPublished && !product.isArchived) {
        // Product is published
      } else if (filters.status.includes("draft") && !product.isPublished && !product.isArchived) {
        // Product is draft
      } else if (filters.status.includes("archived") && product.isArchived) {
        // Product is archived
      } else {
        return false
      }
    }

    // Gender filter
    if (filters.gender.length > 0 && !filters.gender.includes(product.gender)) {
      return false
    }

    // Material filter (assuming material is stored as JSON array)
    if (filters.material.length > 0) {
      const productMaterials = Array.isArray(product.material) ? product.material : []
      if (!filters.material.some((m: string) => productMaterials.includes(m))) {
        return false
      }
    }

    // Style filter (assuming style is stored as JSON array)
    if (filters.style.length > 0) {
      const productStyles = Array.isArray(product.style) ? product.style : []
      if (!filters.style.some((s: string) => productStyles.includes(s))) {
        return false
      }
    }

    // Size filter
    if (filters.size.length > 0 && !filters.size.includes(product.sizeId)) {
      return false
    }

    // Color filter
    if (filters.color.length > 0 && !filters.color.includes(product.colorId)) {
      return false
    }

    // Price range filter
    if (filters.minPrice > 0 && product.price < filters.minPrice) {
      return false
    }

    if (filters.maxPrice < 1000 && product.price > filters.maxPrice) {
      return false
    }

    return true
  })
}

// Helper function to get filter counts
export const getFilterCounts = (products: any[]) => {
  const counts = {
    status: {
      published: 0,
      draft: 0,
      archived: 0,
    },
    gender: {},
    material: {},
    style: {},
    size: {},
    color: {},
  }

  products.forEach((product) => {
    // Status counts
    if (product.isPublished && !product.isArchived) {
      counts.status.published++
    } else if (!product.isPublished && !product.isArchived) {
      counts.status.draft++
    } else if (product.isArchived) {
      counts.status.archived++
    }

    // Gender counts
    if (product.gender) {
      counts.gender[product.gender] = (counts.gender[product.gender] || 0) + 1
    }

    // Material counts
    if (Array.isArray(product.material)) {
      product.material.forEach((m: string) => {
        counts.material[m] = (counts.material[m] || 0) + 1
      })
    }

    // Style counts
    if (Array.isArray(product.style)) {
      product.style.forEach((s: string) => {
        counts.style[s] = (counts.style[s] || 0) + 1
      })
    }

    // Size counts
    if (product.sizeId) {
      counts.size[product.sizeId] = (counts.size[product.sizeId] || 0) + 1
    }

    // Color counts
    if (product.colorId) {
      counts.color[product.colorId] = (counts.color[product.colorId] || 0) + 1
    }
  })

  return counts
}
