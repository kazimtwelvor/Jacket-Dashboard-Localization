import { ContactFormDetail } from "../components/contact-form-detail"
import prismadb from "@/lib/prismadb"

const ContactFormViewPage = async ({ params }: { params: { formId: string, storeId: string } }) => {
  const contactForm = await prismadb.contactForm.findUnique({
    where: {
      id: params.formId,
      storeId: params.storeId,
    },
  })

  if (!contactForm) {
    return <div>Contact form not found</div>
  }

  const formattedData = {
    ...contactForm,
    createdAt: contactForm.createdAt.toLocaleDateString(),
    createdAtFull: contactForm.createdAt,
    type: "contact" as const
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ContactFormDetail data={formattedData} />
    </div>
  )
}

export default ContactFormViewPage