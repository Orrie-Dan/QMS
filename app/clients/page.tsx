"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, Eye, Edit, Trash2, MoreHorizontal, Building, Mail, Phone } from "lucide-react"
import Link from "next/link"

export default function ClientsPage() {
  const { clients, quotations, deleteClient } = useStore()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredClients = clients.filter((client) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      client.company?.toLowerCase().includes(searchLower) ||
      client.phone.includes(searchTerm)
    )
  })

  const getClientQuotations = (clientId: string) => {
    return quotations.filter((q) => q.clientId === clientId)
  }

  const getClientStats = (clientId: string) => {
    const clientQuotations = getClientQuotations(clientId)
    const totalValue = clientQuotations.reduce((sum, q) => sum + q.total, 0)
    const acceptedQuotations = clientQuotations.filter((q) => q.status === "accepted")
    const acceptedValue = acceptedQuotations.reduce((sum, q) => sum + q.total, 0)

    return {
      totalQuotations: clientQuotations.length,
      totalValue,
      acceptedValue,
      acceptedCount: acceptedQuotations.length,
    }
  }

  const handleDelete = (id: string) => {
    const clientQuotations = getClientQuotations(id)
    if (clientQuotations.length > 0) {
      alert("Cannot delete client with existing quotations. Please delete or reassign quotations first.")
      return
    }

    if (confirm("Are you sure you want to delete this client?")) {
      deleteClient(id)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Clients</h1>
            <p className="text-muted-foreground">Manage your client database</p>
          </div>
          <Button asChild>
            <Link href="/clients/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Link>
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, company, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Clients Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3">
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? "No clients match your search" : "No clients yet"}
                  </p>
                  <Button asChild>
                    <Link href="/clients/new">Add Your First Client</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredClients.map((client) => {
              const stats = getClientStats(client.id)
              return (
                <Card key={client.id} className="hover:shadow-md transition-shadow border-t-4 border-sky-400">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{client.name}</h3>
                        {client.company && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Building className="h-3 w-3" />
                            {client.company}
                          </div>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/clients/${client.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/clients/${client.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(client.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Contact Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="p-1.5 rounded-md bg-sky-500/10">
                          <Mail className="h-3 w-3 text-sky-500" />
                        </span>
                        <span className="text-muted-foreground truncate">{client.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="p-1.5 rounded-md bg-indigo-500/10">
                          <Phone className="h-3 w-3 text-indigo-500" />
                        </span>
                        <span className="text-muted-foreground">{client.phone}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="pt-3 border-t">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Quotations</p>
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-md bg-amber-500/10">
                              <Search className="h-3 w-3 text-amber-600" />
                            </span>
                            <p className="font-medium">{stats.totalQuotations}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Value</p>
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-md bg-emerald-500/10">
                              <Search className="h-3 w-3 text-emerald-600" />
                            </span>
                            <p className="font-medium">${stats.totalValue.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      {stats.acceptedCount > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          ${stats.acceptedValue.toLocaleString()} accepted ({stats.acceptedCount} quotations)
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                      <Link href={`/clients/${client.id}`}>View Profile</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </MainLayout>
  )
}
