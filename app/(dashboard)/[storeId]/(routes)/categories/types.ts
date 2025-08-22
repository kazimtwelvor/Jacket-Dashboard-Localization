export type FeaturedProduct = {
  id: string
  name: string
  image: string | null
  price: string
}

export type CategoryColumn = {
  id: string
  name: string
  billboardLabel: string
  billboardId: string
  imageUrl: string
  productCount: number
  featuredProducts: FeaturedProduct[]
  createdAt: string
  updatedAt: string
  isActive?: boolean
  isBest?: boolean
  description?: string
  slug?: string
  metaTitle?: string
  metaDescription?: string
}
