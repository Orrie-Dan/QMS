"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Save, Upload, Building, DollarSign, Mail, Bell } from "lucide-react"

export default function SettingsPage() {
  const user = useStore((state) => state.user)

  // Company Settings
  const [companySettings, setCompanySettings] = useState({
        name: user?.company || "QMS Inc.",
    address: "123 Business Street\nNew York, NY 10001",
    phone: "+1-555-0123",
    email: "info@qms.com",
    website: "www.qms.com",
    logo: "",
  })

  // Tax & Currency Settings
  const [taxSettings, setTaxSettings] = useState({
    defaultTaxRate: 18,
    currency: "USD",
    currencySymbol: "$",
    taxLabel: "Tax",
  })

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    fromName: companySettings.name,
    fromEmail: companySettings.email,
    subject: "New Quotation from {company}",
    template: `Dear {client_name},

Please find attached your quotation #{quotation_number}.

This quotation is valid until {valid_until}.

If you have any questions, please don't hesitate to contact us.

Best regards,
{company_name}`,
  })

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    quotationAccepted: true,
    quotationRejected: true,
    quotationExpiring: true,
    weeklyReports: false,
  })

  const handleSaveCompany = () => {
    // Mock save functionality
    alert("Company settings saved successfully!")
  }

  const handleSaveTax = () => {
    // Mock save functionality
    alert("Tax & currency settings saved successfully!")
  }

  const handleSaveEmail = () => {
    // Mock save functionality
    alert("Email template saved successfully!")
  }

  const handleSaveNotifications = () => {
    // Mock save functionality
    alert("Notification settings saved successfully!")
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-balance">Settings</h1>
          <p className="text-muted-foreground">Manage your QMS configuration and preferences</p>
        </div>

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="tax">Tax & Currency</TabsTrigger>
            <TabsTrigger value="email">Email Templates</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Company Settings */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={companySettings.name}
                      onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">Email Address</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={companySettings.email}
                      onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyPhone">Phone Number</Label>
                    <Input
                      id="companyPhone"
                      value={companySettings.phone}
                      onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyWebsite">Website</Label>
                    <Input
                      id="companyWebsite"
                      value={companySettings.website}
                      onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Address</Label>
                  <Textarea
                    id="companyAddress"
                    value={companySettings.address}
                    onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Company Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                      {companySettings.logo ? (
                        <img
                          src={companySettings.logo || "/placeholder.svg"}
                          alt="Logo"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <Building className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Recommended size: 200x200px, PNG or JPG format</p>
                </div>

                <Button onClick={handleSaveCompany}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Company Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tax & Currency Settings */}
          <TabsContent value="tax">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Tax & Currency Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
                    <Input
                      id="defaultTaxRate"
                      type="number"
                      value={taxSettings.defaultTaxRate}
                      onChange={(e) =>
                        setTaxSettings({ ...taxSettings, defaultTaxRate: Number.parseFloat(e.target.value) || 0 })
                      }
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxLabel">Tax Label</Label>
                    <Input
                      id="taxLabel"
                      value={taxSettings.taxLabel}
                      onChange={(e) => setTaxSettings({ ...taxSettings, taxLabel: e.target.value })}
                      placeholder="Tax, VAT, GST, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={taxSettings.currency}
                      onValueChange={(value) => setTaxSettings({ ...taxSettings, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">US Dollar (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                        <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                        <SelectItem value="AUD">Australian Dollar (AUD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currencySymbol">Currency Symbol</Label>
                    <Input
                      id="currencySymbol"
                      value={taxSettings.currencySymbol}
                      onChange={(e) => setTaxSettings({ ...taxSettings, currencySymbol: e.target.value })}
                      placeholder="$, €, £, etc."
                    />
                  </div>
                </div>

                <Button onClick={handleSaveTax}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Tax & Currency Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Templates */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      value={emailSettings.fromName}
                      onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      value={emailSettings.fromEmail}
                      onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailSubject">Email Subject</Label>
                  <Input
                    id="emailSubject"
                    value={emailSettings.subject}
                    onChange={(e) => setEmailSettings({ ...emailSettings, subject: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailTemplate">Email Template</Label>
                  <Textarea
                    id="emailTemplate"
                    value={emailSettings.template}
                    onChange={(e) => setEmailSettings({ ...emailSettings, template: e.target.value })}
                    rows={10}
                  />
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2">Available variables:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <span>
                        {"{"}client_name{"}"}
                      </span>
                      <span>
                        {"{"}quotation_number{"}"}
                      </span>
                      <span>
                        {"{"}company_name{"}"}
                      </span>
                      <span>
                        {"{"}valid_until{"}"}
                      </span>
                      <span>
                        {"{"}total_amount{"}"}
                      </span>
                      <span>
                        {"{"}company_email{"}"}
                      </span>
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveEmail}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Email Template
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Quotation Accepted</h4>
                      <p className="text-sm text-muted-foreground">When a client accepts a quotation</p>
                    </div>
                    <Switch
                      checked={notifications.quotationAccepted}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, quotationAccepted: checked })}
                      disabled={!notifications.emailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Quotation Rejected</h4>
                      <p className="text-sm text-muted-foreground">When a client rejects a quotation</p>
                    </div>
                    <Switch
                      checked={notifications.quotationRejected}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, quotationRejected: checked })}
                      disabled={!notifications.emailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Quotation Expiring</h4>
                      <p className="text-sm text-muted-foreground">
                        When a quotation is about to expire (3 days before)
                      </p>
                    </div>
                    <Switch
                      checked={notifications.quotationExpiring}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, quotationExpiring: checked })}
                      disabled={!notifications.emailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Weekly Reports</h4>
                      <p className="text-sm text-muted-foreground">Receive weekly performance summaries</p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
                      disabled={!notifications.emailNotifications}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveNotifications}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
