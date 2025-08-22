import * as z from "zod"

// Define the schema for the product form with proper validation
export const formSchema = z.object({
  // Basic information
  name: z.string().min(1, "Product name is required"),
  slug: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  mainImage: z.string().min(1, "Main product image is required"), // New field for main image
  images: z.array(z.string()).default([]), // Gallery images (can be empty)

  // Pricing
  regularPrice: z.string().min(1, "Regular price is required"),
  salePrice: z.string().optional(),

  // Inventory
  sku: z
    .string()
    .min(1, "SKU is required")
    .refine((val) => val.trim() !== "", {
      message: "SKU is required and cannot be empty",
    }),
  stockStatus: z.string().min(1, "Stock status is required"),
  status: z.string().min(1, "Status is required"),
  isFeatured: z.boolean().default(false),
  relatedProducts: z.array(z.string()).default([]),

  // Size and color details
  sizeDetails: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        value: z.string(),
      }),
    )
    .optional()
    .default([]),

  colorDetails: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        value: z.string(),
      }),
    )
    .optional()
    .default([]),

  // Specifications - using a simpler approach to avoid validation issues
  specifications: z
    .object({
      externalMaterial: z.array(z.string()).default([]),
      internalMaterial: z.array(z.string()).default([]),
      collar: z.array(z.string()).default([]),
      closure: z.array(z.string()).default([]),
      cuffs: z.array(z.string()).default([]),
      pockets: z.array(z.string()).default([]),
      color: z.array(z.string()).min(1, "At least one color is required").default([]),
    })
    .default({}),

  // Categories and attributes - updated to make required fields
  categories: z
    .object({
      gender: z.string().min(1, "Gender is required"),
      material: z.array(z.string()).min(1, "At least one material is required").default([]),
      style: z.array(z.string()).min(1, "At least one style is required").default([]),
      variationColors: z.array(z.string()).min(1, "At least one color variation is required").default([]),
      colorVariationLinks: z.record(z.string()).optional().default({}),
      sizes: z.array(z.string()).min(1, "At least one size is required").default([]),
    })
    .default({
      gender: "",
      material: [],
      style: [],
      variationColors: [],
      colorVariationLinks: {},
      sizes: [],
    }),

  // Additional information
  brandName: z.string().optional(),
  ratingValue: z.string().optional(),
  reviewCount: z.string().optional(),
  tags: z.array(z.string()).default([]),
  purchaseNote: z.string().optional(),
  menuOrder: z.string().optional(),
  reviews: z.boolean().default(true),

  // SEO
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      slug: z.string().optional(),
      keywords: z.array(z.string()).optional().default([]),
      isPillarContent: z.boolean().optional().default(false),
      noIndex: z.boolean().optional().default(false),
      seoScore: z.number().optional().default(0),
      canonicalUrl: z.string().optional(),
    })
    .optional()
    .default({
      metaTitle: "",
      metaDescription: "",
      slug: "",
      keywords: [],
      isPillarContent: false,
      noIndex: false,
      seoScore: 0,
      canonicalUrl: "",
    }),

  // Updated to support multiple schemas
  schema: z.string().optional(),
  schema1: z.string().optional(),
  schema2: z.string().optional(),
  schema3: z.string().optional(),
  
  // Temporary reviews ID for new products
  tempReviewsId: z.string().optional(),
  cachedReviews: z.array(z.any()).optional().default([]),
})

// Export the type for the form values
export type ProductFormValues = z.infer<typeof formSchema>

// Specification options for dropdown menus
export const specificationOptions = {
  externalMaterial: ["Leather", "Cotton", "Polyester", "Nylon", "Denim", "Wool", "Suede", "Canvas", "Fleece"],
  internalMaterial: ["Viscose", "Wool", "Fur", "Polyester", "Nylon", "Cotton", "Fleece", "Sherpa"],
  collar: [
    "Rib-Knitted",
    "Shirt Style",
    "lapel",
    "Stand",
    "Hood",
    "Fur",
    "Shearling",
    "V-Neck",
    "Others",
  ],
  closure: ["Zippered", "Button", "Hook", "Snap", "Velcro", "Drawstring", "Lace-Up", "Others"],
  cuffs: ["Rib-Knitted", "Regular", "Button", "Elastic", "Others"],
  pockets: [
    "Side Pockets",
    "Chest Pockets",
    "Patch Pockets",
    "Welt Pockets",
    "Flap Pockets",
    "Zippered Pockets",
    "Others",
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

// Gender options
export const genderOptions = [
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Unisex", value: "unisex" },
  { label: "Boys", value: "boys" },
  { label: "Girls", value: "girls" },
]

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
  "Denim",
  "Leather",
  "Winter",
  "Casual",
  "Formal",
]
