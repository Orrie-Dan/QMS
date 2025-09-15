import { useStore } from "../../lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, FileText, Users, TrendingUp } from "lucide-react"

export default function StatsCards() {
  const { quotations, clients } = useStore()

  const totalQuotations = quotations.length
  const totalClients = clients.length
  const totalRevenue = quotations.reduce((sum, q) => sum + q.total, 0)
  const averageQuotationValue = totalQuotations > 0 ? totalRevenue / totalQuotations : 0

  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      description: "All time revenue",
      icon: DollarSign,
      color: "text-emerald-500",
      pill: "bg-emerald-500/10",
      border: "border-t-4 border-emerald-400",
    },
    {
      title: "Total Quotations",
      value: totalQuotations.toString(),
      description: "Quotations created",
      icon: FileText,
      color: "text-sky-500",
      pill: "bg-sky-500/10",
      border: "border-t-4 border-sky-400",
    },
    {
      title: "Total Clients",
      value: totalClients.toString(),
      description: "Active clients",
      icon: Users,
      color: "text-indigo-500",
      pill: "bg-indigo-500/10",
      border: "border-t-4 border-indigo-400",
    },
    {
      title: "Avg. Quotation",
      value: `$${averageQuotationValue.toFixed(0)}`,
      description: "Average quotation value",
      icon: TrendingUp,
      color: "text-amber-500",
      pill: "bg-amber-500/10",
      border: "border-t-4 border-amber-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className={`shadow-sm ${stat.border}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center">
              <div className={`p-2 ${stat.pill} rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}