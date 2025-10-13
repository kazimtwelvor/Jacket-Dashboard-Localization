"use client"

import { useEffect, useState } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface Country {
  id: string
  name: string
  countryCode: string
  currency: string | null
  currencySymbol: string | null
  timezone: string | null
  isActive: boolean
  sortOrder: number
}

interface DashboardCountryStore {
  selectedCountry: Country | null
  countries: Country[]
  isLoading: boolean
  setSelectedCountry: (country: Country) => void
  setCountries: (countries: Country[]) => void
  setLoading: (loading: boolean) => void
  getCountryByCode: (code: string) => Country | undefined
  reset: () => void
}

const defaultCountry: Country = {
  id: 'default-us',
  name: 'United States',
  countryCode: 'us',
  currency: 'USD',
  currencySymbol: '$',
  timezone: 'America/New_York',
  isActive: true,
  sortOrder: 0,
}

export const useDashboardCountryStore = create<DashboardCountryStore>()(
  persist(
    (set, get) => ({
      selectedCountry: defaultCountry,
      countries: [defaultCountry],
      isLoading: false,

      setSelectedCountry: (country) => set({ selectedCountry: country }),

      setCountries: (countries) => set({ countries }),

      setLoading: (loading) => set({ isLoading: loading }),

      getCountryByCode: (code) => {
        const { countries } = get()
        return countries.find((c) => c.countryCode.toLowerCase() === code.toLowerCase())
      },

      reset: () =>
        set({
          selectedCountry: defaultCountry,
          countries: [defaultCountry],
          isLoading: false,
        }),
    }),
    {
      name: 'dashboard-country-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedCountry: state.selectedCountry,
      }),
    }
  )
)

export function DashboardCountrySelector() {
  const {
    selectedCountry,
    countries,
    setSelectedCountry,
    setCountries,
    setLoading,
    isLoading,
  } = useDashboardCountryStore()
  
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/countries?isActive=true&sortBy=sortOrder&sortOrder=asc&limit=100')
        const data = await response.json()

        if (data?.countries) {
          setCountries(data.countries)
          
          // Only set default if there's NO selected country at all
          // This preserves the persisted selection from localStorage
          if (!selectedCountry) {
            const defaultCountry = data.countries.find(
              (c: Country) => c.countryCode.toLowerCase() === 'us'
            ) || data.countries[0]
            
            if (defaultCountry) {
              console.log('[COUNTRY_SELECTOR] Setting default country:', defaultCountry.countryCode)
              setSelectedCountry(defaultCountry)
            }
          } else {
            console.log('[COUNTRY_SELECTOR] Using persisted country:', selectedCountry.countryCode)
          }
        }
      } catch (error) {
        console.error('Failed to fetch countries:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCountries()
  }, [])

  const handleCountryChange = (country: Country) => {
    console.log('[COUNTRY_SELECTOR] Changing country to:', country.countryCode)
    setSelectedCountry(country)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dashboard-country-changed', { detail: country }))
      // No reload needed - useEffect hooks will handle re-fetching
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={isLoading}>
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {selectedCountry?.countryCode.toUpperCase() || 'US'}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {countries.map((country) => (
          <DropdownMenuItem
            key={country.id}
            onClick={() => handleCountryChange(country)}
            className={`flex items-center justify-between cursor-pointer ${
              selectedCountry?.id === country.id ? 'bg-accent' : ''
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="font-medium">{country.countryCode.toUpperCase()}</span>
              <span>{country.name}</span>
            </span>
            {country.currencySymbol && (
              <span className="text-muted-foreground text-sm">
                {country.currencySymbol}
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

