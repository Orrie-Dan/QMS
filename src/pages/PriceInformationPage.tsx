"use client"

import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { getQuotations as apiGetQuotations, deleteQuotation as apiDeleteQuotation, type UIQuotation } from "../lib/api"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Input } from "../../components/ui/input"
import { Plus, Search, Eye, Edit, Trash2, Download, FileText } from "lucide-react"

const statusStyles: Record<string, { badge: string; border: string; pill: string; icon: string }> = {
  draft: { badge: "bg-gray-100 text-gray-800", border: "border-t-4 border-indigo-300", pill: "bg-indigo-500/10", icon: "text-indigo-500" },
  sent: { badge: "bg-blue-100 text-blue-800", border: "border-t-4 border-sky-300", pill: "bg-sky-500/10", icon: "text-sky-500" },
  accepted: { badge: "bg-green-100 text-green-800", border: "border-t-4 border-emerald-300", pill: "bg-emerald-500/10", icon: "text-emerald-500" },
  rejected: { badge: "bg-red-100 text-red-800", border: "border-t-4 border-red-300", pill: "bg-red-500/10", icon: "text-red-500" },
}

export default function PriceInformationPage() {
  const [quotations, setQuotations] = useState<UIQuotation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    apiGetQuotations()
      .then((data) => { if (mounted) setQuotations(data) })
      .catch((e) => { if (mounted) setError(e?.message || "Failed to load price information") })
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Price Information</h1>
          <p className="text-muted-foreground">Manage and track all your price information</p>
        </div>
        <Link to="/quotations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Price
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search price information..."
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
                          <Link to={`/quotations/${quotation.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              // Mirror behavior: here we could generate a PDF or similar if needed
                              alert("PDF generation can be wired to backend data later.")
                            }}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            PDF
                          </Button>
                          <Link to={`/quotations/${quotation.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                await apiDeleteQuotation(quotation.id)
                                setQuotations((prev) => prev.filter((q) => q.id !== quotation.id))
                              } catch (e) {
                                console.error(e)
                                alert("Failed to delete item")
                              }
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredQuotations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No price information found
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


