"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Save, Lock } from "lucide-react"

export default function SettingsPage() {
  const user = useStore((state) => state.user)

  const [profile, setProfile] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    middleName: "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    phoneCountryCode: "+1",
    phoneNumber: "",
    photoUrl: "",
  })

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleSaveProfile = () => {
    alert("Profile updated successfully!")
  }

  const handleUpdatePassword = () => {
    if (security.newPassword !== security.confirmPassword) {
      alert("New password and confirmation do not match")
      return
    }
    alert("Security settings updated successfully!")
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Settings</h1>
          <p className="text-muted-foreground">Manage your profile and security</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Profile */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Photo */}
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-muted rounded-full overflow-hidden flex items-center justify-center">
                      {profile.photoUrl ? (
                        <img src={profile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm text-muted-foreground">No photo</span>
                      )}
                    </div>
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Photo
                    </Button>
                  </div>
                </div>

                {/* Names */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name (optional)</Label>
                    <Input
                      id="middleName"
                      value={profile.middleName}
                      onChange={(e) => setProfile({ ...profile, middleName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Second Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="grid grid-cols-3 gap-3 md:max-w-md">
                    <Input
                      placeholder="+250"
                      value={profile.phoneCountryCode}
                      onChange={(e) => setProfile({ ...profile, phoneCountryCode: e.target.value })}
                    />
                    <div className="col-span-2">
                      <Input
                        placeholder="7xx xxx xxx"
                        value={profile.phoneNumber}
                        onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Include country code, e.g., +1, +44, +250</p>
                </div>

                <Button onClick={handleSaveProfile}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:max-w-3xl">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={security.currentPassword}
                      onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={security.newPassword}
                      onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={security.confirmPassword}
                      onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={handleUpdatePassword}>
                  <Save className="mr-2 h-4 w-4" />
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
