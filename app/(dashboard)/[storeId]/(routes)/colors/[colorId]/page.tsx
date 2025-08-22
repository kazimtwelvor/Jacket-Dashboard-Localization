import prismadb from "@/lib/prismadb"
import { ColorForm } from "./components/color-form"
import { redirect } from "next/navigation"

const ColorPage = async ({ params }: { params: { colorId: string; storeId: string } }) => {
  const { colorId } = params
  const color = await prismadb.color.findUnique({
    where: {
      id: colorId,
    },
  })

  const goBack = () => {
    return redirect(`/${params.storeId}/attributes?tab=colors`)
  }

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <ColorForm initialData={color} />
      </div>
    </div>
  )
}

export default ColorPage
