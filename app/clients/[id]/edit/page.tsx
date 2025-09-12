"use client"

import { useParams, useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { MainLayout } from "@/components/layout/main-layout"
import { ClientForm } from "@/components/clients/client-form"

export default function EditClientPage() {
  const params = useParams()
  const router = useRouter()
  const clients = useStore((state) => state.clients)

  const client = clients.find((c) => c.id === params.id)

  if (!client) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Client not found</p>
          <button onClick={() => router.back()}>Go Back</button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <ClientForm client={client} mode="edit" />
    </MainLayout>
  )
}
