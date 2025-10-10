const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeNofollowFromCategoryPages() {
  try {
    console.log('Starting nofollow removal...');
    
    const categoryPages = await prisma.categoryPage.findMany({
      where: {
        categoryContent: {
          not: null
        }
      }
    });

    console.log(`Found ${categoryPages.length} category pages`);

    let updatedCount = 0;

    for (const page of categoryPages) {
      let contentStr = JSON.stringify(page.categoryContent);
      
      if (contentStr.includes('nofollow')) {
        // Simple string replacement for all nofollow variations
        let updated = contentStr
          .replace(/nofollow\s+/g, '')
          .replace(/\s+nofollow/g, '')
          .replace(/nofollow/g, '');
        
        try {
          const updatedContent = JSON.parse(updated);
          
          await prisma.categoryPage.update({
            where: { id: page.id },
            data: { categoryContent: updatedContent }
          });
          
          updatedCount++;
          console.log(`Updated: ${page.name}`);
        } catch (error) {
          console.error(`Failed to update ${page.id}:`, error.message);
        }
      }
    }

    console.log(`Completed! Updated ${updatedCount} pages.`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeNofollowFromCategoryPages();