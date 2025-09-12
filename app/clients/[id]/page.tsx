"use client"

import { useParams, useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Mail, Phone, Building, MapPin, Plus, Eye } from "lucide-react"
import Link from "next/link"

const statusColors = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-chart-4/20 text-chart-4",
  accepted: "bg-chart-3/20 text-chart-3",
  rejected: "bg-destructive/20 text-destructive",
}

export default function ClientProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { clients, quotations } = useStore()

  const client = clients.find((c) => c.id === params.id)
  const clientQuotations = quotations.filter((q) => q.clientId === params.id)

  if (!client) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Client not found</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </MainLayout>
    )
  }

  const stats = {
    totalQuotations: clientQuotations.length,
    totalValue: clientQuotations.reduce((sum, q) => sum + q.total, 0),
    acceptedQuotations: clientQuotations.filter((q) => q.status === "accepted"),
    pendingQuotations: clientQuotations.filter((q) => q.status === "sent"),
    draftQuotations: clientQuotations.filter((q) => q.status === "draft"),
    rejectedQuotations: clientQuotations.filter((q) => q.status === "rejected"),
  }

  const acceptedValue = stats.acceptedQuotations.reduce((sum, q) => sum + q.total, 0)
  const conversionRate =
    stats.totalQuotations > 0 ? Math.round((stats.acceptedQuotations.length / stats.totalQuotations) * 100) : 0

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{client.name}</h1>
              {client.company && (
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <Building className="h-4 w-4" />
                  {client.company}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/quotations/new?clientId=${client.id}`}>
                <Plus className="mr-2 h-4 w-4" />
                New Quotation
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/clients/${client.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Client
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{client.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{client.phone}</p>
                    </div>
                  </div>
                </div>

                {client.address && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{client.address}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quotation History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Quotation History</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/quotations/new?clientId=${client.id}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Quotation
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {clientQuotations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No quotations yet</p>
                    <Button className="mt-4" asChild>
                      <Link href={`/quotations/new?clientId=${client.id}`}>Create First Quotation</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clientQuotations
                      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                      .map((quotation) => (
                        <div key={quotation.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium">{quotation.quotationNumber}</h4>
                              <Badge className={statusColors[quotation.status]}>
                                {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>${quotation.total.toLocaleString()}</span>
                              <span>•</span>
                              <span>{new Date(quotation.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/quotations/${quotation.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Client Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{stats.totalQuotations}</p>
                    <p className="text-sm text-muted-foreground">Total Quotations</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{conversionRate}%</p>
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Value</span>
                    <span className="font-medium">${stats.totalValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Accepted Value</span>
                    <span className="font-medium text-chart-3">${acceptedValue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Accepted</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{stats.acceptedQuotations.length}</span>
                    <div className="w-2 h-2 bg-chart-3 rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pending</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{stats.pendingQuotations.length}</span>
                    <div className="w-2 h-2 bg-chart-4 rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Draft</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{stats.draftQuotations.length}</span>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Rejected</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{stats.rejectedQuotations.length}</span>
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Details */}
            <Card>
              <CardHeader>
                <CardTitle>Client Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Client Since</p>
                  <p className="font-medium">{new Date(client.createdAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
