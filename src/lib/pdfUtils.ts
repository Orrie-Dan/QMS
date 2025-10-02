import jsPDF from 'jspdf'
import { Quotation, Client, CompanySettings } from './store'

// HTML Generation Functions
export const generateQuotationHTML = (quotation: Quotation, companySettings: CompanySettings, client?: Client): string => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    const currencySymbols = {
      RWF: "RWF",
      USD: "$",
      EUR: "€"
    }
    const symbol = currencySymbols[quotation.currency] || quotation.currency
    
    if (quotation.currency === "RWF") {
      return `${symbol} ${Math.round(amount).toLocaleString()}`
    }
    
    return `${symbol} ${amount.toFixed(2)}`
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quotation ${quotation.quotationNumber}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            font-size: 14px;
            line-height: 1.4;
        }
        
        .quotation-container {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background-color: white;
            padding: 8mm;
            border: 1px solid #ccc;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            overflow: visible;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 0;
                background-color: white;
            }
            
            .quotation-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0;
                padding: 8mm;
                border: none;
                box-shadow: none;
            }
            
            .page-break {
                page-break-before: always;
            }
            
            .no-break {
                page-break-inside: avoid;
            }
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 6mm;
        }
        
        .company-info {
            flex: 1;
        }
        
        .logo-section {
            margin-bottom: 5mm;
        }
        
        .logo {
            width: 80px;
            height: 60px;
            background-color: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            margin-bottom: 10px;
            overflow: hidden;
        }
        
        
        .company-name {
            font-size: 20px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 3mm;
            letter-spacing: 0.5px;
        }
        
        .company-details {
            font-size: 13px;
            color: #374151;
            line-height: 1.4;
            font-weight: 500;
        }
        
        .quote-section {
            text-align: right;
        }
        
        .quote-title {
            font-size: 28px;
            font-weight: 800;
            color: #0066cc;
            margin-bottom: 3mm;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        
        .quote-details {
            font-size: 13px;
            line-height: 1.4;
            font-weight: 500;
        }
        
        .quote-details span {
            font-weight: 700;
            color: #1f2937;
        }
        
        .customer-section {
            margin-bottom: 4mm;
        }
        
        .customer-header {
            background-color: #0066cc;
            color: white;
            padding: 6px 12px;
            text-align: center;
            font-weight: 700;
            font-size: 15px;
            margin-bottom: 3mm;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        
        .customer-details {
            font-size: 13px;
            line-height: 1.4;
            font-weight: 400;
        }
        
        .customer-details .name {
            font-weight: 600;
            color: #1f2937;
        }
        
        .services-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4mm;
        }
        
        .services-table th {
            background-color: #0066cc;
            color: white;
            padding: 8px 12px;
            text-align: left;
            font-weight: 700;
            font-size: 13px;
            border: 1px solid #333;
            letter-spacing: 0.3px;
            text-transform: uppercase;
        }
        
        .services-table th.center {
            text-align: center;
            width: 60px;
        }
        
        .services-table th.right {
            text-align: right;
            width: 80px;
        }
        
        .services-table th.quantity {
            text-align: center;
            width: 60px;
        }
        
        .services-table th.unit-price {
            text-align: right;
            width: 80px;
        }
        
        .services-table td {
            padding: 8px 12px;
            border: 1px solid #333;
            font-size: 12px;
            font-weight: 400;
            line-height: 1.3;
        }
        
        .services-table td.center {
            text-align: center;
        }
        
        .services-table td.right {
            text-align: right;
        }
        
        .services-table td.quantity {
            text-align: center;
        }
        
        .services-table td.unit-price {
            text-align: right;
        }
        
        .summary-section {
            display: flex;
            justify-content: flex-end;
            margin-top: 3mm;
        }
        
        .summary-box {
            width: 60mm;
            font-size: 12px;
            font-weight: 400;
        }
        
        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
        }
        
        .total-row {
            background-color: #ffffcc;
            font-weight: 700;
            font-size: 14px;
            padding: 6px;
            border: 1px solid #333;
            margin-top: 2px;
            letter-spacing: 0.3px;
        }
        
        .terms-section {
            margin-bottom: 4mm;
        }
        
        .terms-header {
            background-color: #0066cc;
            color: white;
            padding: 6px 12px;
            text-align: center;
            font-weight: 700;
            font-size: 14px;
            margin-bottom: 3mm;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        
        .terms-content {
            font-size: 11px;
            line-height: 1.4;
            font-weight: 400;
        }
        
        .terms-content p {
            margin-bottom: 2px;
        }
        
        .acceptance-section {
            margin-bottom: 4mm;
        }
        
        .acceptance-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 15px;
        }
        
        .signature-line {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .signature-x {
            margin-right: 10px;
            font-size: 16px;
        }
        
        .signature-field {
            border-bottom: 2px solid #333;
            width: 70mm;
            height: 8mm;
        }
        
        .print-name {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 15px;
        }
        
        .print-name-field {
            border-bottom: 2px solid #333;
            width: 70mm;
            height: 8mm;
        }
        
        .footer {
            text-align: center;
            font-size: 12px;
            margin-top: 5mm;
        }
        
        .bank-details {
            margin-top: 5mm;
            font-size: 11px;
            text-align: left;
            background: #f8fafc;
            padding: 6px 8px;
            border-radius: 3px;
            border: 1px solid #d1d5db;
        }
        
        .bank-details .account-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 1px 0;
            padding: 1px 0;
            min-height: 16px;
        }

        .bank-details .account-label {
            font-weight: 500;
            color: #6b7280;
            font-size: 11px;
            min-width: 80px;
        }

        .bank-details .account-value {
            font-weight: 500;
            color: #111827;
            font-size: 11px;
            text-align: right;
            flex: 1;
        }
        
        .footer-contact {
            font-weight: 600;
            margin: 5px 0;
            color: #1f2937;
        }
        
        .footer-thanks {
            color: #ff6600;
            font-weight: 700;
            font-size: 16px;
            margin-top: 5mm;
            letter-spacing: 0.5px;
        }
    </style>
