import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmailPreview } from "./components/email-preview"

interface EmailSettingsPageProps {
  params: {
    storeId: string
  }
}

export default async function EmailSettingsPage({ params }: EmailSettingsPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      userId,
    },
  })

  if (!store) {
    redirect("/")
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Email Settings" description="Manage your store's email templates and settings" />
        <Separator />

        <Tabs defaultValue="templates" className="w-full">
          <TabsList>
            <TabsTrigger value="templates">Email Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="templates">
            <EmailPreview storeId={params.storeId} />
          </TabsContent>
          <TabsContent value="analytics">
            <div>Analytics Coming Soon</div>
          </TabsContent>
          <TabsContent value="settings">
            <div>Settings Coming Soon</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
