"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { ClientForm } from "@/components/clients/client-form"

export default function NewClientPage() {
  return (
    <MainLayout>
      <ClientForm mode="create" />
    </MainLayout>
  )
}
