import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prismadb from "@/lib/prismadb"
import { CountriesClient } from "./components/countries-client"
import { SettingsTabs } from "../components/settings-tabs"

interface CountriesPageProps {
  params: {
    storeId: string
  }
}

const CountriesPage: React.FC<CountriesPageProps> = async ({ params }) => {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const countries = await prismadb.country.findMany({
    orderBy: {
      sortOrder: 'asc'
    }
  })

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SettingsTabs />
        <CountriesClient data={countries} />
      </div>
    </div>
  )
}

export default CountriesPage
