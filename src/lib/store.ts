import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface QuotationItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Quotation {
  id: string
  quotationNumber: string
  clientId: string
  clientName: string
  status: "draft" | "sent" | "accepted" | "rejected"
  items: QuotationItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  discount: number
  total: number
  validUntil: string
  createdAt: string
  updatedAt: string
  notes?: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  company?: string
  createdAt: string
}

export interface User {
  id: string
  name: string
  email: string
  company: string
  isAuthenticated: boolean
}

interface AppState {
  user: User | null
  quotations: Quotation[]
  clients: Client[]

  // Auth actions
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void

  // Quotation actions
  addQuotation: (quotation: Omit<Quotation, "id" | "createdAt" | "updatedAt">) => void
  updateQuotation: (id: string, updates: Partial<Quotation>) => void
  deleteQuotation: (id: string) => void

  // Client actions
  addClient: (client: Omit<Client, "id" | "createdAt">) => void
  updateClient: (id: string, updates: Partial<Client>) => void
  deleteClient: (id: string) => void
}

// Mock data
const mockQuotations: Quotation[] = [
  {
    id: "1",
    quotationNumber: "QUO-2024-001",
    clientId: "1",
    clientName: "Acme Corporation",
    status: "sent",
    items: [
      {
        id: "1",
        description: "Website Development",
        quantity: 1,
        unitPrice: 5000,
        total: 5000,
      },
      {
        id: "2",
        description: "SEO Optimization",
        quantity: 1,
        unitPrice: 1500,
        total: 1500,
      },
    ],
    subtotal: 6500,
    taxRate: 18,
    taxAmount: 1170,
    discount: 0,
    total: 7670,
    validUntil: "2024-12-31",
    createdAt: "2024-09-01",
    updatedAt: "2024-09-01",
  },
  {
    id: "2",
    quotationNumber: "QUO-2024-002",
    clientId: "2",
    clientName: "Tech Solutions Ltd",
    status: "draft",
    items: [
      {
        id: "3",
        description: "Mobile App Development",
        quantity: 1,
        unitPrice: 8000,
        total: 8000,
      },
    ],
    subtotal: 8000,
    taxRate: 18,
    taxAmount: 1440,
    discount: 500,
    total: 8940,
    validUntil: "2024-12-31",
    createdAt: "2024-09-05",
    updatedAt: "2024-09-05",
  },
]

const mockClients: Client[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john@acmecorp.com",
    phone: "+1-555-0123",
    address: "123 Business St, New York, NY 10001",
    company: "Acme Corporation",
    createdAt: "2024-08-15",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@techsolutions.com",
    phone: "+1-555-0456",
    address: "456 Tech Ave, San Francisco, CA 94105",
    company: "Tech Solutions Ltd",
    createdAt: "2024-08-20",
  },
]

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      quotations: mockQuotations,
      clients: mockClients,

      login: async (email: string, password: string) => {
        // Mock authentication
        if (email === "admin@qms.com" && password === "password") {
          set({
            user: {
              id: "1",
              name: "Admin User",
        email: "admin@qms.com",
        company: "QMS Inc.",
              isAuthenticated: true,
            },
          })
          return true
        }
        return false
      },

      logout: () => {
        set({ user: null })
      },

      addQuotation: (quotation) => {
        const newQuotation: Quotation = {
          ...quotation,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({
          quotations: [...state.quotations, newQuotation],
        }))
      },

      updateQuotation: (id, updates) => {
        set((state) => ({
          quotations: state.quotations.map((q) =>
            q.id === id ? { ...q, ...updates, updatedAt: new Date().toISOString() } : q,
          ),
        }))
      },

      deleteQuotation: (id) => {
        set((state) => ({
          quotations: state.quotations.filter((q) => q.id !== id),
        }))
      },

      addClient: (client) => {
        const newClient: Client = {
          ...client,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          clients: [...state.clients, newClient],
        }))
      },

      updateClient: (id, updates) => {
        set((state) => ({
          clients: state.clients.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }))
      },

      deleteClient: (id) => {
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
        }))
      },
    }),
    {
      name: "qms-storage",
    },
  ),
)