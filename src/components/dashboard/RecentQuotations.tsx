import { useStore } from "../../lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { FileText, Eye } from "lucide-react"

export default function RecentQuotations() {
  const { quotations } = useStore()

  const recentQuotations = quotations
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

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
            {recentQuotations.map((quotation) => (
              <div
                key={quotation.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-gray-600" />
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
                  <Badge className={getStatusColor(quotation.status)}>
                    {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                  </Badge>
                  <span className="font-medium text-gray-900">
                    ${quotation.total.toLocaleString()}
                  </span>
                  <Link to={`/quotations/${quotation.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
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