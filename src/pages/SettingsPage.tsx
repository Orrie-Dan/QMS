import { useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Save, Lock, User } from "lucide-react"
import { useStore } from "../lib/store"

export default function SettingsPage() {
  const user = useStore((s) => s.user)
  const updateUserProfile = useStore((s) => s.updateUserProfile)
  const updateUserPassword = useStore((s) => s.updateUserPassword)

  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] || "")
  const [middleName, setMiddleName] = useState("")
  const [lastName, setLastName] = useState(user?.name?.split(" ").slice(1).join(" ") || "")
  const [phoneCountryCode, setPhoneCountryCode] = useState(user?.phoneCountryCode || "+250")
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "")
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleUploadClick = () => fileInputRef.current?.click()
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPhotoUrl(url)
  }

  const handleSaveProfile = () => {
    const name = [firstName, middleName, lastName].filter(Boolean).join(" ")
    updateUserProfile({ name, photoUrl, phoneCountryCode, phoneNumber })
    alert("Profile saved")
  }

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("New password and confirmation do not match")
      return
    }
    const ok = await updateUserPassword(currentPassword, newPassword)
    if (!ok) {
      alert("Current password is incorrect")
    } else {
      alert("Password updated")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <User className="h-6 w-6 text-gray-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your profile and security</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

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
                  <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm text-gray-500">No photo</span>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  <Button variant="outline" onClick={handleUploadClick}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name (optional)</Label>
                  <Input id="middleName" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Second Name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <div className="grid grid-cols-3 gap-3 md:max-w-md">
                  <Input placeholder="+250" value={phoneCountryCode} onChange={(e) => setPhoneCountryCode(e.target.value)} />
                  <div className="col-span-2">
                    <Input placeholder="7xx xxx xxx" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                  </div>
                </div>
                <p className="text-xs text-gray-500">Include country code, e.g., +1, +44, +250</p>
              </div>

              <Button onClick={handleSaveProfile}>
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 md:max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
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
  )
}