import { VoucherForm } from "../[voucherId]/components/voucher-form"

const NewVoucherPage = () => {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <VoucherForm />
      </div>
    </div>
  )
}

export default NewVoucherPage