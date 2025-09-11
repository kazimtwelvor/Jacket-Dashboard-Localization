import { format } from "date-fns"
import prismadb from "@/lib/prismadb"
import { VouchersClient } from "./components/client"
import { VoucherColumn } from "./components/columns"

const VouchersPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const vouchers = await prismadb.voucher.findMany({
    where: {
      storeId: params.storeId
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const formattedVouchers: VoucherColumn[] = vouchers.map((item) => ({
    id: item.id,
    code: item.code,
    type: item.type,
    value: item.type === "PERCENTAGE" ? `${item.value}%` : 
           item.type === "FIXED" ? `$${item.value}` :
           `Buy ${item.buyQuantity} Get ${item.getQuantity}`,
    usedCount: item.usedCount,
    usageLimit: item.usageLimit,
    isActive: item.isActive,
    validUntil: item.validUntil ? format(item.validUntil, 'MMMM do, yyyy') : null,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <VouchersClient data={formattedVouchers} />
      </div>
    </div>
  )
}

export default VouchersPage