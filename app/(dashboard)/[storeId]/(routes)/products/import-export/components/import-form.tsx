"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { toast } from "react-hot-toast"
import { FileSpreadsheet, Upload, Download, Loader2, CheckCircle, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ImportProductsFormProps {
  storeId: string
}

export const ImportProductsForm: React.FC<ImportProductsFormProps> = ({ storeId }) => {
  const router = useRouter()
  const [fileFormat, setFileFormat] = useState<"xlsx" | "csv">("xlsx")
  const [file, setFile] = useState<File | null>(null)
  const [importMode, setImportMode] = useState<"create_update" | "create_only" | "update_only" | "validate">(
    "create_update",
  )
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [importStatus, setImportStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle")
  const [importResult, setImportResult] = useState<{
    totalRows: number
    successCount: number
    errorCount: number
    errors?: any[]
  } | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const selectedFile = acceptedFiles[0]
      if (selectedFile) {
        // Check file extension
        const extension = selectedFile.name.split(".").pop()?.toLowerCase()
        if ((fileFormat === "xlsx" && extension !== "xlsx") || (fileFormat === "csv" && extension !== "csv")) {
          toast.error(`Please select a ${fileFormat.toUpperCase()} file`)
          return
        }

        setFile(selectedFile)
        toast.success(`File "${selectedFile.name}" selected`)
      }
    },
    [fileFormat],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/csv": [".csv"],
    },
    maxFiles: 1,
    multiple: false,
  })

  const downloadTemplate = async () => {
    try {
      const response = await fetch(`/api/${storeId}/products/import/template?format=${fileFormat}`)

      if (!response.ok) {
        throw new Error("Failed to download template")
      }

      // Get filename from Content-Disposition header if available
      const contentDisposition = response.headers.get("Content-Disposition")
      let filename = `product_import_template.${fileFormat}`
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1]
        }
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success("Template downloaded successfully")
    } catch (error) {
      toast.error("Failed to download template")
    }
  }

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file to import")
      return
    }

    try {
      setIsUploading(true)
      setImportStatus("uploading")
      setUploadProgress(0)

      const formData = new FormData()
      formData.append("file", file)

      // Set the correct parameters based on import mode
      if (importMode === "create_update") {
        formData.append("updateExisting", "true")
        formData.append("createMissing", "true")
        formData.append("validateOnly", "false")
      } else if (importMode === "create_only") {
        formData.append("updateExisting", "false")
        formData.append("createMissing", "true")
        formData.append("validateOnly", "false")
      } else if (importMode === "update_only") {
        formData.append("updateExisting", "true")
        formData.append("createMissing", "false")
        formData.append("validateOnly", "false")
      } else if (importMode === "validate") {
        formData.append("updateExisting", "false")
        formData.append("createMissing", "false")
        formData.append("validateOnly", "true")
      }

      // Create a custom fetch with upload progress
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `/api/${storeId}/products/import`)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(progress)
        }
      }

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setImportStatus("processing")

          try {
            const response = JSON.parse(xhr.responseText)

            if (response.success) {
              setImportStatus("success")
              setImportResult({
                totalRows: response.totalRows,
                successCount: response.successCount,
                errorCount: response.errorCount,
                errors: response.errors,
              })

              toast.success(`Import completed: ${response.successCount} products processed successfully`)
              router.refresh()
            } else {
              setImportStatus("error")
              setImportResult({
                totalRows: response.totalRows || 0,
                successCount: response.successCount || 0,
                errorCount: response.errorCount || 0,
                errors: response.errors,
              })

              toast.error(response.message || "Import failed")
            }
          } catch (parseError) {
            setImportStatus("error")
            toast.error("Error processing import response")
          }
        } else {
          setImportStatus("error")
          let errorMessage = "Import failed"

          try {
            const errorResponse = JSON.parse(xhr.responseText)
            errorMessage = errorResponse.message || errorMessage
          } catch (e) {
            // If we can't parse the error, use the default message
          }

          toast.error(errorMessage)
        }

        setIsUploading(false)
      }

      xhr.onerror = () => {
        setImportStatus("error")
        setIsUploading(false)
        toast.error("Network error during import")
      }

      xhr.send(formData)
    } catch (error) {
      setImportStatus("error")
      setIsUploading(false)
      toast.error("Failed to import products")
    }
  }

  const resetForm = () => {
    setFile(null)
    setImportStatus("idle")
    setImportResult(null)
    setUploadProgress(0)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-2">1. Choose File Format</h3>
          <RadioGroup
            value={fileFormat}
            onValueChange={(value) => {
              setFileFormat(value as "xlsx" | "csv")
              setFile(null) // Reset file when format changes
            }}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="xlsx" id="xlsx" />
              <Label htmlFor="xlsx" className="flex items-center">
                <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                Excel (.xlsx)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="csv" id="csv" />
              <Label htmlFor="csv" className="flex items-center">
                <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-600" />
                CSV (.csv)
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">2. Download Template</h3>
          <Button variant="outline" onClick={downloadTemplate} className="w-full md:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Download {fileFormat.toUpperCase()} Template
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Use our template to ensure your data is formatted correctly
          </p>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium mb-4">3. Upload Your File</h3>

        {importStatus === "idle" && (
          <>
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? "border-primary bg-primary/5" : "border-border"}
                ${file ? "bg-primary/5" : ""}
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />

              {file ? (
                <div>
                  <p className="font-medium text-primary">{file.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB · {fileFormat.toUpperCase()}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                    }}
                    className="mt-2"
                  >
                    Change File
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="font-medium">{isDragActive ? "Drop your file here" : "Drag & drop your file here"}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to browse for a {fileFormat.toUpperCase()} file
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">4. Import Options</h3>
              <Select value={importMode} onValueChange={(value) => setImportMode(value as any)}>
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder="Select import mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create_update">Create new & update existing products</SelectItem>
                  <SelectItem value="create_only">Create new products only</SelectItem>
                  <SelectItem value="update_only">Update existing products only</SelectItem>
                  <SelectItem value="validate">Validate only (no changes)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">Choose how to handle existing products during import</p>
            </div>

            <Button onClick={handleImport} disabled={!file || isUploading} className="mt-6">
              <Upload className="mr-2 h-4 w-4" />
              Start Import
            </Button>
          </>
        )}

        {(importStatus === "uploading" || importStatus === "processing") && (
          <Card className="p-6">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-medium mb-2">
                {importStatus === "uploading" ? "Uploading File..." : "Processing Import..."}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {importStatus === "uploading"
                  ? "Please wait while we upload your file"
                  : "Analyzing and importing your products"}
              </p>

              {importStatus === "uploading" && (
                <>
                  <Progress value={uploadProgress} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
                </>
              )}
            </div>
          </Card>
        )}

        {(importStatus === "success" || importStatus === "error") && importResult && (
          <Card className="p-6">
            <div className="text-center mb-6">
              {importStatus === "success" ? (
                <CheckCircle className="h-10 w-10 mx-auto mb-4 text-green-500" />
              ) : (
                <AlertCircle className="h-10 w-10 mx-auto mb-4 text-red-500" />
              )}

              <h3 className="text-lg font-medium mb-2">
                {importStatus === "success" ? "Import Completed" : "Import Completed With Errors"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {importStatus === "success"
                  ? "Your products have been imported successfully"
                  : "Some products could not be imported due to errors"}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Total Rows</p>
                <p className="text-2xl font-bold">{importResult.totalRows}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-green-600">Successful</p>
                <p className="text-2xl font-bold text-green-600">{importResult.successCount}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-sm text-red-600">Errors</p>
                <p className="text-2xl font-bold text-red-600">{importResult.errorCount}</p>
              </div>
            </div>

            {importResult.errorCount > 0 && importResult.errors && (
              <div className="mb-6">
                <h4 className="font-medium mb-2">Error Summary:</h4>
                <div className="max-h-40 overflow-y-auto bg-muted p-3 rounded-md text-sm">
                  {importResult.errors.slice(0, 5).map((error, index) => (
                    <div key={index} className="mb-2 pb-2 border-b border-border last:border-0 last:mb-0 last:pb-0">
                      <p>
                        <strong>Row {error.row || "Unknown"}:</strong> {error.message}
                      </p>
                      {error.field && <p className="text-xs text-muted-foreground">Field: {error.field}</p>}
                    </div>
                  ))}
                  {importResult.errors.length > 5 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      And {importResult.errors.length - 5} more errors...
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <Button onClick={resetForm} variant="outline">
                Import Another File
              </Button>
              <Button onClick={() => router.push(`/${storeId}/products`)}>View Products</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
