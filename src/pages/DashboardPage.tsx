import StatsCards from "@/components/dashboard/StatsCards"
import RecentQuotations from "@/components/dashboard/RecentQuotations"
import QuickActions from "@/components/dashboard/QuickActions"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your quotation business.</p>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentQuotations />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
