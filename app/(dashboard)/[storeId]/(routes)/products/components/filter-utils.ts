export const applyFilters = (products: any[], filters: any) => {
  return products.filter((product) => {
    if (filters.status.length > 0) {
      if (filters.status.includes("published") && product.isPublished && !product.isArchived) {
      } else if (filters.status.includes("draft") && !product.isPublished && !product.isArchived) {
      } else if (filters.status.includes("archived") && product.isArchived) {
      } else {
        return false
      }
    }

    if (filters.gender.length > 0 && !filters.gender.includes(product.gender)) {
      return false
    }

    if (filters.material.length > 0) {
      const productMaterials = Array.isArray(product.material) ? product.material : []
      if (!filters.material.some((m: string) => productMaterials.includes(m))) {
        return false
      }
    }

    if (filters.style.length > 0) {
      const productStyles = Array.isArray(product.style) ? product.style : []
      if (!filters.style.some((s: string) => productStyles.includes(s))) {
        return false
      }
    }

    if (filters.size.length > 0 && !filters.size.includes(product.sizeId)) {
      return false
    }

    if (filters.color.length > 0 && !filters.color.includes(product.colorId)) {
      return false
    }

    if (filters.minPrice > 0 && product.price < filters.minPrice) {
      return false
    }

    if (filters.maxPrice < 1000 && product.price > filters.maxPrice) {
      return false
    }

    return true
  })
}

export const getFilterCounts = (products: any[]) => {
  const counts = {
    status: {
      published: 0,
      draft: 0,
      archived: 0,
    },
    gender: {} as Record<string, number>,
    material: {} as Record<string, number>,
    style: {} as Record<string, number>,
    size: {} as Record<string, number>,
    color: {} as Record<string, number>,
  }

  products.forEach((product) => {
    if (product.isPublished && !product.isArchived) {
      counts.status.published++
    } else if (!product.isPublished && !product.isArchived) {
      counts.status.draft++
    } else if (product.isArchived) {
      counts.status.archived++
    }

    if (product.gender) {
      counts.gender[product.gender] = (counts.gender[product.gender] || 0) + 1
    }

    if (Array.isArray(product.material)) {
      product.material.forEach((m: string) => {
        counts.material[m] = (counts.material[m] || 0) + 1
      })
    }

    if (Array.isArray(product.style)) {
      product.style.forEach((s: string) => {
        counts.style[s] = (counts.style[s] || 0) + 1
      })
    }

    if (product.sizeId) {
      counts.size[product.sizeId] = (counts.size[product.sizeId] || 0) + 1
    }

    if (product.colorId) {
      counts.color[product.colorId] = (counts.color[product.colorId] || 0) + 1
    }
  })

  return counts
}
