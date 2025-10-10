const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixLinksInCategoryPages() {
  console.log('Starting link fix process for category pages...')
  
  const categoryPages = await prisma.categoryPage.findMany({
    where: {
      OR: [
        { categoryContent: { path: [], string_contains: 'https://www.fineystjackets.com/collections/' } },
        { categoryContent: { path: [], string_contains: 'https://fineystjackets.com/us/collections/' } }
      ]
    }
  })

  console.log(`Found ${categoryPages.length} category pages with target links`)

  let updatedCount = 0
  for (const categoryPage of categoryPages) {
    let categoryContent = categoryPage.categoryContent
    if (categoryContent) {
      const originalContent = JSON.stringify(categoryContent)
      let contentString = originalContent
        .replace(/https:\/\/www\.fineystjackets\.com\/collections\//g, 'https://www.fineystjackets.com/us/collections/')
        .replace(/https:\/\/fineystjackets\.com\/us\/collections\//g, 'https://www.fineystjackets.com/us/collections/')

      if (originalContent !== contentString) {
        await prisma.categoryPage.update({
          where: { id: categoryPage.id },
          data: { categoryContent: JSON.parse(contentString) }
        })
        updatedCount++
        console.log(`Updated category page ID: ${categoryPage.id}`)
      }
    }
  }

  console.log(`Process complete. Updated ${updatedCount} out of ${categoryPages.length} category pages`)
}

fixLinksInCategoryPages().catch(console.error).finally(() => prisma.$disconnect())