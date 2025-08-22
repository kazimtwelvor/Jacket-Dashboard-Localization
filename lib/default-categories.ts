// import prismadb from "@/lib/prismadb"

// // Define the default categories
// const DEFAULT_MATERIALS = ["Leather", "Denim", "Wool", "Suede", "Fleece"]
// const DEFAULT_STYLES = [
//   "Bomber",
//   "Puffer",
//   "Varsity",
//   "Letterman",
//   "Biker",
//   "Aviator",
//   "Quilted",
//   "Blazer",
//   "Cropped",
//   "Long Coat",
// ]
// const DEFAULT_GENDERS = ["Men", "Women", "Unisex"]

// // Helper function to create a slug from a name
// const createSlug = (name: string): string => {
//   return name.toLowerCase().replace(/\s+/g, "-")
// }

// // Function to create default categories for a store
// export async function createDefaultCategories(storeId: string) {
//   try {
//     console.log(`Creating default categories for store ${storeId}`)

//     // Create a default billboard first
//     const defaultBillboard = await prismadb.billboard.create({
//       data: {
//         label: "Default Billboard",
//         imageUrl: "https://via.placeholder.com/1200x400?text=Default+Billboard",
//         storeId,
//       },
//     })

//     console.log(`Created default billboard with ID: ${defaultBillboard.id}`)

//     // Create material categories
//     for (const material of DEFAULT_MATERIALS) {
//       await prismadb.category.create({
//         data: {
//           name: material,
//           type: "material",
//           slug: createSlug(material),
//           billboardId: defaultBillboard.id,
//           storeId,
//         },
//       })
//       console.log(`Created material category: ${material}`)
//     }

//     // Create style categories
//     for (const style of DEFAULT_STYLES) {
//       await prismadb.category.create({
//         data: {
//           name: style,
//           type: "style",
//           slug: createSlug(style),
//           billboardId: defaultBillboard.id,
//           storeId,
//         },
//       })
//       console.log(`Created style category: ${style}`)
//     }

//     // Create gender categories
//     for (const gender of DEFAULT_GENDERS) {
//       await prismadb.category.create({
//         data: {
//           name: gender,
//           type: "gender",
//           slug: createSlug(gender),
//           billboardId: defaultBillboard.id,
//           storeId,
//         },
//       })
//       console.log(`Created gender category: ${gender}`)
//     }

//     console.log("Successfully created all default categories")
//     return true
//   } catch (error) {
//     console.error("Error creating default categories:", error)
//     return false
//   }
// }

