import { Quotation, Client, CompanySettings } from '../lib/store'
import { formatCurrency } from '../lib/utils'

interface QuotationTemplateProps {
  quotation: Quotation
  client?: Client
  companySettings: CompanySettings
}

export default function QuotationTemplate({ quotation, client, companySettings }: QuotationTemplateProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatAmount = (amount: number) => {
    return formatCurrency(amount, quotation.currency)
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 border-2 border-gray-400" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8">
        {/* Left Side - Company Info */}
        <div className="flex-1">
          {/* Logo */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-600 flex items-center justify-center mb-2" style={{ borderRadius: '4px' }}>
              <div className="text-white text-center">
                <div className="text-lg font-bold">esri</div>
                <div className="text-xs">RWANDA</div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Esri Rwanda</h1>
          </div>
          
          {/* Company Details */}
          <div className="space-y-1 text-sm text-gray-700">
            <p>KG 7 Ave, Kigali, Rwanda</p>
            <p>www.esri.rw</p>
            <p>+250 788 123 456</p>
            <p>info@esri.rw</p>
            <p className="mt-4">Prepared by: Sales Team</p>
          </div>
        </div>

        {/* Right Side - Quote Details */}
        <div className="text-right">
          <h2 className="text-4xl font-bold text-blue-600 mb-4">QUOTE</h2>
          <div className="space-y-1 text-sm">
            <p><span className="font-semibold">DATE:</span> {formatDate(quotation.createdAt)}</p>
            <p><span className="font-semibold">QUOTE #:</span> {quotation.quotationNumber}</p>
            <p><span className="font-semibold">CUSTOMER ID:</span> {quotation.clientId}</p>
            <p><span className="font-semibold">VALID UNTIL:</span> {formatDate(quotation.validUntil)}</p>
          </div>
        </div>
      </div>

      {/* Customer Section */}
      <div className="mb-8">
        <div className="bg-blue-600 text-white py-2 px-4 text-center font-bold text-lg mb-4">
          CUSTOMER
        </div>
        {client && (
          <div className="space-y-1 text-sm">
            <p className="font-semibold">{client.name} ({client.company})</p>
            <p>{client.address}</p>
            <p>{client.phone}</p>
            <p>{client.email}</p>
          </div>
        )}
      </div>

      {/* Services Table */}
      <div className="mb-8">
        <table className="w-full border-collapse border border-gray-400">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="border border-gray-400 py-3 px-4 text-left font-bold text-lg">DESCRIPTION</th>
              <th className="border border-gray-400 py-3 px-4 text-center font-bold text-lg w-24">TAXED</th>
              <th className="border border-gray-400 py-3 px-4 text-right font-bold text-lg w-32">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {quotation.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-400">
                <td className="border border-gray-400 py-3 px-4 text-sm">{item.description}</td>
                <td className="border border-gray-400 py-3 px-4 text-center text-sm">
                  {item.description.toLowerCase().includes('seo') ? 'X' : ''}
                </td>
                <td className="border border-gray-400 py-3 px-4 text-right text-sm">{formatAmount(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary Section */}
        <div className="flex justify-end mt-6">
          <div className="w-80 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatAmount(quotation.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxable:</span>
              <span>{formatAmount(quotation.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax rate:</span>
              <span>{quotation.taxRate}%</span>
            </div>
            <div className="flex justify-between">
              <span>Tax due:</span>
              <span>{formatAmount(quotation.taxAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Other:</span>
              <span>-</span>
            </div>
            <div className="flex justify-between bg-yellow-200 font-bold text-lg py-3 px-3 border border-gray-400">
              <span>TOTAL:</span>
              <span>{formatAmount(quotation.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      {companySettings.currencyAccounts[quotation.currency] && (
        <div className="mb-8">
          <div className="bg-blue-600 text-white py-3 px-4 text-center font-bold text-lg mb-4">
            PAYMENT INFORMATION
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-semibold">Account No. {companySettings.currencyAccounts[quotation.currency]} ({quotation.currency})</p>
            <p>Please include the quotation number as reference when making payment</p>
          </div>
        </div>
      )}

      {/* Terms and Conditions */}
      <div className="mb-8">
        <div className="bg-blue-600 text-white py-3 px-4 text-center font-bold text-lg mb-4">
          TERMS AND CONDITIONS
        </div>
        <div className="space-y-2 text-sm">
          <p>1. Customer will be billed after indicating acceptance of this quote</p>
          <p>2. Payment will be due prior to delivery of service and goods</p>
          <p>3. Please fax or mail the signed price quote to the address above</p>
        </div>
      </div>

      {/* Customer Acceptance */}
      <div className="mb-8">
        <div className="space-y-6 text-sm">
          <div>
            <p className="font-medium">Customer Acceptance (sign below):</p>
            <div className="mt-3 flex items-center">
              <span className="mr-2">X</span>
              <div className="border-b-2 border-gray-400 w-96 h-8"></div>
            </div>
          </div>
          <div>
            <p className="font-medium">Print Name:</p>
            <div className="border-b-2 border-gray-400 mt-3 w-96 h-8"></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm space-y-2 mt-8">
        <p>If you have any questions about this price quote, please contact</p>
        <p className="font-semibold">Sales Team, +250 788 123 456, info@esri.rw</p>
        <p className="text-orange-500 font-bold text-lg mt-4">Thank You For Your Business!</p>
      </div>
    </div>
  )
}
