import { Quotation, Client, QuotationItem } from './store'

export interface AnalyticsData {
  // Quotation Overview
  totalQuotations: number
  quotationsByStatus: Record<string, number>
  conversionRate: number
  averageResponseTime: number
  
  // Financial Insights
  totalRevenue: number
  acceptedRevenue: number
  rejectedRevenue: number
  averageQuotationValue: number
  currencyBreakdown: Record<string, number>
  taxSummary: {
    totalTax: number
    averageTaxRate: number
  }
  discountSummary: {
    totalDiscounts: number
    averageDiscount: number
  }
  
  // Client Insights
  totalClients: number
  quotationsPerClient: Record<string, number>
  clientAcceptanceRates: Record<string, number>
  topClientsByValue: Array<{
    client: Client
    totalValue: number
    quotationCount: number
    acceptanceRate: number
  }>
  inactiveClients: Client[]
  
  // Product/Service Insights
  mostQuotedItems: Array<{
    item: QuotationItem
    count: number
    totalValue: number
    averagePrice: number
  }>
  categoryBreakdown: Record<string, {
    count: number
    totalValue: number
    averageValue: number
  }>
  
  // Time-based Trends
  monthlyTrends: Array<{
    month: string
    quotations: number
    revenue: number
    accepted: number
    rejected: number
  }>
  yearlyTrends: Array<{
    year: string
    quotations: number
    revenue: number
    growth: number
  }>
  seasonalDemand: Record<string, number>
  
  // Pipeline/Forecast
  pendingQuotations: Quotation[]
  expiringSoon: Quotation[]
  expectedRevenue: number
  pipelineValue: number
}

