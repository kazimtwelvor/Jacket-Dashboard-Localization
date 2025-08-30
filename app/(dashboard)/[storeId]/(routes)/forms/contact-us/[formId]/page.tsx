import { ContactFormEdit } from "./components/contact-form-edit"
import prismadb from "@/lib/prismadb"

const ContactFormEditPage = async ({ params }: { params: { formId: string, storeId: string } }) => {
  const contactForm = await prismadb.contactForm.findUnique({
    where: {
      id: params.formId,
      storeId: params.storeId,
    },
  })

  if (!contactForm) {
    return <div>Contact form not found</div>
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ContactFormEdit initialData={contactForm} />
    </div>
  )
}

export default ContactFormEditPage