"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { ExportProductsForm } from "./export-form"
import { ImportProductsForm } from "./import-form"
import { RecentActivityTable } from "./recent-activity-table"

interface Category {
  id: string
  name: string
}

interface ExportLog {
  id: string
  fileName: string
  fileType: string
  productCount: number
  status: string
  createdAt: string
  lastDownloadedAt: string
}

interface ImportLog {
  id: string
  fileName: string
  fileType: string
  totalRows: number
  successCount: number
  errorCount: number
  status: string
  createdAt: string
  completedAt: string
}

interface ImportExportClientProps {
  storeId: string
  categories: Category[]
  productCount: number
  exportLogs: ExportLog[]
  importLogs: ImportLog[]
}

export const ImportExportClient: React.FC<ImportExportClientProps> = ({
  storeId,
  categories,
  productCount,
  exportLogs,
  importLogs,
}) => {
  const [activeTab, setActiveTab] = useState("export")

  return (
    <>
      <PageHeader title="Import & Export" description="Import and export your product data" />

      <div className="px-4 md:px-8 pb-8">
        <Tabs defaultValue="export" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="export">Export Products</TabsTrigger>
            <TabsTrigger value="import">Import Products</TabsTrigger>
          </TabsList>
          <TabsContent value="export">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Export Products</CardTitle>
                  <CardDescription>Export your products to CSV or Excel format</CardDescription>
                </CardHeader>
                <CardContent>
                  <ExportProductsForm storeId={storeId} categories={categories} productCount={productCount} />
                </CardContent>
              </Card>

              {exportLogs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Exports</CardTitle>
                    <CardDescription>History of your recent product exports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentActivityTable type="export" data={exportLogs} storeId={storeId} />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          <TabsContent value="import">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Import Products</CardTitle>
                  <CardDescription>Import products from Excel or CSV files</CardDescription>
                </CardHeader>
                <CardContent>
                  <ImportProductsForm storeId={storeId} />
                </CardContent>
              </Card>

              {importLogs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Imports</CardTitle>
                    <CardDescription>History of your recent product imports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentActivityTable type="import" data={importLogs} storeId={storeId} />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
