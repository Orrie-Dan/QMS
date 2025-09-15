"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useStore, Quotation } from "../lib/store"
import { generateQuotationPDF } from "../lib/pdfUtils"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Plus, Search, Eye, Edit, Trash2, Download, FileText, CalendarDays, DollarSign } from "lucide-react"

const statusStyles: Record<string, { badge: string; border: string; pill: string; icon: string }> = {
  draft: { badge: "bg-gray-100 text-gray-800", border: "border-t-4 border-indigo-300", pill: "bg-indigo-500/10", icon: "text-indigo-500" },
  sent: { badge: "bg-blue-100 text-blue-800", border: "border-t-4 border-sky-300", pill: "bg-sky-500/10", icon: "text-sky-500" },
  accepted: { badge: "bg-green-100 text-green-800", border: "border-t-4 border-emerald-300", pill: "bg-emerald-500/10", icon: "text-emerald-500" },
  rejected: { badge: "bg-red-100 text-red-800", border: "border-t-4 border-red-300", pill: "bg-red-500/10", icon: "text-red-500" },
}

export default function QuotationsPage() {
  const quotations = useStore((state) => state.quotations)
  const deleteQuotation = useStore((state) => state.deleteQuotation)
  const companySettings = useStore((state) => state.companySettings)
  const clients = useStore((state) => state.clients)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredQuotations = quotations.filter(
    (quotation) =>
      quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.clientName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDownload = (quotation: Quotation) => {
    const client = clients.find((c) => c.id === quotation.clientId)
    generateQuotationPDF(quotation, companySettings, client)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quotations</h1>
          <p className="text-muted-foreground">Manage and track all your quotations</p>
        </div>
        <Link to="/quotations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Quotation
          </Button>
        </Link>
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

      <div className="grid gap-4">
        {filteredQuotations.map((quotation) => {
          const s = statusStyles[quotation.status] || statusStyles.draft
          return (
            <Card key={quotation.id} className={`shadow-sm ${s.border}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{quotation.quotationNumber}</CardTitle>
                    <CardDescription>{quotation.clientName}</CardDescription>
                  </div>
                  <Badge className={s.badge}>{quotation.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className={`p-1.5 rounded-md ${s.pill}`}>
                        <DollarSign className={`h-3 w-3 ${s.icon}`} />
                      </span>
                      <span>Total: ${quotation.total.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className={`p-1.5 rounded-md ${s.pill}`}>
                        <CalendarDays className={`h-3 w-3 ${s.icon}`} />
                      </span>
                      <span>Valid until: {quotation.validUntil}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link to={`/quotations/${quotation.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(quotation)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteQuotation(quotation.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredQuotations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No quotations found</p>
            <Link to="/quotations/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create your first quotation
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
