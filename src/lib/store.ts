import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface QuotationItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  category?: string
  itemDescription?: string
}

export interface Quotation {
  id: string
  quotationNumber: string
  clientId: string
  clientName: string
  status: "draft" | "sent" | "accepted" | "rejected"
  currency: "RWF" | "USD" | "EUR"
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
  photoUrl?: string
  phoneCountryCode?: string
  phoneNumber?: string
}

export interface CompanySettings {
  name: string
  address: string
  phone: string
  email: string
  website: string
  logo: string
  taxRate: number
  currency: string
  preparedBy: string
  currencyAccounts: {
    RWF?: string
    USD?: string
    EUR?: string
  }
}

interface AppState {
  user: User | null
  quotations: Quotation[]
  clients: Client[]
  companySettings: CompanySettings

  // Auth actions
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void

  // Profile/Security
  updateUserProfile: (updates: Partial<User>) => void
  updateUserPassword: (current: string, next: string) => Promise<boolean>

  // Quotation actions
  addQuotation: (quotation: Omit<Quotation, "id" | "createdAt" | "updatedAt">) => void
  updateQuotation: (id: string, updates: Partial<Quotation>) => void
  deleteQuotation: (id: string) => void

  // Client actions
  addClient: (client: Omit<Client, "id" | "createdAt">) => void
  updateClient: (id: string, updates: Partial<Client>) => void
  deleteClient: (id: string) => void

  // Company settings actions
  updateCompanySettings: (settings: Partial<CompanySettings>) => void
}

// Mock data
const mockQuotations: Quotation[] = [
  {
    id: "1",
    quotationNumber: "QUO-2024-001",
    clientId: "1",
    clientName: "Acme Corporation",
    status: "sent",
    currency: "USD",
    items: [
      {
        id: "1",
        description: "Website Development",
        quantity: 1,
        unitPrice: 5000,
        total: 5000,
        category: "services",
        itemDescription: "Custom website development with responsive design and modern UI/UX",
      },
      {
        id: "2",
        description: "SEO Optimization",
        quantity: 1,
        unitPrice: 1500,
        total: 1500,
        category: "services",
        itemDescription: "Search engine optimization services to improve website visibility",
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
    currency: "EUR",
    items: [
      {
        id: "3",
        description: "Mobile App Development",
        quantity: 1,
        unitPrice: 8000,
        total: 8000,
        category: "software",
        itemDescription: "Cross-platform mobile application development for iOS and Android",
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

// Esri Rwanda company settings
const defaultCompanySettings: CompanySettings = {
  name: "Esri Rwanda",
  address: "KG 7 Ave, Kigali, Rwanda",
  phone: "+250 788 123 456",
  email: "info@esri.rw",
  website: "www.esri.rw",
  logo: "/Esri.png",
  taxRate: 18,
  currency: "RWF",
  preparedBy: "Sales Team",
  currencyAccounts: {
    RWF: "00040-00314912-83",
    USD: "00040-00314914-85",
    EUR: "00040-00314913-84"
  }
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: {
        id: "1",
        name: "Admin User",
        email: "admin@qms.com",
        company: "QMS Inc.",
        isAuthenticated: true,
        photoUrl: "",
        phoneCountryCode: "+250",
        phoneNumber: "",
      },
      quotations: mockQuotations,
      clients: mockClients,
      companySettings: defaultCompanySettings,

      login: async (email: string, password: string) => {
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

      updateUserProfile: (updates) => {
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : state.user }))
      },

      updateUserPassword: async (current, next) => {
        // Mock password validation: current must be 'password'
        if (current !== "password") {
          return false
        }
        // In a real app, you would hash and save server-side. We just return true.
        return true
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

      updateCompanySettings: (settings) => {
        set((state) => ({
          companySettings: { ...state.companySettings, ...settings },
        }))
      },
    }),
    {
      name: "qms-storage",
    },
  ),
)