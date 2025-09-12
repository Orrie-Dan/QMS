"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, Users, BarChart3, Settings, ChevronLeft, ChevronRight } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Quotations", href: "/quotations", icon: FileText },
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

  return (
    <div
      data-sidebar
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 flex-shrink-0",
        collapsed ? "w-20" : "w-80",
        className,
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header - More spacious */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-xl p-3 flex items-center justify-center">
                <img 
                  src="/Esri.png" 
                  alt="Esri Logo" 
                  className="h-10 w-auto"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-sidebar-foreground">Esri Rwanda</h1>
                <p className="text-xs text-sidebar-foreground/70 leading-tight">Quotation Management System</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center w-full">
              <div className="bg-white rounded-xl p-3 flex items-center justify-center">
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
            className="h-9 w-9 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground",
                    )}
                    title={collapsed ? item.name : undefined}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}
