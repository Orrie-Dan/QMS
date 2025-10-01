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

export default function NewQuotationPage() {
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

  const generateQuotationNumber = () => {
    const initials = getUserInitials()
    const datePart = formatDateDDMMYYYY(new Date())
    const seq = computeTodaySequence()
    return `${initials}${datePart}-${seq}`
  }

  const [formData, setFormData] = useState({
    quotationNumber: generateQuotationNumber(),
    clientId: "",
    clientName: "",
    validUntil: "",
    notes: "",
    taxRate: 18,
    discount: 0,
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

  const [items, setItems] = useState<Omit<QuotationItem, "id" | "total">[]>([
    { description: "", quantity: 1, unitPrice: 0 },
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
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof Omit<QuotationItem, "id" | "total">, value: string | number) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setItems(updatedItems)
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const taxAmount = (subtotal * formData.taxRate) / 100
    const total = subtotal + taxAmount - formData.discount
    return { subtotal, taxAmount, total }
  }

  const handleSubmit = async (e: React.FormEvent, status: "draft" | "sent" = "draft") => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { subtotal, taxAmount, total } = calculateTotals()

      const quotationItems: QuotationItem[] = items.map((item, index) => ({
        ...item,
        id: (index + 1).toString(),
        total: item.quantity * item.unitPrice,
      }))

      // Always enforce formatted, unique number for today
      const finalQuotationNumber = generateQuotationNumber()

      addQuotation({
        quotationNumber: finalQuotationNumber,
        clientId: clientType === "existing" ? formData.clientId : "new-client",
        clientName: getClientDisplayName(),
        status,
        items: quotationItems,
        subtotal,
        taxRate: formData.taxRate,
        taxAmount,
        discount: formData.discount,
        total,
        validUntil: formData.validUntil,
        notes: formData.notes,
      })

      if (status === "sent") {
        alert("Quotation sent successfully!")
      }

      navigate("/quotations")
    } catch (error) {
      console.error("Error saving quotation:", error)
      alert("Failed to save quotation. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveAsDraft = (e: React.FormEvent) => {
    handleSubmit(e, "draft")
  }

  const handleSendQuotation = (e: React.FormEvent) => {
    if (window.confirm("Are you sure you want to send this quotation to the client?")) {
      handleSubmit(e, "sent")
    }
  }

  const { subtotal, taxAmount, total } = calculateTotals()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/quotations")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">New Quotation</h1>
          <p className="text-muted-foreground">Create a new quotation for your client</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quotation Details</CardTitle>
              <CardDescription>Basic information about the quotation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quotationNumber">Quotation Number</Label>
                <Input
                  id="quotationNumber"
                  value={formData.quotationNumber}
                  readOnly
                />
                <p className="text-xs text-muted-foreground">Automatically generated as [Initials][DDMMYYYY]-[Sequence]</p>
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
                      <span>New Client</span>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Quotation totals and calculations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({formData.taxRate}%):</span>
                <span>${taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-${formData.discount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Items</CardTitle>
                <CardDescription>Add items and services to this quotation</CardDescription>
              </div>
              <Button type="button" onClick={addItem} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-5">
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Input
                      id={`description-${index}`}
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                      placeholder="Item description"
                      required
                    />
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
                  <div className="md:col-span-2">
                    <Label>Total</Label>
                    <div className="h-10 flex items-center px-3 border rounded-md bg-muted">
                      ${(item.quantity * item.unitPrice).toLocaleString()}
                    </div>
                  </div>
                  <div className="md:col-span-1">
                    {items.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount ($)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or terms and conditions"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/quotations")}
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
            onClick={handleSendQuotation}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isSubmitting ? "Sending..." : "Send Quotation"}
          </Button>
        </div>
      </form>
    </div>
  )
}
