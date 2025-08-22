import { format } from "date-fns"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import prismadb from "@/lib/prismadb"
import { ImportExportClient } from "./components/client"

interface ImportExportPageProps {
  params: {
    storeId: string
  }
}

export default async function ImportExportPage({ params }: ImportExportPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Fetch store to verify ownership
  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      userId,
    },
  })

  if (!store) {
    redirect("/")
  }

  // Fetch categories for filtering
  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      name: "asc",
    },
  })

  // Count total products
  const productCount = await prismadb.product.count({
    where: {
      storeId: params.storeId,
      isDeleted: false,
    },
  })

  // Fetch recent export logs
  const exportLogs = await prismadb.exportLog.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  })

  // Fetch recent import logs
  const importLogs = await prismadb.importLog.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  })

  // Format export logs for display
  const formattedExportLogs = exportLogs.map((log) => ({
    id: log.id,
    fileName: log.fileName,
    fileType: log.fileType.toUpperCase(),
    productCount: log.productCount,
    status: log.status,
    createdAt: format(log.createdAt, "MMM dd, yyyy HH:mm"),
    lastDownloadedAt: log.lastDownloadedAt ? format(log.lastDownloadedAt, "MMM dd, yyyy HH:mm") : "-",
  }))

  // Format import logs for display
  const formattedImportLogs = importLogs.map((log) => ({
    id: log.id,
    fileName: log.fileName,
    fileType: log.fileType.toUpperCase(),
    totalRows: log.totalRows,
    successCount: log.successCount,
    errorCount: log.errorCount,
    status: log.status,
    createdAt: format(log.createdAt, "MMM dd, yyyy HH:mm"),
    completedAt: log.completedAt ? format(log.completedAt, "MMM dd, yyyy HH:mm") : "-",
  }))

  return (
    <ImportExportClient
      storeId={params.storeId}
      categories={categories}
      productCount={productCount}
      exportLogs={formattedExportLogs}
      importLogs={formattedImportLogs}
    />
  )
}
