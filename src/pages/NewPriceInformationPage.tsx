"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
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

export default function NewPriceInformationPage() {
  const navigate = useNavigate()
  const clients = useStore((state) => state.clients)
  const user = useStore((state) => state.user)
  const quotations = useStore((state) => state.quotations)
  const addQuotation = useStore((state) => state.addQuotation)

  const getUserInitials = () => {
    const name = user?.name?.trim() || ""
    if (name) {
      const parts = name.split(/\s+/).filter(Boolean)
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    }
    const email = user?.email || ""
    if (email.includes("@")) return email.split("@")[0].slice(0, 2).toUpperCase()
    return "XX"
  }

  const formatDateDDMMYYYY = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, "0")
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const yyyy = d.getFullYear()
    return `${dd}${mm}${yyyy}`
  }

  const computeTodaySequence = () => {
    const today = new Date()
    const todayKey = today.toISOString().slice(0, 10)
    const todaysCount = quotations.filter((q) => {
      const key = new Date(q.createdAt).toISOString().slice(0, 10)
      return key === todayKey
    }).length
    return String(todaysCount + 1).padStart(2, "0")
  }

  const generatePriceNumber = () => {
    const initials = getUserInitials()
    const datePart = formatDateDDMMYYYY(new Date())
    const seq = computeTodaySequence()
    return `PRICE-${initials}${datePart}-${seq}`
  }

  const [formData, setFormData] = useState({
    priceNumber: generatePriceNumber(),
    clientId: "",
    clientName: "",
    validUntil: "",
    currency: "RWF" as Currency,
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

  type NewPriceLine = Omit<QuotationItem, "id" | "total"> & {
    category?: string
    itemDescription?: string
  }

  const [items, setItems] = useState<NewPriceLine[]>([
    { description: "", quantity: 1, unitPrice: 0, category: "", itemDescription: "" },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      const typeLabel = newClientData.clientType === "company" ? "Company" : "Individual"
      const displayName = newClientData.clientType === "company" 
        ? `${newClientData.name} (${newClientData.fullName})` 
        : newClientData.name
      return `${displayName} (${typeLabel})`
    }
  }

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, category: "", itemDescription: "" }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof NewPriceLine, value: string | number) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    
    // Auto-set description based on category selection
    if (field === "category" && typeof value === "string") {
      const categoryLabels = {
        services: "Services",
        software: "Software", 
        training: "Training"
      }
      updatedItems[index].description = categoryLabels[value as keyof typeof categoryLabels] || ""
    }
    
    setItems(updatedItems)
  }

  const handleSubmit = async (e: React.FormEvent, status: "draft" | "sent" = "draft") => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const quotationItems: QuotationItem[] = items.map((item, index) => ({
        id: (index + 1).toString(),
        description: (item.itemDescription && item.itemDescription.trim().length > 0) ? item.itemDescription : item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      }))

      // Always enforce formatted, unique number for today
      const finalPriceNumber = generatePriceNumber()

      addQuotation({
        quotationNumber: finalPriceNumber,
        clientId: clientType === "existing" ? formData.clientId : "new-client",
        clientName: getClientDisplayName(),
        status,
        currency: formData.currency,
        items: quotationItems,
        subtotal: 0,
        taxRate: 0,
        taxAmount: 0,
        discount: 0,
        total: 0,
        validUntil: formData.validUntil,
        notes: "",
      } as unknown as Parameters<typeof addQuotation>[0])

      if (status === "sent") {
        alert("Price information sent successfully!")
      }

      navigate("/price-information")
    } catch (error) {
      console.error("Error saving price information:", error)
      alert("Failed to save price information. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveAsDraft = (e: React.FormEvent) => {
    handleSubmit(e, "draft")
  }

  const handleSendPriceInfo = (e: React.FormEvent) => {
    if (window.confirm("Are you sure you want to send this price information to the client?")) {
      handleSubmit(e, "sent")
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
          <h1 className="text-3xl font-bold text-foreground">New Price Information</h1>
          <p className="text-muted-foreground">Create new price information for your client</p>
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
                <Input
                  id="priceNumber"
                  value={formData.priceNumber}
                  readOnly
                />
                <p className="text-xs text-muted-foreground">Automatically generated as PRICE-[Initials][DDMMYYYY]-[Sequence]</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Client Type</Label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="clientType"
                        value="existing"
                        checked={clientType === "existing"}
                        onChange={(e) => setClientType(e.target.value as "existing" | "new")}
                        className="rounded"
                      />
                      <span>Existing Client</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="clientType"
                        value="new"
                        checked={clientType === "new"}
                        onChange={(e) => setClientType(e.target.value as "existing" | "new")}
                        className="rounded"
                      />
                      <span>Potential Client</span>
                    </label>
                  </div>
                </div>

                {clientType === "existing" ? (
                  <div className="space-y-2">
                    <Label htmlFor="client">Select Client</Label>
                    <Select onValueChange={handleClientChange} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
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
                    <div className="space-y-2">
                      <Label>Client Type</Label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="newClientType"
                            value="individual"
                            checked={newClientData.clientType === "individual"}
                            onChange={(e) => handleNewClientChange("clientType", e.target.value)}
                            className="rounded"
                          />
                          <span>Individual</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="newClientType"
                            value="company"
                            checked={newClientData.clientType === "company"}
                            onChange={(e) => handleNewClientChange("clientType", e.target.value)}
                            className="rounded"
                          />
                          <span>Company</span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newClientName">
                          {newClientData.clientType === "company" ? "Company Name" : "Full Name"} *
                        </Label>
                        <Input
                          id="newClientName"
                          value={newClientData.name}
                          onChange={(e) => handleNewClientChange("name", e.target.value)}
                          placeholder={newClientData.clientType === "company" ? "Acme Corporation" : "John Doe"}
                          required
                        />
                      </div>

                      {newClientData.clientType === "company" && (
                        <div className="space-y-2">
                          <Label htmlFor="newClientFullName">Full Name *</Label>
                          <Input
                            id="newClientFullName"
                            value={newClientData.fullName}
                            onChange={(e) => handleNewClientChange("fullName", e.target.value)}
                            placeholder="John Smith"
                            required
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="newClientEmail">Email *</Label>
                        <Input
                          id="newClientEmail"
                          type="email"
                          value={newClientData.email}
                          onChange={(e) => handleNewClientChange("email", e.target.value)}
                          placeholder="john@example.com"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newClientPhone">Phone *</Label>
                        <Input
                          id="newClientPhone"
                          value={newClientData.phone}
                          onChange={(e) => handleNewClientChange("phone", e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newClientTin">TIN Number</Label>
                        <Input
                          id="newClientTin"
                          value={newClientData.tin}
                          onChange={(e) => handleNewClientChange("tin", e.target.value)}
                          placeholder="123456789"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="newClientAddress">Address *</Label>
                        <Textarea
                          id="newClientAddress"
                          value={newClientData.address}
                          onChange={(e) => handleNewClientChange("address", e.target.value)}
                          placeholder="123 Business St, New York, NY 10001"
                          rows={2}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value: Currency) => setFormData({ ...formData, currency: value })}
                >
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
                <CardDescription>Add items and services to this price information</CardDescription>
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
                      <Select
                        value={item.category}
                        onValueChange={(value) => updateItem(index, "category", value)}
                      >
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
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor={`unitPrice-${index}`}>Unit Price</Label>
                      <Input
                        id={`unitPrice-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                        required
                      />
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
                    <Textarea
                      id={`itemDescription-${index}`}
                      value={item.itemDescription}
                      onChange={(e) => updateItem(index, "itemDescription", e.target.value)}
                      placeholder="Detailed description of the item or service"
                      rows={3}
                    />
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
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/price-information")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleSaveAsDraft}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSubmitting ? "Saving..." : "Save as Draft"}
          </Button>
          <Button 
            type="button" 
            onClick={handleSendPriceInfo}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isSubmitting ? "Sending..." : "Send Price Information"}
          </Button>
        </div>
      </form>
    </div>
  )
}
