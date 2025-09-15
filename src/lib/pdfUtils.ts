import jsPDF from 'jspdf'
import { Quotation, Client, CompanySettings } from './store'

export const generateQuotationPDF = (quotation: Quotation, companySettings: CompanySettings, client?: Client): void => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPosition = margin

  // Helper function to add text with word wrapping
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    const maxWidth = pageWidth - x - margin
    const lines = doc.splitTextToSize(text, maxWidth)
    doc.text(lines, x, y)
    return y + (lines.length * (options.fontSize || 12) * 0.4) + 5
  }


  // Helper function to add colored background
  const addColoredBackground = (x: number, y: number, width: number, height: number, color: number[]) => {
    doc.setFillColor(color[0], color[1], color[2])
    doc.rect(x, y, width, height, 'F')
  }

  // Helper function to add text with background
  const addTextWithBackground = (text: string, x: number, y: number, width: number, height: number, textColor: number[] = [255, 255, 255], bgColor: number[] = [0, 100, 200]) => {
    addColoredBackground(x, y, width, height, bgColor)
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.setFont('helvetica', 'bold')
    doc.text(text, x + 5, y + height/2 + 2)
    doc.setTextColor(0, 0, 0) // Reset to black
  }

  // Header Section - Company Logo and Details (Left Side)
  
  // Company Logo (placeholder - in real implementation, you'd load the actual logo)
  doc.setFillColor(255, 193, 7) // Yellow background for logo placeholder
  doc.circle(margin + 15, yPosition + 15, 15, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('E', margin + 10, yPosition + 20)
  doc.setTextColor(0, 0, 0)
  
  // Company Name
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 140, 0) // Orange color
  yPosition = addText(companySettings.name, margin + 40, yPosition)
  doc.setTextColor(0, 0, 0)
  
  // Company Details
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  yPosition = addText(companySettings.address, margin + 40, yPosition)
  yPosition = addText(`Website: ${companySettings.website}`, margin + 40, yPosition)
  yPosition = addText(`Phone: ${companySettings.phone}`, margin + 40, yPosition)
  yPosition = addText(`Email: ${companySettings.email}`, margin + 40, yPosition)
  yPosition = addText(`Prepared by: ${companySettings.preparedBy}`, margin + 40, yPosition)
  
  // Reset yPosition for right side alignment
  yPosition = margin

  // Quote Header (Right Side)
  const quoteX = pageWidth - 80
  yPosition = margin
  
  // QUOTE title
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 100, 200) // Blue color
  yPosition = addText('QUOTE', quoteX, yPosition)
  yPosition += 10

  // Quote details table
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  
  // Format date properly
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }
  
  const details = [
    ['DATE:', formatDate(quotation.createdAt)],
    ['QUOTE #:', quotation.quotationNumber],
    ['CUSTOMER ID:', quotation.clientId],
    ['VALID UNTIL:', formatDate(quotation.validUntil)]
  ]
  
  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, quoteX, yPosition)
    doc.setFont('helvetica', 'normal')
    doc.text(value, quoteX + 30, yPosition)
    yPosition += 5
  })

  yPosition += 30

  // Customer Information Section
  const customerY = yPosition
  addTextWithBackground('CUSTOMER', margin, customerY, pageWidth - 2*margin, 15)
  yPosition = customerY + 20

  // Display actual client details
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  
  if (client) {
    // Show client name and company
    const clientDisplayName = client.company ? `${client.name} (${client.company})` : client.name
    yPosition = addText(clientDisplayName, margin, yPosition)
    yPosition = addText(client.address || 'Address not provided', margin, yPosition)
    yPosition = addText(client.phone || 'Phone not provided', margin, yPosition)
    yPosition = addText(client.email || 'Email not provided', margin, yPosition)
  } else {
    // Fallback to quotation client name
    yPosition = addText(quotation.clientName, margin, yPosition)
    yPosition = addText('Company Name', margin, yPosition)
    yPosition = addText('Street Address', margin, yPosition)
    yPosition = addText('City, ST ZIP', margin, yPosition)
    yPosition = addText('Phone Number', margin, yPosition)
  }

  yPosition += 30

  // Description Section
  const descY = yPosition
  addTextWithBackground('DESCRIPTION', margin, descY, (pageWidth - 2*margin) * 0.7, 15)
  addTextWithBackground('TAXED', margin + (pageWidth - 2*margin) * 0.7, descY, (pageWidth - 2*margin) * 0.15, 15)
  addTextWithBackground('AMOUNT', margin + (pageWidth - 2*margin) * 0.85, descY, (pageWidth - 2*margin) * 0.15, 15)
  yPosition = descY + 20

  // Items table
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  quotation.items.forEach((item) => {
    if (yPosition > pageHeight - 100) {
      doc.addPage()
      yPosition = margin
    }
    
    // Description
    yPosition = addText(item.description, margin, yPosition)
    
    // Taxed column (X for parts, empty for services)
    const taxedX = margin + (pageWidth - 2*margin) * 0.7 + 5
    const amountX = margin + (pageWidth - 2*margin) * 0.85 + 5
    doc.text('X', taxedX, yPosition - 5) // You might want to determine this based on item type
    
    // Amount - right aligned
    const amountText = `${companySettings.currency} ${item.total.toFixed(2)}`
    const textWidth = doc.getTextWidth(amountText)
    doc.text(amountText, amountX + (pageWidth - 2*margin) * 0.15 - textWidth - 5, yPosition - 5)
    yPosition += 8
  })

  // Discount if applicable
  if (quotation.discount > 0) {
    yPosition = addText('New client discount', margin, yPosition)
    const amountX = margin + (pageWidth - 2*margin) * 0.85 + 5
    doc.text(`(${companySettings.currency} ${quotation.discount.toFixed(2)})`, amountX, yPosition - 5)
    yPosition += 5
  }

  yPosition += 10

  // Summary Section (Right side)
  const summaryX = pageWidth - 100
  const summaryY = yPosition
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  // Subtotal
  doc.text('Subtotal:', summaryX - 50, summaryY)
  const subtotalText = `${companySettings.currency} ${quotation.subtotal.toFixed(2)}`
  doc.text(subtotalText, summaryX - doc.getTextWidth(subtotalText), summaryY)
  
  // Taxable amount
  doc.text('Taxable:', summaryX - 50, summaryY + 8)
  const taxableText = `${companySettings.currency} ${quotation.subtotal.toFixed(2)}`
  doc.text(taxableText, summaryX - doc.getTextWidth(taxableText), summaryY + 8)
  
  // Tax rate in box
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  doc.rect(summaryX - 50, summaryY + 15, 30, 8)
  doc.text(`${quotation.taxRate}%`, summaryX - 45, summaryY + 20)
  
  // Tax due
  doc.text('Tax due:', summaryX - 50, summaryY + 30)
  const taxText = `${companySettings.currency} ${quotation.taxAmount.toFixed(2)}`
  doc.text(taxText, summaryX - doc.getTextWidth(taxText), summaryY + 30)
  
  // Other (empty box)
  doc.rect(summaryX - 50, summaryY + 35, 30, 8)
  doc.text('-', summaryX - 45, summaryY + 40)
  
  // Total with colored background
  const totalY = summaryY + 50
  addColoredBackground(summaryX - 50, totalY, 50, 15, [255, 140, 0]) // Orange background
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  const totalText = `TOTAL: ${companySettings.currency} ${quotation.total.toFixed(2)}`
  doc.text(totalText, summaryX - 45, totalY + 10)
  doc.setTextColor(0, 0, 0)

  // Terms and Conditions (Left side)
  const termsY = totalY + 30
  addTextWithBackground('TERMS AND CONDITIONS', margin, termsY, pageWidth - 2*margin, 15)
  yPosition = termsY + 25

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  
  const terms = [
    '1. Customer will be billed after indicating acceptance of this quote',
    '2. Payment will be due prior to delivery of service and goods',
    '3. Please fax or mail the signed price quote to the address above'
  ]
  
  terms.forEach(term => {
    yPosition = addText(term, margin, yPosition)
  })

  yPosition += 10
  doc.text('Customer Acceptance (sign below):', margin, yPosition)
  yPosition += 5
  doc.text('X _____________________________', margin, yPosition)
  yPosition += 10
  doc.text('Print Name: _____________________________', margin, yPosition)

  // Footer
  const footerY = pageHeight - 30
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('If you have any questions about this price quote, please contact', pageWidth/2, footerY, { align: 'center' })
  doc.text(`${companySettings.preparedBy}, ${companySettings.phone}, ${companySettings.email}`, pageWidth/2, footerY + 5, { align: 'center' })
  
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 140, 0) // Orange color
  doc.text('Thank You For Your Business!', pageWidth/2, footerY + 15, { align: 'center' })
  doc.setTextColor(0, 0, 0)

  // Download the PDF
  doc.save(`quotation-${quotation.quotationNumber}.pdf`)
}