</head>
<body>
    <div class="quotation-container">
        <!-- Header Section -->
        <div class="header">
            <!-- Left Side - Company Info -->
            <div class="company-info">
                <div class="logo-section">
                    <div class="logo">
                        <img src="/esri-3-logo.png" alt="Esri Logo" style="width: 100%; height: 100%; object-fit: contain;" />
                    </div>
                </div>
                
                <div class="company-details">
                    <p>KG 7 Ave, Kigali, Rwanda</p>
                    <p>Website: www.esri.rw</p>
                    <p>Phone: 0788 381 900</p>
                    <p>Email: info@esri.rw</p>
                    <p style="margin-top: 15px;">Prepared by: Sales Team</p>
                </div>
            </div>

            <!-- Right Side - Quote Details -->
            <div class="quote-section">
                <div class="quote-title">QUOTE</div>
                <div class="quote-details">
                    <p><span>DATE:</span> ${formatDate(quotation.createdAt)}</p>
                    <p><span>QUOTE #:</span> ${quotation.quotationNumber}</p>
                    <p><span>CUSTOMER ID:</span> ${quotation.clientId}</p>
                    <p><span>VALID UNTIL:</span> ${formatDate(quotation.validUntil)}</p>
                </div>
            </div>
        </div>

        <!-- Customer Section -->
        <div class="customer-section">
            <div class="customer-header">CUSTOMER</div>
            <div class="customer-details">
                ${client ? `
                    <p class="name">${client.name} (${client.company})</p>
                    <p>${client.address}</p>
                    <p>${client.phone}</p>
                    <p>${client.email}</p>
                ` : '<p>No client information available</p>'}
            </div>
        </div>

        <!-- Services Table -->
        <table class="services-table no-break">
            <thead>
                <tr>
                    <th>DESCRIPTION</th>
                    <th class="quantity">QUANTITY</th>
                    <th class="unit-price">UNIT PRICE</th>
                    <th class="right">AMOUNT</th>
                </tr>
            </thead>
            <tbody>
                ${quotation.items.map(item => `
                    <tr>
                        <td>${item.description}</td>
                        <td class="quantity">${item.quantity}</td>
                        <td class="unit-price">${formatCurrency(item.unitPrice)}</td>
                        <td class="right">${formatCurrency(item.total)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <!-- Summary Section -->
        <div class="summary-section no-break">
            <div class="summary-box">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(quotation.subtotal)}</span>
                </div>
                <div class="summary-row">
                    <span>Taxable:</span>
                    <span>${formatCurrency(quotation.subtotal)}</span>
                </div>
                <div class="summary-row">
                    <span>Tax rate:</span>
                    <span>${quotation.taxRate}%</span>
                </div>
                <div class="summary-row">
                    <span>Tax due:</span>
                    <span>${formatCurrency(quotation.taxAmount)}</span>
                </div>
                <div class="summary-row">
                    <span>Other:</span>
                    <span>-</span>
                </div>
                <div class="total-row">
                    <span>TOTAL:</span>
                    <span>${formatCurrency(quotation.total)}</span>
                </div>
            </div>
        </div>

        <!-- Terms and Conditions -->
        <div class="terms-section">
            <div class="terms-header">TERMS AND CONDITIONS</div>
            <div class="terms-content">
                <p>1. Customer will be billed after indicating acceptance of this quote</p>
                <p>2. Payment will be due prior to delivery of service and goods</p>
                <p>3. Please fax or mail the signed price quote to the address above</p>
            </div>
        </div>

        <!-- Customer Acceptance -->
        <div class="acceptance-section">
            <div class="acceptance-title">Customer Acceptance (sign below):</div>
            <div class="signature-line">
                <span class="signature-x">X</span>
                <div class="signature-field"></div>
            </div>
            <div class="print-name">Print Name:</div>
            <div class="print-name-field"></div>
        </div>

        <!-- Bank Details -->
        ${companySettings.currencyAccounts[quotation.currency] ? `
        <div class="bank-details">
            <div class="account-row">
                <span class="account-label">Bank Name and Address:</span>
                <span class="account-value">Bank of Kigali, Head Office, Avenue de la Paix</span>
            </div>
            <div class="account-row">
                <span class="account-label">P.O. Box and Location:</span>
                <span class="account-value">P.O. Box 175, Kigali, Rwanda</span>
            </div>
            <div class="account-row">
                <span class="account-label">SWIFT Code:</span>
                <span class="account-value">BKIGRWRW</span>
            </div>
            <div class="account-row">
                <span class="account-label">Account No.:</span>
                <span class="account-value">${companySettings.currencyAccounts[quotation.currency]} (${quotation.currency})</span>
            </div>
            <div class="account-row">
                <span class="account-label">Name of Account Holder:</span>
                <span class="account-value">Esri Rwanda Ltd.</span>
            </div>
            <div class="account-row">
                <span class="account-label">Reference Instruction:</span>
                <span class="account-value">Please reference our _____ in your correspondence!</span>
            </div>
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
            <p>If you have any questions about this price quote, please contact</p>
            <p class="footer-contact">Sales Team, +250 788 123 456, info@esri.rw</p>
            <p class="footer-thanks">Thank You For Your Business!</p>
        </div>
    </div>
</body>
</html>
  `
}

export const downloadQuotationHTML = (quotation: Quotation, companySettings: CompanySettings, client?: Client): void => {
  const htmlContent = generateQuotationHTML(quotation, companySettings, client)
  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `quotation-${quotation.quotationNumber}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Invoice HTML Generation Function
export const generateInvoiceHTML = (quotation: Quotation, companySettings: CompanySettings, client?: Client): string => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    const currencySymbols = {
      RWF: "RWF",
      USD: "$",
      EUR: "€"
    }
    const symbol = currencySymbols[quotation.currency] || quotation.currency
    
    if (quotation.currency === "RWF") {
      return `${symbol} ${Math.round(amount).toLocaleString()}`
    }
    
    return `${symbol} ${amount.toFixed(2)}`
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${quotation.quotationNumber}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            font-size: 14px;
            line-height: 1.4;
        }
        
        .invoice-container {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background-color: white;
            padding: 8mm;
            border: 1px solid #ccc;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            overflow: visible;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 0;
                background-color: white;
            }
            
            .invoice-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0;
                padding: 8mm;
                border: none;
                box-shadow: none;
            }
            
            .page-break {
                page-break-before: always;
            }
            
            .no-break {
                page-break-inside: avoid;
            }
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 6mm;
        }
        
        .company-info {
            flex: 1;
        }
        
        .logo-section {
            margin-bottom: 5mm;
        }
        
        .logo {
            width: 80px;
            height: 60px;
            background-color: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            margin-bottom: 10px;
            overflow: hidden;
        }
        
        .company-name {
            font-size: 20px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 3mm;
            letter-spacing: 0.5px;
        }
        
        .company-details {
            font-size: 13px;
            color: #374151;
            line-height: 1.4;
            font-weight: 500;
        }
        
        .invoice-section {
            text-align: right;
        }
        
        .invoice-title {
            font-size: 28px;
            font-weight: 800;
            color: #0066cc;
            margin-bottom: 3mm;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        
        .invoice-details {
            font-size: 13px;
            line-height: 1.4;
            font-weight: 500;
        }
        
        .invoice-details span {
            font-weight: 700;
            color: #1f2937;
        }
        
        .customer-section {
            margin-bottom: 4mm;
        }
        
        .customer-header {
            background-color: #0066cc;
            color: white;
            padding: 6px 12px;
            text-align: center;
            font-weight: 700;
            font-size: 15px;
            margin-bottom: 3mm;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        
        .customer-details {
            font-size: 13px;
            line-height: 1.4;
            font-weight: 400;
        }
        
        .customer-details .name {
            font-weight: 600;
            color: #1f2937;
        }
        
        .services-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4mm;
        }
        
        .services-table th {
            background-color: #0066cc;
            color: white;
            padding: 8px 12px;
            text-align: left;
            font-weight: 700;
            font-size: 13px;
            border: 1px solid #333;
            letter-spacing: 0.3px;
            text-transform: uppercase;
        }
        
        .services-table th.center {
            text-align: center;
            width: 60px;
        }
        
        .services-table th.right {
            text-align: right;
            width: 80px;
        }
        
        .services-table th.quantity {
            text-align: center;
            width: 60px;
        }
        
        .services-table th.unit-price {
            text-align: right;
            width: 80px;
        }
        
        .services-table td {
            padding: 8px 12px;
            border: 1px solid #333;
            font-size: 12px;
            font-weight: 400;
            line-height: 1.3;
        }
        
        .services-table td.center {
            text-align: center;
        }
        
        .services-table td.right {
            text-align: right;
        }
        
        .services-table td.quantity {
            text-align: center;
        }
        
        .services-table td.unit-price {
            text-align: right;
        }
        
        .summary-section {
            display: flex;
            justify-content: flex-end;
            margin-top: 3mm;
        }
        
        .summary-box {
            width: 60mm;
            font-size: 12px;
            font-weight: 400;
        }
        
        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
        }
        
        .total-row {
            background-color: #ffffcc;
            font-weight: 700;
            font-size: 14px;
            padding: 6px;
            border: 1px solid #333;
            margin-top: 2px;
            letter-spacing: 0.3px;
        }
        
        .terms-section {
            margin-bottom: 4mm;
        }
        
        .terms-header {
            background-color: #0066cc;
            color: white;
            padding: 6px 12px;
            text-align: center;
            font-weight: 700;
            font-size: 14px;
            margin-bottom: 3mm;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        
        .terms-content {
            font-size: 11px;
            line-height: 1.4;
            font-weight: 400;
        }
        
        .terms-content p {
            margin-bottom: 2px;
        }
        
        .acceptance-section {
            margin-bottom: 4mm;
        }
        
        .acceptance-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 15px;
        }
        
        .signature-line {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .signature-x {
            margin-right: 10px;
            font-size: 16px;
        }
        
        .signature-field {
            border-bottom: 2px solid #333;
            width: 70mm;
            height: 8mm;
        }
        
        .print-name {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 15px;
        }
        
        .print-name-field {
            border-bottom: 2px solid #333;
            width: 70mm;
            height: 8mm;
        }
        
        .footer {
            text-align: center;
            font-size: 12px;
            margin-top: 5mm;
        }
        
        .bank-details {
            margin-top: 5mm;
            font-size: 11px;
            text-align: left;
            background: #f8fafc;
            padding: 6px 8px;
            border-radius: 3px;
            border: 1px solid #d1d5db;
        }
        
        .bank-details .account-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 1px 0;
            padding: 1px 0;
            min-height: 16px;
        }

        .bank-details .account-label {
            font-weight: 500;
            color: #6b7280;
            font-size: 11px;
            min-width: 80px;
        }

        .bank-details .account-value {
            font-weight: 500;
            color: #111827;
            font-size: 11px;
            text-align: right;
            flex: 1;
        }
        
        .footer-contact {
            font-weight: 600;
            margin: 5px 0;
            color: #1f2937;
        }
        
        .footer-thanks {
            color: #ff6600;
            font-weight: 700;
            font-size: 16px;
            margin-top: 5mm;
            letter-spacing: 0.5px;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header Section -->
        <div class="header">
            <!-- Left Side - Company Info -->
            <div class="company-info">
                <div class="logo-section">
                    <div class="logo">
                        <img src="Esri logo.jpg" alt="Esri Rwanda Logo" style="width: 100%; height: 100%; object-fit: contain;" />
                    </div>
                </div>
                
                <div class="company-details">
                    <p>KG 7 Ave, Kigali, Rwanda</p>
                    <p>Website: www.esri.rw</p>
                    <p>Phone: 0788 381 900</p>
                    <p>Email: info@esri.rw</p>
                    <p style="margin-top: 15px;">Prepared by: Sales Team</p>
                </div>
            </div>

            <!-- Right Side - Invoice Details -->
            <div class="invoice-section">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-details">
                    <p><span>DATE:</span> ${formatDate(quotation.createdAt)}</p>
                    <p><span>INVOICE #:</span> ${quotation.quotationNumber}</p>
                    <p><span>CUSTOMER ID:</span> ${quotation.clientId}</p>
                    <p><span>DUE DATE:</span> ${formatDate(quotation.validUntil)}</p>
                </div>
            </div>
        </div>

        <!-- Customer Section -->
        <div class="customer-section">
            <div class="customer-header">CUSTOMER</div>
            <div class="customer-details">
                <p class="name"><strong>Name:</strong> ${quotation.clientName}</p>
                ${client ? `
                    <p><strong>Address:</strong> ${client.address || '-'}</p>
                    <p><strong>Phone:</strong> ${client.phone || '-'}</p>
                    <p><strong>Email:</strong> ${client.email || '-'}</p>
                ` : ''}
            </div>
        </div>

        <!-- Services Table -->
        <table class="services-table">
            <thead>
                <tr>
                    <th>DESCRIPTION</th>
                    <th class="quantity">QUANTITY</th>
                    <th class="unit-price">UNIT PRICE</th>
                    <th class="right">AMOUNT</th>
                </tr>
            </thead>
            <tbody>
                ${quotation.items.map(item => `
                    <tr>
                        <td>${item.description}</td>
                        <td class="quantity">${item.quantity}</td>
                        <td class="unit-price">${formatCurrency(item.unitPrice)}</td>
                        <td class="right">${formatCurrency(item.total)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <!-- Summary Section -->
        <div class="summary-section">
            <div class="summary-box">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(quotation.subtotal)}</span>
                </div>
                <div class="summary-row">
                    <span>Taxable:</span>
                    <span>${formatCurrency(quotation.subtotal)}</span>
                </div>
                <div class="summary-row">
                    <span>Tax rate:</span>
                    <span>${quotation.taxRate}%</span>
                </div>
                <div class="summary-row">
                    <span>Tax due:</span>
                    <span>${formatCurrency(quotation.taxAmount)}</span>
                </div>
                <div class="summary-row">
                    <span>Other:</span>
                    <span>-</span>
                </div>
                <div class="total-row">
                    <span>TOTAL:</span>
                    <span>${formatCurrency(quotation.total)}</span>
                </div>
            </div>
        </div>

        <!-- Terms and Conditions -->
        <div class="terms-section">
            <div class="terms-header">TERMS AND CONDITIONS</div>
            <div class="terms-content">
                <p>1. Customer will be billed after indicating acceptance of this invoice</p>
                <p>2. Payment will be due prior to delivery of service and goods</p>
                <p>3. Please fax or mail the signed invoice to the address above</p>
            </div>
        </div>

        <!-- Customer Acceptance -->
        <div class="acceptance-section">
            <div class="acceptance-title">Customer Acceptance (sign below):</div>
            <div class="signature-line">
                <span class="signature-x">X</span>
                <div class="signature-field"></div>
            </div>
            <div class="print-name">Print Name:</div>
            <div class="print-name-field"></div>
        </div>

        <!-- Bank Details -->
        <div class="bank-details">
            <div class="account-row">
                <span class="account-label">Bank Name and Address:</span>
                <span class="account-value">Bank of Kigali, Head Office, Avenue de la Paix</span>
            </div>
            <div class="account-row">
                <span class="account-label">P.O. Box and Location:</span>
                <span class="account-value">P.O. Box 175, Kigali, Rwanda, SWIFT: BKIGRWRW</span>
            </div>
            <div class="account-row">
                <span class="account-label">Account No.:</span>
                <span class="account-value">00040-00314912-83 (RWF) / 00040-00314914-85 (USD)</span>
            </div>
            <div class="account-row">
                <span class="account-label">Name of Account Holder:</span>
                <span class="account-value">Esri Rwanda Ltd.</span>
            </div>
            <div class="account-row">
                <span class="account-label">Reference Instruction:</span>
                <span class="account-value">Please reference our invoice number in your correspondence!</span>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>If you have any questions about this invoice, please contact</p>
            <p class="footer-contact">Sales Team, +250 788 123 456, info@esri.rw</p>
            <p class="footer-thanks">Thank You For Your Business!</p>
        </div>
    </div>
</body>
</html>
  `
}

export const downloadInvoiceHTML = (quotation: Quotation, companySettings: CompanySettings, client?: Client): void => {
  const htmlContent = generateInvoiceHTML(quotation, companySettings, client)
  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `invoice-${quotation.quotationNumber}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Generate Invoice PDF using the styled HTML with embedded Esri logo
export const downloadInvoicePDF = async (quotation: Quotation, companySettings: CompanySettings, client?: Client): Promise<void> => {
  const html = generateInvoiceHTML(quotation, companySettings, client)

  // Create an offscreen container to render the HTML
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-10000px'
  container.style.top = '0'
  container.style.width = '210mm'
  container.style.background = '#ffffff'
  container.innerHTML = html
  document.body.appendChild(container)

  try {
    const target = container.querySelector('.invoice-container') as HTMLElement | null
    if (!target) throw new Error('Invoice container not found')

    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(target, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' })

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

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      doc.addPage()
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    doc.save(`invoice-${quotation.quotationNumber}.pdf`)
  } finally {
    document.body.removeChild(container)
  }
}

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

// New PDF generation function that matches the template design
export const generateQuotationPDFNew = (quotation: Quotation, companySettings: CompanySettings, client?: Client): void => {
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

  // Format date helper
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return `${companySettings.currency} ${amount.toFixed(2)}`
  }

  // Header Section - Company Logo and Details (Left Side)
  
  // Company Logo (blue square with esri text)
  doc.setFillColor(0, 100, 200) // Blue background
  doc.rect(margin, yPosition, 30, 30, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('esri', margin + 5, yPosition + 12)
  doc.setFontSize(8)
  doc.text('RWANDA', margin + 8, yPosition + 20)
  doc.setTextColor(0, 0, 0)
  
  // Company Name
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Esri Rwanda', margin + 40, yPosition + 15)
  
  // Company Details
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  yPosition = addText('18 KG 5 Ave, Kigali', margin + 40, yPosition + 25)
  yPosition = addText('Website: www.esri.rw/', margin + 40, yPosition)
  yPosition = addText('Phone: 0788 381 900', margin + 40, yPosition)
  yPosition = addText('Email: info@esri.rw', margin + 40, yPosition)
  yPosition = addText('Prepared by: Sales Team', margin + 40, yPosition + 5)

  // Quote Details (Right Side)
  const quoteX = pageWidth - 80
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 100, 200) // Blue color
  doc.text('QUOTE', quoteX, margin + 20)
  doc.setTextColor(0, 0, 0)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`DATE: ${formatDate(quotation.createdAt)}`, quoteX, margin + 35)
  doc.text(`QUOTE #: ${quotation.quotationNumber}`, quoteX, margin + 45)
  doc.text(`CUSTOMER ID: ${quotation.clientId}`, quoteX, margin + 55)
  doc.text(`VALID UNTIL: ${formatDate(quotation.validUntil)}`, quoteX, margin + 65)

  yPosition = Math.max(yPosition, margin + 80)

  // Customer Section
  addTextWithBackground('CUSTOMER', margin, yPosition, pageWidth - 2*margin, 15)
  yPosition += 20
  
  if (client) {
    yPosition = addText(`${client.name} (${client.company})`, margin, yPosition)
    yPosition = addText(client.address, margin, yPosition)
    yPosition = addText(client.phone, margin, yPosition)
    yPosition = addText(client.email, margin, yPosition)
  } else {
    yPosition = addText(quotation.clientName, margin, yPosition)
  }

  yPosition += 10

  // Items table header
  addTextWithBackground('DESCRIPTION', margin, yPosition, (pageWidth - 2*margin) * 0.6, 18)
  addTextWithBackground('TAXED', margin + (pageWidth - 2*margin) * 0.6, yPosition, (pageWidth - 2*margin) * 0.2, 18)
  addTextWithBackground('AMOUNT', margin + (pageWidth - 2*margin) * 0.8, yPosition, (pageWidth - 2*margin) * 0.2, 18)
  yPosition += 22

  // Items table rows
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  quotation.items.forEach((item) => {
    if (yPosition > pageHeight - 100) {
      doc.addPage()
      yPosition = margin
    }
    
    // Description
    doc.text(item.description, margin + 5, yPosition)
    
    // Taxed column (X for SEO, empty for others)
    const taxedX = margin + (pageWidth - 2*margin) * 0.6 + (pageWidth - 2*margin) * 0.2 / 2
    if (item.description.toLowerCase().includes('seo')) {
      doc.text('X', taxedX, yPosition)
    }
    
    // Amount - right aligned
    const amountX = margin + (pageWidth - 2*margin) * 0.8 + 5
    const amountText = formatCurrency(item.total)
    const textWidth = doc.getTextWidth(amountText)
    doc.text(amountText, amountX + (pageWidth - 2*margin) * 0.2 - textWidth - 5, yPosition)
    yPosition += 10
  })

  yPosition += 10

  // Summary Section (Right side)
  const summaryX = pageWidth - 100
  const summaryY = yPosition
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  // Subtotal
  doc.text('Subtotal:', summaryX - 50, summaryY)
  const subtotalText = formatCurrency(quotation.subtotal)
  doc.text(subtotalText, summaryX - doc.getTextWidth(subtotalText), summaryY)
  
  // Taxable amount
  doc.text('Taxable:', summaryX - 50, summaryY + 8)
  const taxableText = formatCurrency(quotation.subtotal)
  doc.text(taxableText, summaryX - doc.getTextWidth(taxableText), summaryY + 8)
  
  // Tax rate in box
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  doc.rect(summaryX - 50, summaryY + 15, 30, 8)
  doc.text(`${quotation.taxRate}%`, summaryX - 45, summaryY + 20)
  
  // Tax due
  doc.text('Tax due:', summaryX - 50, summaryY + 30)
  const taxText = formatCurrency(quotation.taxAmount)
  doc.text(taxText, summaryX - doc.getTextWidth(taxText), summaryY + 30)
  
  // Other (empty)
  doc.text('Other:', summaryX - 50, summaryY + 38)
  
  // Total (highlighted with yellow background)
  doc.setFillColor(255, 255, 0) // Yellow background
  doc.rect(summaryX - 50, summaryY + 45, 50, 12, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('TOTAL:', summaryX - 45, summaryY + 53)
  const totalText = formatCurrency(quotation.total)
  doc.text(totalText, summaryX - doc.getTextWidth(totalText), summaryY + 53)

  yPosition = summaryY + 70

  // Terms and Conditions
  if (yPosition > pageHeight - 80) {
    doc.addPage()
    yPosition = margin
  }
  
  addTextWithBackground('TERMS AND CONDITIONS', margin, yPosition, pageWidth - 2*margin, 15)
  yPosition += 20
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  yPosition = addText('1. Customer will be billed after indicating acceptance of this quote', margin, yPosition)
  yPosition = addText('2. Payment will be due prior to delivery of service and goods', margin, yPosition)
  yPosition = addText('3. Please fax or mail the signed price quote to the address above', margin, yPosition)

  yPosition += 20

  // Customer Acceptance
  if (yPosition > pageHeight - 60) {
    doc.addPage()
    yPosition = margin
  }
  
  doc.text('Customer Acceptance (sign below):', margin, yPosition)
  yPosition += 15
  doc.line(margin, yPosition, margin + 100, yPosition)
  yPosition += 20
  
  doc.text('Print Name:', margin, yPosition)
  yPosition += 15
  doc.line(margin, yPosition, margin + 100, yPosition)

  yPosition += 30

  // Footer
  if (yPosition > pageHeight - 40) {
    doc.addPage()
    yPosition = margin
  }
  
  const footerY = pageHeight - 30
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('If you have any questions about this price quote, please contact', pageWidth/2, footerY, { align: 'center' })
  doc.text(`Sales Team, 0788 381 900, info@esri.rw`, pageWidth/2, footerY + 5, { align: 'center' })
  
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 140, 0) // Orange color
  doc.text('Thank You For Your Business!', pageWidth/2, footerY + 15, { align: 'center' })
  doc.setTextColor(0, 0, 0)

  // Download the PDF
  doc.save(`quotation-${quotation.quotationNumber}.pdf`)
}