/**
 * Migration Script: Assign US country to all existing data
 * 
 * This script assigns the US country to all:
 * - Products (via ProductCountry junction table)
 * - Category Pages (via CategoryPageCountry junction table)
 * - Vouchers (via VoucherCountry junction table)
 * - Blogs (via BlogCountry junction table)
 * - Orders (direct countryId field)
 * - Contact Forms (direct countryId field)
 * - Newsletter Forms (direct countryId field)
 * 
 * Run with: npx tsx migrate-data-to-us.ts
 */

import prismadb from './lib/prismadb'

async function migrateDataToUS() {
  console.log('🚀 Starting migration: Assigning US country to existing data...\n')

  try {
    // Step 1: Find US country
    console.log('1️⃣  Finding US country...')
    const usCountry = await prismadb.country.findUnique({
      where: { countryCode: 'us' }
    })

    if (!usCountry) {
      throw new Error('❌ US country not found! Please create it first.')
    }

    console.log(`✅ Found US country: ${usCountry.name} (ID: ${usCountry.id})\n`)

    // =================================================================
    // 2. PRODUCTS
    // =================================================================
    console.log('2️⃣  Migrating Products...')
    
    // Find products without any countries
    const productsWithoutCountry = await prismadb.product.findMany({
      where: {
        productCountries: {
          none: {}
        }
      },
      select: { id: true }
    })

    console.log(`   Found ${productsWithoutCountry.length} products without countries`)

    if (productsWithoutCountry.length > 0) {
      const productCountries = await prismadb.productCountry.createMany({
        data: productsWithoutCountry.map(p => ({
          productId: p.id,
          countryId: usCountry.id
        })),
        skipDuplicates: true
      })
      console.log(`✅ Assigned ${productCountries.count} products to US\n`)
    } else {
      console.log(`✅ No products to migrate\n`)
    }

    // =================================================================
    // 3. CATEGORY PAGES
    // =================================================================
    console.log('3️⃣  Migrating Category Pages...')
    
    const categoryPagesWithoutCountry = await prismadb.categoryPage.findMany({
      where: {
        categoryPageCountries: {
          none: {}
        }
      },
      select: { id: true }
    })

    console.log(`   Found ${categoryPagesWithoutCountry.length} category pages without countries`)

    if (categoryPagesWithoutCountry.length > 0) {
      const categoryPageCountries = await prismadb.categoryPageCountry.createMany({
        data: categoryPagesWithoutCountry.map(cp => ({
          categoryPageId: cp.id,
          countryId: usCountry.id
        })),
        skipDuplicates: true
      })
      console.log(`✅ Assigned ${categoryPageCountries.count} category pages to US\n`)
    } else {
      console.log(`✅ No category pages to migrate\n`)
    }

    // =================================================================
    // 4. VOUCHERS
    // =================================================================
    console.log('4️⃣  Migrating Vouchers...')
    
    const vouchersWithoutCountry = await prismadb.voucher.findMany({
      where: {
        voucherCountries: {
          none: {}
        }
      },
      select: { id: true }
    })

    console.log(`   Found ${vouchersWithoutCountry.length} vouchers without countries`)

    if (vouchersWithoutCountry.length > 0) {
      const voucherCountries = await prismadb.voucherCountry.createMany({
        data: vouchersWithoutCountry.map(v => ({
          voucherId: v.id,
          countryId: usCountry.id
        })),
        skipDuplicates: true
      })
      console.log(`✅ Assigned ${voucherCountries.count} vouchers to US\n`)
    } else {
      console.log(`✅ No vouchers to migrate\n`)
    }

    // =================================================================
    // 5. BLOGS
    // =================================================================
    console.log('5️⃣  Migrating Blogs...')
    
    const blogsWithoutCountry = await prismadb.blog.findMany({
      where: {
        blogCountries: {
          none: {}
        }
      },
      select: { id: true }
    })

    console.log(`   Found ${blogsWithoutCountry.length} blogs without countries`)

    if (blogsWithoutCountry.length > 0) {
      const blogCountries = await prismadb.blogCountry.createMany({
        data: blogsWithoutCountry.map(b => ({
          blogId: b.id,
          countryId: usCountry.id
        })),
        skipDuplicates: true
      })
      console.log(`✅ Assigned ${blogCountries.count} blogs to US\n`)
    } else {
      console.log(`✅ No blogs to migrate\n`)
    }

    // =================================================================
    // 6. ORDERS
    // =================================================================
    console.log('6️⃣  Migrating Orders...')
    
    const ordersUpdated = await prismadb.order.updateMany({
      where: {
        countryId: null
      },
      data: {
        countryId: usCountry.id
      }
    })

    console.log(`✅ Assigned ${ordersUpdated.count} orders to US\n`)

    // =================================================================
    // 7. CONTACT FORMS
    // =================================================================
    console.log('7️⃣  Migrating Contact Forms...')
    
    const contactFormsUpdated = await prismadb.contactForm.updateMany({
      where: {
        countryId: null
      },
      data: {
        countryId: usCountry.id
      }
    })

    console.log(`✅ Assigned ${contactFormsUpdated.count} contact forms to US\n`)

    // =================================================================
    // 8. NEWSLETTER FORMS
    // =================================================================
    console.log('8️⃣  Migrating Newsletter Forms...')
    
    const newsletterFormsUpdated = await prismadb.newsletterForm.updateMany({
      where: {
        countryId: null
      },
      data: {
        countryId: usCountry.id
      }
    })

    console.log(`✅ Assigned ${newsletterFormsUpdated.count} newsletter forms to US\n`)

    // =================================================================
    // SUMMARY
    // =================================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ MIGRATION COMPLETED SUCCESSFULLY!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n📊 Summary:')
    console.log(`   - Products: ${productsWithoutCountry.length} assigned to US`)
    console.log(`   - Category Pages: ${categoryPagesWithoutCountry.length} assigned to US`)
    console.log(`   - Vouchers: ${vouchersWithoutCountry.length} assigned to US`)
    console.log(`   - Blogs: ${blogsWithoutCountry.length} assigned to US`)
    console.log(`   - Orders: ${ordersUpdated.count} assigned to US`)
    console.log(`   - Contact Forms: ${contactFormsUpdated.count} assigned to US`)
    console.log(`   - Newsletter Forms: ${newsletterFormsUpdated.count} assigned to US`)
    console.log('\n🎉 All existing data is now assigned to US country!')
    console.log('   You can now filter by country in your dashboard.\n')

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    throw error
  } finally {
    await prismadb.$disconnect()
  }
}

// Run the migration
migrateDataToUS()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })





