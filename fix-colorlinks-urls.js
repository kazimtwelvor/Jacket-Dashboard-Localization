const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixColorLinksUrls() {
  try {
    console.log('Starting colorLinks URL fix...');
    
    const products = await prisma.product.findMany({
      where: {
        colorLinks: {
          not: null
        }
      }
    });

    console.log(`Found ${products.length} products with colorLinks`);

    let updatedCount = 0;

    for (const product of products) {
      let colorLinksStr = JSON.stringify(product.colorLinks);
      
      if (colorLinksStr.includes('/us/us/product/')) {
        const updatedColorLinksStr = colorLinksStr.replace(/\/us\/us\/product\//g, '/us/product/');
        
        try {
          const updatedColorLinks = JSON.parse(updatedColorLinksStr);
          
          await prisma.product.update({
            where: { id: product.id },
            data: { colorLinks: updatedColorLinks }
          });
          
          updatedCount++;
          console.log(`Updated product: ${product.name} (ID: ${product.id})`);
        } catch (parseError) {
          console.error(`Failed to parse updated colorLinks for product ${product.id}:`, parseError);
        }
      }
    }

    console.log(`\nCompleted! Updated ${updatedCount} products.`);
    
  } catch (error) {
    console.error('Error fixing colorLinks URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixColorLinksUrls();