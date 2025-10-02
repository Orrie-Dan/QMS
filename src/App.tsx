import type React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useStore } from "./lib/store"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import QuotationsPage from "./pages/QuotationsPage"
import NewQuotationPage from "./pages/NewQuotationPage"
import QuotationDetailPage from "./pages/QuotationDetailPage"
import ClientsPage from "./pages/ClientsPage"
import NewClientPage from "./pages/NewClientPage"
import ClientDetailPage from "./pages/ClientDetailPage"
import EditClientPage from "./pages/EditClientPage"
import EditQuotationPage from "./pages/EditQuotationPage"
import ReportsPage from "./pages/ReportsPage"
import SettingsPage from "./pages/SettingsPage"
import InvoicePage from "./pages/InvoicePage"
import PriceInformationPage from "./pages/PriceInformationPage"
import NewPriceInformationPage from "./pages/NewPriceInformationPage"
import EditPriceInformationPage from "./pages/EditPriceInformationPage"
import MainLayout from "./components/layout/MainLayout"

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useStore((state) => state.user)

  if (!user?.isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Public Route component (redirects to dashboard if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const user = useStore((state) => state.user)

  if (user?.isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="quotations" element={<QuotationsPage />} />
        <Route path="quotations/new" element={<NewQuotationPage />} />
        <Route path="quotations/:id" element={<QuotationDetailPage />} />
        <Route path="quotations/:id/edit" element={<EditQuotationPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="clients/new" element={<NewClientPage />} />
        <Route path="clients/:id" element={<ClientDetailPage />} />
        <Route path="clients/:id/edit" element={<EditClientPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="invoice" element={<InvoicePage />} />
        <Route path="price-information" element={<PriceInformationPage />} />
        <Route path="price-information/new" element={<NewPriceInformationPage />} />
        <Route path="price-information/:id/edit" element={<EditPriceInformationPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
