import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth()
    const body = await req.json()
    const { name, specifications, categories } = body

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return new NextResponse("GEMINI_API_KEY is not configured", { status: 500 })
    }

    // Format product name with gender if available
    const genderedName = categories?.gender
      ? `${categories.gender.charAt(0).toUpperCase() + categories.gender.slice(1)}'s ${name}`
      : name

    // Generate primary keyword based on product details
    const primaryKeyword = `${specifications.color?.[0] || ""} ${genderedName}`.trim()

    // Determine jacket type based on name and specifications
    const jacketType = determineJacketType(name, specifications)

    // Select appropriate keywords based on jacket type
    const { kgrTerms, nlpTerms, sgeTerms, lsiTerms } = selectAppropriateKeywords(jacketType, specifications)

    // Generate secondary keywords based on specifications
    const secondaryKeywords = [
      `${specifications.externalMaterial?.[0] || ""} ${name}`,
      `${name} with ${specifications.closure?.[0] || "closure"}`,
      `${specifications.color?.[0] || ""} ${specifications.externalMaterial?.[0] || ""} ${name}`,
      `quality ${name}`,
    ]
      .filter((keyword) => keyword.trim() !== "")
      .slice(0, 4)

    // Generate common question for featured snippet
    const commonQuestion = `What makes ${name} stand out?`

    // Create material phrase if available
    let materialPhrase = ""
    if (categories?.material?.length > 0) {
      materialPhrase = `crafted from premium ${categories.material.join(" and ")}`
    }

    // Create style phrase if available
    let stylePhrase = ""
    if (categories?.style?.length > 0) {
      stylePhrase = `featuring a ${categories.style.join("/")} design`
    }

    // Create a detailed prompt based on product specifications and SEO template
    const prompt = `Create a highly SEO-optimized product description for ${genderedName} in 200 words maximum (2-3 paragraphs only).

Include:
- Primary keyword "${primaryKeyword}" in first sentence and paragraph conclusion
- Secondary keywords: ${secondaryKeywords.join(", ")} naturally distributed
- LSI terms: ${lsiTerms.join(", ")}
- SGE terms: ${sgeTerms.join(", ")}
- NLP-friendly terms: ${nlpTerms.join(", ")}
- KGR focus term: ${kgrTerms[0]}
- One H2 subheading with keyword variation
- One featured snippet-optimized sentence answering "${commonQuestion}"
- NLP-friendly structure with clear subject-verb relationships

Paragraph structure:
1. Opening paragraph (60-80 words): Introduce product with primary keyword, main benefit, and address informational intent. If applicable, mention it's "${materialPhrase}" and "${stylePhrase}".
2. Middle paragraph (70-90 words): Highlight key features with bolded benefits, include secondary keywords and LSI terms
3. Final paragraph (40-50 words): Conclusion with product application and persuasive CTA

Avoid AI clichés completely (no "elevate," "unleash," etc.)
Use natural, conversion-focused language with specific details
Balance SEO elements with genuine value proposition

Format with short sentences, strategic bolding, and scannable structure.

Additional product specifications to include naturally:
${categories?.gender ? `Gender: ${categories.gender} (use as prefix to product name like "${categories.gender}'s")` : ""}
${categories?.material?.length > 0 ? `Material: ${categories.material.join(", ")} (use phrases like "crafted from premium [material]" or "made with high-quality [material]")` : ""}
${categories?.style?.length > 0 ? `Style: ${categories.style.join(", ")} (use phrases like "featuring a [style] design" or "in a stylish [style] cut")` : ""}
${specifications.externalMaterial?.length > 0 ? `External Material: ${specifications.externalMaterial.join(", ")}` : ""}
${specifications.internalMaterial?.length > 0 ? `Internal Material: ${specifications.internalMaterial.join(", ")}` : ""}
${specifications.collar?.length > 0 ? `Collar: ${specifications.collar.join(", ")}` : ""}
${specifications.closure?.length > 0 ? `Closure: ${specifications.closure.join(", ")}` : ""}
${specifications.cuffs?.length > 0 ? `Cuffs: ${specifications.cuffs.join(", ")}` : ""}
${specifications.pockets?.length > 0 ? `Pockets: ${specifications.pockets.join(", ")}` : ""}
${specifications.color?.length > 0 ? `Color: ${specifications.color.join(", ")}` : ""}

Format the description with proper HTML tags:
- Use <h2> for the subheading (NO H1 tags)
- Use <p> for paragraphs
- Use <strong> for strategic bolding of important benefits
- Use <ul> and <li> for any bullet points or lists
- Keep the HTML structure clean and simple

IMPORTANT: DO NOT wrap your response in markdown code blocks (do not use \`\`\` or \`\`\`html). Just provide the raw HTML content.

IMPORTANT: The final word count MUST be MAXIMUM 200 words. Please check your word count before finalizing.`

    try {
      // Call the Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        console.log("Gemini API error:", errorData)
        throw new Error(`API call failed: ${response.statusText}`)
      }

      const data = await response.json()

      // Extract the generated text from the response
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
        throw new Error("Unexpected API response format")
      }

      // Get the raw text from Gemini
      let description = data.candidates[0].content.parts[0].text

      // Remove any markdown code block syntax if present
      if (description.startsWith("```") && description.endsWith("```")) {
        description = description.replace(/^```(?:html)?\s*\n?/, "").replace(/\n?```$/, "")
      }

      // Process the description to ensure proper HTML formatting
      // Fix common issues with the Key Features section
      if (description.includes("Key Features") && !description.includes("<ul>")) {
        description = description.replace(/(Key Features:?.*?)([•\-*])/gi, "<h3>Key Features:</h3>\n<ul>\n<li>")

        // Replace bullet points with proper list items
        description = description.replace(/([•\-*]\s*)(.*?)(?=\s*[•\-*]|$)/g, "<li>$2</li>\n")

        // Close any unclosed ul tags
        if (description.includes("<ul>") && !description.includes("</ul>")) {
          description += "\n</ul>"
        }
      }

      // Count words in the description (excluding HTML tags)
      const wordCount = description
        .replace(/<[^>]*>/g, "")
        .split(/\s+/)
        .filter(Boolean).length
      console.log(`Generated description word count: ${wordCount}`)

      return NextResponse.json({ description, wordCount })
    } catch (error) {
      console.error("Error calling Gemini API:", error)
      return new NextResponse("Failed to generate description", { status: 500 })
    }
  } catch (error) {
    console.error("[PRODUCT_DESCRIPTION_ERROR]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// Helper function to determine jacket type based on name and specifications
function determineJacketType(name: string, specifications: any): string {
  const nameLower = name.toLowerCase()
  const externalMaterial = specifications.externalMaterial?.map((m: string) => m.toLowerCase()) || []

  // Check for leather jacket
  if (nameLower.includes("leather") || externalMaterial.some((m: string) => m.includes("leather"))) {
    return "leather"
  }

  // Check for winter/puffer jacket
  if (
    nameLower.includes("winter") ||
    nameLower.includes("puffer") ||
    nameLower.includes("down") ||
    nameLower.includes("insulated")
  ) {
    return "winter"
  }

  // Check for rain jacket
  if (nameLower.includes("rain") || nameLower.includes("waterproof") || nameLower.includes("water resistant")) {
    return "rain"
  }

  // Check for bomber jacket
  if (nameLower.includes("bomber")) {
    return "bomber"
  }

  // Check for denim jacket
  if (
    nameLower.includes("denim") ||
    nameLower.includes("jean") ||
    externalMaterial.some((m: string) => m.includes("denim"))
  ) {
    return "denim"
  }

  // Default to general jacket
  return "general"
}

// Helper function to select appropriate keywords based on jacket type
function selectAppropriateKeywords(jacketType: string, specifications: any) {
  // KGR Focus Terms
  const allKgrTerms = [
    "winter jacket temperature ratings",
    "packable down jacket comparison",
    "best motorcycle jacket protection",
    "sustainable puffer jacket materials",
    "leather jacket break-in methods",
    "rain jacket waterproof ratings",
    "bomber jacket history origin",
    "technical hiking jacket features",
  ]

  // NLP-friendly Terms
  const allNlpTerms = [
    "warm waterproof winter jackets",
    "lightweight breathable rain jacket",
    "durable leather motorcycle jacket",
    "insulated ski jacket with hood",
    "vintage denim jacket styles",
    "windproof running jacket review",
    "reversible puffer jacket women's",
    "sustainable ethical jacket brands",
  ]

  // SGE Terms
  const allSgeTerms = [
    "how to choose the right jacket size",
    "what makes a good hiking jacket",
    "best jacket for extreme cold weather",
    "differences between jacket insulation types",
    "how to care for leather jacket",
    "jacket styles for different body types",
    "sustainable jacket materials guide",
    "how to layer with lightweight jackets",
  ]

  // LSI Terms
  const allLsiTerms = [
    "coat outerwear overcoat",
    "insulation warmth thermal lining",
    "waterproof weatherproof rainproof",
    "breathable ventilated airflow",
    "durability rugged long-lasting",
    "fashion style trend aesthetic",
    "seasonal winter fall spring",
    "performance technical functional",
    "comfort fit ergonomic design",
    "adventure outdoor expedition gear",
  ]

  // Select appropriate terms based on jacket type
  let kgrTerms: string[] = []
  let nlpTerms: string[] = []
  let sgeTerms: string[] = []
  let lsiTerms: string[] = []

  switch (jacketType) {
    case "leather":
      kgrTerms = [allKgrTerms[4]] // leather jacket break-in methods
      nlpTerms = [allNlpTerms[2]] // durable leather motorcycle jacket
      sgeTerms = [allSgeTerms[4]] // how to care for leather jacket
      lsiTerms = [allLsiTerms[4], allLsiTerms[5], allLsiTerms[8]] // durability, fashion, comfort
      break

    case "winter":
      kgrTerms = [allKgrTerms[0], allKgrTerms[3]] // winter jacket ratings, sustainable puffer
      nlpTerms = [allNlpTerms[0], allNlpTerms[3], allNlpTerms[6]] // warm waterproof, insulated, reversible
      sgeTerms = [allSgeTerms[2], allSgeTerms[3]] // extreme cold, insulation types
      lsiTerms = [allLsiTerms[1], allLsiTerms[6], allLsiTerms[8]] // insulation, seasonal, comfort
      break

    case "rain":
      kgrTerms = [allKgrTerms[5]] // rain jacket waterproof ratings
      nlpTerms = [allNlpTerms[1]] // lightweight breathable rain jacket
      sgeTerms = [allSgeTerms[7]] // how to layer with lightweight jackets
      lsiTerms = [allLsiTerms[2], allLsiTerms[3], allLsiTerms[7]] // waterproof, breathable, performance
      break

    case "bomber":
      kgrTerms = [allKgrTerms[6]] // bomber jacket history origin
      nlpTerms = [allNlpTerms[7]] // sustainable ethical jacket brands
      sgeTerms = [allSgeTerms[5]] // jacket styles for different body types
      lsiTerms = [allLsiTerms[5], allLsiTerms[8], allLsiTerms[6]] // fashion, comfort, seasonal
      break

    case "denim":
      kgrTerms = [allKgrTerms[7]] // technical features (closest match)
      nlpTerms = [allNlpTerms[4]] // vintage denim jacket styles
      sgeTerms = [allSgeTerms[5]] // jacket styles for different body types
      lsiTerms = [allLsiTerms[4], allLsiTerms[5], allLsiTerms[8]] // durability, fashion, comfort
      break

    default: // general jacket
      kgrTerms = [allKgrTerms[7]] // technical features
      nlpTerms = [allNlpTerms[7]] // sustainable ethical jacket brands
      sgeTerms = [allSgeTerms[0], allSgeTerms[5]] // right size, different body types
      lsiTerms = [allLsiTerms[4], allLsiTerms[5], allLsiTerms[8]] // durability, fashion, comfort
      break
  }

  // If color is specified, add color-related LSI terms
  if (specifications.color?.length > 0) {
    lsiTerms.push("color shade tone hue")
  }

  // Ensure we have at least one term in each category
  if (kgrTerms.length === 0) kgrTerms = [allKgrTerms[7]] // default to technical features
  if (nlpTerms.length === 0) nlpTerms = [allNlpTerms[7]] // default to sustainable ethical
  if (sgeTerms.length === 0) sgeTerms = [allSgeTerms[0]] // default to right size
  if (lsiTerms.length === 0) lsiTerms = [allLsiTerms[5], allLsiTerms[8]] // default to fashion, comfort

  return {
    kgrTerms: kgrTerms.slice(0, 1), // Just take one KGR term
    nlpTerms: nlpTerms.slice(0, 2), // Take up to 2 NLP terms
    sgeTerms: sgeTerms.slice(0, 2), // Take up to 2 SGE terms
    lsiTerms: lsiTerms.slice(0, 3), // Take up to 3 LSI terms
  }
}

// import { NextResponse } from "next/server"
// import { auth } from "@clerk/nextjs/server"

// export async function POST(req: Request, { params }: { params: { storeId: string } }) {
//   try {
//     // Get the request body
//     const body = await req.json()
//     console.log("FULL REQUEST BODY:", JSON.stringify(body, null, 2))

//     // Extract the available data
//     const { name, specifications } = body

//     // Check authentication and parameters
//     const { userId } = await auth()
//     if (!userId) {
//       return new NextResponse("Unauthenticated", { status: 401 })
//     }

//     const storeId = params?.storeId
//     if (!storeId) {
//       return new NextResponse("Store ID is required", { status: 400 })
//     }

//     if (!process.env.GEMINI_API_KEY) {
//       return new NextResponse("GEMINI_API_KEY is not configured", { status: 500 })
//     }

//     // Create a simple, direct prompt that focuses on the available specifications
//     const prompt = `
//     Create a product description for a "${name}" with the following specifications:

//     - External Material: ${specifications?.externalMaterial?.join(", ") || "Not specified"}
//     - Internal Material: ${specifications?.internalMaterial?.join(", ") || "Not specified"}
//     - Collar: ${specifications?.collar?.join(", ") || "Not specified"}
//     - Closure: ${specifications?.closure?.join(", ") || "Not specified"}
//     - Cuffs: ${specifications?.cuffs?.join(", ") || "Not specified"}
//     - Pockets: ${specifications?.pockets?.join(", ") || "Not specified"}
//     - Color: ${specifications?.color?.join(", ") || "Not specified"}

//     The description should:
//     1. Be 150-200 words maximum
//     2. Highlight the premium quality of the materials
//     3. Emphasize the design features (collar, cuffs, closure)
//     4. Mention the color and how it enhances the style
//     5. Include proper HTML formatting with paragraphs (<p>) and emphasis (<strong>) where appropriate
//     6. NOT include any gender-specific language (don't use terms like "men's", "women's", or "unisex")
//     7. Focus on the product's features and benefits

//     Format the description with proper HTML tags:
//     - Use <p> for paragraphs
//     - Use <strong> for important points
//     - Use <h2> for any subheadings (if needed)

//     DO NOT wrap your response in markdown code blocks. Provide the raw HTML content only.
//     `

//     try {
//       // Call the Gemini API with a simplified approach
//       const response = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             contents: [{ parts: [{ text: prompt }] }],
//             generationConfig: {
//               temperature: 0.7,
//               maxOutputTokens: 1024,
//             },
//           }),
//         },
//       )

//       if (!response.ok) {
//         const errorData = await response.json()
//         console.log("Gemini API error:", errorData)
//         throw new Error(`API call failed: ${response.statusText}`)
//       }

//       const data = await response.json()

//       // Extract the generated text
//       if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
//         throw new Error("Unexpected API response format")
//       }

//       let description = data.candidates[0].content.parts[0].text

//       // Remove any markdown code block syntax if present
//       if (description.startsWith("```") && description.endsWith("```")) {
//         description = description.replace(/^```(?:html)?\s*\n?/, "").replace(/\n?```$/, "")
//       }

//       // Count words
//       const wordCount = description
//         .replace(/<[^>]*>/g, "")
//         .split(/\s+/)
//         .filter(Boolean).length

//       console.log("GENERATED DESCRIPTION:", description)
//       console.log(`Word count: ${wordCount}`)

//       return NextResponse.json({ description, wordCount })
//     } catch (error) {
//       console.error("Error generating description:", error)
//       return NextResponse.json({ error: "Failed to generate description" }, { status: 500 })
//     }
//   } catch (error) {
//     console.error("[PRODUCT_DESCRIPTION_ERROR]", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }
