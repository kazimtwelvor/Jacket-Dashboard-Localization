/**
 * Smart search utility that handles plural/singular variations
 * When searching for "mens jackets", it will also match "men jacket", "men jackets", "mens jacket"
 */

// Gender groups - words that belong to the same gender category
const GENDER_GROUPS = {
  MALE: ['men', 'mens', 'man', 'male', 'males', 'masculine', "men's", "mens'", "man's", "mans'"],
  FEMALE: ['women', 'womens', 'woman', 'female', 'females', 'feminine', "women's", "womens'", "woman's", "womans'"],
  UNISEX: ['kids', 'kid', 'children', 'child', 'unisex', 'genderless', 'neutral', "kids'", "kid's", "children's", "child's"]
}

// Special cases that don't follow standard pluralization rules
const SPECIAL_CASES: Record<string, string[]> = {
  // Gender terms
  'men': ['mens', 'man'],
  'mens': ['men', 'man'],
  'man': ['men', 'mens'],
  'women': ['womens', 'woman'],
  'womens': ['women', 'woman'],
  'woman': ['women', 'womens'],
  'children': ['kids', 'kid'],
  'kids': ['kid', 'children'],
  'kid': ['kids', 'children'],
  
  // Colors with irregular forms
  'gray': ['grey', 'grays'],
  'grey': ['gray', 'grays'],
  'grays': ['gray', 'grey'],
  
  // Unisex terms
  'unisex': ['unisex'],
}

/**
 * Generate plural form of a word using regex patterns
 */
function generatePlural(word: string): string {
  const lowerWord = word.toLowerCase()
  
  // Handle special cases first
  if (SPECIAL_CASES[lowerWord]) {
    return SPECIAL_CASES[lowerWord][0] // Return first variation
  }
  
  // Standard pluralization rules using regex
  if (lowerWord.endsWith('y') && !/[aeiou]y$/.test(lowerWord)) {
    // Words ending in consonant + y: change y to ies
    return lowerWord.slice(0, -1) + 'ies'
  } else if (lowerWord.endsWith('s') || lowerWord.endsWith('sh') || lowerWord.endsWith('ch') || lowerWord.endsWith('x') || lowerWord.endsWith('z')) {
    // Words ending in s, sh, ch, x, z: add es
    return lowerWord + 'es'
  } else if (lowerWord.endsWith('f')) {
    // Words ending in f: change f to ves
    return lowerWord.slice(0, -1) + 'ves'
  } else if (lowerWord.endsWith('fe')) {
    // Words ending in fe: change fe to ves
    return lowerWord.slice(0, -2) + 'ves'
  } else if (lowerWord.endsWith('o') && !/[aeiou]o$/.test(lowerWord)) {
    // Words ending in consonant + o: add es
    return lowerWord + 'es'
  } else {
    // Default: add s
    return lowerWord + 's'
  }
}

/**
 * Generate singular form of a word using regex patterns
 */
function generateSingular(word: string): string {
  const lowerWord = word.toLowerCase()
  
  // Handle special cases first
  if (SPECIAL_CASES[lowerWord]) {
    return SPECIAL_CASES[lowerWord][0] // Return first variation
  }
  
  // Standard singularization rules using regex
  if (lowerWord.endsWith('ies') && lowerWord.length > 3) {
    // Words ending in ies: change ies to y
    return lowerWord.slice(0, -3) + 'y'
  } else if (lowerWord.endsWith('ves') && (lowerWord.endsWith('ves') && !lowerWord.endsWith('aves'))) {
    // Words ending in ves (but not aves): change ves to f or fe
    const base = lowerWord.slice(0, -3)
    if (base.endsWith('i')) {
      return base.slice(0, -1) + 'fe'
    } else {
      return base + 'f'
    }
  } else if (lowerWord.endsWith('es') && lowerWord.length > 3) {
    // Words ending in es: remove es
    return lowerWord.slice(0, -2)
  } else if (lowerWord.endsWith('s') && lowerWord.length > 1) {
    // Words ending in s: remove s
    return lowerWord.slice(0, -1)
  } else {
    // Already singular or doesn't follow standard rules
    return lowerWord
  }
}

/**
 * Get the gender group for a word
 */
function getGenderGroup(word: string): string | null {
  const lowerWord = word.toLowerCase()
  
  // First check exact matches
  for (const [group, words] of Object.entries(GENDER_GROUPS)) {
    if (words.includes(lowerWord)) {
      return group
    }
  }
  
  // Check for apostrophe variations by removing apostrophes and checking again
  const wordWithoutApostrophe = lowerWord.replace(/['']/g, '')
  for (const [group, words] of Object.entries(GENDER_GROUPS)) {
    if (words.includes(wordWithoutApostrophe)) {
      return group
    }
  }
  
  // Check if word starts with gender terms (for cases like "women's" -> "women")
  for (const [group, words] of Object.entries(GENDER_GROUPS)) {
    for (const genderWord of words) {
      const cleanGenderWord = genderWord.replace(/['']/g, '')
      if (lowerWord.startsWith(cleanGenderWord) || wordWithoutApostrophe.startsWith(cleanGenderWord)) {
        return group
      }
    }
  }
  
  return null
}

/**
 * Check if two words belong to the same gender group
 */
function isSameGender(word1: string, word2: string): boolean {
  const group1 = getGenderGroup(word1)
  const group2 = getGenderGroup(word2)
  
  // If either word is not a gender term, they're compatible
  if (!group1 || !group2) {
    return true
  }
  
  // If both are gender terms, they must be in the same group
  return group1 === group2
}

/**
 * Generate search variations for a given word using regex patterns
 */
function getWordVariations(word: string): string[] {
  const variations = new Set<string>([word.toLowerCase()])
  
  // Check special cases first
  if (SPECIAL_CASES[word.toLowerCase()]) {
    SPECIAL_CASES[word.toLowerCase()].forEach(variation => {
      variations.add(variation.toLowerCase())
    })
    return Array.from(variations)
  }
  
  // Generate plural and singular forms
  const plural = generatePlural(word)
  const singular = generateSingular(word)
  
  variations.add(plural)
  variations.add(singular)
  
  // If the word is already plural, also try to generate its plural (in case of irregular forms)
  if (word.endsWith('s') && word.length > 1) {
    const pluralOfPlural = generatePlural(singular)
    variations.add(pluralOfPlural)
  }
  
  return Array.from(variations)
}

/**
 * Generate all possible permutations of an array
 */
function generatePermutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr]
  
  const result: T[][] = []
  
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i]
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)]
    const permutations = generatePermutations(remaining)
    
    for (const perm of permutations) {
      result.push([current, ...perm])
    }
  }
  
  return result
}

/**
 * Generate all possible combinations of an array (including subsets)
 */
function generateCombinations<T>(arr: T[], minLength: number = 1): T[][] {
  const result: T[][] = []
  
  function backtrack(start: number, current: T[]) {
    if (current.length >= minLength) {
      result.push([...current])
    }
    
    for (let i = start; i < arr.length; i++) {
      current.push(arr[i])
      backtrack(i + 1, current)
      current.pop()
    }
  }
  
  backtrack(0, [])
  return result
}

/**
 * Generate all possible search combinations for a search phrase
 * Now only generates variations that contain ALL words from the search term
 */
export function generateSearchVariations(searchTerm: string): string[] {
  if (!searchTerm.trim()) return []
  
  const words = searchTerm.trim().toLowerCase().split(/\s+/)
  const variations = new Set<string>()
  
  // Add original search term
  variations.add(searchTerm.toLowerCase())
  
  // Generate all possible word variations for each word
  const wordVariationsList = words.map(word => getWordVariations(word))
  
  // Generate all combinations of word variations (ALL words must be present)
  const generateAllWordCombinations = (wordIndex: number, currentCombination: string[]) => {
    if (wordIndex === words.length) {
      if (currentCombination.length === words.length) { // Must have ALL words
        const phrase = currentCombination.join(' ')
        variations.add(phrase)
        
        // Generate all permutations of this phrase
        const permutations = generatePermutations(currentCombination)
        permutations.forEach(perm => {
          variations.add(perm.join(' '))
        })
      }
      return
    }
    
    const wordVariations = wordVariationsList[wordIndex]
    
    for (const variation of wordVariations) {
      generateAllWordCombinations(wordIndex + 1, [...currentCombination, variation])
    }
  }
  
  // Generate all word combinations (ALL words must be present)
  generateAllWordCombinations(0, [])
  
  return Array.from(variations)
}

/**
 * Check if a text contains all words from the search term (with variations)
 * Now includes gender consistency checking
 */
export function matchesSearchVariations(text: string, searchTerm: string): boolean {
  if (!searchTerm.trim()) return true
  
  const searchWords = searchTerm.trim().toLowerCase().split(/\s+/)
  const normalizedText = text.toLowerCase()
  const textWords = normalizedText.split(/\s+/)
  
  // Check if all search words (or their variations) are present in the text
  const allWordsFound = searchWords.every(searchWord => {
    const wordVariations = getWordVariations(searchWord)
    return wordVariations.some(variation => 
      normalizedText.includes(variation.toLowerCase())
    )
  })
  
  if (!allWordsFound) return false
  
  // Check gender consistency
  const searchGenderTerms = searchWords.filter(word => getGenderGroup(word) !== null)
  const textGenderTerms = textWords.filter(word => getGenderGroup(word) !== null)
  
  // If there are gender terms in the search, check consistency
  if (searchGenderTerms.length > 0) {
    // All gender terms in the text must be compatible with search gender terms
    const searchGenderGroups = new Set(searchGenderTerms.map(word => getGenderGroup(word)))
    
    // Check if all gender terms in the text belong to the same group as search terms
    const textGenderGroups = new Set(textGenderTerms.map(word => getGenderGroup(word)))
    
    // If there are gender terms in the text, they must match the search gender
    if (textGenderGroups.size > 0) {
      // Check if any text gender group matches any search gender group
      const hasMatchingGender = Array.from(textGenderGroups).some(textGroup => 
        Array.from(searchGenderGroups).some(searchGroup => textGroup === searchGroup)
      )
      
      if (!hasMatchingGender) {
        return false
      }
    }
  }
  
  return true
}

/**
 * Smart search function that can be used with arrays
 */
export function smartSearch<T>(
  items: T[], 
  searchTerm: string, 
  searchFields: (keyof T)[]
): T[] {
  if (!searchTerm.trim()) return items
  
  return items.filter(item => {
    return searchFields.some(field => {
      const fieldValue = item[field]
      if (typeof fieldValue === 'string') {
        return matchesSearchVariations(fieldValue, searchTerm)
      }
      return false
    })
  })
}

/**
 * Test function to verify search functionality
 * This can be called from browser console for debugging
 */
