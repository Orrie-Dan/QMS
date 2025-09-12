import { useParams, useNavigate } from "react-router-dom"
import { useStore } from "../lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Building } from "lucide-react"

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { clients, quotations, deleteClient } = useStore()

  const client = clients.find((c) => c.id === id)
  const clientQuotations = quotations.filter((q) => q.clientId === id)

  if (!client) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Client not found</h1>
          <p className="text-gray-600 mt-2">The client you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/clients")} className="mt-4">
            Back to Clients
          </Button>
        </div>
      </div>
    )
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${client.name}?`)) {
      deleteClient(client.id)
      navigate("/clients")
    }
  }

  const totalQuotationValue = clientQuotations.reduce((sum, q) => sum + q.total, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/clients")}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-600">Client Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/clients/${client.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{client.email}</p>
                  <p className="text-sm text-gray-600">Email Address</p>
                </div>
              </div>
              {client.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{client.phone}</p>
                    <p className="text-sm text-gray-600">Phone Number</p>
                  </div>
                </div>
              )}
              {client.address && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{client.address}</p>
                    <p className="text-sm text-gray-600">Address</p>
                  </div>
                </div>
              )}
              {client.company && (
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{client.company}</p>
                    <p className="text-sm text-gray-600">Company</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quotations */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Quotations</CardTitle>
              <CardDescription>
                Quotations sent to this client
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clientQuotations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No quotations sent to this client yet</p>
                  <Button
                    className="mt-4"
                    onClick={() => navigate("/quotations/new")}
                  >
                    Create Quotation
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {clientQuotations.map((quotation) => (
                    <div
                      key={quotation.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <h3 className="font-medium">{quotation.quotationNumber}</h3>
                        <p className="text-sm text-gray-600">
                          {quotation.items.length} items • ${quotation.total.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={
                            quotation.status === "draft"
                              ? "bg-gray-100 text-gray-800"
                              : quotation.status === "sent"
                              ? "bg-blue-100 text-blue-800"
                              : quotation.status === "accepted"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/quotations/${quotation.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Client Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Quotations:</span>
                <span className="font-medium">{clientQuotations.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Value:</span>
                <span className="font-medium">${totalQuotationValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Client Since:</span>
                <span className="font-medium">
                  {new Date(client.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full justify-start"
                onClick={() => navigate("/quotations/new")}
              >
                Create Quotation
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(`/clients/${client.id}/edit`)}
              >
                Edit Client
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}