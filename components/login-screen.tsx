"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lock, User, Key, Eye, EyeOff } from "lucide-react"
import type { UserAccount } from "@/components/account-manager"

interface LoginScreenProps {
  onLogin: (user: UserAccount) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [keyCode, setKeyCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showKeyCode, setShowKeyCode] = useState(false)

  const VALID_CREDENTIALS = {
    username: "tenacity",
    password: "ADMIN",
  }

  const createOrLoadAccount = (loginUsername: string): UserAccount => {
    const savedAccounts = localStorage.getItem("tenacity-accounts")
    let accounts: UserAccount[] = []

    if (savedAccounts) {
      try {
        accounts = JSON.parse(savedAccounts)
      } catch (error) {
        console.error("Error loading accounts:", error)
      }
    }

    // Check if account already exists
    const existingAccount = accounts.find((acc) => acc.username === loginUsername)

    if (existingAccount) {
      // Update last login time
      const updatedAccount = {
        ...existingAccount,
        lastLogin: new Date().toISOString(),
      }

      // Update in localStorage
      const updatedAccounts = accounts.map((acc) => (acc.username === loginUsername ? updatedAccount : acc))
      localStorage.setItem("tenacity-accounts", JSON.stringify(updatedAccounts))

      return updatedAccount
    } else {
      const newAccount: UserAccount = {
        id: Date.now().toString(),
        username: loginUsername,
        displayName: loginUsername, // Use username as display name initially
        theme: "Tenacity", // Fixed: Use proper theme name that matches the app
        preferences: {
          showLogo: true,
          textGradient: false,
          fadeAnimation: false,
          fadeDuration: 300,
          gradientSpeed: 8,
        },
        generationSettings: {
          roastPercentage: 50,
          scenario1Percentage: 25,
          scenario2Percentage: 25,
        },
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      }

      // Add to accounts and save
      const updatedAccounts = [...accounts, newAccount]
      localStorage.setItem("tenacity-accounts", JSON.stringify(updatedAccounts))

      return newAccount
    }
  }

  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (username.trim() === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
      const userAccount = createOrLoadAccount(username.trim())
      onLogin(userAccount)
    } else {
      setError("Invalid username or password")
    }
    setIsLoading(false)
  }

  const handleKeyLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (keyCode.trim() === VALID_CREDENTIALS.password) {
      const userAccount = createOrLoadAccount(VALID_CREDENTIALS.username)
      onLogin(userAccount)
    } else {
      setError("Invalid key code")
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-pink-500 to-blue-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/90 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">Tenacity V1</CardTitle>
          <CardDescription className="text-gray-400">Sign in to access the application</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="username" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-700">
              <TabsTrigger value="username" className="text-white data-[state=active]:bg-slate-600">
                <User className="w-4 h-4 mr-2" />
                Username
              </TabsTrigger>
              <TabsTrigger value="key" className="text-white data-[state=active]:bg-slate-600">
                <Key className="w-4 h-4 mr-2" />
                Key Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="username" className="space-y-4 mt-6">
              <form onSubmit={handleUsernameLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 pr-10"
                      placeholder="Enter password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-white" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400 hover:text-white" />
                      )}
                    </Button>
                  </div>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white font-semibold"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="key" className="space-y-4 mt-6">
              <form onSubmit={handleKeyLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="keycode" className="text-white">
                    Access Key
                  </Label>
                  <div className="relative">
                    <Input
                      id="keycode"
                      type={showKeyCode ? "text" : "password"}
                      value={keyCode}
                      onChange={(e) => setKeyCode(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 pr-10"
                      placeholder="Enter key code"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowKeyCode(!showKeyCode)}
                    >
                      {showKeyCode ? (
                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-white" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400 hover:text-white" />
                      )}
                    </Button>
                  </div>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white font-semibold"
                >
                  <Key className="w-4 h-4 mr-2" />
                  {isLoading ? "Verifying..." : "Access with Key"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
