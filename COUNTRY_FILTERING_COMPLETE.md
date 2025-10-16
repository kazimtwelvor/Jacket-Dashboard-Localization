# Country Filtering Implementation - COMPLETE ✅

## Overview

All backend dashboard pages now use the **Zustand country selector** from the navbar to filter data dynamically based on the selected country.

---

## 🎯 How It Works

### From Navbar Country Selector:
1. User selects country from navbar (e.g., UK, USA, Canada)
2. Selection stored in Zustand: `useDashboardCountryStore`
3. All list pages use `useDashboardCountry()` hook
4. Hook provides `getCountryCode()` → returns "us", "uk", "ca", etc.
5. Pages append `?cn={countryCode}` to API calls
6. APIs filter data by country and return relevant results

---

## ✅ Pages Updated (Converted to Client Components)

### 1. **Products Page**
**File:** `app/(dashboard)/[storeId]/(routes)/products/components/client.tsx`
- ✅ Line 9: Imports `useDashboardCountry`
- ✅ Line 66: Uses `getCountryCode()`
- ✅ Line 113: Appends `&cn=${countryCode}` to API URL
- ✅ Line 125: Console log for debugging

### 2. **CategoryPage Page**
**File:** `app/(dashboard)/[storeId]/(routes)/category-page/page.tsx`
- ✅ Line 16: Imports `useDashboardCountry`
- ✅ Line 21: Uses `getCountryCode()`
- ✅ Line 63: Appends `cn=${countryCode}` to params
- ✅ Line 77: Console log for debugging

### 3. **Vouchers Page**
**File:** `app/(dashboard)/[storeId]/(routes)/vouchers/page.tsx`
- ✅ Converted from server to client component
- ✅ Line 8: Imports `useDashboardCountry`
- ✅ Line 14: Uses `getCountryCode()`
- ✅ Line 23: Appends `?cn=${countryCode}` to API URL
- ✅ Line 25: Console log for debugging

### 4. **Blog Page**
**File:** `app/(dashboard)/[storeId]/(routes)/blog/page.tsx`
- ✅ Converted from server to client component
- ✅ Line 7: Imports `useDashboardCountry`
- ✅ Line 13: Uses `getCountryCode()`
- ✅ Line 22: Appends `?cn=${countryCode}` to API URL
- ✅ Line 24: Console log for debugging

### 5. **Orders Page**
**File:** `app/(dashboard)/[storeId]/(routes)/orders/page.tsx`
- ✅ Converted from server to client component
- ✅ Line 6: Imports `useDashboardCountry`
- ✅ Line 12: Uses `getCountryCode()`
- ✅ Line 21: Appends `?cn=${countryCode}&limit=1000`
- ✅ Line 23: Console log for debugging

### 6. **Forms Page**
**File:** `app/(dashboard)/[storeId]/(routes)/forms/page.tsx`
- ✅ Converted from server to client component
- ✅ Line 6: Imports `useDashboardCountry`
- ✅ Line 12: Uses `getCountryCode()`
- ✅ Lines 26-27: Appends `?cn=${countryCode}` to both contact and newsletter APIs
- ✅ Line 23: Console log for debugging

---

## ✅ API Routes Updated with Country Filtering

### Many-to-Many Relationships (Junction Tables)

#### 1. **Products** (`app/api/[storeId]/products/route.ts`)
- ✅ Lines 35-61: Country filtering with OR logic
- ✅ Shows products that have selected country OR have no countries (global)
- ✅ Uses `productCountries.some` or `productCountries.none`
- ✅ Lines 72-76: Includes `productCountries` relation
- ✅ Lines 407-409: Debug logging

**Filter Logic:**
```typescript
OR: [
  { productCountries: { some: { countryId: country.id } } }, // Has this country
  { productCountries: { none: {} } }                          // Global product
]
```

#### 2. **CategoryPages** (`app/api/[storeId]/category-pages/route.ts`)
- ✅ Lines 169-195: Country filtering with OR logic
- ✅ Shows pages that have selected country OR have no countries (global)
- ✅ Uses `categoryPageCountries.some` or `categoryPageCountries.none`

#### 3. **Vouchers** (`app/api/[storeId]/vouchers/route.ts`)
- ✅ Lines 118-148: Country filtering with OR logic
- ✅ Shows vouchers that have selected country OR have no countries (global)
- ✅ Uses `voucherCountries.some` or `voucherCountries.none`
- ✅ Lines 133-139: Includes `voucherCountries` relation

#### 4. **Blogs** (`app/api/[storeId]/blog/route.ts`)
- ✅ Lines 274-303: Country filtering with OR logic
- ✅ Shows blogs that have selected country OR have no countries (global)
- ✅ Uses `blogCountries.some` or `blogCountries.none`
- ✅ Lines 307-313: Includes `blogCountries` relation

### One-to-Many Relationships (Single countryId)

#### 5. **Orders** (`app/api/[storeId]/orders/route.ts`)
- ✅ Lines 34-42: Country filtering by countryId
- ✅ Line 51: Applies `countryId` filter to where clause
- ✅ Line 79: Also applies to count query

**Filter Logic:**
```typescript
if (cn) {
  const country = await prismadb.country.findUnique({ where: { countryCode: cn } })
  if (country) {
    whereClause.countryId = country.id
  }
}
```

#### 6. **ContactForms** (`app/api/[storeId]/forms/contact-forms/route.ts`)
- ✅ Lines 45-60: Country filtering by countryId
- ✅ Line 58: Applies `countryId` filter

