import { NewsletterFormEdit } from "./components/newsletter-form-edit"
import prismadb from "@/lib/prismadb"

const NewsletterFormEditPage = async ({ params }: { params: { formId: string, storeId: string } }) => {
  const newsletterForm = await prismadb.newsletterForm.findUnique({
    where: {
      id: params.formId,
      storeId: params.storeId,
    },
  })

  if (!newsletterForm) {
    return <div>Newsletter form not found</div>
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <NewsletterFormEdit initialData={newsletterForm} />
    </div>
  )
}

export default NewsletterFormEditPage