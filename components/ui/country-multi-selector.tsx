"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface Country {
  id: string
  name: string
  countryCode: string
}

interface CountryMultiSelectorProps {
  value: string[] // Array of country IDs
  onChange: (value: string[]) => void
  disabled?: boolean
  placeholder?: string
}

export function CountryMultiSelector({
  value = [],
  onChange,
  disabled,
  placeholder = "Select countries...",
}: CountryMultiSelectorProps) {
  const [open, setOpen] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/countries?limit=1000") // Get all countries
      .then((res) => res.json())
      .then((data) => {
        // API returns { countries: [], pagination: {} }
        if (data && Array.isArray(data.countries)) {
          setCountries(data.countries)
        } else if (Array.isArray(data)) {
          // Fallback if API returns array directly
          setCountries(data)
        } else {
          console.error("Countries API did not return an array:", data)
          setCountries([])
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error("Failed to fetch countries:", error)
        setCountries([])
        setLoading(false)
      })
  }, [])

  const selectedCountries = countries.filter((c) => value.includes(c.id))

  const toggleCountry = (countryId: string) => {
    if (value.includes(countryId)) {
      onChange(value.filter((id) => id !== countryId))
    } else {
      onChange([...value, countryId])
    }
  }

  const removeCountry = (countryId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value.filter((id) => id !== countryId))
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || loading}
          >
            <span className="truncate">
              {loading
                ? "Loading countries..."
                : selectedCountries.length > 0
                ? `${selectedCountries.length} ${selectedCountries.length === 1 ? 'country' : 'countries'} selected`
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search countries..." />
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {countries.map((country) => (
                <CommandItem
                  key={country.id}
                  value={country.name}
                  onSelect={() => toggleCountry(country.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(country.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {country.name} ({country.countryCode})
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedCountries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCountries.map((country) => (
            <Badge key={country.id} variant="secondary" className="pr-1">
              {country.name}
              <button
                type="button"
                onClick={(e) => removeCountry(country.id, e)}
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}


