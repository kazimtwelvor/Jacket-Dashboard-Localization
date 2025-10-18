import prismadb from "@/lib/prismadb"
import { VoucherForm } from "./components/voucher-form"

const VoucherPage = async ({
  params
}: {
  params: { voucherId: string, storeId: string }
}) => {
  const voucher = await prismadb.voucher.findUnique({
    where: {
      id: params.voucherId
    },
    include: {
      voucherCountries: {
        include: {
          country: true
        }
      }
    }
  })

  // Serialize Decimal fields to numbers
  const serializedVoucher = voucher ? {
    ...voucher,
    value: voucher.value ? Number(voucher.value) : 0,
    minOrderAmount: voucher.minOrderAmount ? Number(voucher.minOrderAmount) : null,
    maxDiscount: voucher.maxDiscount ? Number(voucher.maxDiscount) : null,
    voucherCountries: voucher.voucherCountries || [],
  } : null

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <VoucherForm initialData={serializedVoucher} />
      </div>
    </div>
  )
}

export default VoucherPage