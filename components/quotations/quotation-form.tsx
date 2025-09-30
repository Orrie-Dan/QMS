"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import type { UIClient, UIQuotation, UIQuotationItem } from "@/lib/api"
import { getClients, createQuotation as apiCreateQuotation, updateQuotation as apiUpdateQuotation } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, ArrowLeft, Save, Send } from "lucide-react"

interface QuotationFormProps {
  quotation?: UIQuotation
  mode: "create" | "edit"
}

export function QuotationForm({ quotation, mode }: QuotationFormProps) {
  const router = useRouter()
  const [clients, setClients] = useState<UIClient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [step, setStep] = useState(1)
  const [selectedClientId, setSelectedClientId] = useState(quotation?.clientId || "")
  const [items, setItems] = useState<UIQuotationItem[]>(quotation?.items || [])
  const [taxRate, setTaxRate] = useState(quotation?.taxRate ?? 18)
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState(quotation?.notes || "")
  const [validUntil, setValidUntil] = useState(
    (quotation?.validUntil?.slice(0, 10) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
  )

  useEffect(() => {
    let mounted = true
    getClients()
      .then((data) => {
        if (!mounted) return
        setClients(data)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  const selectedClient = useMemo(() => clients.find((c) => c.id === selectedClientId), [clients, selectedClientId])

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const taxAmount = (subtotal * (taxRate || 0)) / 100
  const total = subtotal + taxAmount - (discount || 0)

  const addItem = () => {
    const newItem: UIQuotationItem = {
      description: "",
      quantity: 1,
      unitPrice: 0,
    }
    setItems([...items, newItem])
  }

  const updateItem = (index: number, field: keyof UIQuotationItem, value: string | number) => {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value as any } : item)))
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSave = async (status: "draft" | "sent") => {
    if (!selectedClientId || items.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const payload = {
      clientId: selectedClientId,
      status,
        notes: notes || null,
        validUntil: validUntil || null,
        taxRatePercent: taxRate ?? 0,
        items: items.map((it) => ({ description: it.description, quantity: it.quantity, unitPrice: it.unitPrice })),
      }
    if (mode === "edit" && quotation) {
        const updated = await apiUpdateQuotation(quotation.id, payload)
        router.push(`/quotations/${updated.id}`)
    } else {
        const created = await apiCreateQuotation(payload)
        router.push(`/quotations/${created.id}`)
      }
    } catch (e: any) {
      setError(e?.message || "Failed to save quotation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step >= stepNumber ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
              `}
              >
                {stepNumber}
              </div>
              {stepNumber < 3 && <div className={`w-12 h-0.5 mx-2 ${step > stepNumber ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">Step {step} of 3</div>
      </div>

      {/* Step 1: Select Client */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="client">Client</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedClient && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Client Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p>{selectedClient.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Company</p>
                    <p>{selectedClient.company}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p>{selectedClient.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p>{selectedClient.phone}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={() => setStep(2)} disabled={!selectedClientId}>
                Next: Add Items
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Add Items */}
      {step === 2 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Add Items</CardTitle>
            <Button onClick={addItem} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No items added yet</p>
                <Button onClick={addItem} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Item
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Item {index + 1}</h4>
                      <Button variant="ghost" size="sm" onClick={() => removeItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <Label>Description</Label>
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateItem(index, "description", e.target.value)}
                          placeholder="Item description"
                        />
                      </div>
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value) || 0)}
                          min="1"
                        />
                      </div>
                      <div>
                        <Label>Unit Price ($)</Label>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="mt-4 text-right">
                      <p className="text-sm text-muted-foreground">
                        Total: <span className="font-medium">${(item.quantity * item.unitPrice).toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Previous
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={
                  items.length === 0 ||
                  items.some((item) => !item.description || item.quantity <= 0 || item.unitPrice <= 0)
                }
              >
                Next: Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Save */}
      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Quotation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Client Info */}
              <div>
                <h4 className="font-medium mb-2">Client Information</h4>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">{selectedClient?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedClient?.company}</p>
                  <p className="text-sm text-muted-foreground">{selectedClient?.email}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-medium mb-2">Items</h4>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={item.id} className="flex justify-between items-start p-3 border rounded">
                      <div className="flex-1">
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × ${item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium">${item.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number.parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div>
                  <Label htmlFor="discount">Discount ($)</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number.parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes or terms..."
                />
              </div>

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="space-y-2 text-right">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({taxRate}%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Previous
                </Button>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => handleSave("draft")} disabled={loading}>
                    <Save className="mr-2 h-4 w-4" />
                    Save as Draft
                  </Button>
                  <Button onClick={() => handleSave("sent")} disabled={loading}>
                    <Send className="mr-2 h-4 w-4" />
                    Send Quotation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
