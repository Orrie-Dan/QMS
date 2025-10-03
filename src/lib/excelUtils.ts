import * as XLSX from 'xlsx'
import { Quotation, Client, CompanySettings } from './store'
import { calculateAnalytics } from './analytics'
import { formatCurrency, formatPercentage } from './analytics'

// Type for UI quotations (simplified version from API)
export interface UIQuotation {
  id: string
  quotationNumber: string
  clientId: string
  clientName: string
  status: "draft" | "sent" | "accepted" | "rejected" | "expired"
  currency: "RWF" | "USD" | "EUR"
  total: number
  validUntil: string
  createdAt: string
}

export interface ExcelExportData {
  quotations: Quotation[]
  clients: Client[]
  companySettings: CompanySettings
}

export const generateExcelReport = (quotations: Quotation[], clients: Client[], companySettings: CompanySettings) => {
  const analytics = calculateAnalytics(quotations, clients)
  
  // Create a new workbook
  const workbook = XLSX.utils.book_new()
  
  // Helper function to format dates
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  // Helper function to format currency with proper symbols
  const formatCurrencyWithSymbol = (amount: number, currency: string = 'RWF') => {
    const symbols = { RWF: 'RWF', USD: '$', EUR: '€' }
    const symbol = symbols[currency as keyof typeof symbols] || currency
    return `${symbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  
  // 1. Executive Summary Sheet
  const summaryData = [
    ['QUOTATION MANAGEMENT SYSTEM - EXECUTIVE SUMMARY'],
    [''],
    ['Report Generated:', formatDate(new Date())],
    ['Company:', companySettings.name || 'N/A'],
    ['Company Address:', companySettings.address || 'N/A'],
    ['Company Email:', companySettings.email || 'N/A'],
    ['Company Phone:', companySettings.phone || 'N/A'],
    [''],
    ['PERFORMANCE OVERVIEW'],
    ['Total Quotations', analytics.totalQuotations],
    ['Active Quotations', analytics.quotationsByStatus.sent + analytics.quotationsByStatus.accepted],
    ['Draft Quotations', analytics.quotationsByStatus.draft],
    ['Accepted Quotations', analytics.quotationsByStatus.accepted],
    ['Rejected Quotations', analytics.quotationsByStatus.rejected],
    [''],
    ['FINANCIAL PERFORMANCE'],
    ['Total Revenue', formatCurrency(analytics.totalRevenue)],
    ['Accepted Revenue', formatCurrency(analytics.acceptedRevenue)],
    ['Rejected Revenue', formatCurrency(analytics.rejectedRevenue)],
    ['Conversion Rate', formatPercentage(analytics.conversionRate)],
    ['Average Quotation Value', formatCurrency(analytics.averageQuotationValue)],
    ['Highest Quotation Value', formatCurrency(Math.max(...quotations.map(q => q.total)))],
    ['Lowest Quotation Value', formatCurrency(Math.min(...quotations.map(q => q.total)))],
    [''],
    ['CLIENT INSIGHTS'],
    ['Total Active Clients', analytics.totalClients],
    ['New Clients (Last 30 days)', clients.filter(c => {
      const clientDate = new Date(c.createdAt)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return clientDate > thirtyDaysAgo
    }).length],
    ['Average Quotations per Client', (analytics.totalQuotations / analytics.totalClients).toFixed(1)],
    ['Average Response Time', `${analytics.averageResponseTime} days`],
    [''],
    ['TAX & DISCOUNT ANALYSIS'],
    ['Total Tax Collected', formatCurrency(analytics.taxSummary.totalTax)],
    ['Average Tax Rate', formatPercentage(analytics.taxSummary.averageTaxRate)],
    ['Total Discounts Given', formatCurrency(analytics.discountSummary.totalDiscounts)],
    ['Average Discount per Quotation', formatCurrency(analytics.discountSummary.averageDiscount)],
    ['Discount Impact on Revenue', formatPercentage((analytics.discountSummary.totalDiscounts / analytics.totalRevenue) * 100)],
    [''],
    ['CURRENCY BREAKDOWN'],
    ...Object.entries(analytics.currencyBreakdown).map(([currency, amount]) => [
      `${currency} Revenue`, formatCurrencyWithSymbol(amount, currency)
    ]),
    [''],
    ['BUSINESS RECOMMENDATIONS'],
    ['1. Focus on converting sent quotations to accepted status'],
    ['2. Follow up on quotations approaching expiry date'],
    ['3. Analyze rejected quotations for improvement opportunities'],
    ['4. Consider offering discounts to improve conversion rates'],
    ['5. Maintain strong relationships with top-performing clients']
  ]
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')
  
  // 2. Quotations by Status - Enhanced
  const statusData = [
    ['QUOTATION STATUS ANALYSIS'],
    [''],
    ['Status', 'Count', 'Percentage', 'Revenue', 'Avg Value', 'Trend'],
    ['Draft', String(analytics.quotationsByStatus.draft), 
     `${((analytics.quotationsByStatus.draft / analytics.totalQuotations) * 100).toFixed(1)}%`,
     formatCurrency(quotations.filter(q => q.status === 'draft').reduce((sum, q) => sum + q.total, 0)),
     formatCurrency(quotations.filter(q => q.status === 'draft').reduce((sum, q) => sum + q.total, 0) / analytics.quotationsByStatus.draft || 0),
     'Needs Action'],
    ['Sent', String(analytics.quotationsByStatus.sent),
     `${((analytics.quotationsByStatus.sent / analytics.totalQuotations) * 100).toFixed(1)}%`,
     formatCurrency(quotations.filter(q => q.status === 'sent').reduce((sum, q) => sum + q.total, 0)),
     formatCurrency(quotations.filter(q => q.status === 'sent').reduce((sum, q) => sum + q.total, 0) / analytics.quotationsByStatus.sent || 0),
     'Follow Up'],
    ['Accepted', String(analytics.quotationsByStatus.accepted),
     `${((analytics.quotationsByStatus.accepted / analytics.totalQuotations) * 100).toFixed(1)}%`,
     formatCurrency(quotations.filter(q => q.status === 'accepted').reduce((sum, q) => sum + q.total, 0)),
     formatCurrency(quotations.filter(q => q.status === 'accepted').reduce((sum, q) => sum + q.total, 0) / analytics.quotationsByStatus.accepted || 0),
     'Success'],
    ['Rejected', String(analytics.quotationsByStatus.rejected),
     `${((analytics.quotationsByStatus.rejected / analytics.totalQuotations) * 100).toFixed(1)}%`,
     formatCurrency(quotations.filter(q => q.status === 'rejected').reduce((sum, q) => sum + q.total, 0)),
     formatCurrency(quotations.filter(q => q.status === 'rejected').reduce((sum, q) => sum + q.total, 0) / analytics.quotationsByStatus.rejected || 0),
     'Review Needed'],
    [''],
    ['TOTAL', String(analytics.totalQuotations), '100.0%', formatCurrency(analytics.totalRevenue), 
     formatCurrency(analytics.averageQuotationValue), 'Overall Performance']
  ]
  
  const statusSheet = XLSX.utils.aoa_to_sheet(statusData)
  XLSX.utils.book_append_sheet(workbook, statusSheet, 'Quotations by Status')
  
  // 3. Monthly Trends - Enhanced
  const monthlyData = [
    ['MONTHLY PERFORMANCE TRENDS'],
    [''],
    ['Month', 'Revenue', 'Quotations', 'Accepted', 'Rejected', 'Conversion Rate', 'Avg Value', 'Growth Rate'],
    ...analytics.monthlyTrends.map((trend, index) => {
      const conversionRate = trend.quotations > 0 ? (trend.accepted / trend.quotations) * 100 : 0
      const avgValue = trend.quotations > 0 ? trend.revenue / trend.quotations : 0
      const prevMonth = index > 0 ? analytics.monthlyTrends[index - 1] : null
      const growthRate = prevMonth && prevMonth.revenue > 0 
        ? ((trend.revenue - prevMonth.revenue) / prevMonth.revenue) * 100 
        : 0
      
      return [
        trend.month,
        formatCurrency(trend.revenue),
        trend.quotations,
        trend.accepted,
        trend.rejected,
        `${conversionRate.toFixed(1)}%`,
        formatCurrency(avgValue),
        growthRate > 0 ? `+${growthRate.toFixed(1)}%` : `${growthRate.toFixed(1)}%`
      ]
    }),
    [''],
    ['YEAR-TO-DATE TOTALS'],
    ['Total Revenue', formatCurrency(analytics.monthlyTrends.reduce((sum, t) => sum + t.revenue, 0))],
    ['Total Quotations', analytics.monthlyTrends.reduce((sum, t) => sum + t.quotations, 0)],
    ['Total Accepted', analytics.monthlyTrends.reduce((sum, t) => sum + t.accepted, 0)],
    ['Overall Conversion Rate', `${((analytics.monthlyTrends.reduce((sum, t) => sum + t.accepted, 0) / analytics.monthlyTrends.reduce((sum, t) => sum + t.quotations, 0)) * 100).toFixed(1)}%`]
  ]
  
  const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData)
  XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly Trends')
  
  // 4. Top Clients - Enhanced
  const topClientsData = [
    ['TOP CLIENTS PERFORMANCE ANALYSIS'],
    [''],
    ['Rank', 'Client Name', 'Company', 'Total Value', 'Quotations', 'Acceptance Rate', 'Avg Value', 'Last Quotation', 'Email', 'Phone', 'Client Type'],
    ...analytics.topClientsByValue.map((client, index) => {
      const avgValue = client.quotationCount > 0 ? client.totalValue / client.quotationCount : 0
      const clientQuotations = quotations.filter(q => q.clientId === client.client.id)
      const lastQuotation = clientQuotations.length > 0 
        ? formatDate(new Date(Math.max(...clientQuotations.map(q => new Date(q.createdAt).getTime()))))
        : 'N/A'
      
      return [
        index + 1,
        client.client.name,
        client.client.company || 'Individual',
        formatCurrency(client.totalValue),
        client.quotationCount,
        formatPercentage(client.acceptanceRate),
        formatCurrency(avgValue),
        lastQuotation,
        client.client.email,
        client.client.phone,
        'N/A'
      ]
    }),
    [''],
    ['CLIENT PERFORMANCE INSIGHTS'],
    ['Total Client Revenue', formatCurrency(analytics.topClientsByValue.reduce((sum, c) => sum + c.totalValue, 0))],
    ['Average Revenue per Client', formatCurrency(analytics.topClientsByValue.reduce((sum, c) => sum + c.totalValue, 0) / analytics.topClientsByValue.length)],
    ['Highest Performing Client', analytics.topClientsByValue[0]?.client.name || 'N/A'],
    ['Most Active Client', analytics.topClientsByValue.reduce((max, client) => 
      client.quotationCount > max.quotationCount ? client : max, analytics.topClientsByValue[0] || { quotationCount: 0 }
    ).client.name || 'N/A']
  ]
  
  const topClientsSheet = XLSX.utils.aoa_to_sheet(topClientsData)
  XLSX.utils.book_append_sheet(workbook, topClientsSheet, 'Top Clients')
  
  // 5. Category Breakdown
  const categoryData = [
    ['Category', 'Count', 'Total Value', 'Average Value']
  ]
  
  Object.entries(analytics.categoryBreakdown).forEach(([category, data]) => {
    categoryData.push([
      category.charAt(0).toUpperCase() + category.slice(1),
      String(data.count),
      formatCurrency(data.totalValue),
      formatCurrency(data.averageValue)
    ])
  })
  
  const categorySheet = XLSX.utils.aoa_to_sheet(categoryData)
  XLSX.utils.book_append_sheet(workbook, categorySheet, 'Category Breakdown')
  
  // 6. Detailed Quotations - Enhanced
  const quotationsData = [
    ['DETAILED QUOTATIONS ANALYSIS'],
    [''],
    [
      'Quotation Number',
      'Client Name',
      'Status',
      'Created Date',
      'Valid Until',
      'Days to Expiry',
      'Subtotal',
      'Tax Rate (%)',
      'Tax Amount',
      'Discount',
      'Total',
      'Currency',
      'Items Count',
      'Avg Item Value',
      'Notes',
      'Response Time (Days)'
    ]
  ]
  
  quotations.forEach(quotation => {
    const createdDate = new Date(quotation.createdAt)
    const validUntilDate = quotation.validUntil ? new Date(quotation.validUntil) : null
    const daysToExpiry = validUntilDate ? Math.ceil((validUntilDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
    const avgItemValue = quotation.items.length > 0 ? quotation.subtotal / quotation.items.length : 0
    
    // Calculate response time (simplified - would need actual response tracking)
    const responseTime = quotation.status !== 'draft' ? 
      Math.ceil((new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
    
    quotationsData.push([
      quotation.quotationNumber,
      quotation.clientName,
      quotation.status.toUpperCase(),
      formatDate(quotation.createdAt),
      quotation.validUntil ? formatDate(quotation.validUntil) : 'N/A',
      daysToExpiry !== null ? (daysToExpiry > 0 ? String(daysToExpiry) : 'EXPIRED') : 'N/A',
      formatCurrency(quotation.subtotal),
        String(quotation.taxRate),
      formatCurrency(quotation.taxAmount),
      formatCurrency(quotation.discount),
      formatCurrency(quotation.total),
      quotation.currency,
      String(quotation.items.length),
      formatCurrency(avgItemValue),
      quotation.notes || '',
      String(responseTime)
    ])
  })
  
  // Add summary statistics
  quotationsData.push([''])
  quotationsData.push(['QUOTATION SUMMARY STATISTICS'])
  quotationsData.push(['Total Quotations', String(quotations.length)])
  quotationsData.push(['Total Revenue', formatCurrency(quotations.reduce((sum, q) => sum + q.total, 0))])
  quotationsData.push(['Average Quotation Value', formatCurrency(quotations.reduce((sum, q) => sum + q.total, 0) / quotations.length)])
  quotationsData.push(['Total Items Quoted', String(quotations.reduce((sum, q) => sum + q.items.length, 0))])
  quotationsData.push(['Average Items per Quotation', (quotations.reduce((sum, q) => sum + q.items.length, 0) / quotations.length).toFixed(1)])
  
  const quotationsSheet = XLSX.utils.aoa_to_sheet(quotationsData)
  XLSX.utils.book_append_sheet(workbook, quotationsSheet, 'All Quotations')
  
  // 7. Client Details - Enhanced
  const clientData = [
    ['COMPREHENSIVE CLIENT ANALYSIS'],
    [''],
    [
      'Name',
      'Company',
      'Email',
      'Phone',
      'Address',
      'Client Type',
      'TIN Number',
      'Total Quotations',
      'Total Value',
      'Acceptance Rate',
      'Avg Quotation Value',
      'Last Quotation Date',
      'Client Since',
      'Status'
    ]
  ]
  
  clients.forEach(client => {
    const clientQuotations = quotations.filter(q => q.clientId === client.id)
    const totalValue = clientQuotations.reduce((sum, q) => sum + q.total, 0)
    const acceptedQuotations = clientQuotations.filter(q => q.status === 'accepted').length
    const acceptanceRate = clientQuotations.length > 0 ? (acceptedQuotations / clientQuotations.length) * 100 : 0
    const avgQuotationValue = clientQuotations.length > 0 ? totalValue / clientQuotations.length : 0
    const lastQuotationDate = clientQuotations.length > 0 
      ? formatDate(new Date(Math.max(...clientQuotations.map(q => new Date(q.createdAt).getTime()))))
      : 'N/A'
    const clientSince = formatDate(client.createdAt)
    
    // Determine client status based on activity
    const daysSinceLastQuotation = clientQuotations.length > 0 
      ? Math.ceil((new Date().getTime() - Math.max(...clientQuotations.map(q => new Date(q.createdAt).getTime()))) / (1000 * 60 * 60 * 24))
      : 999
    const status = daysSinceLastQuotation < 30 ? 'Active' : 
                   daysSinceLastQuotation < 90 ? 'Inactive' : 'Dormant'
    
    clientData.push([
      client.name,
      client.company || 'Individual',
      client.email,
      client.phone,
      client.address,
      'N/A',
      'N/A',
      String(clientQuotations.length),
      formatCurrency(totalValue),
      `${acceptanceRate.toFixed(1)}%`,
      formatCurrency(avgQuotationValue),
      lastQuotationDate,
      clientSince,
      status
    ])
  })
  
  // Add client insights
  clientData.push([''])
  clientData.push(['CLIENT INSIGHTS'])
  clientData.push(['Total Clients', String(clients.length)])
  clientData.push(['Active Clients', String(clients.filter(c => {
    const clientQuotations = quotations.filter(q => q.clientId === c.id)
    const daysSinceLastQuotation = clientQuotations.length > 0 
      ? Math.ceil((new Date().getTime() - Math.max(...clientQuotations.map(q => new Date(q.createdAt).getTime()))) / (1000 * 60 * 60 * 24))
      : 999
    return daysSinceLastQuotation < 30
  }).length)])
  clientData.push(['New Clients (Last 30 days)', String(clients.filter(c => {
    const clientDate = new Date(c.createdAt)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return clientDate > thirtyDaysAgo
  }).length)])
  
  const clientSheet = XLSX.utils.aoa_to_sheet(clientData)
  XLSX.utils.book_append_sheet(workbook, clientSheet, 'Client Details')
  
  // 8. Most Quoted Items
  const itemsData = [
    ['Item Description', 'Category', 'Count', 'Total Value', 'Average Price']
  ]
  
  analytics.mostQuotedItems.forEach(item => {
    itemsData.push([
      item.item.description,
      item.item.category || 'N/A',
      String(item.count),
      formatCurrency(item.totalValue),
      formatCurrency(item.averagePrice)
    ])
  })
  
  const itemsSheet = XLSX.utils.aoa_to_sheet(itemsData)
  XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Most Quoted Items')
  
  // 9. Business Insights & Recommendations
  const insightsData = [
    ['BUSINESS INSIGHTS & STRATEGIC RECOMMENDATIONS'],
    [''],
    ['PERFORMANCE ANALYSIS'],
    ['Current Conversion Rate', formatPercentage(analytics.conversionRate)],
    ['Industry Benchmark (Typical)', '15-25%'],
    ['Performance vs Benchmark', analytics.conversionRate > 20 ? 'Above Average' : 'Below Average'],
    [''],
    ['REVENUE OPTIMIZATION OPPORTUNITIES'],
    ['Total Potential Revenue (All Quotations)', formatCurrency(analytics.totalRevenue)],
    ['Lost Revenue (Rejected Quotations)', formatCurrency(analytics.rejectedRevenue)],
    ['Revenue Recovery Potential', formatCurrency(analytics.rejectedRevenue * 0.3)],
    [''],
    ['CLIENT RELATIONSHIP INSIGHTS'],
    ['Top 20% Clients Revenue Share', formatPercentage(
      analytics.topClientsByValue.slice(0, Math.ceil(analytics.topClientsByValue.length * 0.2))
        .reduce((sum, c) => sum + c.totalValue, 0) / analytics.totalRevenue * 100
    )],
    ['Client Retention Rate', formatPercentage(
      clients.filter(c => {
        const clientQuotations = quotations.filter(q => q.clientId === c.id)
        return clientQuotations.length > 1
      }).length / clients.length * 100
    )],
    [''],
    ['OPERATIONAL EFFICIENCY'],
    ['Average Quotation Processing Time', `${analytics.averageResponseTime} days`],
    ['Target Processing Time', '3-5 days'],
    ['Efficiency Rating', analytics.averageResponseTime <= 5 ? 'Good' : 'Needs Improvement'],
    [''],
    ['STRATEGIC RECOMMENDATIONS'],
    ['1. IMMEDIATE ACTIONS (Next 30 days)'],
    ['   • Follow up on all sent quotations older than 7 days'],
    ['   • Contact clients with rejected quotations to understand reasons'],
    ['   • Implement quotation expiry reminders'],
    ['   • Review and improve quotation templates'],
    [''],
    ['2. MEDIUM-TERM GOALS (Next 90 days)'],
    ['   • Implement client feedback system'],
    ['   • Create quotation templates for top-performing categories'],
    ['   • Develop client retention program'],
    ['   • Optimize pricing strategy based on acceptance rates'],
    [''],
    ['3. LONG-TERM STRATEGY (Next 6 months)'],
    ['   • Expand service offerings in high-conversion categories'],
    ['   • Develop automated follow-up system'],
    ['   • Create client loyalty program'],
    ['   • Implement advanced analytics dashboard'],
    [''],
    ['4. REVENUE GROWTH OPPORTUNITIES'],
    ['   • Focus on high-value clients for upselling'],
    ['   • Develop recurring service packages'],
    ['   • Implement dynamic pricing based on demand'],
    ['   • Create seasonal promotion strategies'],
    [''],
    ['5. RISK MITIGATION'],
    ['   • Diversify client base to reduce dependency on top clients'],
    ['   • Implement better quotation tracking and follow-up'],
    ['   • Create backup plans for key client relationships'],
    ['   • Monitor market trends and adjust pricing accordingly']
  ]
  
  const insightsSheet = XLSX.utils.aoa_to_sheet(insightsData)
  XLSX.utils.book_append_sheet(workbook, insightsSheet, 'Business Insights')
  
  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  const filename = `QMS_Enhanced_Analytics_Report_${timestamp}.xlsx`
  
  // Save the file
  XLSX.writeFile(workbook, filename)
  
  return filename
}

export const generateQuotationsExcel = (quotations: any[]) => {
  const workbook = XLSX.utils.book_new()
  
  // Helper function to format dates
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  // Check if we have full quotations or UI quotations
  const hasFullData = quotations.length > 0 && 'subtotal' in quotations[0]
  
  const quotationsData = [
    ['QUOTATIONS EXPORT REPORT'],
    ['Generated on:', formatDate(new Date())],
    ['Total Quotations:', quotations.length],
    [''],
    hasFullData ? [
      'Quotation Number',
      'Client Name',
      'Status',
      'Created Date',
      'Valid Until',
      'Days to Expiry',
      'Subtotal',
      'Tax Rate (%)',
      'Tax Amount',
      'Discount',
      'Total',
      'Currency',
      'Items Count',
      'Avg Item Value',
      'Notes'
    ] : [
      'Quotation Number',
      'Client Name',
      'Status',
      'Created Date',
      'Valid Until',
      'Days to Expiry',
      'Total',
      'Currency'
    ]
  ]
  
  quotations.forEach(quotation => {
    const isUIQuotation = 'total' in quotation && !('subtotal' in quotation)
    
    if (isUIQuotation) {
      const uiQuotation = quotation as UIQuotation
      const validUntilDate = uiQuotation.validUntil ? new Date(uiQuotation.validUntil) : null
      const daysToExpiry = validUntilDate ? Math.ceil((validUntilDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
      
      quotationsData.push([
        uiQuotation.quotationNumber,
        uiQuotation.clientName,
        uiQuotation.status.toUpperCase(),
        formatDate(uiQuotation.createdAt),
        uiQuotation.validUntil ? formatDate(uiQuotation.validUntil) : 'N/A',
        daysToExpiry !== null ? (daysToExpiry > 0 ? String(daysToExpiry) : 'EXPIRED') : 'N/A',
        formatCurrency(uiQuotation.total),
        uiQuotation.currency
      ])
    } else {
      const fullQuotation = quotation as Quotation
      const validUntilDate = fullQuotation.validUntil ? new Date(fullQuotation.validUntil) : null
      const daysToExpiry = validUntilDate ? Math.ceil((validUntilDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
      const avgItemValue = fullQuotation.items.length > 0 ? fullQuotation.subtotal / fullQuotation.items.length : 0
      
      quotationsData.push([
        fullQuotation.quotationNumber,
        fullQuotation.clientName,
        fullQuotation.status.toUpperCase(),
        formatDate(fullQuotation.createdAt),
        fullQuotation.validUntil ? formatDate(fullQuotation.validUntil) : 'N/A',
        daysToExpiry !== null ? (daysToExpiry > 0 ? String(daysToExpiry) : 'EXPIRED') : 'N/A',
        formatCurrency(fullQuotation.subtotal),
        fullQuotation.taxRate,
        formatCurrency(fullQuotation.taxAmount),
        formatCurrency(fullQuotation.discount),
        formatCurrency(fullQuotation.total),
        fullQuotation.currency,
        fullQuotation.items.length,
        formatCurrency(avgItemValue),
        fullQuotation.notes || ''
      ])
    }
  })
  
  // Add summary statistics
  quotationsData.push([''])
  quotationsData.push(['SUMMARY STATISTICS'])
  quotationsData.push(['Total Quotations', String(quotations.length)])
  quotationsData.push(['Total Value', formatCurrency(quotations.reduce((sum, q) => sum + q.total, 0))])
  quotationsData.push(['Average Value', formatCurrency(quotations.reduce((sum, q) => sum + q.total, 0) / quotations.length)])
  quotationsData.push(['Status Breakdown'])
  const statusCounts = quotations.reduce((acc, q) => {
    acc[q.status] = (acc[q.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  Object.entries(statusCounts).forEach(([status, count]) => {
    quotationsData.push([`  ${status.toUpperCase()}`, String(count), `${((count as number / quotations.length) * 100).toFixed(1)}%`])
  })
  
  const quotationsSheet = XLSX.utils.aoa_to_sheet(quotationsData)
  XLSX.utils.book_append_sheet(workbook, quotationsSheet, 'Quotations')
  
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  const filename = `Quotations_Export_${timestamp}.xlsx`
  
  XLSX.writeFile(workbook, filename)
  
  return filename
}

export const generateClientsExcel = (clients: Client[], quotations: Quotation[]) => {
  const workbook = XLSX.utils.book_new()
  
  // Helper function to format dates
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const clientData = [
    ['CLIENTS EXPORT REPORT'],
    ['Generated on:', formatDate(new Date())],
    ['Total Clients:', clients.length],
    [''],
    [
      'Name',
      'Company',
      'Email',
      'Phone',
      'Address',
      'Client Type',
      'TIN Number',
      'Total Quotations',
      'Total Value',
      'Acceptance Rate',
      'Avg Quotation Value',
      'Last Quotation Date',
      'Client Since',
      'Status',
      'Revenue Rank'
    ]
  ]
  
  // Calculate revenue ranking
  const clientsWithRevenue = clients.map(client => {
    const clientQuotations = quotations.filter(q => q.clientId === client.id)
    const totalValue = clientQuotations.reduce((sum, q) => sum + q.total, 0)
    return { client, totalValue }
  }).sort((a, b) => b.totalValue - a.totalValue)
  
  clients.forEach(client => {
    const clientQuotations = quotations.filter(q => q.clientId === client.id)
    const totalValue = clientQuotations.reduce((sum, q) => sum + q.total, 0)
    const acceptedQuotations = clientQuotations.filter(q => q.status === 'accepted').length
    const acceptanceRate = clientQuotations.length > 0 ? (acceptedQuotations / clientQuotations.length) * 100 : 0
    const avgQuotationValue = clientQuotations.length > 0 ? totalValue / clientQuotations.length : 0
    const lastQuotationDate = clientQuotations.length > 0 
      ? formatDate(new Date(Math.max(...clientQuotations.map(q => new Date(q.createdAt).getTime()))))
      : 'N/A'
    const clientSince = formatDate(client.createdAt)
    
    // Determine client status based on activity
    const daysSinceLastQuotation = clientQuotations.length > 0 
      ? Math.ceil((new Date().getTime() - Math.max(...clientQuotations.map(q => new Date(q.createdAt).getTime()))) / (1000 * 60 * 60 * 24))
      : 999
    const status = daysSinceLastQuotation < 30 ? 'Active' : 
                   daysSinceLastQuotation < 90 ? 'Inactive' : 'Dormant'
    
    // Find revenue rank
    const revenueRank = clientsWithRevenue.findIndex(c => c.client.id === client.id) + 1
    
    clientData.push([
      client.name,
      client.company || 'Individual',
      client.email,
      client.phone,
      client.address,
      'N/A',
      'N/A',
      String(clientQuotations.length),
      formatCurrency(totalValue),
      `${acceptanceRate.toFixed(1)}%`,
      formatCurrency(avgQuotationValue),
      lastQuotationDate,
      clientSince,
      status,
      revenueRank
    ])
  })
  
  // Add summary statistics
  clientData.push([''])
  clientData.push(['CLIENT SUMMARY STATISTICS'])
  clientData.push(['Total Clients', String(clients.length)])
  clientData.push(['Active Clients', String(clients.filter(c => {
    const clientQuotations = quotations.filter(q => q.clientId === c.id)
    const daysSinceLastQuotation = clientQuotations.length > 0 
      ? Math.ceil((new Date().getTime() - Math.max(...clientQuotations.map(q => new Date(q.createdAt).getTime()))) / (1000 * 60 * 60 * 24))
      : 999
    return daysSinceLastQuotation < 30
  }).length)])
  clientData.push(['New Clients (Last 30 days)', String(clients.filter(c => {
    const clientDate = new Date(c.createdAt)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return clientDate > thirtyDaysAgo
  }).length)])
  clientData.push(['Total Client Revenue', formatCurrency(clientsWithRevenue.reduce((sum, c) => sum + c.totalValue, 0))])
  clientData.push(['Average Revenue per Client', formatCurrency(clientsWithRevenue.reduce((sum, c) => sum + c.totalValue, 0) / clients.length)])
  clientData.push(['Top Client', clientsWithRevenue[0]?.client.name || 'N/A'])
  clientData.push(['Top Client Revenue', formatCurrency(clientsWithRevenue[0]?.totalValue || 0)])
  
  const clientSheet = XLSX.utils.aoa_to_sheet(clientData)
  XLSX.utils.book_append_sheet(workbook, clientSheet, 'Clients')
  
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  const filename = `Clients_Export_${timestamp}.xlsx`
  
  XLSX.writeFile(workbook, filename)
  
  return filename
} 

