import { useStore } from "../lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Download, TrendingUp, Users, FileText, DollarSign } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell } from "recharts"
import { generateReportsPDF } from "../lib/pdfUtils"

export default function ReportsPage() {
  const { quotations, clients } = useStore()

  // Calculate statistics
  const totalQuotations = quotations.length
  const totalClients = clients.length
  const totalRevenue = quotations.reduce((sum, q) => sum + q.total, 0)
  const averageQuotationValue = totalQuotations > 0 ? totalRevenue / totalQuotations : 0

  const quotationsByStatus = quotations.reduce((acc, q) => {
    acc[q.status] = (acc[q.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const quotationsByMonth = quotations.reduce((acc, q) => {
    const month = new Date(q.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Prepare data for charts
  const statusChartData = Object.entries(quotationsByStatus).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count,
    percentage: totalQuotations > 0 ? Math.round((count / totalQuotations) * 100) : 0
  }))

  // Chart configurations
  const statusChartConfig = {
    count: {
      label: "Quotations",
    },
    status: {
      label: "Status",
    },
  }

  // Colors for status chart
  const statusColors = {
    draft: "#3b82f6", // blue
    sent: "#10b981", // green
    accepted: "#10b981", // green
    rejected: "#f59e0b", // amber
  }

  const topClients = clients.map(client => {
    const clientQuotations = quotations.filter(q => q.clientId === client.id)
    const totalValue = clientQuotations.reduce((sum, q) => sum + q.total, 0)
    return {
      ...client,
      quotationCount: clientQuotations.length,
      totalValue
    }
  }).sort((a, b) => b.totalValue - a.totalValue).slice(0, 5)

  // Export report function
  const handleExportReport = () => {
    generateReportsPDF(quotations, clients)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Insights into your quotation business</p>
        </div>
        <Button className="flex items-center" onClick={handleExportReport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-t-4 border-sky-400">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-sky-500/10 rounded-lg">
                <FileText className="h-6 w-6 text-sky-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Quotations</p>
                <p className="text-2xl font-bold text-gray-900">{totalQuotations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-t-4 border-emerald-400">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-t-4 border-indigo-400">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Users className="h-6 w-6 text-indigo-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-t-4 border-amber-400">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-amber-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Quotation</p>
                <p className="text-2xl font-bold text-gray-900">${averageQuotationValue.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quotation Status and Monthly Quotations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quotation Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Quotation Status</CardTitle>
            <CardDescription>Breakdown of quotations by status</CardDescription>
          </CardHeader>
          <CardContent>
            {statusChartData.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No data yet</h3>
                <p className="text-gray-600">Create some quotations to see status breakdown</p>
              </div>
            ) : (
              <div className="space-y-4">
                <ChartContainer config={statusChartConfig} className="h-[300px]">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie data={statusChartData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={2}>
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={statusColors[entry.status.toLowerCase() as keyof typeof statusColors] || "#6b7280"} />
                      ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {statusChartData.map((entry) => (
                    <div key={entry.status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors[entry.status.toLowerCase() as keyof typeof statusColors] || "#6b7280" }} />
                        <span className="text-gray-600">{entry.status}</span>
                      </div>
                      <span className="font-medium">{entry.count} ({entry.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Quotations */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Quotations</CardTitle>
            <CardDescription>Quotations created by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(quotationsByMonth)
                .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                .map(([month, count]) => (
                  <div key={month} className="flex items-center justify-between">
                    <p className="font-medium">{month}</p>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                      <p className="text-sm text-gray-600">quotations</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Clients (restored position after the grid) */}
      <Card>
        <CardHeader>
          <CardTitle>Top Clients by Revenue</CardTitle>
          <CardDescription>Your most valuable clients</CardDescription>
        </CardHeader>
        <CardContent>
          {topClients.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No data yet</h3>
              <p className="text-gray-600">Create some quotations to see client analytics</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topClients.map((client, index) => (
                <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg bg-white/60 backdrop-blur-sm border-l-4 border-sky-400 hover:bg-sky-500/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-sky-500/10 rounded-full flex items-center justify-center text-sm font-medium text-sky-600">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium">{client.name}</h3>
                      <p className="text-sm text-muted-foreground">{client.company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${client.totalValue.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{client.quotationCount} quotations</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}