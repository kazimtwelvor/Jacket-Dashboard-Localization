
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
  colorDetails?: any
  baseColor?: string
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
  colorLinks?: string | object 
  metaTitle?: string
  metaDescription?: string
  slug?: string
  focusKeyword?: string
  additionalKeywords?: string[]
  // noIndex?: boolean
  brandName?: string
  // ratingValue?: string
  // reviewCount?: string
  schema?: string 
  // purchaseNote?: string
  menuOrder?: number
  // productType?: string
  seoScore?: number
  productSizes?: ProductSize[]
  sizeDetails?: any
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

export interface ProductSpecifications {
  externalMaterial: string[]
  internalMaterial: string[]
  collar: string[]
  closure: string[]
  cuffs: string[]
  pockets: string[]
  color: string[]
}

export interface ProductCategories {
  gender: string
  material: string[]
  style: string[]
  variationColors: string[]
  colorVariationLinks: Record<string, string>
  sizes: string[]
}

export interface ProductSEO {
  metaTitle: string
  metaDescription: string
  slug: string
  focusKeyword: string
  additionalKeywords: string[]
  isPillarContent: boolean
  // noIndex: boolean
  seoScore: number
  canonicalUrl: string
}

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
  // ratingValue: string
  // reviewCount: string
  tags: string[]
  // purchaseNote: string
  menuOrder: string
  reviews: boolean
  seo: ProductSEO
}


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

export const materialOptions = ["Leather", "Denim", "Wool", "Suede", "Fleece"]

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

export const genderOptions = [
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Unisex", value: "unisex" },
]
