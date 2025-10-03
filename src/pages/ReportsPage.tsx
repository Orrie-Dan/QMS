import { useStore } from "../lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Users, 
  FileText, 
  DollarSign, 
  Clock, 
  Target,
  PieChart as PieChartIcon,
  BarChart,
  LineChart,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity
} from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart as RechartsLineChart, Line, ResponsiveContainer } from "recharts"
import { generateReportsPDF, generateReportsPDFModern, generateAnalyticsPDF } from "../lib/pdfUtils"
import { calculateAnalytics, formatCurrency, formatPercentage, formatNumber } from "../lib/analytics"
import { generateExcelReport, generateQuotationsExcel, generateClientsExcel } from "../lib/excelUtils"

export default function ReportsPage() {
  const { quotations, clients, companySettings } = useStore()
  
  // Calculate comprehensive analytics
  const analytics = calculateAnalytics(quotations, clients)

  // Chart configurations
  const statusChartConfig = {
    count: {
      label: "Quotations",
    },
    status: {
      label: "Status",
    },
  }

  const revenueChartConfig = {
    revenue: {
      label: "Revenue",
    },
    month: {
      label: "Month",
    },
  }

  const clientChartConfig = {
    value: {
      label: "Revenue",
    },
    client: {
      label: "Client",
    },
  }

  // Colors for charts
  const statusColors = {
    draft: "#3b82f6", // blue
    sent: "#10b981", // green
    accepted: "#10b981", // green
    rejected: "#f59e0b", // amber
  }

  // Prepare data for charts
  const statusChartData = Object.entries(analytics.quotationsByStatus).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count,
    percentage: analytics.totalQuotations > 0 ? Math.round((count / analytics.totalQuotations) * 100) : 0
  }))

  const monthlyRevenueData = analytics.monthlyTrends.map(trend => ({
    month: trend.month,
    revenue: trend.revenue,
    quotations: trend.quotations,
    accepted: trend.accepted,
    rejected: trend.rejected
  }))

  const topClientsData = analytics.topClientsByValue.slice(0, 5).map(client => ({
    client: client.client.name,
    value: client.totalValue,
    quotations: client.quotationCount,
    acceptanceRate: client.acceptanceRate
  }))

  const categoryData = Object.entries(analytics.categoryBreakdown).map(([category, data]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    count: data.count,
    value: data.totalValue,
    averageValue: data.averageValue
  }))

  // Export functions
  const handleExportPDF = () => {
    generateAnalyticsPDF(quotations, clients, companySettings)
  }

  const handleExportExcel = () => {
    try {
      const filename = generateExcelReport(quotations, clients, companySettings)
      alert(`Excel report exported successfully as: ${filename}`)
    } catch (error) {
      console.error('Error exporting Excel report:', error)
      alert('Failed to export Excel report. Please try again.')
    }
  }

  const handleExportQuotationsExcel = () => {
    try {
      const filename = generateQuotationsExcel(quotations)
      alert(`Quotations exported successfully as: ${filename}`)
    } catch (error) {
      console.error('Error exporting quotations:', error)
      alert('Failed to export quotations. Please try again.')
    }
  }

  const handleExportClientsExcel = () => {
    try {
      const filename = generateClientsExcel(clients, quotations)
      alert(`Clients exported successfully as: ${filename}`)
    } catch (error) {
      console.error('Error exporting clients:', error)
      alert('Failed to export clients. Please try again.')
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your quotation business</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button className="flex items-center" onClick={handleExportExcel}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-t-4 border-sky-400">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-sky-500/10 rounded-lg">
                <FileText className="h-6 w-6 text-sky-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Quotations</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.totalQuotations)}</p>
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
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
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
                <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.totalClients)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-t-4 border-amber-400">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Target className="h-6 w-6 text-amber-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{formatPercentage(analytics.conversionRate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-t-4 border-purple-400">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Quotation Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.averageQuotationValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-t-4 border-green-400">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accepted Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.acceptedRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-t-4 border-red-400">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lost Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.rejectedRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-t-4 border-orange-400">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.averageResponseTime.toFixed(1)} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quotation Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Quotation Status
                </CardTitle>
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

            {/* Monthly Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Monthly Revenue Trend
                </CardTitle>
                <CardDescription>Revenue and quotations over time</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyRevenueData.length === 0 ? (
                  <div className="text-center py-8">
                    <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No data yet</h3>
                    <p className="text-gray-600">Create some quotations to see trends</p>
                  </div>
                ) : (
                  <ChartContainer config={revenueChartConfig} className="h-[300px]">
                    <RechartsLineChart data={monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                    </RechartsLineChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Currency Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Currency Breakdown
                </CardTitle>
                <CardDescription>Revenue distribution by currency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.currencyBreakdown).map(([currency, amount]) => (
                    <div key={currency} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="font-medium">{currency}</span>
                      </div>
                      <span className="font-bold">{formatCurrency(amount, currency)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tax & Discount Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Tax & Discount Summary
                </CardTitle>
                <CardDescription>Financial adjustments overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Total Tax Collected</span>
                    <span className="font-bold text-green-600">{formatCurrency(analytics.taxSummary.totalTax)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Average Tax Rate</span>
                    <span className="font-bold">{formatPercentage(analytics.taxSummary.averageTaxRate)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Total Discounts Given</span>
                    <span className="font-bold text-red-600">{formatCurrency(analytics.discountSummary.totalDiscounts)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Average Discount</span>
                    <span className="font-bold">{formatCurrency(analytics.discountSummary.averageDiscount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Clients by Revenue */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top Clients by Revenue
                </CardTitle>
                <CardDescription>Your most valuable clients</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.topClientsByValue.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No data yet</h3>
                    <p className="text-gray-600">Create some quotations to see client analytics</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analytics.topClientsByValue.slice(0, 5).map((client, index) => (
                      <div key={client.client.id} className="flex items-center justify-between p-4 border rounded-lg bg-white/60 backdrop-blur-sm border-l-4 border-sky-400 hover:bg-sky-500/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-sky-500/10 rounded-full flex items-center justify-center text-sm font-medium text-sky-600">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-medium">{client.client.name}</h3>
                            <p className="text-sm text-muted-foreground">{client.client.company}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(client.totalValue)}</p>
                          <p className="text-sm text-muted-foreground">{client.quotationCount} quotations</p>
                          <p className="text-xs text-muted-foreground">{formatPercentage(client.acceptanceRate)} acceptance</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Client Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Client Revenue Comparison
                </CardTitle>
                <CardDescription>Top 5 clients by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                {topClientsData.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No data yet</h3>
                    <p className="text-gray-600">Create some quotations to see client performance</p>
                  </div>
                ) : (
                  <ChartContainer config={clientChartConfig} className="h-[300px]">
                    <RechartsBarChart data={topClientsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="client" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </RechartsBarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Inactive Clients */}
          {analytics.inactiveClients.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Inactive Clients
                </CardTitle>
                <CardDescription>Clients with no quotations in the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.inactiveClients.map((client) => (
                    <div key={client.id} className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                      <h3 className="font-medium">{client.name}</h3>
                      <p className="text-sm text-muted-foreground">{client.company}</p>
                      <p className="text-xs text-amber-600 mt-2">No activity in 6+ months</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Quoted Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Most Quoted Items
                </CardTitle>
                <CardDescription>Top items by quotation frequency</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.mostQuotedItems.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No data yet</h3>
                    <p className="text-gray-600">Create some quotations to see product analytics</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analytics.mostQuotedItems.slice(0, 5).map((item, index) => (
                      <div key={item.item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-medium">{item.item.description}</h3>
                            <p className="text-sm text-muted-foreground">{item.item.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{item.count} times</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(item.averagePrice)} avg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Category Breakdown
                </CardTitle>
                <CardDescription>Revenue by product category</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryData.length === 0 ? (
                  <div className="text-center py-8">
                    <PieChartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No data yet</h3>
                    <p className="text-gray-600">Create some quotations to see category breakdown</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {categoryData.map((category) => (
                      <div key={category.category} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-purple-500" />
                          <span className="font-medium">{category.category}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(category.value)}</p>
                          <p className="text-sm text-muted-foreground">{category.count} items</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Monthly Trends
                </CardTitle>
                <CardDescription>Quotations and revenue by month</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyRevenueData.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No data yet</h3>
                    <p className="text-gray-600">Create some quotations to see trends</p>
                  </div>
                ) : (
                  <ChartContainer config={revenueChartConfig} className="h-[300px]">
                    <RechartsBarChart data={monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="quotations" fill="#3b82f6" name="Quotations" />
                      <Bar dataKey="accepted" fill="#10b981" name="Accepted" />
                      <Bar dataKey="rejected" fill="#f59e0b" name="Rejected" />
                    </RechartsBarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Seasonal Demand */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Seasonal Demand
                </CardTitle>
                <CardDescription>Quotation activity by quarter</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.seasonalDemand).map(([quarter, count]) => (
                    <div key={quarter} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{quarter}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(count / Math.max(...Object.values(analytics.seasonalDemand))) * 100}%` }}
                          />
                        </div>
                        <span className="font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Quotations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Quotations
                </CardTitle>
                <CardDescription>Quotations awaiting client response</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.pendingQuotations.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pending quotations</h3>
                    <p className="text-gray-600">All quotations have been processed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analytics.pendingQuotations.slice(0, 5).map((quotation) => (
                      <div key={quotation.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{quotation.quotationNumber}</h3>
                          <p className="text-sm text-muted-foreground">{quotation.clientName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(quotation.total, quotation.currency || 'USD')}</p>
                          <p className="text-sm text-muted-foreground">Valid until {quotation.validUntil}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expiring Soon */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Expiring Soon
                </CardTitle>
                <CardDescription>Quotations expiring within 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.expiringSoon.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No expiring quotations</h3>
                    <p className="text-gray-600">All quotations are valid</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analytics.expiringSoon.map((quotation) => (
                      <div key={quotation.id} className="flex items-center justify-between p-3 border rounded-lg bg-amber-50 border-amber-200">
                        <div>
                          <h3 className="font-medium">{quotation.quotationNumber}</h3>
                          <p className="text-sm text-muted-foreground">{quotation.clientName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(quotation.total, quotation.currency || 'USD')}</p>
                          <p className="text-sm text-amber-600">Expires {quotation.validUntil}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pipeline Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Pipeline Summary
              </CardTitle>
              <CardDescription>Revenue forecast and pipeline value</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Expected Revenue</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(analytics.expectedRevenue)}</p>
                  <p className="text-xs text-muted-foreground">From accepted quotations</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(analytics.pipelineValue)}</p>
                  <p className="text-xs text-muted-foreground">From pending quotations</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Total Potential</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(analytics.expectedRevenue + analytics.pipelineValue)}</p>
                  <p className="text-xs text-muted-foreground">Combined value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}