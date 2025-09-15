"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Download, TrendingUp, DollarSign, FileText } from "lucide-react"

const statusColors = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-chart-4/20 text-chart-4",
  accepted: "bg-chart-3/20 text-chart-3",
  rejected: "bg-destructive/20 text-destructive",
}

export default function ReportsPage() {
  const { quotations, clients } = useStore()
  const [dateRange, setDateRange] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Filter quotations based on selected criteria
  const filteredQuotations = quotations.filter((quotation) => {
    // Status filter
    if (statusFilter !== "all" && quotation.status !== statusFilter) {
      return false
    }

    // Date filter
    if (dateRange !== "all") {
      const quotationDate = new Date(quotation.createdAt)
      const now = new Date()

      switch (dateRange) {
        case "7days":
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          if (quotationDate < sevenDaysAgo) return false
          break
        case "30days":
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          if (quotationDate < thirtyDaysAgo) return false
          break
        case "90days":
          const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          if (quotationDate < ninetyDaysAgo) return false
          break
        case "custom":
          if (startDate && quotationDate < new Date(startDate)) return false
          if (endDate && quotationDate > new Date(endDate)) return false
          break
      }
    }

    return true
  })

  // Calculate metrics
  const metrics = {
    totalQuotations: filteredQuotations.length,
    totalValue: filteredQuotations.reduce((sum, q) => sum + q.total, 0),
    acceptedQuotations: filteredQuotations.filter((q) => q.status === "accepted"),
    rejectedQuotations: filteredQuotations.filter((q) => q.status === "rejected"),
    pendingQuotations: filteredQuotations.filter((q) => q.status === "sent"),
    draftQuotations: filteredQuotations.filter((q) => q.status === "draft"),
  }

  const acceptedValue = metrics.acceptedQuotations.reduce((sum, q) => sum + q.total, 0)
  const conversionRate =
    metrics.totalQuotations > 0 ? (metrics.acceptedQuotations.length / metrics.totalQuotations) * 100 : 0
  const averageQuotationValue = metrics.totalQuotations > 0 ? metrics.totalValue / metrics.totalQuotations : 0

  // Client performance
  const clientPerformance = clients
    .map((client) => {
      const clientQuotations = filteredQuotations.filter((q) => q.clientId === client.id)
      const clientAccepted = clientQuotations.filter((q) => q.status === "accepted")
      const clientValue = clientQuotations.reduce((sum, q) => sum + q.total, 0)
      const clientAcceptedValue = clientAccepted.reduce((sum, q) => sum + q.total, 0)

      return {
        client,
        quotations: clientQuotations.length,
        totalValue: clientValue,
        acceptedValue: clientAcceptedValue,
        conversionRate: clientQuotations.length > 0 ? (clientAccepted.length / clientQuotations.length) * 100 : 0,
      }
    })
    .filter((cp) => cp.quotations > 0)
    .sort((a, b) => b.totalValue - a.totalValue)

  const handleExport = () => {
    // Mock export functionality
    const csvContent = [
      ["Quotation Number", "Client", "Status", "Total", "Created Date"],
      ...filteredQuotations.map((q) => [
        q.quotationNumber,
        q.clientName,
        q.status,
        q.total.toString(),
        new Date(q.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `quotations-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Reports</h1>
            <p className="text-muted-foreground">Analyze your quotation performance and trends</p>
          </div>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateRange === "custom" && (
                <>
                  <div>
                    <Label>Start Date</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </>
              )}

              <div>
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm border-t-4 border-sky-400">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Quotations</CardTitle>
              <div className="p-2 rounded-lg bg-sky-500/10">
                <FileText className="h-4 w-4 text-sky-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalQuotations}</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-t-4 border-emerald-400">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.totalValue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-t-4 border-amber-400">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <TrendingUp className="h-4 w-4 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {metrics.acceptedQuotations.length} of {metrics.totalQuotations} accepted
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-t-4 border-indigo-400">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Quotation Value</CardTitle>
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <TrendingUp className="h-4 w-4 text-indigo-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${averageQuotationValue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Status Breakdown */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-chart-3 rounded-full"></div>
                    <span>Accepted</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{metrics.acceptedQuotations.length}</p>
                    <p className="text-sm text-muted-foreground">${acceptedValue.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-chart-4 rounded-full"></div>
                    <span>Pending</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{metrics.pendingQuotations.length}</p>
                    <p className="text-sm text-muted-foreground">
                      ${metrics.pendingQuotations.reduce((sum, q) => sum + q.total, 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
                    <span>Draft</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{metrics.draftQuotations.length}</p>
                    <p className="text-sm text-muted-foreground">
                      ${metrics.draftQuotations.reduce((sum, q) => sum + q.total, 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-destructive rounded-full"></div>
                    <span>Rejected</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{metrics.rejectedQuotations.length}</p>
                    <p className="text-sm text-muted-foreground">
                      ${metrics.rejectedQuotations.reduce((sum, q) => sum + q.total, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Clients */}
          <Card>
            <CardHeader>
              <CardTitle>Top Clients by Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientPerformance.slice(0, 5).map((cp, index) => (
                  <div key={cp.client.id} className="flex items-center justify-between p-4 border rounded-lg bg-white/60 backdrop-blur-sm border-l-4 border-sky-400 hover:bg-sky-500/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-sky-500/10 rounded-full flex items-center justify-center text-sm font-medium text-sky-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{cp.client.name}</p>
                        <p className="text-sm text-muted-foreground">{cp.client.company}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${cp.totalValue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{cp.quotations} quotations</p>
                    </div>
                  </div>
                ))}
                {clientPerformance.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No client data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Quotations */}
        <Card>
          <CardHeader>
            <CardTitle>Filtered Quotations ({filteredQuotations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredQuotations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No quotations match your filters</p>
              ) : (
                filteredQuotations
                  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .slice(0, 10)
                  .map((quotation) => (
                    <div key={quotation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{quotation.quotationNumber}</h4>
                          <Badge className={statusColors[quotation.status]}>
                            {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{quotation.clientName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${quotation.total.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(quotation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
