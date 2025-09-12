"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentQuotations } from "@/components/dashboard/recent-quotations"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your quotation management system</p>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Quotations - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RecentQuotations />
          </div>

          {/* Quick Actions - Takes 1 column */}
          <div>
            <QuickActions />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
