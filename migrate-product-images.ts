import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function migrateProductImages() {
  try {
    // Get all products with their images (from the OLD image table)
    const products = await prisma.product.findMany({
      include: { 
        // Assuming your old image relation is called 'oldImages'
        oldImages: {
          orderBy: { createdAt: 'asc' }
        }
      },
    });

    console.log(`Found ${products.length} products to migrate.`);

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`Migrating product ${i + 1}/${products.length}: ${product.id}`);

      for (let j = 0; j < product.oldImages.length; j++) {
        const oldImage = product.oldImages[j];

        // Create or find image in the NEW structure
        const newImage = await prisma.image.upsert({
          where: { 
            url: oldImage.url
          },
          update: {},
          create: {
            url: oldImage.url,
            altText: oldImage.altText || undefined,
            title: oldImage.title || undefined,
            description: oldImage.description || undefined,
            // Add other fields from your new Image model
          },
        });

        // Create the product-image association
        await prisma.productImage.create({
          data: {
            product: { connect: { id: product.id } },
            image: { connect: { id: newImage.id } },
            isMain: j === 0, // First image is main
            order: j
          },
        });
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute
migrateProductImages();