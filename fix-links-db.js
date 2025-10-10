const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixCollectionLinks() {
  const products = await prisma.product.updateMany({
    where: {
      OR: [
        { description: { contains: 'https://fineystjackets.com/us/collections/' } },
        { description: { contains: 'https://www.fineystjackets.com/collections/' } }
      ]
    },
    data: {
      description: {
        // This won't work directly in Prisma, need to fetch and update individually
      }
    }
  })
}

async function fixLinksInDatabase() {
  console.log('Starting link fix process...')
  
  // Debug: Check what collection links actually exist
  const allProducts = await prisma.product.findMany({
    where: {
      description: { contains: 'fineystjackets.com' }
    },
    select: { id: true, description: true }
  })
  
  console.log(`Total products with fineystjackets.com: ${allProducts.length}`)
  
  // Find products with collection links
  const withCollections = allProducts.filter(p => 
    p.description && p.description.includes('/collections/')
  )
  
  console.log(`Products with /collections/ links: ${withCollections.length}`)
  
  // Show actual link patterns
  const linkPatterns = new Set()
  withCollections.forEach(p => {
    const matches = p.description.match(/https?:\/\/[^\s"'<>]*fineystjackets\.com[^\s"'<>]*\/collections\//g)
    if (matches) {
      matches.forEach(match => linkPatterns.add(match.split('/collections/')[0] + '/collections/'))
    }
  })
  
  console.log('Found link patterns:', Array.from(linkPatterns))
  
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { description: { contains: 'https://www.fineystjackets.com/collections/' } },
        { description: { contains: 'https://fineystjackets.com/us/collections/' } }
      ]
    }
  })

  console.log(`Found ${products.length} products with target links`)

  let updatedCount = 0
  for (const product of products) {
    let description = product.description
    if (description) {
      const originalDescription = description
      description = description
        .replace(/https:\/\/www\.fineystjackets\.com\/collections\//g, 'https://www.fineystjackets.com/us/collections/')
        .replace(/https:\/\/fineystjackets\.com\/us\/collections\//g, 'https://www.fineystjackets.com/us/collections/')

      if (originalDescription !== description) {
        await prisma.product.update({
          where: { id: product.id },
          data: { description }
        })
        updatedCount++
        console.log(`Updated product ID: ${product.id}`)
      }
    }
  }

  console.log(`Process complete. Updated ${updatedCount} out of ${products.length} products`)
  
  // Show remaining patterns after update
  if (updatedCount > 0) {
    const remaining = await prisma.product.findMany({
      where: {
        description: { contains: 'fineystjackets.com/collections/' }
      },
      select: { description: true }
    })
    
    const remainingPatterns = new Set()
    remaining.forEach(p => {
      const matches = p.description.match(/https?:\/\/[^\s"'<>]*fineystjackets\.com[^\s"'<>]*\/collections\//g)
      if (matches) {
        matches.forEach(match => remainingPatterns.add(match.split('/collections/')[0] + '/collections/'))
      }
    })
    
    console.log('Remaining link patterns:', Array.from(remainingPatterns))
  }
}

fixLinksInDatabase().catch(console.error).finally(() => prisma.$disconnect())