#### 7. **NewsletterForms** (`app/api/[storeId]/forms/newsletter-forms/route.ts`)
- ✅ Lines 45-60: Country filtering by countryId
- ✅ Line 58: Applies `countryId` filter

---

## 📊 Filtering Behavior

### Scenario 1: User Selects "USA" from Navbar

**Products:**
- Shows products assigned to USA
- Shows products with NO country assignments (global)

**CategoryPages:**
- Shows category pages assigned to USA
- Shows pages with NO country assignments (global)

**Vouchers:**
- Shows vouchers valid in USA
- Shows vouchers with NO country assignments (global)

**Blogs:**
- Shows blogs targeted to USA
- Shows blogs with NO country assignments (global)

**Orders:**
- Shows ONLY orders from USA (single country per order)

**ContactForms:**
- Shows ONLY contact forms from USA

**NewsletterForms:**
- Shows ONLY newsletter signups from USA

### Scenario 2: User Selects "UK" from Navbar

Same logic applies but for UK country ID.

### Scenario 3: Product Has Multiple Countries

Example: Product assigned to USA, Canada, UK

**When USA is selected:**
- ✅ Product IS shown (has USA in productCountries)

**When Canada is selected:**
- ✅ Product IS shown (has Canada in productCountries)

**When France is selected:**
- ❌ Product NOT shown (doesn't have France)

**When product has NO countries:**
- ✅ Product shown for ALL country selections (global)

---

## 🔍 API Query Examples

### From Frontend (External API Call)
```typescript
// Fetch products for USA market
fetch('/api/store-123/products?cn=us')

// Fetch category pages for UK market
fetch('/api/store-123/category-pages?cn=uk')

// Fetch vouchers for Canada
fetch('/api/store-123/vouchers?cn=ca')
```

### From Backend Dashboard
```typescript
// Automatically uses selected country from Zustand store
const { getCountryCode } = useDashboardCountry()
const countryCode = getCountryCode() // Returns 'us', 'uk', 'ca', etc.

// All pages automatically append cn parameter
fetch(`/api/${storeId}/products?cn=${countryCode}`)
```

---

## 🚀 Console Logs for Debugging

When navigating pages, you'll see in browser console:

```
[PRODUCTS_CLIENT] Fetching products with country: us
[PRODUCTS_GET] Filtering by country: United States (us) - ID: xxx
[PRODUCTS_GET] Total products after filtering: 5, Country filter: us
[PRODUCTS_GET] Products with countries: 2
[PRODUCTS_GET] Products without countries (global): 3
```

```
[CATEGORY_PAGE_CLIENT] Fetching with country: uk
[VOUCHERS_CLIENT] Fetching vouchers with country: ca
[BLOG_CLIENT] Fetching blogs with country: us
[ORDERS_CLIENT] Fetching orders with country: us
[FORMS_CLIENT] Fetching forms with country: us
```

---

## 🎯 Key Features

✅ **Dynamic Country Filtering**: All modules filter by selected country  
✅ **Global Items Support**: Items with no country show everywhere  
✅ **Real-time Updates**: Changing country in navbar reloads pages with new filter  
✅ **Frontend Compatible**: External APIs can use `?cn=xx` parameter  
✅ **Backend Dashboard**: Uses Zustand store automatically  
✅ **Many-to-Many**: Products/Pages/Vouchers/Blogs support multiple countries  
✅ **One-to-Many**: Orders/Forms have single country  
✅ **Debug Logging**: Console logs for tracking country filtering  

---

## 📋 Summary of Changes

### Pages Converted to Client Components:
1. ✅ Products (was already client)
2. ✅ CategoryPages (was already client)
3. ✅ Vouchers (converted)
4. ✅ Blogs (converted)
5. ✅ Orders (converted)
6. ✅ Forms (converted)

### API Routes with Country Filtering:
1. ✅ `/api/[storeId]/products` - Many-to-many
2. ✅ `/api/[storeId]/category-pages` - Many-to-many
3. ✅ `/api/[storeId]/vouchers` - Many-to-many
4. ✅ `/api/[storeId]/blog` - Many-to-many
5. ✅ `/api/[storeId]/orders` - One-to-many (already had it)
6. ✅ `/api/[storeId]/forms/contact-forms` - One-to-many
7. ✅ `/api/[storeId]/forms/newsletter-forms` - One-to-many

---

## 🧪 Testing

### Test Country Filtering:

1. **Change country in navbar** to USA
2. **Check console logs** - should see `[PAGE_CLIENT] Fetching with country: us`
3. **Verify data** - only USA-specific data shown
4. **Change to UK** in navbar
5. **Page reloads** with UK data

### Test Product Creation:

1. **Create product** and select USA, Canada
2. **Check console**: `[CREATE_PRODUCT] Creating product with countryIds: ['usa-id', 'canada-id']`
3. **Verify database**: ProductCountry table has 2 rows
4. **Switch navbar to USA**: Product IS shown
5. **Switch navbar to Canada**: Product IS shown
6. **Switch navbar to UK**: Product NOT shown (unless no countries assigned)

---

## 🎉 Result

**COMPLETE COUNTRY FILTERING SYSTEM!**

- ✅ All backend pages use Zustand country selector
- ✅ All APIs filter by `cn` parameter
- ✅ Many-to-many relationships work correctly
- ✅ Global items (no countries) show everywhere
- ✅ Frontend can use same APIs with `?cn=xx`
- ✅ Debug logging throughout system

**Ready for production use!** 🚀









