import { useEffect, useState } from "react"
import { getRecentQuotations, type UIQuotation } from "../../lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { FileText, Eye } from "lucide-react"

const styles: Record<string, { badge: string; stripe: string; pill: string; icon: string; hover: string }> = {
  draft: { badge: "bg-gray-100 text-gray-800", stripe: "border-l-4 border-indigo-400", pill: "bg-indigo-500/10", icon: "text-indigo-500", hover: "hover:bg-indigo-500/5" },
  sent: { badge: "bg-blue-100 text-blue-800", stripe: "border-l-4 border-sky-400", pill: "bg-sky-500/10", icon: "text-sky-500", hover: "hover:bg-sky-500/5" },
  accepted: { badge: "bg-green-100 text-green-800", stripe: "border-l-4 border-emerald-400", pill: "bg-emerald-500/10", icon: "text-emerald-500", hover: "hover:bg-emerald-500/5" },
  rejected: { badge: "bg-red-100 text-red-800", stripe: "border-l-4 border-red-400", pill: "bg-red-500/10", icon: "text-red-500", hover: "hover:bg-red-500/5" },
}

export default function RecentQuotations() {
  const [recentQuotations, setRecentQuotations] = useState<UIQuotation[]>([])
  useEffect(() => {
    getRecentQuotations().then(setRecentQuotations).catch(console.error)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Quotations</CardTitle>
        <CardDescription>
          Your latest quotation requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentQuotations.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations yet</h3>
            <p className="text-gray-600 mb-4">Create your first quotation to get started</p>
            <Link to="/quotations/new">
              <Button>Create Quotation</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentQuotations.map((quotation) => {
              const s = styles[quotation.status] || styles.draft
              return (
                <div
                  key={quotation.id}
                  className={`flex items-center justify-between p-4 border rounded-lg bg-white/60 backdrop-blur-sm ${s.stripe} ${s.hover}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 ${s.pill} rounded-lg flex items-center justify-center`}>
                      <FileText className={`h-5 w-5 ${s.icon}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{quotation.quotationNumber}</h3>
                      <p className="text-sm text-gray-600">{quotation.clientName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(quotation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={s.badge}>
                      {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                    </Badge>
                    <Link to={`/quotations/${quotation.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
            <div className="pt-4 border-t">
              <Link to="/quotations">
                <Button variant="outline" className="w-full">
                  View All Quotations
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}