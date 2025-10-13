"use client"

import { useDashboardCountryStore } from "@/components/dashboard-country-selector"

/**
 * Hook to access the selected country in the backend dashboard
 * Use this hook in any dashboard component to get the current country selection
 */
export function useDashboardCountry() {
  const { selectedCountry, countries, setSelectedCountry } = useDashboardCountryStore()

  /**
   * Get the country ID for API calls and form submissions
   */
  const getCountryId = () => {
    return selectedCountry?.id || null
  }

  /**
   * Get the country code for API calls (e.g., 'us', 'uk', 'ca')
   */
  const getCountryCode = () => {
    return selectedCountry?.countryCode || 'us'
  }

  /**
   * Get API query params with country code
   * Example: getApiParams({ status: 'PENDING' }) => { status: 'PENDING', cn: 'us' }
   */
  const getApiParams = (params: Record<string, any> = {}) => {
    return {
      ...params,
      cn: getCountryCode(),
    }
  }

  /**
   * Check if a specific country is selected
   */
  const isCountrySelected = (countryCode: string) => {
    return selectedCountry?.countryCode.toLowerCase() === countryCode.toLowerCase()
  }

  return {
    selectedCountry,
    countries,
    setSelectedCountry,
    getCountryId,
    getCountryCode,
    getApiParams,
    isCountrySelected,
    countryCode: selectedCountry?.countryCode || 'us',
    countryId: selectedCountry?.id || null,
  }
}

