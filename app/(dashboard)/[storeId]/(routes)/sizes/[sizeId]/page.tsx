import prismadb from "@/lib/prismadb"
import { SizeForm } from "./components/size-form"
import { redirect } from "next/navigation"

const SizePage = async ({ params }: { params: { sizeId: string; storeId: string } }) => {
  const { sizeId } = params
  const size = await prismadb.size.findUnique({
    where: {
      id: sizeId,
    },
  })

  const goBack = () => {
    return redirect(`/${params.storeId}/attributes?tab=sizes`)
  }

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <SizeForm initialData={size} />
      </div>
    </div>
  )
}

export default SizePage
