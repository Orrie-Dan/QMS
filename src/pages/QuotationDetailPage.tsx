import { useParams, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useStore } from "../lib/store"
import { generateQuotationPDF } from "../lib/pdfUtils"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { ConfirmationDialog } from "../components/ui/confirmation-dialog"
import { ArrowLeft, Edit, Trash2, Send, Download, Loader2 } from "lucide-react"

export default function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { quotations, deleteQuotation } = useStore()
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
        // Simulate API call delay
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
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500))
        // Update quotation status to 'sent'
        const { updateQuotation } = useStore.getState()
        updateQuotation(quotation.id, { status: "sent" })
        // In a real app, you would send an email here
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
    setIsLoading(prev => ({ ...prev, download: true }))
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Generate and download PDF
      generateQuotationPDF(quotation)
    } catch (error) {
      console.error("Error downloading quotation:", error)
      alert("Failed to download quotation. Please try again.")
    } finally {
      setIsLoading(prev => ({ ...prev, download: false }))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
          <Badge className={getStatusColor(quotation.status)}>
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
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{quotation.clientName}</p>
                <p className="text-sm text-gray-600">Client ID: {quotation.clientId}</p>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotation.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × ${item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium">${item.total.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {quotation.notes && (
            <Card>
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
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${quotation.subtotal.toFixed(2)}</span>
              </div>
              {quotation.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-${quotation.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax ({quotation.taxRate}%):</span>
                <span>${quotation.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-3">
                <span>Total:</span>
                <span>${quotation.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
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