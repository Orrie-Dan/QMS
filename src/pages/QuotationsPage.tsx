"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useStore, Quotation } from "../lib/store"
import { generateQuotationPDF } from "../lib/pdfUtils"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Plus, Search, Eye, Edit, Trash2, Download } from "lucide-react"

export default function QuotationsPage() {
  const quotations = useStore((state) => state.quotations)
  const deleteQuotation = useStore((state) => state.deleteQuotation)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredQuotations = quotations.filter(
    (quotation) =>
      quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.clientName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  const handleDownload = (quotation: Quotation) => {
    generateQuotationPDF(quotation)
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
        {filteredQuotations.map((quotation) => (
          <Card key={quotation.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{quotation.quotationNumber}</CardTitle>
                  <CardDescription>{quotation.clientName}</CardDescription>
                </div>
                <Badge className={getStatusColor(quotation.status)}>{quotation.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total: ${quotation.total.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Valid until: {quotation.validUntil}</p>
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
        ))}
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
