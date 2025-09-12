"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

const statusColors = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-chart-4/20 text-chart-4",
  accepted: "bg-chart-3/20 text-chart-3",
  rejected: "bg-destructive/20 text-destructive",
}

export function RecentQuotations() {
  const quotations = useStore((state) => state.quotations)

  // Get the 5 most recent quotations
  const recentQuotations = quotations
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Quotations</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/quotations">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentQuotations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No quotations yet</p>
              <Button className="mt-4" asChild>
                <Link href="/quotations/new">Create Your First Quotation</Link>
              </Button>
            </div>
          ) : (
            recentQuotations.map((quotation) => (
              <div key={quotation.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{quotation.quotationNumber}</h4>
                    <Badge className={statusColors[quotation.status]}>
                      {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{quotation.clientName}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>${quotation.total.toLocaleString()}</span>
                    <span>•</span>
                    <span>{new Date(quotation.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/quotations/${quotation.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/quotations/${quotation.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