export function testSearch() {
  const testData = [
    { name: "Women Jackets", slug: "women-jackets", description: "Beautiful women jackets" },
    { name: "Men Jacket", slug: "men-jacket", description: "Stylish men jacket" },
    { name: "Kids Shoes", slug: "kids-shoes", description: "Comfortable kids shoes" },
    { name: "Womens Dresses", slug: "womens-dresses", description: "Elegant womens dresses" },
    { name: "Brown Women Blazers", slug: "brown-women-blazers", description: "Elegant brown women blazers" },
    { name: "Black Men Suits", slug: "black-men-suits", description: "Professional black men suits" },
    { name: "Blue Kids Shirts", slug: "blue-kids-shirts", description: "Casual blue kids shirts" },
    { name: "Women Blazers", slug: "women-blazers", description: "Stylish women blazers" },
    { name: "Brown Jackets", slug: "brown-jackets", description: "Classic brown jackets" },
    { name: "Red Dresses", slug: "red-dresses", description: "Elegant red dresses" },
    { name: "Brown Mens Blazers", slug: "brown-mens-blazers", description: "Classic brown mens blazers" },
    { name: "Mens Brown Blazers", slug: "mens-brown-blazers", description: "Stylish mens brown blazers" },
    { name: "Mens Red Bomber Jackets", slug: "mens-red-bomber-jackets", description: "Stylish mens red bomber jackets" },
    { name: "Mens Yellow Bomber Jackets", slug: "mens-yellow-bomber-jackets", description: "Classic mens yellow bomber jackets" },
    { name: "Mens Bomber", slug: "mens-bomber", description: "Classic mens bomber" },
    { name: "Womens Bomber", slug: "womens-bomber", description: "Classic womens bomber" },
    { name: "Women's Leather Bomber Jackets", slug: "womens-leather-bomber-jackets", description: "Elegant women's leather bomber jackets" },
    { name: "Men's Black Bomber Coats", slug: "mens-black-bomber-coats", description: "Stylish men's black bomber coats" },
    { name: "Women Blue Bomber Coats", slug: "women-blue-bomber-coats", description: "Elegant women blue bomber coats" },
    { name: "Kids Green Bomber Vests", slug: "kids-green-bomber-vests", description: "Comfortable kids green bomber vests" },
  ]
  
  console.log("=== Testing GENDER-SPECIFIC SEARCH (NEW BEHAVIOR) ===")
  
  console.log("Testing search for 'Mens Bomber' (should find 'Mens Red Bomber Jackets', 'Mens Yellow Bomber Jackets', 'Mens Bomber' but NOT 'Womens Bomber'):")
  const result1 = smartSearch(testData, "Mens Bomber", ["name", "slug", "description"])
  console.log("Results:", result1)
  
  console.log("Testing search for 'Women Bomber' (should find 'Women Blue Bomber Coats' but NOT 'Mens Bomber'):")
  const result2 = smartSearch(testData, "Women Bomber", ["name", "slug", "description"])
  console.log("Results:", result2)
  
  console.log("Testing search for 'Kids Bomber' (should find 'Kids Green Bomber Vests'):")
  const result3 = smartSearch(testData, "Kids Bomber", ["name", "slug", "description"])
  console.log("Results:", result3)
  
  console.log("Testing search for 'Mens Jackets' (should find 'Men Jacket', 'Mens Jackets' but NOT 'Women Jackets'):")
  const result8 = smartSearch(testData, "Mens Jackets", ["name", "slug", "description"])
  console.log("Results:", result8)
  
  console.log("=== Testing APOSTROPHE GENDER DETECTION ===")
  
  console.log("Testing search for 'Mens Bomber' (should NOT find 'Women's Leather Bomber Jackets'):")
  const result9 = smartSearch(testData, "Mens Bomber", ["name", "slug", "description"])
  console.log("Results:", result9)
  
  console.log("Testing search for 'Men's Bomber' (should find 'Men's Black Bomber Coats' but NOT 'Women's Leather Bomber Jackets'):")
  const result10 = smartSearch(testData, "Men's Bomber", ["name", "slug", "description"])
  console.log("Results:", result10)
  
  console.log("Testing gender detection for 'Women's':")
  const womensGender = getGenderGroup("Women's")
  console.log("Women's gender group:", womensGender)
  
  console.log("Testing gender detection for 'Mens':")
  const mensGender = getGenderGroup("Mens")
  console.log("Mens gender group:", mensGender)
  
  console.log("=== Testing with Additional Words ===")
  
  console.log("Testing search for 'Mens Brown Blazers' (should find 'Brown Mens Blazers', 'Mens Brown Blazers'):")
  const result4 = smartSearch(testData, "Mens Brown Blazers", ["name", "slug", "description"])
  console.log("Results:", result4)
  
  console.log("Testing search for 'Blue Kids' (should find 'Blue Kids Shirts'):")
  const result5 = smartSearch(testData, "Blue Kids", ["name", "slug", "description"])
  console.log("Results:", result5)
  
  console.log("=== Testing Plural/Singular Variations ===")
  
  console.log("Testing search for 'womens':")
  const result6 = smartSearch(testData, "womens", ["name", "slug", "description"])
  console.log("Results:", result6)
  
  console.log("Testing search for 'jackets':")
  const result7 = smartSearch(testData, "jackets", ["name", "slug", "description"])
  console.log("Results:", result7)
  
  console.log("=== Testing Word Matching Logic ===")
  console.log("Testing if 'Mens Red Bomber Jackets' contains 'Mens' and 'Bomber':")
  const testMatch = matchesSearchVariations("Mens Red Bomber Jackets", "Mens Bomber")
  console.log("Match result:", testMatch)
  
  console.log("=== Testing Regex-Based Word Variations ===")
  console.log("Testing word variations for 'jacket':")
  const jacketVariations = getWordVariations("jacket")
  console.log("Jacket variations:", jacketVariations)
  
  console.log("Testing word variations for 'jackets':")
  const jacketsVariations = getWordVariations("jackets")
  console.log("Jackets variations:", jacketsVariations)
  
  console.log("Testing word variations for 'dress':")
  const dressVariations = getWordVariations("dress")
  console.log("Dress variations:", dressVariations)
  
  console.log("Testing word variations for 'dresses':")
  const dressesVariations = getWordVariations("dresses")
  console.log("Dresses variations:", dressesVariations)
  
  console.log("Testing word variations for 'scarf':")
  const scarfVariations = getWordVariations("scarf")
  console.log("Scarf variations:", scarfVariations)
  
  console.log("Testing word variations for 'scarves':")
  const scarvesVariations = getWordVariations("scarves")
  console.log("Scarves variations:", scarvesVariations)
  
  return { result1, result2, result3, result4, result5, result6, result7, testMatch, jacketVariations, jacketsVariations, dressVariations, dressesVariations, scarfVariations, scarvesVariations }
}
