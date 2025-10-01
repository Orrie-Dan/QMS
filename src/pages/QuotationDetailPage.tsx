import { useParams, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useStore } from "../lib/store"
import { downloadQuotationHTML } from "../lib/pdfUtils"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { ConfirmationDialog } from "../components/ui/confirmation-dialog"
import { ArrowLeft, Edit, Trash2, Send, Download, Loader2, User, CalendarDays, ReceiptText } from "lucide-react"
import { formatCurrency } from "../lib/utils"

export default function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { quotations, deleteQuotation, companySettings, clients } = useStore()
  const [isLoading, setIsLoading] = useState({
    send: false,
    download: false,
    delete: false
  })
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    type: "delete" | "send" | null
  }>({
    open: false,
    type: null
  })

  const quotation = quotations.find((q) => q.id === id)
  const client = quotation ? clients.find((c) => c.id === quotation.clientId) : undefined

  if (!quotation) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Quotation not found</h1>
          <p className="text-gray-600 mt-2">The quotation you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/quotations")} className="mt-4">
            Back to Quotations
          </Button>
        </div>
      </div>
    )
  }

  const handleDelete = () => {
    setConfirmDialog({ open: true, type: "delete" })
  }

  const handleSend = () => {
    setConfirmDialog({ open: true, type: "send" })
  }

  const handleEdit = () => {
    navigate(`/quotations/${quotation.id}/edit`)
  }

  const confirmAction = async () => {
    if (!confirmDialog.type) return

    if (confirmDialog.type === "delete") {
      setIsLoading(prev => ({ ...prev, delete: true }))
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        deleteQuotation(quotation.id)
        navigate("/quotations")
      } catch (error) {
        console.error("Error deleting quotation:", error)
        alert("Failed to delete quotation. Please try again.")
      } finally {
        setIsLoading(prev => ({ ...prev, delete: false }))
        setConfirmDialog({ open: false, type: null })
      }
    } else if (confirmDialog.type === "send") {
      setIsLoading(prev => ({ ...prev, send: true }))
      try {
        await new Promise(resolve => setTimeout(resolve, 1500))
        const { updateQuotation } = useStore.getState()
        updateQuotation(quotation.id, { status: "sent" })
        alert("Quotation sent successfully!")
      } catch (error) {
        console.error("Error sending quotation:", error)
        alert("Failed to send quotation. Please try again.")
      } finally {
        setIsLoading(prev => ({ ...prev, send: false }))
        setConfirmDialog({ open: false, type: null })
      }
    }
  }

  const handleDownload = async () => {
    console.log("Download button clicked")
    setIsLoading(prev => ({ ...prev, download: true }))
    try {
      console.log("Generating HTML for quotation:", quotation)
      console.log("Company settings:", companySettings)
      console.log("Client:", client)
      await new Promise(resolve => setTimeout(resolve, 500))
      downloadQuotationHTML(quotation, companySettings, client)
      console.log("HTML generation completed")
    } catch (error) {
      console.error("Error downloading quotation:", error)
      alert("Failed to download quotation. Please try again.")
    } finally {
      setIsLoading(prev => ({ ...prev, download: false }))
    }
  }

  const statusStyles: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800 border border-gray-200",
    sent: "bg-sky-100 text-sky-800 border border-sky-200",
    accepted: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    rejected: "bg-red-100 text-red-800 border border-red-200",
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/quotations")}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quotation.quotationNumber}</h1>
            <p className="text-gray-600">Quotation Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={statusStyles[quotation.status] || statusStyles.draft}>
            {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSend}
            disabled={isLoading.send}
          >
            {isLoading.send ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isLoading.send ? "Sending..." : "Send"}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownload}
            disabled={isLoading.download}
          >
            {isLoading.download ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isLoading.download ? "Downloading..." : "Download"}
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete}
            disabled={isLoading.delete}
          >
            {isLoading.delete ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            {isLoading.delete ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <Card className="border-t-4 border-sky-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-4 w-4 text-sky-500" /> Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{quotation.clientName}</p>
                <p className="text-sm text-gray-600">Client ID: {quotation.clientId}</p>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="border-t-4 border-indigo-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ReceiptText className="h-4 w-4 text-indigo-500" /> Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotation.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × {formatCurrency(item.unitPrice, quotation.currency)}
                      </p>
                    </div>
                    <p className="font-medium">{formatCurrency(item.total, quotation.currency)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {quotation.notes && (
            <Card className="border-t-4 border-amber-400">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{quotation.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <Card className="border-t-4 border-emerald-400">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(quotation.subtotal, quotation.currency)}</span>
              </div>
              {quotation.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(quotation.discount, quotation.currency)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax ({quotation.taxRate}%):</span>
                <span>{formatCurrency(quotation.taxAmount, quotation.currency)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-3 text-emerald-600">
                <span>Total:</span>
                <span>{formatCurrency(quotation.total, quotation.currency)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card className="border-t-4 border-sky-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-sky-500" /> Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Valid Until</p>
                <p className="font-medium">{quotation.validUntil}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium">{quotation.createdAt}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium">{quotation.updatedAt}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open: boolean) => setConfirmDialog({ open, type: null })}
        title={confirmDialog.type === "delete" ? "Delete Quotation" : "Send Quotation"}
        description={
          confirmDialog.type === "delete"
            ? "Are you sure you want to delete this quotation? This action cannot be undone."
            : "Are you sure you want to send this quotation to the client?"
        }
        confirmText={confirmDialog.type === "delete" ? "Delete" : "Send"}
        variant={confirmDialog.type === "delete" ? "destructive" : "default"}
        onConfirm={confirmAction}
        isLoading={
          (confirmDialog.type === "delete" && isLoading.delete) ||
          (confirmDialog.type === "send" && isLoading.send)
        }
      />
    </div>
  )
}