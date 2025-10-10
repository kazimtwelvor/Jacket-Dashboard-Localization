const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeNofollowFromCategoryPages() {
  try {
    console.log('Starting nofollow removal from CategoryPage content...');
    
    // Get all category pages with content
    const categoryPages = await prisma.categoryPage.findMany({
      where: {
        categoryContent: {
          not: null
        }
      }
    });

    console.log(`Found ${categoryPages.length} category pages to process`);

    let updatedCount = 0;

    for (const page of categoryPages) {
      let contentStr = JSON.stringify(page.categoryContent);
      
      // Check if content contains nofollow
      if (contentStr.includes('nofollow')) {
        // Remove all instances of nofollow (including HTML encoded)
        const updatedContentStr = contentStr
          .replace(/\s*rel=\\["']noopener\s+noreferrer\s+nofollow\\["']/gi, ' rel=\\"noopener noreferrer\\"')
          .replace(/\s*rel=\\["']nofollow\s+noopener\s+noreferrer\\["']/gi, ' rel=\\"noopener noreferrer\\"')
          .replace(/\s*rel=\\["']nofollow\\["']/gi, '')
          .replace(/\s*rel=["']noopener\s+noreferrer\s+nofollow["']/gi, ' rel="noopener noreferrer"')
          .replace(/\s*rel=["']nofollow\s+noopener\s+noreferrer["']/gi, ' rel="noopener noreferrer"')
          .replace(/\s*rel=["']nofollow["']/gi, '');
        
        try {
          const updatedContent = JSON.parse(updatedContentStr);
          
          await prisma.categoryPage.update({
            where: { id: page.id },
            data: { categoryContent: updatedContent }
          });
          
          updatedCount++;
          console.log(`Updated category page: ${page.name} (ID: ${page.id})`);
        } catch (parseError) {
          console.error(`Failed to parse updated content for page ${page.id}:`, parseError);
        }
      }
    }

    console.log(`\nCompleted! Updated ${updatedCount} category pages.`);
    
  } catch (error) {
    console.error('Error removing nofollow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
removeNofollowFromCategoryPages();