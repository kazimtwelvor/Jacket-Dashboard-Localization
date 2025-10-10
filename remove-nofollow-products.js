const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeNofollowFromProducts() {
  try {
    console.log('Starting nofollow removal from product descriptions...');
    
    const products = await prisma.product.findMany({
      where: {
        description: {
          contains: 'nofollow'
        }
      }
    });

    console.log(`Found ${products.length} products with nofollow`);

    let updatedCount = 0;

    for (const product of products) {
      const updated = product.description
        .replace(/nofollow\s+/g, '')
        .replace(/\s+nofollow/g, '')
        .replace(/nofollow/g, '');
      
      await prisma.product.update({
        where: { id: product.id },
        data: { description: updated }
      });
      
      updatedCount++;
      console.log(`Updated: ${product.name}`);
    }

    console.log(`Completed! Updated ${updatedCount} products.`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeNofollowFromProducts();