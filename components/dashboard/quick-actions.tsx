"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, FileText, BarChart3 } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      title: "New Quotation",
      description: "Create a new quotation for a client",
      icon: Plus,
      href: "/quotations/new",
      variant: "default" as const,
    },
    {
      title: "Add Client",
      description: "Add a new client to your database",
      icon: Users,
      href: "/clients/new",
      variant: "outline" as const,
    },
    {
      title: "View Reports",
      description: "Check your business analytics",
      icon: BarChart3,
      href: "/reports",
      variant: "outline" as const,
    },
    {
      title: "All Quotations",
      description: "Manage existing quotations",
      icon: FileText,
      href: "/quotations",
      variant: "outline" as const,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map((action) => (
            <Button key={action.title} variant={action.variant} className="h-auto p-4 justify-start" asChild>
              <Link href={action.href}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-muted-foreground">{action.description}</div>
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
