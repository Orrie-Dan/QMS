"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useStore, type QuotationItem } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Save, Plus, Trash2 } from "lucide-react"
import { CURRENCY_OPTIONS, formatCurrency, type Currency } from "@/lib/utils"

type EditLine = Omit<QuotationItem, "id" | "total"> & {
  category?: string
  itemDescription?: string
}

export default function EditQuotationPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const clients = useStore((state) => state.clients)
  const quotations = useStore((state) => state.quotations)
  const updateQuotation = useStore((state) => state.updateQuotation)

  const current = useMemo(() => quotations.find((q) => q.id === id), [quotations, id])

  const [formData, setFormData] = useState({
    quotationNumber: "",
    clientId: "",
    clientName: "",
    validUntil: "",
    notes: "",
    taxRate: 18,
    discount: 0,
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

  const [items, setItems] = useState<EditLine[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!current) return
    const match = clients.find((c) => `${c.name} (${c.company || "Individual"})` === current.clientName)
    setFormData({
      quotationNumber: current.quotationNumber,
      clientId: match?.id || "",
      clientName: current.clientName,
      validUntil: current.validUntil,
      notes: current.notes || "",
      taxRate: current.taxRate,
      discount: current.discount,
      currency: current.currency as Currency,
    })
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

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, category: "", itemDescription: "" }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof EditLine, value: string | number) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    if (field === "category" && typeof value === "string") {
      const categoryLabels = { services: "Services", software: "Software", training: "Training" }
      updated[index].description = categoryLabels[value as keyof typeof categoryLabels] || ""
    }
    setItems(updated)
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const taxAmount = (subtotal * formData.taxRate) / 100
    const total = subtotal + taxAmount - formData.discount
    return { subtotal, taxAmount, total }
  }

  if (!current) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={() => navigate("/quotations")}>Back</Button>
        <p className="mt-4">Quotation not found.</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 500))
      const { subtotal, taxAmount, total } = calculateTotals()
      const updatedItems: QuotationItem[] = items.map((item, index) => ({
        id: String(index + 1),
        description: item.itemDescription && item.itemDescription.trim() ? item.itemDescription : item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
        category: item.category,
        itemDescription: item.itemDescription,
      }))
      updateQuotation(current.id, {
        quotationNumber: formData.quotationNumber,
        clientId: formData.clientId || current.clientId,
        clientName: formData.clientName,
        items: updatedItems,
        subtotal,
        taxRate: formData.taxRate,
        taxAmount,
        discount: formData.discount,
        total,
        validUntil: formData.validUntil,
        currency: formData.currency,
        notes: formData.notes,
      })
      navigate("/invoice")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/invoice")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Quotation</h1>
          <p className="text-muted-foreground">Update this quotation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quotation Details</CardTitle>
              <CardDescription>Update the quotation basics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quotationNumber">Quotation Number</Label>
                <Input id="quotationNumber" value={formData.quotationNumber} onChange={(e) => setFormData({ ...formData, quotationNumber: e.target.value })} />
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

          <Card>
            <CardHeader>
              <CardTitle>Totals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input id="taxRate" type="number" min="0" max="100" step="0.01" value={formData.taxRate} onChange={(e) => setFormData({ ...formData, taxRate: Number.parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount ({formData.currency})</Label>
                <Input id="discount" type="number" min="0" step="0.01" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: Number.parseFloat(e.target.value) || 0 })} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Items</CardTitle>
                <CardDescription>Edit items in this quotation</CardDescription>
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
                      <Label htmlFor={`desc-${index}`}>Description</Label>
                      <Input id={`desc-${index}`} value={item.itemDescription} onChange={(e) => updateItem(index, "itemDescription", e.target.value)} placeholder="Item description" />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                      <Input id={`quantity-${index}`} type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value) || 1)} />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor={`unitPrice-${index}`}>Unit Price</Label>
                      <Input id={`unitPrice-${index}`} type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(index, "unitPrice", Number.parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="md:col-span-1">
                      {items.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removeItem(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate("/invoice")}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (<Loader2 className="h-4 w-4 mr-2 animate-spin" />) : (<Save className="h-4 w-4 mr-2" />)}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}


