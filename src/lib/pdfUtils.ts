import jsPDF from 'jspdf'
import { Quotation, Client, CompanySettings } from './store'
import { calculateAnalytics, formatCurrency, formatPercentage, formatNumber } from './analytics'

// HTML Generation Functions
export const generateQuotationHTMLOptimized = (quotation: Quotation, companySettings: CompanySettings, client?: Client): string => {
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
            background-color: white;
            font-size: 12px;
            line-height: 1.4;
        }
        
        .quotation-container {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 8mm;
            background-color: white;
            overflow: hidden;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 6mm;
            padding-bottom: 4mm;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .company-info {
            flex: 1;
        }
        
        .logo-section {
            margin-bottom: 4mm;
        }
        
        .logo {
            width: 70px;
            height: 50px;
            background-color: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            margin-bottom: 8px;
            overflow: hidden;
        }
        
        .company-name {
            font-size: 18px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 3mm;
            letter-spacing: 0.5px;
        }
        
        .company-details {
            font-size: 11px;
            color: #374151;
            line-height: 1.4;
            font-weight: 500;
        }
        
        .company-details p {
            margin: 2px 0;
        }
        
        .quote-section {
            text-align: right;
        }
        
        .quote-title {
            font-size: 24px;
            font-weight: 800;
            color: #0066cc;
            margin-bottom: 3mm;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        
        .quote-details {
            font-size: 11px;
            line-height: 1.4;
            font-weight: 500;
        }
        
        .quote-details p {
            margin: 3px 0;
        }
        
        .quote-details span {
            font-weight: 700;
            color: #1f2937;
        }
        
        .customer-section {
            margin-bottom: 5mm;
        }
        
        .customer-header {
            background-color: #0066cc;
            color: white;
            padding: 6px 12px;
            text-align: center;
            font-weight: 700;
            font-size: 12px;
            margin-bottom: 3mm;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            border-radius: 3px;
        }
        
        .customer-details {
            font-size: 11px;
            line-height: 1.4;
            font-weight: 400;
            padding: 2mm 0;
        }
        
        .customer-details p {
            margin: 2px 0;
        }
        
        .customer-details .name {
            font-weight: 600;
            color: #1f2937;
        }
        
        .customer-details .label {
            font-weight: 600;
            color: #6b7280;
            margin-right: 4px;
        }
        
        .services-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5mm;
            font-size: 10px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .services-table th {
            background-color: #0066cc;
            color: white;
            padding: 8px 10px;
            text-align: left;
            font-weight: 700;
            font-size: 10px;
            border: none;
            letter-spacing: 0.3px;
            text-transform: uppercase;
        }
        
        .services-table th.center {
            text-align: center;
            width: 50px;
        }
        
        .services-table th.right {
            text-align: right;
            width: 70px;
        }
        
        .services-table th.quantity {
            text-align: center;
            width: 60px;
        }
        
        .services-table th.unit-price {
            text-align: right;
            width: 80px;
        }
        
        .services-table th.description {
            text-align: left;
            width: 200px;
            max-width: 200px;
        }
        
        .services-table td {
            padding: 6px 10px;
            border: none;
            border-bottom: 1px solid #e5e7eb;
            font-size: 10px;
            font-weight: 400;
            line-height: 1.3;
        }
        
        .services-table tbody tr:last-child td {
            border-bottom: none;
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
        
        .services-table td.description {
            text-align: left;
            max-width: 200px;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        
        .summary-section {
            display: flex;
            justify-content: flex-end;
            margin-top: 4mm;
            margin-bottom: 4mm;
        }
        
        .summary-box {
            width: 55mm;
            font-size: 10px;
            font-weight: 400;
            background-color: #f9fafb;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #e5e7eb;
        }
        
        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
            padding: 2px 0;
        }
        
        .total-row {
            background-color: #fef3c7;
            font-weight: 700;
            font-size: 11px;
            padding: 6px 8px;
            border: 1px solid #f59e0b;
            margin-top: 4px;
            letter-spacing: 0.3px;
            border-radius: 3px;
        }
        
        .terms-section {
            margin-bottom: 5mm;
        }
        
        .terms-header {
            background-color: #0066cc;
            color: white;
            padding: 6px 12px;
            text-align: center;
            font-weight: 700;
            font-size: 11px;
            margin-bottom: 3mm;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            border-radius: 3px;
        }
        
        .terms-content {
            font-size: 9px;
            line-height: 1.4;
            font-weight: 400;
            padding: 2mm 0;
        }
        
        .terms-content p {
            margin-bottom: 3px;
        }
        
        .acceptance-section {
            margin-bottom: 5mm;
            padding: 3mm 0;
        }
        
        .acceptance-title {
            font-weight: bold;
            font-size: 11px;
            margin-bottom: 4mm;
            color: #374151;
        }
        
        .signature-line {
            display: flex;
            align-items: center;
            margin-bottom: 4mm;
        }
        
        .signature-x {
            margin-right: 10px;
            font-size: 14px;
            color: #6b7280;
        }
        
        .signature-field {
            border-bottom: 2px solid #374151;
            width: 60mm;
            height: 6mm;
        }
        
        .print-name {
            font-weight: bold;
            font-size: 11px;
            margin-bottom: 4mm;
            color: #374151;
        }
        
        .print-name-field {
            border-bottom: 2px solid #374151;
            width: 60mm;
            height: 6mm;
        }
        
        .footer {
            text-align: center;
            font-size: 10px;
            margin-top: 5mm;
            padding-top: 3mm;
            border-top: 1px solid #e5e7eb;
        }
        
        .bank-details {
            margin-top: 4mm;
            font-size: 9px;
            text-align: left;
            background: #f8fafc;
            padding: 6px 8px;
            border-radius: 4px;
            border: 1px solid #d1d5db;
        }
        
        .bank-details .account-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 2px 0;
            padding: 2px 0;
            min-height: 16px;
        }

        .bank-details .account-label {
            font-weight: 500;
            color: #6b7280;
            font-size: 9px;
            min-width: 70px;
        }

        .bank-details .account-value {
            font-weight: 500;
            color: #111827;
            font-size: 9px;
            text-align: right;
            flex: 1;
        }
        
        .footer-contact {
            font-weight: 600;
            margin: 4px 0;
            color: #1f2937;
        }
        
        .footer-thanks {
            color: #f59e0b;
            font-weight: 700;
            font-size: 13px;
            margin-top: 4mm;
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
                        <div style="width: 100%; height: 100%; background-color: #0066cc; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">ESRI</div>
                    </div>
                </div>
                
                <div class="company-details">
                    <p>KG 7 Ave, Kigali, Rwanda</p>
                    <p>Website: www.esri.rw</p>
                    <p>Phone: 0788 381 900</p>
                    <p>Email: info@esri.rw</p>
                    <p style="margin-top: 4px; font-weight: 600; color: #374151;">Prepared by: Sales Team</p>
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
                    <p><span class="label">Phone:</span>${client.phone}</p>
                    <p><span class="label">Email:</span>${client.email}</p>
                ` : '<p>No client information available</p>'}
            </div>
        </div>

        <!-- Services Table -->
        <table class="services-table">
            <thead>
                <tr>
                    <th class="description">DESCRIPTION</th>
                    <th class="quantity">QUANTITY</th>
                    <th class="unit-price">UNIT PRICE</th>
                    <th class="right">AMOUNT</th>
                </tr>
            </thead>
            <tbody>
                ${quotation.items.map(item => `
                    <tr>
                        <td class="description">${item.description}</td>
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

// Generate HTML for Invoice format
export const generateInvoiceHTMLOptimized = (quotation: Quotation, companySettings: CompanySettings, client?: Client): string => {
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
            background-color: white;
            font-size: 12px;
            line-height: 1.4;
        }
        
        .invoice-container {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 8mm;
            background-color: white;
            overflow: hidden;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 6mm;
            padding-bottom: 4mm;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .company-info {
            flex: 1;
        }
        
        .logo-section {
            margin-bottom: 4mm;
        }
        
        .logo {
            width: 70px;
            height: 50px;
            background-color: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            margin-bottom: 8px;
            overflow: hidden;
        }
        
        .company-name {
            font-size: 18px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 3mm;
            letter-spacing: 0.5px;
        }
        
        .company-details {
            font-size: 11px;
            color: #374151;
            line-height: 1.4;
            font-weight: 500;
        }
        
        .company-details p {
            margin: 2px 0;
        }
        
        .invoice-section {
            text-align: right;
        }
        
        .invoice-title {
            font-size: 24px;
            font-weight: 800;
            color: #dc2626;
            margin-bottom: 3mm;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        
        .invoice-details {
            font-size: 11px;
            line-height: 1.4;
            font-weight: 500;
        }
        
        .invoice-details p {
            margin: 3px 0;
        }
        
        .invoice-details span {
            font-weight: 700;
            color: #1f2937;
        }
        
        .customer-section {
            margin-bottom: 5mm;
        }
        
        .customer-header {
            background-color: #dc2626;
            color: white;
            padding: 6px 12px;
            text-align: center;
            font-weight: 700;
            font-size: 12px;
            margin-bottom: 3mm;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            border-radius: 3px;
        }
        
        .customer-details {
            font-size: 11px;
            line-height: 1.4;
            font-weight: 400;
            padding: 2mm 0;
        }
        
        .customer-details p {
            margin: 2px 0;
        }
        
        .customer-details .name {
            font-weight: 600;
            color: #1f2937;
        }
        
        .customer-details .label {
            font-weight: 600;
            color: #6b7280;
            margin-right: 4px;
        }
        
        .services-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5mm;
            font-size: 10px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .services-table th {
            background-color: #dc2626;
            color: white;
            padding: 8px 10px;
            text-align: left;
            font-weight: 700;
            font-size: 10px;
            border: none;
            letter-spacing: 0.3px;
            text-transform: uppercase;
        }
        
        .services-table th.center {
            text-align: center;
            width: 50px;
        }
        
        .services-table th.right {
            text-align: right;
            width: 70px;
        }
        
        .services-table th.quantity {
            text-align: center;
            width: 60px;
        }
        
        .services-table th.unit-price {
            text-align: right;
            width: 80px;
        }
        
        .services-table th.description {
            text-align: left;
            width: 200px;
            max-width: 200px;
        }
        
        .services-table td {
            padding: 6px 10px;
            border: none;
            border-bottom: 1px solid #e5e7eb;
            font-size: 10px;
            font-weight: 400;
            line-height: 1.3;
        }
        
        .services-table tbody tr:last-child td {
            border-bottom: none;
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
        
        .services-table td.description {
            text-align: left;
            max-width: 200px;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        
        .summary-section {
            display: flex;
            justify-content: flex-end;
            margin-top: 4mm;
            margin-bottom: 4mm;
        }
        
        .summary-box {
            width: 55mm;
            font-size: 10px;
            font-weight: 400;
            background-color: #f9fafb;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #e5e7eb;
        }
        
        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
            padding: 2px 0;
        }
        
        .total-row {
            background-color: #fef2f2;
            font-weight: 700;
            font-size: 11px;
            padding: 6px 8px;
            border: 1px solid #dc2626;
            margin-top: 4px;
            letter-spacing: 0.3px;
            border-radius: 3px;
        }
        
        .terms-section {
            margin-bottom: 5mm;
        }
        
        .terms-header {
            background-color: #dc2626;
            color: white;
            padding: 6px 12px;
            text-align: center;
            font-weight: 700;
            font-size: 11px;
            margin-bottom: 3mm;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            border-radius: 3px;
        }
        
        .terms-content {
            font-size: 9px;
            line-height: 1.4;
            font-weight: 400;
            padding: 2mm 0;
        }
        
        .terms-content p {
            margin-bottom: 3px;
        }
        
        .payment-section {
            margin-bottom: 5mm;
            padding: 3mm 0;
        }
        
        .payment-title {
            font-weight: bold;
            font-size: 11px;
            margin-bottom: 4mm;
            color: #374151;
        }
        
        .payment-details {
            font-size: 10px;
            line-height: 1.4;
            font-weight: 400;
            padding: 2mm 0;
        }
        
        .payment-details p {
            margin: 2px 0;
        }
        
        .footer {
            text-align: center;
            font-size: 10px;
            margin-top: 5mm;
            padding-top: 3mm;
            border-top: 1px solid #e5e7eb;
        }
        
        .bank-details {
            margin-top: 4mm;
            font-size: 9px;
            text-align: left;
            background: #f8fafc;
            padding: 6px 8px;
            border-radius: 4px;
            border: 1px solid #d1d5db;
        }
        
        .bank-details .account-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 2px 0;
            padding: 2px 0;
            min-height: 16px;
        }

        .bank-details .account-label {
            font-weight: 500;
            color: #6b7280;
            font-size: 9px;
            min-width: 70px;
        }

        .bank-details .account-value {
            font-weight: 500;
            color: #111827;
            font-size: 9px;
            text-align: right;
            flex: 1;
        }
        
        .footer-contact {
            font-weight: 600;
            margin: 4px 0;
            color: #1f2937;
        }
        
        .footer-thanks {
            color: #dc2626;
            font-weight: 700;
            font-size: 13px;
            margin-top: 4mm;
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
                        <div style="width: 100%; height: 100%; background-color: #dc2626; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">ESRI</div>
                    </div>
                </div>
                
                <div class="company-details">
                    <p>KG 7 Ave, Kigali, Rwanda</p>
                    <p>Website: www.esri.rw</p>
                    <p>Phone: 0788 381 900</p>
                    <p>Email: info@esri.rw</p>
                    <p style="margin-top: 4px; font-weight: 600; color: #374151;">Prepared by: Sales Team</p>
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
            <div class="customer-header">BILL TO</div>
            <div class="customer-details">
                ${client ? `
                    <p class="name">${client.name} (${client.company})</p>
                    <p>${client.address}</p>
                    <p><span class="label">Phone:</span>${client.phone}</p>
                    <p><span class="label">Email:</span>${client.email}</p>
                ` : '<p>No client information available</p>'}
            </div>
        </div>

        <!-- Services Table -->
        <table class="services-table">
            <thead>
                <tr>
                    <th class="description">DESCRIPTION</th>
                    <th class="quantity">QUANTITY</th>
                    <th class="unit-price">UNIT PRICE</th>
                    <th class="right">AMOUNT</th>
                </tr>
            </thead>
            <tbody>
                ${quotation.items.map(item => `
                    <tr>
                        <td class="description">${item.description}</td>
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
                    <span>Discount:</span>
                    <span>${quotation.discount > 0 ? formatCurrency(quotation.discount) : '-'}</span>
                </div>
                <div class="total-row">
                    <span>TOTAL DUE:</span>
                    <span>${formatCurrency(quotation.total)}</span>
                </div>
            </div>
        </div>

        <!-- Payment Terms -->
        <div class="terms-section">
            <div class="terms-header">PAYMENT TERMS</div>
            <div class="terms-content">
                <p>1. Payment is due within 30 days of invoice date</p>
                <p>2. Late payments may incur additional charges</p>
                <p>3. Please reference invoice number in all payments</p>
            </div>
        </div>

        <!-- Payment Information -->
        <div class="payment-section">
            <div class="payment-title">Payment Information:</div>
            <div class="payment-details">
                <p>Please make payment to the account details below:</p>
            </div>
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
                <span class="account-value">Please reference invoice ${quotation.quotationNumber} in your payment!</span>
            </div>
        </div>
        ` : ''}

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

export const downloadInvoicePDF = async (quotation: Quotation, companySettings: CompanySettings, client?: Client): Promise<void> => {
  try {
    console.log('Starting invoice PDF generation for:', quotation.quotationNumber)
    
    // Validate quotation data
    if (!quotation || !quotation.quotationNumber) {
      throw new Error('Invalid quotation data provided')
    }
    
    if (!quotation.items || quotation.items.length === 0) {
      throw new Error('Quotation must have at least one item')
    }
    
    // Create a simple HTML content for testing
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
    
    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
    
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-title { font-size: 24px; color: #dc2626; font-weight: bold; }
            .company-info { margin-bottom: 20px; }
            .customer-info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #dc2626; color: white; }
            .total { font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1 class="invoice-title">INVOICE</h1>
            <p>Invoice #: ${quotation.quotationNumber}</p>
            <p>Date: ${formatDate(quotation.createdAt)}</p>
        </div>
        
        <div class="company-info">
            <h3>From:</h3>
            <p>${companySettings.name}</p>
            <p>${companySettings.address}</p>
            <p>Phone: ${companySettings.phone}</p>
            <p>Email: ${companySettings.email}</p>
        </div>
        
        <div class="customer-info">
            <h3>Bill To:</h3>
            ${client ? `
                <p>${client.name} (${client.company})</p>
                <p>${client.address}</p>
                <p>Phone: ${client.phone}</p>
                <p>Email: ${client.email}</p>
            ` : '<p>No client information available</p>'}
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${quotation.items.map(item => `
                    <tr>
                        <td>${item.description}</td>
                        <td>${item.quantity}</td>
                        <td>${formatCurrency(item.unitPrice)}</td>
                        <td>${formatCurrency(item.total)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div style="text-align: right;">
            <p>Subtotal: ${formatCurrency(quotation.subtotal)}</p>
            <p>Tax (${quotation.taxRate}%): ${formatCurrency(quotation.taxAmount)}</p>
            <p class="total">Total Due: ${formatCurrency(quotation.total)}</p>
        </div>
    </body>
    </html>
    `
    
    console.log('HTML content generated, length:', htmlContent.length)
    
    // Create a temporary container
    const tempContainer = document.createElement('div')
    tempContainer.innerHTML = htmlContent
    tempContainer.style.position = 'absolute'
    tempContainer.style.left = '-9999px'
    tempContainer.style.top = '-9999px'
    tempContainer.style.width = '210mm'
    tempContainer.style.backgroundColor = 'white'
    tempContainer.style.fontSize = '12px'
    document.body.appendChild(tempContainer)
    console.log('Temporary container created and added to DOM')
    
    // Wait a bit for any content to load
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Wait completed')
    
    // Import html2canvas dynamically
    const { default: html2canvas } = await import('html2canvas')
    console.log('html2canvas imported successfully')
    
    // Convert HTML to canvas with optimized settings
    const canvas = await html2canvas(tempContainer, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794,
      height: 1123,
      scrollX: 0,
      scrollY: 0
    })
    console.log('Canvas generated successfully, dimensions:', canvas.width, 'x', canvas.height)
    
    // Remove temporary container
    document.body.removeChild(tempContainer)
    console.log('Temporary container removed')
    
    // Create PDF
    const imgData = canvas.toDataURL('image/png')
    console.log('Image data generated, length:', imgData.length)
    
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    console.log('PDF document created, page size:', pageWidth, 'x', pageHeight)
    
    // Add single page with the image
    doc.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight)
    console.log('Image added to PDF')
    
    // Download the PDF
    doc.save(`invoice-${quotation.quotationNumber}.pdf`)
    console.log('PDF saved successfully')
  } catch (error) {
    console.error('Detailed error generating PDF:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const downloadQuotationPDF = async (quotation: Quotation, companySettings: CompanySettings, client?: Client): Promise<void> => {
  try {
    // Generate optimized HTML content for single page PDF
    const htmlContent = generateQuotationHTMLOptimized(quotation, companySettings, client)
    
    // Create a temporary container
    const tempContainer = document.createElement('div')
    tempContainer.innerHTML = htmlContent
    tempContainer.style.position = 'absolute'
    tempContainer.style.left = '-9999px'
    tempContainer.style.top = '-9999px'
    tempContainer.style.width = '210mm'
    tempContainer.style.backgroundColor = 'white'
    tempContainer.style.fontSize = '12px' // Smaller base font size
    document.body.appendChild(tempContainer)
    
    // Wait a bit for any content to load
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Import html2canvas dynamically
    const { default: html2canvas } = await import('html2canvas')
    
    // Convert HTML to canvas with optimized settings
    const canvas = await html2canvas(tempContainer, {
      scale: 1.5, // Reduced scale for better fit
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI (single page)
      scrollX: 0,
      scrollY: 0
    })
    
    // Remove temporary container
    document.body.removeChild(tempContainer)
    
    // Create PDF
    const imgData = canvas.toDataURL('image/png')
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    // Add single page with the image
    doc.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight)
    
    // Download the PDF
    doc.save(`quotation-${quotation.quotationNumber}.pdf`)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF. Please try again.')
  }
}

// Comprehensive Analytics PDF Export
export const generateAnalyticsPDF = (quotations: Quotation[], clients: Client[], companySettings: CompanySettings) => {
  const analytics = calculateAnalytics(quotations, clients)
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPosition = margin

  // Helper function to add text with automatic page breaks
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    if (y > pageHeight - 20) {
      doc.addPage()
      return margin
    }
    doc.text(text, x, y, options)
    return y + 6
  }

  // Helper function to add section headers
  const addSectionHeader = (title: string, y: number) => {
    if (y > pageHeight - 30) {
      doc.addPage()
      y = margin
    }
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 100, 200)
    doc.text(title, margin, y)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    return y + 15
  }

  // Helper function to add metric cards
  const addMetricCard = (label: string, value: string, x: number, y: number, width: number, height: number) => {
    // Card border
    doc.setDrawColor(200, 200, 200)
    doc.rect(x, y, width, height)
    
    // Card background
    doc.setFillColor(248, 250, 252)
    doc.rect(x, y, width, height, 'F')
    
    // Label
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(label, x + 5, y + 8)
    
    // Value
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(value, x + 5, y + 18)
    
    return y + height + 10
  }

  // Title Page
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 100, 200)
  doc.text('Business Analytics Report', pageWidth/2, 50, { align: 'center' })
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(companySettings.name, pageWidth/2, 70, { align: 'center' })
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth/2, 80, { align: 'center' })
  
  yPosition = 120

  // Executive Summary
  yPosition = addSectionHeader('Executive Summary', yPosition)
  
  const summaryText = `This report provides comprehensive insights into your quotation business performance. 
Key metrics include ${formatNumber(analytics.totalQuotations)} total quotations with a ${formatPercentage(analytics.conversionRate)} conversion rate, 
generating ${formatCurrency(analytics.totalRevenue)} in total revenue across ${formatNumber(analytics.totalClients)} clients.`
  
  yPosition = addText(summaryText, margin, yPosition, { maxWidth: pageWidth - 2*margin })

  // Key Metrics Grid
  yPosition = addSectionHeader('Key Performance Indicators', yPosition)
  
  const cardWidth = (pageWidth - 2*margin - 20) / 4
  const cardHeight = 25
  let cardX = margin
  let cardY = yPosition
  
  // Row 1
  cardY = addMetricCard('Total Quotations', formatNumber(analytics.totalQuotations), cardX, cardY, cardWidth, cardHeight)
  cardX += cardWidth + 5
  cardY = addMetricCard('Total Revenue', formatCurrency(analytics.totalRevenue), cardX, cardY, cardWidth, cardHeight)
  cardX += cardWidth + 5
  cardY = addMetricCard('Total Clients', formatNumber(analytics.totalClients), cardX, cardY, cardWidth, cardHeight)
  cardX += cardWidth + 5
  cardY = addMetricCard('Conversion Rate', formatPercentage(analytics.conversionRate), cardX, cardY, cardWidth, cardHeight)
  
  // Row 2
  cardX = margin
  cardY = addMetricCard('Avg. Quotation Value', formatCurrency(analytics.averageQuotationValue), cardX, cardY, cardWidth, cardHeight)
  cardX += cardWidth + 5
  cardY = addMetricCard('Accepted Revenue', formatCurrency(analytics.acceptedRevenue), cardX, cardY, cardWidth, cardHeight)
  cardX += cardWidth + 5
  cardY = addMetricCard('Lost Revenue', formatCurrency(analytics.rejectedRevenue), cardX, cardY, cardWidth, cardHeight)
  cardX += cardWidth + 5
  cardY = addMetricCard('Pipeline Value', formatCurrency(analytics.pipelineValue), cardX, cardY, cardWidth, cardHeight)

  yPosition = cardY + 20

  // Quotation Status Breakdown
  yPosition = addSectionHeader('Quotation Status Breakdown', yPosition)
  
  const statusData = Object.entries(analytics.quotationsByStatus).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count,
    percentage: analytics.totalQuotations > 0 ? Math.round((count / analytics.totalQuotations) * 100) : 0
  }))

  statusData.forEach((item) => {
    yPosition = addText(`${item.status}: ${item.count} quotations (${item.percentage}%)`, margin + 10, yPosition)
  })

  yPosition += 10

  // Financial Insights
  yPosition = addSectionHeader('Financial Insights', yPosition)
  
  yPosition = addText(`Currency Breakdown:`, margin, yPosition)
  Object.entries(analytics.currencyBreakdown).forEach(([currency, amount]) => {
    yPosition = addText(`  ${currency}: ${formatCurrency(amount, currency)}`, margin + 10, yPosition)
  })
  
  yPosition += 5
  yPosition = addText(`Tax Summary:`, margin, yPosition)
  yPosition = addText(`  Total Tax Collected: ${formatCurrency(analytics.taxSummary.totalTax)}`, margin + 10, yPosition)
  yPosition = addText(`  Average Tax Rate: ${formatPercentage(analytics.taxSummary.averageTaxRate)}`, margin + 10, yPosition)
  
  yPosition += 5
  yPosition = addText(`Discount Summary:`, margin, yPosition)
  yPosition = addText(`  Total Discounts Given: ${formatCurrency(analytics.discountSummary.totalDiscounts)}`, margin + 10, yPosition)
  yPosition = addText(`  Average Discount: ${formatCurrency(analytics.discountSummary.averageDiscount)}`, margin + 10, yPosition)

  yPosition += 10

  // Client Insights
  yPosition = addSectionHeader('Client Performance', yPosition)
  
  yPosition = addText(`Top 5 Clients by Revenue:`, margin, yPosition)
  analytics.topClientsByValue.slice(0, 5).forEach((client, index) => {
    yPosition = addText(`  ${index + 1}. ${client.client.name} (${client.client.company})`, margin + 10, yPosition)
    yPosition = addText(`     Revenue: ${formatCurrency(client.totalValue)} | Quotations: ${client.quotationCount} | Acceptance Rate: ${formatPercentage(client.acceptanceRate)}`, margin + 20, yPosition)
  })

  if (analytics.inactiveClients.length > 0) {
    yPosition += 5
    yPosition = addText(`Inactive Clients (no activity in 6+ months):`, margin, yPosition)
    analytics.inactiveClients.forEach((client) => {
      yPosition = addText(`  • ${client.name} (${client.company})`, margin + 10, yPosition)
    })
  }

  yPosition += 10

  // Product/Service Insights
  yPosition = addSectionHeader('Product & Service Analytics', yPosition)
  
  yPosition = addText(`Most Quoted Items:`, margin, yPosition)
  analytics.mostQuotedItems.slice(0, 5).forEach((item, index) => {
    yPosition = addText(`  ${index + 1}. ${item.item.description}`, margin + 10, yPosition)
    yPosition = addText(`     Quoted ${item.count} times | Avg. Price: ${formatCurrency(item.averagePrice)} | Category: ${item.item.category || 'Uncategorized'}`, margin + 20, yPosition)
  })

  yPosition += 5
  yPosition = addText(`Category Breakdown:`, margin, yPosition)
  Object.entries(analytics.categoryBreakdown).forEach(([category, data]) => {
    yPosition = addText(`  ${category.charAt(0).toUpperCase() + category.slice(1)}: ${formatCurrency(data.totalValue)} (${data.count} items)`, margin + 10, yPosition)
  })

  yPosition += 10

  // Time-based Trends
  yPosition = addSectionHeader('Time-based Analysis', yPosition)
  
  yPosition = addText(`Monthly Trends:`, margin, yPosition)
  analytics.monthlyTrends.slice(-6).forEach((trend) => {
    yPosition = addText(`  ${trend.month}: ${trend.quotations} quotations, ${formatCurrency(trend.revenue)} revenue`, margin + 10, yPosition)
  })

  yPosition += 5
  yPosition = addText(`Seasonal Demand:`, margin, yPosition)
  Object.entries(analytics.seasonalDemand).forEach(([quarter, count]) => {
    yPosition = addText(`  ${quarter}: ${count} quotations`, margin + 10, yPosition)
  })

  yPosition += 10

  // Pipeline Analysis
  yPosition = addSectionHeader('Pipeline & Forecast', yPosition)
  
  yPosition = addText(`Pending Quotations: ${analytics.pendingQuotations.length}`, margin, yPosition)
  yPosition = addText(`Expiring Soon (7 days): ${analytics.expiringSoon.length}`, margin, yPosition)
  yPosition = addText(`Expected Revenue: ${formatCurrency(analytics.expectedRevenue)}`, margin, yPosition)
  yPosition = addText(`Pipeline Value: ${formatCurrency(analytics.pipelineValue)}`, margin, yPosition)
  yPosition = addText(`Total Potential: ${formatCurrency(analytics.expectedRevenue + analytics.pipelineValue)}`, margin, yPosition)

  if (analytics.pendingQuotations.length > 0) {
    yPosition += 5
    yPosition = addText(`Pending Quotations Details:`, margin, yPosition)
    analytics.pendingQuotations.slice(0, 5).forEach((quotation) => {
      yPosition = addText(`  • ${quotation.quotationNumber} - ${quotation.clientName} - ${formatCurrency(quotation.total, quotation.currency)}`, margin + 10, yPosition)
    })
  }

  if (analytics.expiringSoon.length > 0) {
    yPosition += 5
    yPosition = addText(`Expiring Soon:`, margin, yPosition)
    analytics.expiringSoon.forEach((quotation) => {
      yPosition = addText(`  • ${quotation.quotationNumber} - ${quotation.clientName} - Expires: ${quotation.validUntil}`, margin + 10, yPosition)
    })
  }

  yPosition += 20

  // Recommendations
  yPosition = addSectionHeader('Recommendations', yPosition)
  
  const recommendations = []
  
  if (analytics.conversionRate < 30) {
    recommendations.push("• Focus on improving quotation quality and follow-up processes to increase conversion rate")
  }
  
  if (analytics.inactiveClients.length > 0) {
    recommendations.push(`• Re-engage ${analytics.inactiveClients.length} inactive clients to boost revenue`)
  }
  
  if (analytics.expiringSoon.length > 0) {
    recommendations.push(`• Follow up on ${analytics.expiringSoon.length} quotations expiring soon`)
  }
  
  if (analytics.pipelineValue > analytics.expectedRevenue) {
    recommendations.push("• Focus on converting pending quotations to increase revenue")
  }
  
  if (analytics.rejectedRevenue > analytics.acceptedRevenue * 0.5) {
    recommendations.push("• Analyze rejected quotations to identify improvement opportunities")
  }

  if (recommendations.length === 0) {
    recommendations.push("• Continue current strategies - business is performing well")
  }

  recommendations.forEach((rec) => {
    yPosition = addText(rec, margin, yPosition)
  })

  // Footer
  const footerY = pageHeight - 30
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('Generated by QMS Analytics', pageWidth/2, footerY, { align: 'center' })
  doc.text(`Report generated on ${new Date().toLocaleString()}`, pageWidth/2, footerY + 8, { align: 'center' })

  // Download the PDF
  doc.save(`analytics-report-${new Date().toISOString().split('T')[0]}.pdf`)
}

// Legacy functions for backward compatibility
export const generateReportsPDF = generateAnalyticsPDF
export const generateReportsPDFModern = generateAnalyticsPDF
