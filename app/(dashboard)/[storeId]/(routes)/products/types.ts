// Define all product-related types in one place for consistency

// Update the Product interface to use colorDetails and sizeDetails instead of colorIds and sizeIds
export interface Product {
  id: string
  storeId: string
  categoryData?: { material?: string; style?: string; gender?: string }
  name: string
  price: number | string
  isFeatured: boolean
  isArchived: boolean
  isPublished: boolean
  colorId: string
  colorDetails?: any // Replace colorIds with colorDetails
  images: Image[]
  sku: string
  stockStatus?: string
  description?: string
  salePrice?: number | string | null
  specifications?: string
  material?: string[]
  style?: string[]
  tags?: string[]
  gender?: string
  colorLinks?: string | object // Update type to accept both string and object
  metaTitle?: string
  metaDescription?: string
  slug?: string
  focusKeyword?: string
  additionalKeywords?: string[]
  noIndex?: boolean
  brandName?: string
  ratingValue?: string
  reviewCount?: string
  schema?: string // Ensure this field exists to store JSON-LD schema
  purchaseNote?: string
  menuOrder?: number
  productType?: string
  seoScore?: number
  productSizes?: ProductSize[] // Add this field to store multiple sizes
  sizeDetails?: any // Replace sizeIds with sizeDetails
  createdAt: Date
  updatedAt: Date
}

export interface ProductSize {
  id: string
  productId: string
  sizeId: string
  size: Size
}

export interface Image {
  id: string
  url: string
  altText?: string
  title?: string
  caption?: string
  description?: string
  excludeFromSitemap?: boolean
}

export interface Category {
  id: string
  name: string
}

export interface Size {
  id: string
  name: string
  value: string
}

export interface Color {
  id: string
  name: string
  value: string
  value2?: string | null
}

// Product specifications type
export interface ProductSpecifications {
  externalMaterial: string[]
  internalMaterial: string[]
  collar: string[]
  closure: string[]
  cuffs: string[]
  pockets: string[]
  color: string[]
}

// Product categories type
export interface ProductCategories {
  gender: string
  material: string[]
  style: string[]
  variationColors: string[]
  colorVariationLinks: Record<string, string>
  sizes: string[] // Add sizes array to store selected size IDs
}

// Product SEO type
export interface ProductSEO {
  metaTitle: string
  metaDescription: string
  slug: string
  focusKeyword: string
  additionalKeywords: string[]
  isPillarContent: boolean
  noIndex: boolean
  seoScore: number
  canonicalUrl: string
}

// Product form values type
export interface ProductFormValues {
  name: string
  description: string
  images: string[]
  regularPrice: string
  salePrice: string
  sku: string
  stockStatus: string
  status: string
  specifications: ProductSpecifications
  categories: ProductCategories
  brandName: string
  ratingValue: string
  reviewCount: string
  tags: string[]
  purchaseNote: string
  menuOrder: string
  reviews: boolean
  seo: ProductSEO
}


// Product column type for data table
// Update the ProductColumn interface to include creator information
// Add these fields to the ProductColumn interface
export type ProductColumn = {
  id: string
  name: string
  price: string
  salePrice?: string | null
  category?: string
  sku?: string
  isArchived: boolean
  isFeatured: boolean
  isPublished: boolean
  stockStatus?: string
  sizes?: string
  colors?: string
  color?: string
  imageUrl?: string
  createdAt: string
  createdById?: string
  createdByName?: string
  createdByEmail?: string
  updatedById?: string
  updatedByName?: string
  updatedByEmail?: string
  updatedAt?: string
  publishedAt?: string | null
  categories?: {
    gender?: string
    material?: string[]
    style?: string[]
  }
  colorDetails?: Array<{
    name: string
    value: string
  }>
  sizeDetails?: Array<{
    name: string
    value: string
  }>
  seoDetails?: {
    score: number
    focusKeyword?: string
  }
  description?: string
  deletedAt?: string
}


// Specification options for dropdown menus
export const specificationOptions = {
  externalMaterial: ["Leather", "Cotton", "Polyester", "Nylon", "Denim", "Wool", "Suede", "Canvas", "Silk"],
  internalMaterial: ["Viscose", "Cotton", "Polyester", "Satin", "Fleece", "Nylon", "Silk", "None"],
  collar: [
    "Rib-Knitted",
    "Regular",
    "Mandarin",
    "Spread",
    "Button-Down",
    "Wing",
    "Turtleneck",
    "V-Neck",
    "Crew Neck",
    "None",
  ],
  closure: ["Zippered", "Button", "Hook", "Snap", "Velcro", "Drawstring", "Lace-Up", "None"],
  cuffs: ["Rib-Knitted", "Regular", "Button", "French", "Convertible", "Elastic", "None"],
  pockets: [
    "Side Pockets",
    "Chest Pockets",
    "Patch Pockets",
    "Welt Pockets",
    "Flap Pockets",
    "Zippered Pockets",
    "None",
  ],
  color: [
    "Black",
    "White",
    "Red",
    "Blue",
    "Green",
    "Yellow",
    "Brown",
    "Gray",
    "Purple",
    "Orange",
    "Pink",
    "Navy",
    "Beige",
    "Burgundy",
    "Olive",
  ],
}

// Material options
export const materialOptions = ["Leather", "Denim", "Wool", "Suede", "Fleece"]

// Style options
export const styleOptions = [
  "Bomber",
  "Puffer",
  "Varsity",
  "Letterman",
  "Biker",
  "Aviator",
  "Quilted",
  "Blazer",
  "Cropped",
  "Long Coat",
]

// Gender options
export const genderOptions = [
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Unisex", value: "unisex" },
]
