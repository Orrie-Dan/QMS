"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle, Clock, TrendingUp } from "lucide-react"

export function StatsCards() {
  const quotations = useStore((state) => state.quotations)

  const stats = {
    total: quotations.length,
    accepted: quotations.filter((q) => q.status === "accepted").length,
    rejected: quotations.filter((q) => q.status === "rejected").length,
    drafts: quotations.filter((q) => q.status === "draft").length,
    sent: quotations.filter((q) => q.status === "sent").length,
    totalValue: quotations.reduce((sum, q) => sum + q.total, 0),
    acceptedValue: quotations.filter((q) => q.status === "accepted").reduce((sum, q) => sum + q.total, 0),
    conversionRate:
      quotations.length > 0
        ? Math.round((quotations.filter((q) => q.status === "accepted").length / quotations.length) * 100)
        : 0,
  }

  const cards = [
    {
      title: "Total Quotations",
      value: stats.total,
      icon: FileText,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "Accepted",
      value: stats.accepted,
      icon: CheckCircle,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      title: "Pending",
      value: stats.sent,
      icon: Clock,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
    {
      title: "Drafts",
      value: stats.drafts,
      icon: FileText,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}

      {/* Additional metrics */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            ${stats.acceptedValue.toLocaleString()} accepted • {stats.conversionRate}% conversion rate
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
          <div className="p-2 rounded-lg bg-chart-3/10">
            <CheckCircle className="h-4 w-4 text-chart-3" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.conversionRate}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.accepted} of {stats.total} quotations accepted
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
