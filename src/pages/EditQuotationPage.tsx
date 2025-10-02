"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, ArrowLeft, Loader2, Save, Send } from "lucide-react"
import type { QuotationItem } from "@/lib/store"
import { CURRENCY_OPTIONS, formatCurrency, type Currency } from "@/lib/utils"

export default function EditQuotationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const clients = useStore((state) => state.clients)
  const quotations = useStore((state) => state.quotations)
  const updateQuotation = useStore((state) => state.updateQuotation)

  const quotation = quotations.find((q) => q.id === id)

  if (!quotation) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Quotation not found</h1>
          <p className="text-gray-600 mt-2">The quotation you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/quotations")} className="mt-4">
            Back to Quotations
          </Button>
        </div>
      </div>
    )
  }

  const [formData, setFormData] = useState({
    clientId: quotation.clientId,
    clientName: "",
    validUntil: quotation.validUntil,
    notes: quotation.notes,
    taxRate: quotation.taxRate,
    discount: quotation.discount,
    currency: quotation.currency as Currency,
  })

  const [clientType, setClientType] = useState<"existing" | "new">("existing")
  const [newClientData, setNewClientData] = useState({
    name: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    company: "",
    clientType: "individual" as "individual" | "company",
    tin: "",
  })

  const [items, setItems] = useState<Omit<QuotationItem, "id" | "total">[]>(
    quotation.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      category: item.category,
      itemDescription: item.itemDescription
    }))
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Set client name on component mount
  useEffect(() => {
    const client = clients.find((c) => c.id === quotation.clientId)
    if (client) {
      setFormData(prev => ({
        ...prev,
        clientName: `${client.name} (${client.company || "Individual"})`
      }))
    }
  }, [quotation.clientId, clients])

  const handleClientChange = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    setFormData({
      ...formData,
      clientId,
      clientName: client ? `${client.name} (${client.company || "Individual"})` : "",
    })
  }

  const handleNewClientChange = (field: string, value: string) => {
    setNewClientData(prev => ({ ...prev, [field]: value }))
  }

  const getClientDisplayName = () => {
    if (clientType === "existing") {
      return formData.clientName
    } else {
      return newClientData.name
    }
  }

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, category: "", itemDescription: "" }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof Omit<QuotationItem, "id" | "total">, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const calculateItemTotal = (item: Omit<QuotationItem, "id" | "total">) => {
    return item.quantity * item.unitPrice
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  }

  const calculateTax = () => {
    return (calculateSubtotal() * formData.taxRate) / 100
  }

  const calculateDiscount = () => {
    return (calculateSubtotal() * formData.discount) / 100
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - calculateDiscount()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const quotationData = {
        ...formData,
        quotationNumber: quotation.quotationNumber, // Keep original quotation number
        items: items.map((item, index) => ({
          ...item,
          id: quotation.items[index]?.id || `item-${Date.now()}-${index}`,
          total: calculateItemTotal(item)
        })),
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        discount: calculateDiscount(),
        total: calculateTotal(),
        status: quotation.status, // Keep existing status
        createdAt: quotation.createdAt, // Keep original creation date
        updatedAt: new Date().toISOString()
      }

      updateQuotation(quotation.id, quotationData)
      navigate(`/quotations/${quotation.id}`)
    } catch (error) {
      console.error("Error updating quotation:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === "taxRate" || name === "discount" ? parseFloat(value) || 0 : value
    }))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/quotations")}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Quotation</h1>
            <p className="text-gray-600">Update quotation details and items</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update quotation details and client information (quotation number cannot be changed)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quotationNumber">Quotation Number</Label>
                <Input
                  id="quotationNumber"
                  name="quotationNumber"
                  value={formData.quotationNumber}
                  readOnly
                  className="bg-gray-50 cursor-not-allowed"
                />
                <p className="text-sm text-gray-500 mt-1">Quotation number cannot be changed</p>
              </div>
              <div>
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  name="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value as Currency }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  name="taxRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.taxRate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  name="discount"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes or terms..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Client Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Select an existing client or add a new one</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Button
                type="button"
                variant={clientType === "existing" ? "default" : "outline"}
                onClick={() => setClientType("existing")}
              >
                Existing Client
              </Button>
              <Button
                type="button"
                variant={clientType === "new" ? "default" : "outline"}
                onClick={() => setClientType("new")}
              >
                New Client
              </Button>
            </div>

            {clientType === "existing" ? (
              <div>
                <Label htmlFor="clientId">Select Client</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={handleClientChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} ({client.company || "Individual"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.clientName && (
                  <p className="text-sm text-gray-600 mt-2">Selected: {formData.clientName}</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newClientName">Client Name</Label>
                  <Input
                    id="newClientName"
                    value={newClientData.name}
                    onChange={(e) => handleNewClientChange("name", e.target.value)}
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <Label htmlFor="newClientEmail">Email</Label>
                  <Input
                    id="newClientEmail"
                    type="email"
                    value={newClientData.email}
                    onChange={(e) => handleNewClientChange("email", e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="newClientPhone">Phone</Label>
                  <Input
                    id="newClientPhone"
                    value={newClientData.phone}
                    onChange={(e) => handleNewClientChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="newClientCompany">Company</Label>
                  <Input
                    id="newClientCompany"
                    value={newClientData.company}
                    onChange={(e) => handleNewClientChange("company", e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="newClientAddress">Address</Label>
                  <Textarea
                    id="newClientAddress"
                    value={newClientData.address}
                    onChange={(e) => handleNewClientChange("address", e.target.value)}
                    placeholder="Enter address"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>Quotation Items</CardTitle>
            <CardDescription>Add items and services to your quotation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Input
                      id={`description-${index}`}
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                      placeholder="Item description"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`category-${index}`}>Category</Label>
                    <Input
                      id={`category-${index}`}
                      value={item.category}
                      onChange={(e) => updateItem(index, "category", e.target.value)}
                      placeholder="Item category"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`itemDescription-${index}`}>Detailed Description</Label>
                  <Textarea
                    id={`itemDescription-${index}`}
                    value={item.itemDescription}
                    onChange={(e) => updateItem(index, "itemDescription", e.target.value)}
                    placeholder="Detailed item description"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`unitPrice-${index}`}>Unit Price</Label>
                    <Input
                      id={`unitPrice-${index}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Total</Label>
                    <div className="flex items-center h-10 px-3 py-2 border border-input bg-background rounded-md text-sm">
                      {formatCurrency(calculateItemTotal(item), formData.currency)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addItem} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Quotation Summary</CardTitle>
            <CardDescription>Review the quotation totals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal(), formData.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({formData.taxRate}%):</span>
                <span>{formatCurrency(calculateTax(), formData.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount ({formData.discount}%):</span>
                <span>-{formatCurrency(calculateDiscount(), formData.currency)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(calculateTotal(), formData.currency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/quotations")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSubmitting ? "Updating..." : "Update Quotation"}
          </Button>
        </div>
      </form>
    </div>
  )
}
