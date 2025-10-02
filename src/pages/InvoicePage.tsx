import { useMemo, useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Eye, Edit, Trash2, Download, FileText, Search } from "lucide-react"
import { downloadInvoiceHTML } from "../lib/pdfUtils"

export default function InvoicePage() {
  const navigate = useNavigate()
  const { quotations, clients, companySettings, deleteQuotation } = useStore()
  const [searchTerm, setSearchTerm] = useState("")

  const data = useMemo(() =>
    quotations.filter(
      (q) =>
        q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  [quotations, searchTerm])

  const getClient = (clientId: string) => clients.find((c) => c.id === clientId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">Manage and generate invoices from quotations</p>
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
                <TableHead className="w-[200px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <span className="p-1.5 rounded-md bg-sky-500/10">
                      <FileText className="h-3 w-3 text-sky-600" />
                    </span>
                    {q.quotationNumber}
                  </TableCell>
                  <TableCell>{q.clientName}</TableCell>
                  <TableCell>
                    <Badge>{q.status}</Badge>
                  </TableCell>
                  <TableCell>{q.validUntil ? new Date(q.validUntil).toLocaleDateString() : "—"}</TableCell>
                  <TableCell>{new Date(q.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/quotations/${q.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadInvoiceHTML(q, useStore.getState().companySettings, getClient(q.clientId))}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/quotations/${q.id}/edit`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (window.confirm("Delete this quotation?")) {
                            deleteQuotation(q.id)
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
              ))}
              {data.length === 0 && (
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
    </div>
  )
}


