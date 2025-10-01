"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, Users, BarChart3, Settings, ReceiptText, Tag, LogOut, ChevronLeft, ChevronRight } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Price Information", href: "/price-information", icon: Tag },
  { name: "Quotations", href: "/quotations", icon: FileText },
  { name: "Invoice", href: "/invoice", icon: ReceiptText },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const logout = useStore((state) => state.logout)

  return (
    <div
      data-sidebar
      className={cn(
        "bg-gradient-to-b from-[#0b1730] via-[#0f2c6d] to-[#123a8c] border-r border-white/10 transition-all duration-300 flex-shrink-0 text-white",
        collapsed ? "w-20" : "w-80",
        className,
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header - More spacious */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-4">
              <div className="bg-white/10 rounded-xl p-3 flex items-center justify-center">
                <img 
                  src="/Esri.png" 
                  alt="Esri Logo" 
                  className="h-10 w-auto"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-white">Esri Rwanda</h1>
                <p className="text-xs text-white/70 leading-tight">Quotation Management System</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center w-full">
              <div className="bg-white/10 rounded-xl p-3 flex items-center justify-center">
                <img 
                  src="/Esri2.png" 
                  alt="Esri Logo" 
                  className="h-8 w-auto"
                />
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-9 w-9 text-white hover:bg-white/10 hover:text-white"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation - More generous spacing */}
        <nav className="flex-1 px-6 py-6">
          <ul className="space-y-3">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    data-sidebar-item
                    className={cn(
                      "flex items-center gap-4 rounded-xl px-4 py-3 text-base font-medium transition-colors",
                      "hover:bg-[#60A5FA]/20",
                      isActive ? "bg-[#60A5FA]/30 font-semibold" : "",
                    )}
                    title={collapsed ? item.name : undefined}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0 text-white" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        {/* Bottom actions */}
        <div className="px-6 pb-6 mt-auto">
          <Button
            onClick={logout}
            variant="ghost"
            className="w-full justify-start gap-3 text-white hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Log out</span>}
          </Button>
        </div>
      </div>
    </div>
  )
}
