import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar.tsx"
import { Header } from "./Header"

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
