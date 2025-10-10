const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateProductLinks() {
  try {
    await prisma.$executeRaw`
      UPDATE "Product" 
      SET "colorLinks" = REPLACE("colorLinks"::text, 'https://jacket.us.com/us', 'https://fineystjackets.com/us')::json
      WHERE "colorLinks"::text LIKE '%https://jacket.us.com/us%'
    `;

    console.log('Product links updated successfully');
  } catch (error) {
    console.error('Error updating product links:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductLinks();