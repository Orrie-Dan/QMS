"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { getQuotations as apiGetQuotations, deleteQuotation as apiDeleteQuotation, type UIQuotation } from "@/lib/api"
import { useStore } from "@/lib/store"
import { downloadQuotationPDF } from "@/lib/pdfUtils"
import { generateQuotationsExcel } from "@/lib/excelUtils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Plus, Search, Eye, Edit, Trash2, FileText, CheckCircle, XCircle, Send, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const statusStyles: Record<string, { badge: string; border: string; pill: string; icon: string }> = {
  draft: { badge: "bg-gray-100 text-gray-800", border: "border-t-4 border-indigo-300", pill: "bg-indigo-500/10", icon: "text-indigo-500" },
  sent: { badge: "bg-blue-100 text-blue-800", border: "border-t-4 border-sky-300", pill: "bg-sky-500/10", icon: "text-sky-500" },
  accepted: { badge: "bg-green-100 text-green-800", border: "border-t-4 border-emerald-300", pill: "bg-emerald-500/10", icon: "text-emerald-500" },
  rejected: { badge: "bg-red-100 text-red-800", border: "border-t-4 border-red-300", pill: "bg-red-500/10", icon: "text-red-500" },
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<UIQuotation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    apiGetQuotations()
      .then((data) => { if (mounted) setQuotations(data) })
      .catch((e) => { if (mounted) setError(e?.message || "Failed to load quotations") })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const filteredQuotations = useMemo(() =>
    quotations.filter(
      (quotation) =>
        quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.clientName.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  [quotations, searchTerm])

  const handleDownloadPDF = async (quotation: UIQuotation) => {
    try {
      // Get company settings and client data
      const { companySettings, clients } = useStore.getState()
      const client = clients.find(c => c.id === quotation.clientId)
      
      // Convert UIQuotation to Quotation format
      const quotationData = {
        ...quotation,
        status: (quotation.status === "expired" ? "rejected" : quotation.status) as "draft" | "sent" | "accepted" | "rejected",
        validUntil: quotation.validUntil ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          {
            id: "1",
            description: "Software Development",
            quantity: 1,
            unitPrice: quotation.total * 0.85,
            total: quotation.total * 0.85
          }
        ],
        subtotal: quotation.total * 0.85, // Approximate subtotal
        taxRate: 18,
        taxAmount: quotation.total * 0.15, // Approximate tax
        discount: 0,
        notes: "",
        updatedAt: quotation.createdAt
      }
      
      await downloadQuotationPDF(quotationData, companySettings, client)
    } catch (error) {
      console.error("Error downloading PDF:", error)
      alert("Failed to download PDF. Please try again.")
    }
  }

  const handleStatusUpdate = async (quotationId: string, newStatus: "draft" | "sent" | "accepted" | "rejected") => {
    setUpdatingStatus(quotationId)
    try {
      // Update in local state first for immediate UI feedback
      setQuotations(prev => prev.map(q => 
        q.id === quotationId ? { ...q, status: newStatus } : q
      ))
      
      // Here you would typically call an API to update the status
      // For now, we'll just update the local state
      console.log(`Updating quotation ${quotationId} status to ${newStatus}`)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Failed to update status. Please try again.")
      // Revert the change on error
      setQuotations(prev => prev.map(q => 
        q.id === quotationId ? { ...q, status: quotations.find(q => q.id === quotationId)?.status || "draft" } : q
      ))
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleExportExcel = () => {
    try {
      const filename = generateQuotationsExcel(quotations)
      alert(`Quotations exported successfully as: ${filename}`)
    } catch (error) {
      console.error('Error exporting quotations:', error)
      alert('Failed to export quotations. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quotations</h1>
          <p className="text-muted-foreground">Manage and track all your quotations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <FileText className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Link to="/quotations/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Quotation
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quotations..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {error && (
        <Card>
          <CardContent className="text-center py-6 text-red-600">{error}</CardContent>
        </Card>
      )}

      {loading ? (
        <Card>
          <CardContent className="text-center py-12">Loading…</CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px]">Number</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[160px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotations.map((quotation) => {
                  const s = statusStyles[quotation.status] || statusStyles.draft
                  return (
                    <TableRow key={quotation.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <span className={`p-1.5 rounded-md ${s.pill}`}>
                          <FileText className={`h-3 w-3 ${s.icon}`} />
                        </span>
                        {quotation.quotationNumber}
                      </TableCell>
                      <TableCell>{quotation.clientName}</TableCell>
                      <TableCell>
                        <Badge className={s.badge}>{quotation.status}</Badge>
                      </TableCell>
                      <TableCell>{quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : "—"}</TableCell>
                      <TableCell>{new Date(quotation.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {/* Visible actions - View and PDF */}
                          <Link to={`/quotations/${quotation.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(quotation)}>
                            <FileText className="mr-2 h-4 w-4" />
                            PDF
                          </Button>
                          
                          {/* More actions dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/quotations/${quotation.id}/edit`} className="flex items-center">
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              
                              {/* Status-specific actions */}
                              {quotation.status === 'draft' && (
                                <DropdownMenuItem 
                                  onClick={() => handleStatusUpdate(quotation.id, 'sent')}
                                  disabled={updatingStatus === quotation.id}
                                  className="text-blue-600"
                                >
                                  <Send className="mr-2 h-4 w-4" />
                                  Send
                                </DropdownMenuItem>
                              )}
                              
                              {quotation.status === 'sent' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => handleStatusUpdate(quotation.id, 'accepted')}
                                    disabled={updatingStatus === quotation.id}
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Accept
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleStatusUpdate(quotation.id, 'rejected')}
                                    disabled={updatingStatus === quotation.id}
                                    className="text-red-600"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              <DropdownMenuItem 
                                onClick={async () => {
                                  try {
                                    await apiDeleteQuotation(quotation.id)
                                    setQuotations((prev) => prev.filter((q) => q.id !== quotation.id))
                                  } catch (e) {
                                    console.error(e)
                                    alert("Failed to delete quotation")
                                  }
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredQuotations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No quotations found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      
    </div>
  )
}
