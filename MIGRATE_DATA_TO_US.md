# 🌎 Migrate Existing Data to US Country

This guide explains how to assign the US country to all existing data in your database.

## 📋 What This Migration Does

Assigns **United States** as the default country for:
- ✅ **Products** (creates `ProductCountry` junction records)
- ✅ **Category Pages** (creates `CategoryPageCountry` junction records)
- ✅ **Vouchers** (creates `VoucherCountry` junction records)
- ✅ **Blogs** (creates `BlogCountry` junction records)
- ✅ **Orders** (updates `countryId` field)
- ✅ **Contact Forms** (updates `countryId` field)
- ✅ **Newsletter Forms** (updates `countryId` field)

**Only affects data that doesn't already have a country assigned!** ✅ Safe to run multiple times.

---

## 🎯 Choose Your Method

### **Option 1: SQL Migration (Fastest)** ⚡ RECOMMENDED

**Pros:**
- ⚡ Fastest execution (single transaction)
- 🔒 Atomic (all-or-nothing)
- 📊 Shows detailed counts

**Steps:**

1. **Connect to your database** (PostgreSQL):
   ```bash
   # Using psql
   psql -h localhost -U your_user -d your_database
   
   # OR using connection string
   psql postgresql://user:password@localhost:5432/database
   ```

2. **Run the SQL migration**:
   ```bash
   \i prisma/migrations/assign_us_country_to_existing_data.sql
   ```

3. **Check the output** - You'll see:
   ```
   NOTICE:  US Country ID: cmabcd1234...
   NOTICE:  Products assigned to US: 1144
   NOTICE:  Category pages assigned to US: 25
   NOTICE:  Vouchers assigned to US: 10
   NOTICE:  Blogs assigned to US: 5
   NOTICE:  Orders assigned to US: 50
   NOTICE:  Contact forms assigned to US: 12
   NOTICE:  Newsletter forms assigned to US: 30
   NOTICE:  ======================================
   NOTICE:  Migration completed successfully!
   NOTICE:  ======================================
   ```

**OR run it directly from the command line:**
```bash
cd Jackets-be
psql $DATABASE_URL -f prisma/migrations/assign_us_country_to_existing_data.sql
```

---

### **Option 2: TypeScript Script (More Control)** 📝

**Pros:**
- 🎨 Better logging and formatting
- 🛠️ Easy to customize
- 🔍 Better error messages

**Steps:**

1. **Install tsx** (if not already installed):
   ```bash
   npm install -D tsx
   ```

2. **Run the migration script**:
   ```bash
   cd Jackets-be
   npx tsx migrate-data-to-us.ts
   ```

3. **Check the output**:
   ```
   🚀 Starting migration: Assigning US country to existing data...
   
   1️⃣  Finding US country...
   ✅ Found US country: United States (ID: cmabcd1234...)
   
   2️⃣  Migrating Products...
      Found 1144 products without countries
   ✅ Assigned 1144 products to US
   
   3️⃣  Migrating Category Pages...
      Found 25 category pages without countries
   ✅ Assigned 25 category pages to US
   
   ... (continues for all data types)
   
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ✅ MIGRATION COMPLETED SUCCESSFULLY!
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   📊 Summary:
      - Products: 1144 assigned to US
      - Category Pages: 25 assigned to US
      - Vouchers: 10 assigned to US
      - Blogs: 5 assigned to US
      - Orders: 50 assigned to US
      - Contact Forms: 12 assigned to US
      - Newsletter Forms: 30 assigned to US
   
   🎉 All existing data is now assigned to US country!
   ```

---

## ⚠️ Before Running

### 1. **Ensure US Country Exists**

Check if US country is in your database:
```bash
cd Jackets-be
npx prisma studio
```

Go to `Country` table and verify there's a record with `countryCode = 'us'`.

**If not, create it:**
```typescript
// Run in Prisma Studio or use this script:
await prismadb.country.create({
  data: {
    name: 'United States',
    countryCode: 'us',
    currency: 'USD',
    currencySymbol: '$',
    timezone: 'America/New_York',
    isActive: true,
    sortOrder: 1
  }
})
```

### 2. **Backup Your Database** (Optional but Recommended)

```bash
# PostgreSQL backup
pg_dump -h localhost -U your_user your_database > backup_before_migration.sql
```

---

## ✅ After Migration

### 1. **Verify the Data**

Open your dashboard and:
- Select **US** in the country dropdown
- Check that all your products, blogs, etc. are visible
- Try selecting **UK** - should show 0 items (if you haven't created UK items yet)

### 2. **Test Country Filtering**

```bash
# Should return all migrated products
curl "http://localhost:3000/api/YOUR_STORE_ID/products?cn=us"

# Should return 0 products (unless you have UK products)
curl "http://localhost:3000/api/YOUR_STORE_ID/products?cn=uk"
```

### 3. **Create New Country-Specific Data**

Now you can:
- Create new products and assign them to specific countries
- Assign existing products to multiple countries
- Use the multi-country selector in forms

---

## 🔄 If Something Goes Wrong

### Rollback (SQL Option)

If you ran the SQL migration and need to rollback:

```sql
-- Remove all US ProductCountry records created
DELETE FROM "ProductCountry" WHERE "countryId" = (SELECT id FROM "Country" WHERE "countryCode" = 'us');

-- Remove all US CategoryPageCountry records
DELETE FROM "CategoryPageCountry" WHERE "countryId" = (SELECT id FROM "Country" WHERE "countryCode" = 'us');

-- Remove all US VoucherCountry records
DELETE FROM "VoucherCountry" WHERE "countryId" = (SELECT id FROM "Country" WHERE "countryCode" = 'us');

-- Remove all US BlogCountry records
DELETE FROM "BlogCountry" WHERE "countryId" = (SELECT id FROM "Country" WHERE "countryCode" = 'us');

-- Reset Orders countryId to NULL
UPDATE "Order" SET "countryId" = NULL WHERE "countryId" = (SELECT id FROM "Country" WHERE "countryCode" = 'us');

-- Reset ContactForm countryId to NULL
UPDATE "ContactForm" SET "countryId" = NULL WHERE "countryId" = (SELECT id FROM "Country" WHERE "countryCode" = 'us');

-- Reset NewsletterForm countryId to NULL
UPDATE "NewsletterForm" SET "countryId" = NULL WHERE "countryId" = (SELECT id FROM "Country" WHERE "countryCode" = 'us');
```

---

## 📞 Need Help?

If you encounter any issues:
1. Check the console output for error messages
2. Verify US country exists in database
3. Ensure database connection is working
4. Check Prisma schema matches database

---

## 🎉 Success!

After migration:
- ✅ All existing data is assigned to US
- ✅ Country filtering works correctly
- ✅ Dashboard shows data based on selected country
- ✅ You can now create country-specific content

**Happy country filtering!** 🌎🇺🇸





