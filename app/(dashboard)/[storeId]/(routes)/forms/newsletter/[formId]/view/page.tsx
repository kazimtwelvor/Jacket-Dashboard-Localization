import { NewsletterFormDetail } from "../components/newsletter-form-detail"
import prismadb from "@/lib/prismadb"

const NewsletterFormViewPage = async ({ params }: { params: { formId: string, storeId: string } }) => {
  const newsletterForm = await prismadb.newsletterForm.findUnique({
    where: {
      id: params.formId,
      storeId: params.storeId,
    },
  })

  if (!newsletterForm) {
    return <div>Newsletter form not found</div>
  }

  const formattedData = {
    ...newsletterForm,
    createdAt: newsletterForm.createdAt.toLocaleDateString(),
    createdAtFull: newsletterForm.createdAt,
    type: "newsletter" as const
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <NewsletterFormDetail data={formattedData} />
    </div>
  )
}

export default NewsletterFormViewPage