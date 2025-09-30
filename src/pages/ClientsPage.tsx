import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { getClients as apiGetClients, deleteClient as apiDeleteClient, type UIClient } from "../lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Mail, Phone, MapPin, Edit, Trash2 } from "lucide-react"

export default function ClientsPage() {
  const [clients, setClients] = useState<UIClient[]>([])
  const loadClients = () => apiGetClients().then(setClients).catch(console.error)
  useEffect(() => { loadClients() }, [])
  useEffect(() => {
    const onFocus = () => loadClients()
    const onVisibility = () => { if (document.visibilityState === 'visible') loadClients() }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await apiDeleteClient(id)
        setClients((prev) => prev.filter((c) => c.id !== id))
      } catch (e) {
        console.error(e)
        alert("Failed to delete client")
      }
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">Manage your client relationships</p>
        </div>
        <Link to="/clients/new">
          <Button className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm border-t-4 border-sky-400">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-sky-500/10 rounded-lg">
                <Mail className="h-6 w-6 text-sky-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-t-4 border-emerald-400">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Phone className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-t-4 border-indigo-400">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <MapPin className="h-6 w-6 text-indigo-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Locations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(clients.map(c => (c.address ? c.address.split(',')[2]?.trim() : "")).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
          <CardDescription>
            A list of all your clients and their contact information
          </CardDescription>
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={loadClients}>Refresh</Button>
          </div>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first client</p>
              <Link to="/clients/new">
                <Button>Add Client</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-white/60 backdrop-blur-sm border-l-4 border-sky-400 hover:bg-sky-500/5"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-sky-500/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-sky-600">
                        {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{client.name}</h3>
                      <p className="text-sm text-gray-600">{client.company}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="p-1.5 rounded-md bg-sky-500/10 mr-1">
                            <Mail className="h-4 w-4 text-sky-500" />
                          </span>
                          {client.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="p-1.5 rounded-md bg-indigo-500/10 mr-1">
                            <Phone className="h-4 w-4 text-indigo-500" />
                          </span>
                          {client.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </Badge>
                    <Link to={`/clients/${client.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(client.id, client.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}