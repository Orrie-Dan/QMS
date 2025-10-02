"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, Users, BarChart3, Settings, ChevronLeft, ChevronRight, Receipt, DollarSign } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Quotations", href: "/quotations", icon: FileText },
  { name: "Invoice", href: "/invoice", icon: Receipt },
  { name: "Price Information", href: "/price-information", icon: DollarSign },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  
  console.log("Next.js Sidebar loaded with navigation:", navigation)

  return (
    <div
      className={cn(
        "bg-gradient-to-b from-[#0b1730] via-[#0f2c6d] to-[#123a8c] border-r border-white/10 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <div className="flex h-full flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="bg-white/10 rounded-lg p-2">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold">QMS</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-white hover:bg-white/10 hover:text-white"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      "hover:bg-[#60A5FA]/20",
                      isActive ? "bg-[#60A5FA]/30 font-semibold" : "",
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0 text-white" />
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
