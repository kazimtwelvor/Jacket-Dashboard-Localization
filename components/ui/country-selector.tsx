"use client"

import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormControl } from "@/components/ui/form"

interface Country {
  id: string
  name: string
  countryCode: string
  currency: string | null
  currencySymbol: string | null
  isActive: boolean
}

interface CountrySelectorProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  useFormControl?: boolean 
}

export function CountryFormSelector({ value, onChange, disabled, placeholder = "Select a country", useFormControl = true }: CountrySelectorProps) {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/countries?isActive=true&sortBy=sortOrder&sortOrder=asc&limit=100')
        const data = await response.json()
        
        if (data.countries) {
          setCountries(data.countries)
        }
      } catch (error) {
        console.error('Failed to fetch countries:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCountries()
  }, [])

  const trigger = (
    <SelectTrigger>
      <SelectValue placeholder={loading ? "Loading countries..." : placeholder} />
    </SelectTrigger>
  )

  return (
    <Select
      disabled={disabled || loading}
      onValueChange={onChange}
      value={value}
      defaultValue={value}
    >
      {useFormControl ? <FormControl>{trigger}</FormControl> : trigger}
      <SelectContent>
        {countries.map((country) => (
          <SelectItem key={country.id} value={country.id}>
            {country.name} ({country.countryCode.toUpperCase()})
            {country.currencySymbol && ` - ${country.currencySymbol}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}



