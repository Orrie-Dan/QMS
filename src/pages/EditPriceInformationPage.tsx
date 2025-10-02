"use client"

import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useStore, type QuotationItem } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, ArrowLeft, Loader2, Save } from "lucide-react"
import { CURRENCY_OPTIONS, formatCurrency, type Currency } from "@/lib/utils"

type EditPriceLine = Omit<QuotationItem, "id" | "total"> & {
  category?: string
  itemDescription?: string
}

export default function EditPriceInformationPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const clients = useStore((state) => state.clients)
  const quotations = useStore((state) => state.quotations)
  const updateQuotation = useStore((state) => state.updateQuotation)

  const current = useMemo(() => quotations.find((q) => q.id === id), [quotations, id])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    priceNumber: current?.quotationNumber || "",
    clientId: "",
    clientName: current?.clientName || "",
    validUntil: current?.validUntil || "",
    currency: (current?.currency as Currency) || ("RWF" as Currency),
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

  const [items, setItems] = useState<EditPriceLine[]>([])

  useEffect(() => {
    if (!current) return
    // Attempt to match client by name to set clientId (best-effort)
    const match = clients.find((c) => `${c.name} (${c.company || "Individual"})` === current.clientName)
    setFormData((prev) => ({
      ...prev,
      clientId: match?.id || "",
    }))
    setItems(
      current.items.map((it) => ({
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        category: it.category,
        itemDescription: it.itemDescription ?? it.description,
      }))
    )
  }, [current, clients])

  const handleClientChange = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    setFormData({
      ...formData,
      clientId,
      clientName: client ? `${client.name} (${client.company || "Individual"})` : "",
    })
  }

  const handleNewClientChange = (field: string, value: string) => {
    setNewClientData((prev) => ({ ...prev, [field]: value }))
  }

  const getClientDisplayName = () => {
    if (clientType === "existing") {
      return formData.clientName
    } else {
      const typeLabel = newClientData.clientType === "company" ? "Company" : "Individual"
      const displayName = newClientData.clientType === "company" ? `${newClientData.name} (${newClientData.fullName})` : newClientData.name
      return `${displayName} (${typeLabel})`
    }
  }

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, category: "", itemDescription: "" }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof EditPriceLine, value: string | number) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }

    if (field === "category" && typeof value === "string") {
      const categoryLabels = {
        services: "Services",
        software: "Software",
        training: "Training",
      }
      updatedItems[index].description = categoryLabels[value as keyof typeof categoryLabels] || ""
    }

    setItems(updatedItems)
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const taxRate = 0
    const taxAmount = 0
    const discount = 0
    const total = subtotal
    return { subtotal, taxRate, taxAmount, discount, total }
  }

  if (!current) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate("/price-information")}>Back</Button>
        <Card>
          <CardContent className="py-8 text-center">Price information not found.</CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 500))
      const { subtotal, taxRate, taxAmount, discount, total } = calculateTotals()
      const updatedItems: QuotationItem[] = items.map((item, idx) => ({
        id: String(idx + 1),
        description: item.itemDescription && item.itemDescription.trim().length > 0 ? item.itemDescription : item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
        category: item.category,
        itemDescription: item.itemDescription,
      }))
      updateQuotation(current.id, {
        quotationNumber: formData.priceNumber,
        clientId: clientType === "existing" ? formData.clientId : "new-client",
        clientName: getClientDisplayName(),
        items: updatedItems,
        subtotal,
        taxRate,
        taxAmount,
        discount,
        total,
        validUntil: formData.validUntil,
        currency: formData.currency,
        notes: current.notes,
      })
      navigate("/price-information")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/price-information")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Price Information</h1>
          <p className="text-muted-foreground">Update details and items for this price information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Price Information Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="priceNumber">Price Number</Label>
                <Input id="priceNumber" value={formData.priceNumber} onChange={(e) => setFormData({ ...formData, priceNumber: e.target.value })} />
                <p className="text-xs text-muted-foreground">You can adjust the number if necessary.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Client Type</Label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="clientType" value="existing" checked={clientType === "existing"} onChange={(e) => setClientType(e.target.value as "existing" | "new")} className="rounded" />
                      <span>Existing Client</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="clientType" value="new" checked={clientType === "new"} onChange={(e) => setClientType(e.target.value as "existing" | "new")} className="rounded" />
                      <span>Potential Client</span>
                    </label>
                  </div>
                </div>

                {clientType === "existing" ? (
                  <div className="space-y-2">
                    <Label htmlFor="client">Select Client</Label>
                    <Select value={formData.clientId} onValueChange={handleClientChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={formData.clientName || "Select a client"} />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} ({client.company || "Individual"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newClientName">{newClientData.clientType === "company" ? "Company Name" : "Full Name"} *</Label>
                        <Input id="newClientName" value={newClientData.name} onChange={(e) => handleNewClientChange("name", e.target.value)} placeholder={newClientData.clientType === "company" ? "Acme Corporation" : "John Doe"} required />
                      </div>
                      {newClientData.clientType === "company" && (
                        <div className="space-y-2">
                          <Label htmlFor="newClientFullName">Full Name *</Label>
                          <Input id="newClientFullName" value={newClientData.fullName} onChange={(e) => handleNewClientChange("fullName", e.target.value)} placeholder="John Smith" required />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="newClientEmail">Email *</Label>
                        <Input id="newClientEmail" type="email" value={newClientData.email} onChange={(e) => handleNewClientChange("email", e.target.value)} placeholder="john@example.com" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newClientPhone">Phone *</Label>
                        <Input id="newClientPhone" value={newClientData.phone} onChange={(e) => handleNewClientChange("phone", e.target.value)} placeholder="+1 (555) 123-4567" required />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="newClientAddress">Address *</Label>
                        <Textarea id="newClientAddress" value={newClientData.address} onChange={(e) => handleNewClientChange("address", e.target.value)} placeholder="123 Business St, New York, NY 10001" rows={2} required />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input id="validUntil" type="date" value={formData.validUntil} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value: Currency) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Items</CardTitle>
                  <CardDescription>Update items and services for this price information</CardDescription>
                </div>
                <Button type="button" onClick={addItem} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {items.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-7">
                        <Label htmlFor={`category-${index}`}>Item</Label>
                        <Select value={item.category} onValueChange={(value) => updateItem(index, "category", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="services">Services</SelectItem>
                            <SelectItem value="software">Software</SelectItem>
                            <SelectItem value="training">Training</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                        <Input id={`quantity-${index}`} type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value) || 1)} required />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor={`unitPrice-${index}`}>Unit Price</Label>
                        <Input id={`unitPrice-${index}`} type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(index, "unitPrice", Number.parseFloat(e.target.value) || 0)} required />
                      </div>
                      <div className="md:col-span-1">
                        {items.length > 1 && (
                          <Button type="button" variant="outline" size="sm" onClick={() => removeItem(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`itemDescription-${index}`}>Description</Label>
                      <Textarea id={`itemDescription-${index}`} value={item.itemDescription} onChange={(e) => updateItem(index, "itemDescription", e.target.value)} placeholder="Detailed description of the item or service" rows={3} />
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Total: <span className="font-medium">{formatCurrency(item.quantity * item.unitPrice, formData.currency)}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-4 max-w-4xl mx-auto">
          <Button type="button" variant="outline" onClick={() => navigate("/price-information")}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (<Loader2 className="h-4 w-4 mr-2 animate-spin" />) : (<Save className="h-4 w-4 mr-2" />)}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}


