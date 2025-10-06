import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleCountries = [
  {
    name: "United States",
    countryCode: "us",
    currency: "USD",
    currencySymbol: "$",
    phoneCode: "+1",
    timezone: "America/New_York",
    isActive: true,
    sortOrder: 1
  },
  {
    name: "United Kingdom",
    countryCode: "uk",
    currency: "GBP",
    currencySymbol: "£",
    phoneCode: "+44",
    timezone: "Europe/London",
    isActive: true,
    sortOrder: 2
  },
  {
    name: "Canada",
    countryCode: "ca",
    currency: "CAD",
    currencySymbol: "C$",
    phoneCode: "+1",
    timezone: "America/Toronto",
    isActive: true,
    sortOrder: 3
  },
  {
    name: "Germany",
    countryCode: "de",
    currency: "EUR",
    currencySymbol: "€",
    phoneCode: "+49",
    timezone: "Europe/Berlin",
    isActive: true,
    sortOrder: 4
  },
  {
    name: "France",
    countryCode: "fr",
    currency: "EUR",
    currencySymbol: "€",
    phoneCode: "+33",
    timezone: "Europe/Paris",
    isActive: true,
    sortOrder: 5
  },
  {
    name: "Australia",
    countryCode: "au",
    currency: "AUD",
    currencySymbol: "A$",
    phoneCode: "+61",
    timezone: "Australia/Sydney",
    isActive: true,
    sortOrder: 6
  },
  {
    name: "Japan",
    countryCode: "jp",
    currency: "JPY",
    currencySymbol: "¥",
    phoneCode: "+81",
    timezone: "Asia/Tokyo",
    isActive: true,
    sortOrder: 7
  },
  {
    name: "India",
    countryCode: "in",
    currency: "INR",
    currencySymbol: "₹",
    phoneCode: "+91",
    timezone: "Asia/Kolkata",
    isActive: true,
    sortOrder: 8
  },
  {
    name: "Brazil",
    countryCode: "br",
    currency: "BRL",
    currencySymbol: "R$",
    phoneCode: "+55",
    timezone: "America/Sao_Paulo",
    isActive: true,
    sortOrder: 9
  },
  {
    name: "China",
    countryCode: "cn",
    currency: "CNY",
    currencySymbol: "¥",
    phoneCode: "+86",
    timezone: "Asia/Shanghai",
    isActive: true,
    sortOrder: 10
  }
]

async function seedCountries() {
  try {
    console.log('Starting to seed countries...')
    
    // Clear existing countries
    await prisma.country.deleteMany({})
    console.log('Cleared existing countries')
    
    // Insert sample countries
    for (const country of sampleCountries) {
      await prisma.country.create({
        data: country
      })
      console.log(`Created country: ${country.name}`)
    }
    
    console.log('Successfully seeded countries!')
  } catch (error) {
    console.error('Error seeding countries:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedCountries()
