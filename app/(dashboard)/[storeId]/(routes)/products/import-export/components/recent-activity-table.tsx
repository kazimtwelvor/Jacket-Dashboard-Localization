"use client"

import type React from "react"

import { useState } from "react"
import { toast } from "react-hot-toast"
import { Download, Loader2, FileText, AlertTriangle } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"

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
  errorLogUrl?: string
}

interface RecentActivityTableProps {
  type: "export" | "import"
  data: ExportLog[] | ImportLog[]
  pageSize?: number
  storeId: string
}

export const RecentActivityTable: React.FC<RecentActivityTableProps> = ({ type, data = [], pageSize = 5, storeId }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [viewingErrorsId, setViewingErrorsId] = useState<string | null>(null)

  const totalPages = Math.ceil(data.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentData = data.slice(startIndex, endIndex)

  const handleDownload = async (exportId: string) => {
    try {
      setDownloadingId(exportId)

      // Make a direct request to re-generate the export
      const response = await fetch(`/api/${storeId}/products/export/download/${exportId}`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error("Failed to download export")
      }

      // Get the filename from the Content-Disposition header if available
      const contentDisposition = response.headers.get("Content-Disposition")
      let filename = "products_export.xlsx"
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1]
        }
      }

      // Convert the response to a blob
      const blob = await response.blob()

      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success("Export downloaded successfully")
    } catch (error) {
      console.error("Download error:", error)
      toast.error("Failed to download export")
    } finally {
      setDownloadingId(null)
    }
  }

  const handleViewErrors = async (importLog: ImportLog) => {
    try {
      setViewingErrorsId(importLog.id)

      if (!importLog.errorLogUrl) {
        toast.error("Error log URL not available")
        return
      }

      // Make a request to get the error log
      const response = await fetch(importLog.errorLogUrl)

      if (!response.ok) {
        throw new Error("Failed to fetch error log")
      }

      const errorData = await response.json()

      // Create a downloadable file with the error data
      const blob = new Blob([JSON.stringify(errorData, null, 2)], { type: "application/json" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `import_errors_${importLog.id}.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success("Error log downloaded")
    } catch (error) {
      console.error("Error log fetch error:", error)
      toast.error("Failed to download error log")
    } finally {
      setViewingErrorsId(null)
    }
  }

  const renderStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default"
    let icon = null

    switch (status.toLowerCase()) {
      case "completed":
        variant = "default"
        break
      case "processing":
        variant = "secondary"
        break
      case "failed":
      case "completed_with_errors":
        variant = "destructive"
        icon = <AlertTriangle className="h-3 w-3 mr-1" />
        break
      default:
        variant = "outline"
    }

    return (
      <Badge variant={variant} className="flex items-center">
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")}
      </Badge>
    )
  }

  // Render export table
  if (type === "export") {
    return (
      <div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Downloaded</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.length > 0 ? (
                currentData.map((row: ExportLog) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.fileName}</TableCell>
                    <TableCell>{row.fileType.toUpperCase()}</TableCell>
                    <TableCell>{row.productCount}</TableCell>
                    <TableCell>{renderStatusBadge(row.status)}</TableCell>
                    <TableCell>{row.createdAt}</TableCell>
                    <TableCell>{row.lastDownloadedAt || "-"}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(row.id)}
                        disabled={downloadingId === row.id}
                      >
                        {downloadingId === row.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    No export history available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink isActive={currentPage === index + 1} onClick={() => setCurrentPage(index + 1)}>
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    )
  }

  // Render import table
  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Total Rows</TableHead>
              <TableHead>Success</TableHead>
              <TableHead>Errors</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((row: ImportLog) => (
                <TableRow key={row.id}>
                  <TableCell>{row.fileName}</TableCell>
                  <TableCell>{row.fileType.toUpperCase()}</TableCell>
                  <TableCell>{row.totalRows}</TableCell>
                  <TableCell className="text-green-600 font-medium">{row.successCount}</TableCell>
                  <TableCell className={row.errorCount > 0 ? "text-red-600 font-medium" : ""}>
                    {row.errorCount}
                  </TableCell>
                  <TableCell>{renderStatusBadge(row.status)}</TableCell>
                  <TableCell>{row.createdAt}</TableCell>
                  <TableCell>
                    {row.errorCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewErrors(row as ImportLog)}
                        disabled={viewingErrorsId === row.id}
                      >
                        {viewingErrorsId === row.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <FileText className="mr-2 h-4 w-4" />
                            View Errors
                          </>
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                  No import history available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink isActive={currentPage === index + 1} onClick={() => setCurrentPage(index + 1)}>
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
