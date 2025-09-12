import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FileText, Users, BarChart3 } from "lucide-react"

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Frequently used actions to manage your business</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Link to="/quotations/new">
          <Button className="w-full justify-start bg-primary hover:bg-primary/80 hover:shadow-md transition-all duration-200" size="lg">
            <Plus className="mr-2 h-4 w-4" />
            New Quotation
          </Button>
        </Link>

        <Link to="/clients/new">
          <Button variant="outline" className="w-full justify-start border-primary text-primary hover:bg-primary/10 hover:border-primary/80 hover:shadow-sm transition-all duration-200" size="lg">
            <Users className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </Link>

        <Link to="/quotations">
          <Button variant="outline" className="w-full justify-start border-primary text-primary hover:bg-primary/10 hover:border-primary/80 hover:shadow-sm transition-all duration-200" size="lg">
            <FileText className="mr-2 h-4 w-4" />
            View All Quotations
          </Button>
        </Link>

        <Link to="/reports">
          <Button variant="outline" className="w-full justify-start border-primary text-primary hover:bg-primary/10 hover:border-primary/80 hover:shadow-sm transition-all duration-200" size="lg">
            <BarChart3 className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
