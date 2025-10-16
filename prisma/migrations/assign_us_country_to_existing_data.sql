-- Migration: Assign US country to all existing data
-- This assigns the US country to all products, category pages, vouchers, blogs, orders, and forms
-- that don't currently have a country assigned

-- Step 1: Get the US country ID (we'll use it in all following queries)
DO $$
DECLARE
  us_country_id TEXT;
BEGIN
  -- Find the US country
  SELECT id INTO us_country_id FROM "Country" WHERE "countryCode" = 'us' LIMIT 1;
  
  -- Check if US country exists
  IF us_country_id IS NULL THEN
    RAISE EXCEPTION 'US country not found in database. Please create it first.';
  END IF;
  
  RAISE NOTICE 'US Country ID: %', us_country_id;
  
  -- =====================================================
  -- 1. PRODUCTS - Create ProductCountry junction records
  -- =====================================================
  INSERT INTO "ProductCountry" ("productId", "countryId", "createdAt", "updatedAt")
  SELECT 
    p.id,
    us_country_id,
    NOW(),
    NOW()
  FROM "Product" p
  WHERE NOT EXISTS (
    -- Only insert if product doesn't already have any countries
    SELECT 1 FROM "ProductCountry" pc WHERE pc."productId" = p.id
  );
  
  RAISE NOTICE 'Products assigned to US: %', (SELECT COUNT(*) FROM "ProductCountry" WHERE "countryId" = us_country_id);
  
  -- =====================================================
  -- 2. CATEGORY PAGES - Create CategoryPageCountry junction records
  -- =====================================================
  INSERT INTO "CategoryPageCountry" ("categoryPageId", "countryId", "createdAt", "updatedAt")
  SELECT 
    cp.id,
    us_country_id,
    NOW(),
    NOW()
  FROM "CategoryPage" cp
  WHERE NOT EXISTS (
    -- Only insert if category page doesn't already have any countries
    SELECT 1 FROM "CategoryPageCountry" cpc WHERE cpc."categoryPageId" = cp.id
  );
  
  RAISE NOTICE 'Category pages assigned to US: %', (SELECT COUNT(*) FROM "CategoryPageCountry" WHERE "countryId" = us_country_id);
  
  -- =====================================================
  -- 3. VOUCHERS - Create VoucherCountry junction records
  -- =====================================================
  INSERT INTO "VoucherCountry" ("voucherId", "countryId", "createdAt", "updatedAt")
  SELECT 
    v.id,
    us_country_id,
    NOW(),
    NOW()
  FROM "Voucher" v
  WHERE NOT EXISTS (
    -- Only insert if voucher doesn't already have any countries
    SELECT 1 FROM "VoucherCountry" vc WHERE vc."voucherId" = v.id
  );
  
  RAISE NOTICE 'Vouchers assigned to US: %', (SELECT COUNT(*) FROM "VoucherCountry" WHERE "countryId" = us_country_id);
  
  -- =====================================================
  -- 4. BLOGS - Create BlogCountry junction records
  -- =====================================================
  INSERT INTO "BlogCountry" ("blogId", "countryId", "createdAt", "updatedAt")
  SELECT 
    b.id,
    us_country_id,
    NOW(),
    NOW()
  FROM "Blog" b
  WHERE NOT EXISTS (
    -- Only insert if blog doesn't already have any countries
    SELECT 1 FROM "BlogCountry" bc WHERE bc."blogId" = b.id
  );
  
  RAISE NOTICE 'Blogs assigned to US: %', (SELECT COUNT(*) FROM "BlogCountry" WHERE "countryId" = us_country_id);
  
  -- =====================================================
  -- 5. ORDERS - Update direct countryId field
  -- =====================================================
  UPDATE "Order"
  SET "countryId" = us_country_id
  WHERE "countryId" IS NULL;
  
  RAISE NOTICE 'Orders assigned to US: %', (SELECT COUNT(*) FROM "Order" WHERE "countryId" = us_country_id);
  
  -- =====================================================
  -- 6. CONTACT FORMS - Update direct countryId field
  -- =====================================================
  UPDATE "ContactForm"
  SET "countryId" = us_country_id
  WHERE "countryId" IS NULL;
  
  RAISE NOTICE 'Contact forms assigned to US: %', (SELECT COUNT(*) FROM "ContactForm" WHERE "countryId" = us_country_id);
  
  -- =====================================================
  -- 7. NEWSLETTER FORMS - Update direct countryId field
  -- =====================================================
  UPDATE "NewsletterForm"
  SET "countryId" = us_country_id
  WHERE "countryId" IS NULL;
  
  RAISE NOTICE 'Newsletter forms assigned to US: %', (SELECT COUNT(*) FROM "NewsletterForm" WHERE "countryId" = us_country_id);
  
  RAISE NOTICE '======================================';
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE '======================================';
END $$;





