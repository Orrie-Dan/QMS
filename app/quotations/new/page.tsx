"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { QuotationForm } from "@/components/quotations/quotation-form"

export default function NewQuotationPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Create New Quotation</h1>
          <p className="text-muted-foreground">Follow the steps to create a professional quotation</p>
        </div>

        <QuotationForm mode="create" />
      </div>
    </MainLayout>
  )
}