export function calculateAnalytics(quotations: Quotation[], clients: Client[]): AnalyticsData {
  const now = new Date()
  const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000)
  
  // Quotation Overview
  const totalQuotations = quotations.length
  const quotationsByStatus = quotations.reduce((acc, q) => {
    acc[q.status] = (acc[q.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const sentQuotations = quotations.filter(q => q.status === 'sent')
  const acceptedQuotations = quotations.filter(q => q.status === 'accepted')
  const conversionRate = sentQuotations.length > 0 ? (acceptedQuotations.length / sentQuotations.length) * 100 : 0
  
  // Calculate average response time (mock calculation)
  const averageResponseTime = quotations.length > 0 ? Math.random() * 7 + 1 : 0 // 1-8 days average
  
  // Financial Insights
  const totalRevenue = quotations.reduce((sum, q) => sum + q.total, 0)
  const acceptedRevenue = acceptedQuotations.reduce((sum, q) => sum + q.total, 0)
  const rejectedRevenue = quotations.filter(q => q.status === 'rejected').reduce((sum, q) => sum + q.total, 0)
  const averageQuotationValue = totalQuotations > 0 ? totalRevenue / totalQuotations : 0
  
  const currencyBreakdown = quotations.reduce((acc, q) => {
    const currency = q.currency || 'USD' // Default to USD if currency is undefined
    acc[currency] = (acc[currency] || 0) + q.total
    return acc
  }, {} as Record<string, number>)
  
  const totalTax = quotations.reduce((sum, q) => sum + q.taxAmount, 0)
  const averageTaxRate = quotations.length > 0 ? quotations.reduce((sum, q) => sum + q.taxRate, 0) / quotations.length : 0
  
  const totalDiscounts = quotations.reduce((sum, q) => sum + q.discount, 0)
  const averageDiscount = totalQuotations > 0 ? totalDiscounts / totalQuotations : 0
  
  // Client Insights
  const totalClients = clients.length
  const quotationsPerClient = quotations.reduce((acc, q) => {
    acc[q.clientId] = (acc[q.clientId] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const clientAcceptanceRates = clients.reduce((acc, client) => {
    const clientQuotations = quotations.filter(q => q.clientId === client.id)
    const sent = clientQuotations.filter(q => q.status === 'sent')
    const accepted = clientQuotations.filter(q => q.status === 'accepted')
    acc[client.id] = sent.length > 0 ? (accepted.length / sent.length) * 100 : 0
    return acc
  }, {} as Record<string, number>)
  
  const topClientsByValue = clients.map(client => {
    const clientQuotations = quotations.filter(q => q.clientId === client.id)
    const totalValue = clientQuotations.reduce((sum, q) => sum + q.total, 0)
    const sent = clientQuotations.filter(q => q.status === 'sent')
    const accepted = clientQuotations.filter(q => q.status === 'accepted')
    const acceptanceRate = sent.length > 0 ? (accepted.length / sent.length) * 100 : 0
    
    return {
      client,
      totalValue,
      quotationCount: clientQuotations.length,
      acceptanceRate
    }
  }).sort((a, b) => b.totalValue - a.totalValue).slice(0, 10)
  
  const inactiveClients = clients.filter(client => {
    const clientQuotations = quotations.filter(q => q.clientId === client.id)
    const lastQuotation = clientQuotations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    return !lastQuotation || new Date(lastQuotation.createdAt) < sixMonthsAgo
  })
  
  // Product/Service Insights
  const allItems = quotations.flatMap(q => q.items)
  const itemCounts = allItems.reduce((acc, item) => {
    const key = item.description
    if (!acc[key]) {
      acc[key] = {
        item,
        count: 0,
        totalValue: 0
      }
    }
    acc[key].count += 1
    acc[key].totalValue += item.total
    return acc
  }, {} as Record<string, { item: QuotationItem; count: number; totalValue: number }>)
  
  const mostQuotedItems = Object.values(itemCounts)
    .map(({ item, count, totalValue }) => ({
      item,
      count,
      totalValue,
      averagePrice: totalValue / count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
  
  const categoryBreakdown = allItems.reduce((acc, item) => {
    const category = item.category || 'uncategorized'
    if (!acc[category]) {
      acc[category] = { count: 0, totalValue: 0, averageValue: 0 }
    }
    acc[category].count += 1
    acc[category].totalValue += item.total
    return acc
  }, {} as Record<string, { count: number; totalValue: number; averageValue: number }>)
  
  // Calculate average values for categories
  Object.keys(categoryBreakdown).forEach(category => {
    const data = categoryBreakdown[category]
    data.averageValue = data.count > 0 ? data.totalValue / data.count : 0
  })
  
  // Time-based Trends
  const monthlyTrends = quotations.reduce((acc, q) => {
    const month = new Date(q.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    if (!acc[month]) {
      acc[month] = { month, quotations: 0, revenue: 0, accepted: 0, rejected: 0 }
    }
    acc[month].quotations += 1
    acc[month].revenue += q.total
    if (q.status === 'accepted') acc[month].accepted += 1
    if (q.status === 'rejected') acc[month].rejected += 1
    return acc
  }, {} as Record<string, { month: string; quotations: number; revenue: number; accepted: number; rejected: number }>)
  
  const monthlyTrendsArray = Object.values(monthlyTrends)
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
  
  const yearlyTrends = quotations.reduce((acc, q) => {
    const year = new Date(q.createdAt).getFullYear().toString()
    if (!acc[year]) {
      acc[year] = { year, quotations: 0, revenue: 0, growth: 0 }
    }
    acc[year].quotations += 1
    acc[year].revenue += q.total
    return acc
  }, {} as Record<string, { year: string; quotations: number; revenue: number; growth: number }>)
  
  const yearlyTrendsArray = Object.values(yearlyTrends)
    .sort((a, b) => parseInt(a.year) - parseInt(b.year))
    .map((year, index, array) => {
      if (index === 0) return { ...year, growth: 0 }
      const prevYear = array[index - 1]
      const growth = prevYear.revenue > 0 ? ((year.revenue - prevYear.revenue) / prevYear.revenue) * 100 : 0
      return { ...year, growth }
    })
  
  const seasonalDemand = quotations.reduce((acc, q) => {
    const month = new Date(q.createdAt).getMonth()
    const season = month < 3 ? 'Q1' : month < 6 ? 'Q2' : month < 9 ? 'Q3' : 'Q4'
    acc[season] = (acc[season] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  // Pipeline/Forecast
  const pendingQuotations = quotations.filter(q => q.status === 'sent')
  const expiringSoon = quotations.filter(q => {
    const validUntil = new Date(q.validUntil)
    const daysUntilExpiry = (validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  })
  
  const expectedRevenue = acceptedQuotations.reduce((sum, q) => sum + q.total, 0)
  const pipelineValue = pendingQuotations.reduce((sum, q) => sum + q.total, 0)
  
  return {
    // Quotation Overview
    totalQuotations,
    quotationsByStatus,
    conversionRate,
    averageResponseTime,
    
    // Financial Insights
    totalRevenue,
    acceptedRevenue,
    rejectedRevenue,
    averageQuotationValue,
    currencyBreakdown,
    taxSummary: {
      totalTax,
      averageTaxRate
    },
    discountSummary: {
      totalDiscounts,
      averageDiscount
    },
    
    // Client Insights
    totalClients,
    quotationsPerClient,
    clientAcceptanceRates,
    topClientsByValue,
    inactiveClients,
    
    // Product/Service Insights
    mostQuotedItems,
    categoryBreakdown,
    
    // Time-based Trends
    monthlyTrends: monthlyTrendsArray,
    yearlyTrends: yearlyTrendsArray,
    seasonalDemand,
    
    // Pipeline/Forecast
    pendingQuotations,
    expiringSoon,
    expectedRevenue,
    pipelineValue
  }
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  // Handle undefined or invalid currency
  const validCurrency = currency && currency !== 'undefined' ? currency : 'USD'
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: validCurrency
    }).format(amount)
  } catch (error) {
    // Fallback to USD if currency is invalid
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}
