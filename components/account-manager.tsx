"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, LogOut, Save, Trash2, Plus, X } from "lucide-react"

export interface UserAccount {
  id: string
  username: string
  displayName: string
  theme: string
  preferences: {
    showLogo: boolean
    textGradient: boolean
    fadeAnimation: boolean
    fadeDuration: number
    gradientSpeed: number
    showDock: boolean
  }
  generationSettings: {
    roastPercentage: number
    scenario1Percentage: number
    scenario2Percentage: number
  }
  createdAt: string
  lastLogin: string
}

interface AccountManagerProps {
  currentUser: UserAccount | null
  onUserChange: (user: UserAccount | null) => void
  onClose: () => void
}

export function AccountManager({ currentUser, onUserChange, onClose }: AccountManagerProps) {
  const [accounts, setAccounts] = useState<UserAccount[]>([])
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [newAccountForm, setNewAccountForm] = useState({
    username: "",
    displayName: "",
    password: "",
  })
  const [selectedAccount, setSelectedAccount] = useState<UserAccount | null>(currentUser)

  // Load accounts from localStorage on component mount
  useEffect(() => {
    const savedAccounts = localStorage.getItem("tenacity-accounts")
    if (savedAccounts) {
      try {
        const parsedAccounts = JSON.parse(savedAccounts)
        setAccounts(parsedAccounts)
      } catch (error) {
        console.error("Error loading accounts:", error)
      }
    }
  }, [])

  // Save accounts to localStorage whenever accounts change
  useEffect(() => {
    if (accounts.length > 0) {
      localStorage.setItem("tenacity-accounts", JSON.stringify(accounts))
    }
  }, [accounts])

  const createAccount = () => {
    if (!newAccountForm.username || !newAccountForm.displayName) {
      return
    }

    // Check if username already exists
    if (accounts.some((acc) => acc.username === newAccountForm.username)) {
      alert("Username already exists!")
      return
    }

    const newAccount: UserAccount = {
      id: Date.now().toString(),
      username: newAccountForm.username,
      displayName: newAccountForm.displayName,
      theme: "blue-pink", // Default theme
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

    setAccounts((prev) => [...prev, newAccount])
    setNewAccountForm({ username: "", displayName: "", password: "" })
    setIsCreatingAccount(false)
  }

  const switchAccount = (account: UserAccount) => {
    const updatedAccount = {
      ...account,
      lastLogin: new Date().toISOString(),
    }

    // Update the account in the accounts list
    setAccounts((prev) => prev.map((acc) => (acc.id === account.id ? updatedAccount : acc)))

    setSelectedAccount(updatedAccount)
    onUserChange(updatedAccount)
  }

  const deleteAccount = (accountId: string) => {
    if (confirm("Are you sure you want to delete this account? This action cannot be undone.")) {
      setAccounts((prev) => prev.filter((acc) => acc.id !== accountId))

      // If deleting current account, switch to null
      if (selectedAccount?.id === accountId) {
        setSelectedAccount(null)
        onUserChange(null)
      }
    }
  }

  const logout = () => {
    setSelectedAccount(null)
    onUserChange(null)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center p-4">
      <Card className="bg-transparent backdrop-blur-md border border-white/20 w-full max-w-2xl shadow-[0_0_30px_rgba(255,255,255,0.1),0_0_60px_rgba(255,255,255,0.05),inset_0_0_0_1px_rgba(255,255,255,0.1)] max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Management
            </CardTitle>
            <CardDescription className="text-gray-400">Manage your accounts and preferences</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-slate-700">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Current Account Section */}
          {selectedAccount && (
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Current Account</h3>
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white bg-transparent"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-pink-400 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedAccount.displayName}</p>
                    <p className="text-gray-400 text-sm">@{selectedAccount.username}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Theme</p>
                    <p className="text-white capitalize">{selectedAccount.theme.replace("-", " ")}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Last Login</p>
                    <p className="text-white">{new Date(selectedAccount.lastLogin).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account List */}
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">All Accounts</h3>
              <Button
                onClick={() => setIsCreatingAccount(true)}
                variant="outline"
                size="sm"
                className="text-green-400 border-green-400 hover:bg-green-400 hover:text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Account
              </Button>
            </div>

            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedAccount?.id === account.id
                      ? "border-blue-400 bg-blue-400/10"
                      : "border-slate-600 hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{account.displayName}</p>
                        <p className="text-gray-400 text-xs">@{account.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedAccount?.id !== account.id && (
                        <Button
                          onClick={() => switchAccount(account)}
                          variant="outline"
                          size="sm"
                          className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white"
                        >
                          Switch
                        </Button>
                      )}
                      <Button
                        onClick={() => deleteAccount(account.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {accounts.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No accounts found</p>
                  <p className="text-sm">Create your first account to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Create Account Form */}
          {isCreatingAccount && (
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
              <h3 className="text-white font-medium mb-4">Create New Account</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-white">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={newAccountForm.username}
                    onChange={(e) => setNewAccountForm((prev) => ({ ...prev, username: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <Label htmlFor="displayName" className="text-white">
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    value={newAccountForm.displayName}
                    onChange={(e) => setNewAccountForm((prev) => ({ ...prev, displayName: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Enter display name"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={createAccount}
                    className="bg-gradient-to-r from-green-400 to-teal-400 hover:from-green-500 hover:to-teal-500 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Create Account
                  </Button>
                  <Button
                    onClick={() => {
                      setIsCreatingAccount(false)
                      setNewAccountForm({ username: "", displayName: "", password: "" })
                    }}
                    variant="outline"
                    className="text-gray-400 border-gray-400 hover:bg-gray-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
