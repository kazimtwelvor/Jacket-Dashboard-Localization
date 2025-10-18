"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/ui/data-table"
import { ApiList } from "@/components/ui/api-list"
import { CountryColumn } from "./columns"
import { CountryModal } from "./country-modal"
import { columns } from "./columns"

interface CountriesClientProps {
  data: CountryColumn[]
}

export const CountriesClient: React.FC<CountriesClientProps> = ({
  data
}) => {
  const params = useParams()
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCountry, setEditingCountry] = useState<CountryColumn | null>(null)

  const handleEdit = (country: CountryColumn) => {
    setEditingCountry(country)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCountry(null)
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Countries (${data.length})`} description="Manage countries for your store" />
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} onEdit={handleEdit} />
      <Heading title="API" description="API Calls for Countries" />
      <Separator />
      <ApiList entityName="countries" entityIdName="countryId" />
      
      <CountryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        country={editingCountry}
      />
    </>
  )
}