export const generateQuotationPDFFromElement = async (elementId: string, quotation: Quotation): Promise<void> => {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error('Element not found')
  }

  const { default: html2canvas } = await import('html2canvas')
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff'
  })

  const imgData = canvas.toDataURL('image/png')
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const imgWidth = pageWidth
  const imgHeight = (canvas.height * pageWidth) / canvas.width

  let heightLeft = imgHeight
  let position = 0

  doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight
    doc.addPage()
    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  doc.save(`quotation-${quotation.quotationNumber}.pdf`)
}

export const generateReportsPDF = (quotations: Quotation[], clients: Client[]): void => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPosition = margin

  // Helper function to add text with word wrapping
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    const maxWidth = pageWidth - x - margin
    const lines = doc.splitTextToSize(text, maxWidth)
    doc.text(lines, x, y)
    return y + (lines.length * (options.fontSize || 12) * 0.4) + 5
  }

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number = 20) => {
    if (yPosition > pageHeight - requiredSpace) {
      doc.addPage()
      yPosition = margin
      return true
    }
    return false
  }

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

  const topClients = clients.map(client => {
    const clientQuotations = quotations.filter(q => q.clientId === client.id)
    const totalValue = clientQuotations.reduce((sum, q) => sum + q.total, 0)
    return {
      ...client,
      quotationCount: clientQuotations.length,
      totalValue
    }
  }).sort((a, b) => b.totalValue - a.totalValue).slice(0, 5)

  // Header
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  yPosition = addText('BUSINESS REPORTS & ANALYTICS', pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 10

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  yPosition = addText(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition)
  yPosition += 15

  // Key Metrics Section
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  yPosition = addText('KEY METRICS', margin, yPosition)
  yPosition += 10

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  
  // Metrics in a 2x2 grid
  const metrics = [
    { label: 'Total Quotations', value: totalQuotations.toString() },
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}` },
    { label: 'Total Clients', value: totalClients.toString() },
    { label: 'Average Quotation Value', value: `$${averageQuotationValue.toFixed(0)}` }
  ]

  const col1 = margin
  const col2 = pageWidth / 2 + 10
  
  metrics.forEach((metric, index) => {
    const x = index % 2 === 0 ? col1 : col2
    const y = yPosition + (Math.floor(index / 2) * 20)
    
    doc.setFont('helvetica', 'bold')
    doc.text(metric.label + ':', x, y)
    doc.setFont('helvetica', 'normal')
    doc.text(metric.value, x + 80, y)
  })
  
  yPosition += 50

  // Quotation Status Breakdown
  checkNewPage(40)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  yPosition = addText('QUOTATION STATUS BREAKDOWN', margin, yPosition)
  yPosition += 10

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  
  if (Object.keys(quotationsByStatus).length === 0) {
    yPosition = addText('No quotations available', margin, yPosition)
  } else {
    Object.entries(quotationsByStatus).forEach(([status, count]) => {
      const percentage = totalQuotations > 0 ? Math.round((count / totalQuotations) * 100) : 0
      yPosition = addText(`${status.charAt(0).toUpperCase() + status.slice(1)}: ${count} (${percentage}%)`, margin, yPosition)
    })
  }
  
  yPosition += 20

  // Monthly Quotations
  checkNewPage(40)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  yPosition = addText('MONTHLY QUOTATIONS', margin, yPosition)
  yPosition += 10

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  
  if (Object.keys(quotationsByMonth).length === 0) {
    yPosition = addText('No monthly data available', margin, yPosition)
  } else {
    Object.entries(quotationsByMonth)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .forEach(([month, count]) => {
        yPosition = addText(`${month}: ${count} quotations`, margin, yPosition)
      })
  }
  
  yPosition += 20

  // Top Clients
  checkNewPage(60)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  yPosition = addText('TOP CLIENTS BY REVENUE', margin, yPosition)
  yPosition += 10

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  
  if (topClients.length === 0) {
    yPosition = addText('No client data available', margin, yPosition)
  } else {
    topClients.forEach((client, index) => {
      checkNewPage(15)
      doc.setFont('helvetica', 'bold')
      yPosition = addText(`${index + 1}. ${client.name}`, margin, yPosition)
      doc.setFont('helvetica', 'normal')
      yPosition = addText(`   Company: ${client.company}`, margin, yPosition)
      yPosition = addText(`   Total Value: $${client.totalValue.toLocaleString()}`, margin, yPosition)
      yPosition = addText(`   Quotations: ${client.quotationCount}`, margin, yPosition)
      yPosition += 5
    })
  }

  // Footer
  const footerY = pageHeight - 20
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Generated by QMS', margin, footerY)
  doc.text(`Page 1 of 1`, pageWidth - 50, footerY)

  // Download the PDF
  const currentDate = new Date().toISOString().split('T')[0]
  doc.save(`business-report-${currentDate}.pdf`)
}