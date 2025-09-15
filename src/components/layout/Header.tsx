"use client"

import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const user = useStore((state) => state.user)
  const logout = useStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    // Navigation will be handled by the ProtectedRoute component
  }

  return (
    <header className="bg-gradient-to-r from-[#0b1730] via-[#0f2c6d] to-[#123a8c] border-b border-white/10 px-6 py-4 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 rounded-lg p-2 flex items-center justify-center">
            <img 
              src="/Esri.png" 
              alt="Esri Logo" 
              className="h-8 w-auto"
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Welcome back, {user?.name}</h2>
            <p className="text-sm text-white/70">{user?.company}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full text-white hover:bg-white/10">
              <Avatar className="h-8 w-8">
                {user?.photoUrl ? (
                  <AvatarImage src={user.photoUrl} alt={user.name} />
                ) : (
                  <AvatarFallback>
                    {user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
