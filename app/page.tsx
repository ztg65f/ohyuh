"use client"

import type React from "react"
import Dock from "@/components/Dock";
import { Home as DockHome, ArchiveBox as DockArchive, User as DockUser, Settings as DockSettings } from "lucide-react";
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Settings,
  X,
  ImageIcon,
  Monitor,
  RotateCcw,
  User,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Download,
} from "lucide-react"
import { generateRoast, type GenerationSettings } from "@/lib/roast-generator"
import { LoginScreen } from "@/components/login-screen"
import { AccountManager, type UserAccount } from "@/components/account-manager"


type ThemeColor = "blue-pink" | "purple-orange" | "green-teal" | "red-yellow" | "orange-red" | "yellow-orange"

const GALLERY_IMAGES = [
  "/gallery/pic1.webp",
  "/gallery/pic2.webp",
  "/gallery/pic3.webp",
  "/gallery/pic4.webp",
  "/gallery/pic5.webp",
  "/gallery/pic6.webp",
  "/gallery/pic7.webp",
  "/gallery/pic8.webp",
  "/gallery/pic9.webp",
  "/gallery/pic10.webp",
]

const themes = [
  { name: "Tenacity", from: "from-blue-400", to: "to-pink-400" },
  { name: "Sunset", from: "from-purple-400", to: "to-orange-400" },
  { name: "Mint", from: "from-green-400", to: "to-teal-400" },
  { name: "Mango", from: "from-red-400", to: "to-yellow-400" },
]

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [roast, setRoast] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRoastAnimating, setIsRoastAnimating] = useState(false)
  const [isRoastFading, setIsRoastFading] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isGuiSettingsOpen, setIsGuiSettingsOpen] = useState(false)
  const [isGuiOpen, setIsGuiOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState<"main" | "gallery" | "audio-gallery">("main")
  const [theme, setTheme] = useState<ThemeColor>("blue-pink")
  const [showLogo, setShowLogo] = useState(true)
  const [textGradient, setTextGradient] = useState(false) // Renamed from textGlow for gradient effect
  const [fadeDuration, setFadeDuration] = useState(300)
  const [gradientSpeed, setGradientSpeed] = useState(8) // Default 8 seconds for slower animation
  const [currentGalleryImage, setCurrentGalleryImage] = useState<string | null>(null)
  const [usedImages, setUsedImages] = useState<Set<string>>(new Set())
  const [showCompletionNotification, setShowCompletionNotification] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [settings, setSettings] = useState<GenerationSettings>({
    roastPercentage: 50,
    scenario1Percentage: 25,
    scenario2Percentage: 25,
  })

   const dockItems = [
  {
    icon: <DockHome size={18} />,
    label: 'Roast Generator',
    onClick: () => setCurrentPage('main'),
  },
  {
    icon: <DockArchive size={18} />,
    label: 'Roast Gallery',
    onClick: () => setCurrentPage('gallery'),
  },
  {
    icon: <DockUser size={18} />,
    label: 'Audio Gallery',
    onClick: () => setCurrentPage('audio-gallery'),
  },
  {
    icon: <DockSettings size={18} />,
    label: 'Settings',
    onClick: () => setIsSettingsOpen(true),
  },
];



  // State for GUI Settings Modal
  const [showGUISettings, setShowGUISettings] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<string>("Tenacity") // Renamed from theme for clarity within GUI settings
  const [fadeAnimation, setFadeAnimation] = useState(false) // Added for fade animation toggle
  const [dock, setDock] = useState(false) // Added dock toggle


  const [isRoastTextAnimating, setIsRoastTextAnimating] = useState(false)

  const [roastTextOpacity, setRoastTextOpacity] = useState(1)

  const [showAccountManager, setShowAccountManager] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null)

  const [isRoastGeneratorSettingsOpen, setIsRoastGeneratorSettingsOpen] = useState(false)

  const [currentAudioIndex, setCurrentAudioIndex] = useState(0)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  // State for Profile and Account Manager Modals
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isAccountManagerOpen, setIsAccountManagerOpen] = useState(false)

  const AUDIO_FILES = [
    { name: "Glitchy", file: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/glitchy-2UC0fknvA0qQYw6RyYfXqPppvGbpro.mp3" },
    { name: "Wafaf", file: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/wafaf-Ohw41acZDSBFwrKX5BP9FCvTaURrUg.mp3" },
    { name: "Brain Tumor", file: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/braintumor-GzNVyuMK6EUhzBKTU3oafBS8VECxn5.mp3" },
    { name: "Oh Yeah", file: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ohyeah-qSlxTRDfMzRYcL6PQvyMl9VmTlvVQf.mp3" },
    { name: "What in the", file: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/whatinthe-WVqMxDSucaAa0UZj6FXahQwL3IaIes.mp3" },
    { name: "Saw", file: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/saw-L5wDfTIyIeJBS2FFnLCRffkPva3u6q.mp3" },
    { name: "Bruh", file: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bruh-wMUaFYDLR9T3U5OaOl48OlNRTQtP4n.mp3" },
    { name: "Rewind Alien", file: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/rewindalien-gEwHVVNfNav6ZEzTjJ3Y5qt7e7JA2L.mp3" },
    { name: "Beep Beep", file: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/beepbeep-wjDX07dIHIhrxVRGc1rv2RQphrVhNr.mp3" },
  ]

  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user)
    setIsAuthenticated(true)
  }

  useEffect(() => {
    if (currentUser) {
      console.log("[v0] Loading user settings:", currentUser)

      // Map theme properly
      const themeMapping: { [key: string]: ThemeColor } = {
        Tenacity: "blue-pink",
        Sunset: "orange-red",
        Mint: "green-teal",
        Mango: "yellow-orange",
      }

      const mappedTheme = themeMapping[currentUser.theme] || "blue-pink"
      setTheme(mappedTheme)
      setCurrentTheme(currentUser.theme) // Keep the display name

      setShowLogo(currentUser.preferences.showLogo)
      setTextGradient(currentUser.preferences.textGradient)
      setFadeAnimation(currentUser.preferences.fadeAnimation)
      setFadeDuration(currentUser.preferences.fadeDuration)
      setGradientSpeed(currentUser.preferences.gradientSpeed)
      setDock(currentUser.preferences.dock)
      setSettings(currentUser.generationSettings)

      console.log("[v0] Settings loaded successfully")
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser) {
      const themeReverseMapping: { [key: string]: string } = {
        "blue-pink": "Tenacity",
        "orange-red": "Sunset",
        "green-teal": "Mint",
        "yellow-orange": "Mango",
      }

      const displayTheme = themeReverseMapping[theme] || currentTheme

      const updatedUser = {
        ...currentUser,
        theme: displayTheme, // Store display name
        preferences: {
          showLogo,
          textGradient,
          fadeAnimation,
          fadeDuration,
          gradientSpeed,
          dock,
        },
        generationSettings: settings,
      }

      // Update localStorage
      const savedAccounts = localStorage.getItem("tenacity-accounts")
      if (savedAccounts) {
        try {
          const accounts = JSON.parse(savedAccounts)
          const updatedAccounts = accounts.map((acc: UserAccount) => (acc.id === currentUser.id ? updatedUser : acc))
          localStorage.setItem("tenacity-accounts", JSON.stringify(updatedAccounts))
          console.log("[v0] Settings saved to localStorage")
        } catch (error) {
          console.error("Error saving user preferences:", error)
        }
      }
    }
  }, [theme, currentTheme, showLogo, textGradient, fadeAnimation, fadeDuration, gradientSpeed, settings, currentUser, dock])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSettingsOpen(false)
        setIsGuiSettingsOpen(false)
        setIsGuiOpen(false)
        setShowResetModal(false)
        setShowGUISettings(false) // Close GUI settings on Escape
        setShowAccountManager(false)
        // Close Roast Generator Settings on Escape
        setIsRoastGeneratorSettingsOpen(false)
        setIsProfileOpen(false) // Close Profile modal on Escape
        setIsAccountManagerOpen(false) // Close Account Manager modal on Escape
      }
      if ((event.ctrlKey || event.metaKey) && event.key === ",") {
        event.preventDefault()
        setIsSettingsOpen(!isSettingsOpen)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isSettingsOpen])

  useEffect(() => {
    if (showCompletionNotification) {
      const timer = setTimeout(() => {
        setShowCompletionNotification(false)
        setShowResetModal(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showCompletionNotification])

  const toggleAudioPlayback = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsAudioPlaying(!isAudioPlaying)
    }
  }

  const nextAudio = () => {
    setCurrentAudioIndex((prev) => (prev + 1) % AUDIO_FILES.length)
    setIsAudioPlaying(false)
    setAudioProgress(0)
    setCurrentTime(0)
  }

  const prevAudio = () => {
    setCurrentAudioIndex((prev) => (prev - 1 + AUDIO_FILES.length) % AUDIO_FILES.length)
    setIsAudioPlaying(false)
    setAudioProgress(0)
    setCurrentTime(0)
  }

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100
      setAudioProgress(progress)
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration)
    }
  }

  const handleAudioEnded = () => {
    setIsAudioPlaying(false)
    nextAudio()
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const downloadAudio = async (audioFile: { name: string; file: string }) => {
    try {
      const response = await fetch(audioFile.file)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${audioFile.name}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading audio:", error)
    }
  }

  const getThemeGradient = (themeColor: ThemeColor) => {
    switch (themeColor) {
      case "blue-pink":
        return "bg-gradient-to-br from-blue-500 via-pink-500 to-blue-600"
      case "purple-orange":
        return "bg-gradient-to-br from-purple-500 via-orange-500 to-purple-600"
      case "green-teal":
        return "bg-gradient-to-br from-green-500 via-teal-500 to-green-600"
      case "red-yellow":
        return "bg-gradient-to-br from-red-500 via-yellow-500 to-red-600"
      case "orange-red": // Added for new theme
        return "bg-gradient-to-br from-orange-500 via-red-500 to-orange-600"
      case "yellow-orange": // Added for new theme
        return "bg-gradient-to-br from-yellow-500 via-orange-500 to-yellow-600"
      default:
        return "bg-gradient-to-br from-blue-500 via-pink-500 to-blue-600"
    }
  }

  const getThemeColors = (themeColor: ThemeColor) => {
    switch (themeColor) {
      case "blue-pink":
        return {
          primary: "from-blue-400 to-pink-400",
          shadow: "shadow-pink-400/60",
          hover: "hover:from-blue-400 hover:to-pink-400",
          sliderFrom: "#60a5fa", // blue-400
          sliderTo: "#f472b6", // pink-400
          from: "from-blue-400",
          to: "to-pink-400",
        }
      case "purple-orange":
        return {
          primary: "from-purple-400 to-orange-400",
          shadow: "shadow-orange-400/60",
          hover: "hover:from-purple-400 hover:to-orange-400",
          sliderFrom: "#c084fc", // purple-400
          sliderTo: "#fb923c", // orange-400
          from: "from-purple-400",
          to: "to-orange-400",
        }
      case "green-teal":
        return {
          primary: "from-green-400 to-teal-400",
          shadow: "shadow-teal-400/60",
          hover: "hover:from-green-400 hover:to-teal-400",
          sliderFrom: "#4ade80", // green-400
          sliderTo: "#2dd4bf", // teal-400
          from: "from-green-400",
          to: "to-teal-400",
        }
      case "red-yellow":
        return {
          primary: "from-red-400 to-yellow-400",
          shadow: "shadow-yellow-400/60",
          hover: "hover:from-red-400 hover:to-yellow-400",
          sliderFrom: "#f87171", // red-400
          sliderTo: "#facc15", // yellow-400
          from: "from-red-400",
          to: "to-yellow-400",
        }
      case "orange-red": // Added for new theme
        return {
          primary: "from-orange-400 to-red-400",
          shadow: "shadow-red-400/60",
          hover: "hover:from-orange-400 hover:to-red-400",
          sliderFrom: "#fb923c", // orange-400
          sliderTo: "#f87171", // red-400
          from: "from-orange-400",
          to: "to-red-400",
        }
      case "yellow-orange": // Added for new theme
        return {
          primary: "from-yellow-400 to-orange-400",
          shadow: "shadow-orange-400/60",
          hover: "hover:from-yellow-400 hover:to-orange-400",
          sliderFrom: "#facc15", // yellow-400
          sliderTo: "#fb923c", // orange-400
          from: "from-yellow-400",
          to: "to-orange-400",
        }
      default:
        return {
          primary: "from-blue-400 to-pink-400",
          shadow: "shadow-pink-400/60",
          hover: "hover:from-blue-400 hover:to-pink-400",
          sliderFrom: "#60a5fa", // blue-400
          sliderTo: "#f472b6", // pink-400
          from: "from-blue-400",
          to: "to-pink-400",
        }
    }
  }

  const themeColors = getThemeColors(theme)

  const handleGenerate = async () => {
    setIsGenerating(true)

    if (roast) {
      setIsRoastFading(true)
      await new Promise((resolve) => setTimeout(resolve, fadeDuration + 100))
    }

    const newRoast = generateRoast(settings)
    setRoast(newRoast)

    setIsRoastFading(false)
    setIsGenerating(false)
  }

  const handleGalleryGenerate = async () => {
    setIsGenerating(true)

    const availableImages = GALLERY_IMAGES.filter((img) => !usedImages.has(img))

    if (availableImages.length === 0) {
      setShowCompletionNotification(true)
      setIsGenerating(false)
      return
    }

    if (currentGalleryImage) {
      setIsRoastFading(true)
      await new Promise((resolve) => setTimeout(resolve, fadeDuration + 100))
    }

    const randomIndex = Math.floor(Math.random() * availableImages.length)
    const selectedImage = availableImages[randomIndex]

    setCurrentGalleryImage(selectedImage)
    setUsedImages((prev) => new Set([...prev, selectedImage]))

    setIsRoastFading(false)
    setIsGenerating(false)
  }

  const handleResetGallery = () => {
    setUsedImages(new Set())
    setCurrentGalleryImage(null)
    setShowResetModal(false)
    setShowCompletionNotification(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(roast)
    setIsRoastAnimating(true)
    setIsRoastTextAnimating(true)
    setRoastTextOpacity(0.8)

    setTimeout(() => setIsRoastAnimating(false), 250)

    setTimeout(() => {
      setIsRoastTextAnimating(false)
      setRoastTextOpacity(1)
    }, 400)
  }

  const updatePercentage = (type: keyof GenerationSettings, value: number) => {
    setSettings((prev) => ({
      ...prev,
      [type]: value,
    }))
  }

  const totalPercentage = settings.roastPercentage + settings.scenario1Percentage + settings.scenario2Percentage
  const normalizedSettings = {
    roastPercentage: Math.round((settings.roastPercentage / totalPercentage) * 100),
    scenario1Percentage: Math.round((settings.scenario1Percentage / totalPercentage) * 100),
    scenario2Percentage: Math.round((settings.scenario2Percentage / totalPercentage) * 100),
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />
  }

  if (currentPage === "audio-gallery") {
    return (
      <div className={`min-h-screen ${getThemeGradient(theme)} p-4`}>
        <div className="fixed top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            className="text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        <div className="fixed top-4 left-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsProfileOpen(true)} // Assuming setIsProfileOpen exists or will be added
            className="text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>

        {isSettingsOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-transparent backdrop-blur-md border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1),0_0_60px_rgba(255,255,255,0.05),inset_0_0_0_1px_rgba(255,255,255,0.1)]">
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl font-bold">Settings</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSettingsOpen(false)}
                  className="absolute top-2 right-2 text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setCurrentPage("main")
                      setIsSettingsOpen(false)
                    }}
                    variant="outline"
                    className={`w-full bg-transparent border border-white/30 text-white hover:bg-transparent hover:text-transparent hover:bg-gradient-to-r ${themeColors.hover} hover:bg-clip-text font-bold py-3 text-lg transition-all duration-300 ${currentPage === "main" ? "ring-2 ring-white/50" : ""}`}
                    size="lg"
                  >
                    Generator
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentPage("gallery")
                      setIsSettingsOpen(false)
                    }}
                    variant="outline"
                    className={`w-full bg-transparent border border-white/30 text-white hover:bg-transparent hover:text-transparent hover:bg-gradient-to-r ${themeColors.hover} hover:bg-clip-text font-bold py-3 text-lg transition-all duration-300 ${currentPage === "gallery" ? "ring-2 ring-white/50" : ""}`}
                    size="lg"
                  >
                    Roast Gallery
                  </Button>
                  {/* Updated Audio Gallery button to be functional */}
                  <Button
                    onClick={() => {
                      setCurrentPage("audio-gallery")
                      setIsSettingsOpen(false)
                    }}
                    variant="outline"
                    className={`w-full bg-transparent border border-white/30 text-white hover:bg-transparent hover:text-transparent hover:bg-gradient-to-r from-purple-400 to-pink-400 hover:bg-clip-text font-bold py-3 text-lg transition-all duration-300 ${currentPage === "audio-gallery" ? "ring-2 ring-white/50" : ""}`}
                    size="lg"
                  >
                    Audio Gallery
                  </Button>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Show Logo Instead of Text</span>
                    <Switch
                      checked={showLogo}
                      onCheckedChange={setShowLogo}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      setIsAccountManagerOpen(true) // Assuming setIsAccountManagerOpen exists or will be added
                      setIsSettingsOpen(false)
                    }}
                    variant="outline"
                    className="w-full bg-transparent border border-white/30 text-white hover:bg-white/20 font-medium py-2"
                  >
                    Account Manager
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Modal */}
        {isProfileOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-transparent backdrop-blur-md border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1),0_0_60px_rgba(255,255,255,0.05),inset_0_0_0_1px_rgba(255,255,255,0.1)]">
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl font-bold">Profile</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsProfileOpen(false)}
                  className="absolute top-2 right-2 text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-2">Welcome!</h3>
                  <p className="text-gray-300">Enjoy your audio collection</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Account Manager Modal */}
        {isAccountManagerOpen && (
          <AccountManager
            currentUser={currentUser}
            onUserChange={setCurrentUser}
            onClose={() => setIsAccountManagerOpen(false)}
          />
        )}

        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-4">Audio Gallery</h1>
            <p className="text-xl text-gray-300">Your collection of audio clips</p>
            <p className="text-sm text-gray-400 mt-2">
              Track: {currentAudioIndex + 1}/{AUDIO_FILES.length}
            </p>
          </div>

          <Card className="bg-transparent backdrop-blur-md border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1),0_0_60px_rgba(255,255,255,0.05),inset_0_0_0_1px_rgba(255,255,255,0.1)]">
            <CardHeader>
              <CardTitle className="text-white text-center text-2xl">{AUDIO_FILES[currentAudioIndex].name}</CardTitle>
              <CardDescription className="text-gray-400 text-center">
                Now playing audio clip {currentAudioIndex + 1} of {AUDIO_FILES.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Audio Element */}
                <audio
                  ref={audioRef}
                  src={AUDIO_FILES[currentAudioIndex].file}
                  onTimeUpdate={handleAudioTimeUpdate}
                  onLoadedMetadata={handleAudioLoadedMetadata}
                  onEnded={handleAudioEnded}
                  className="hidden"
                />

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(audioDuration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    onClick={prevAudio}
                    variant="outline"
                    size="icon"
                    className="bg-transparent border border-white/30 text-white hover:bg-white/20"
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>

                  <Button
                    onClick={toggleAudioPlayback}
                    variant="outline"
                    size="icon"
                    className="bg-transparent border border-white/30 text-white hover:bg-white/20 w-16 h-16"
                  >
                    {isAudioPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                  </Button>

                  <Button
                    onClick={nextAudio}
                    variant="outline"
                    size="icon"
                    className="bg-transparent border border-white/30 text-white hover:bg-white/20"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>

                  <Button
                    onClick={() => downloadAudio(AUDIO_FILES[currentAudioIndex])}
                    variant="outline"
                    size="icon"
                    className="bg-transparent border border-white/30 text-white hover:bg-white/20"
                    title="Download current track"
                  >
                    <Download className="h-5 w-5" />
                  </Button>
                </div>

                {/* Track List */}
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  <h3 className="text-white font-semibold mb-2">Playlist</h3>
                  {AUDIO_FILES.map((audio, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 rounded transition-colors ${
                        index === currentAudioIndex
                          ? "bg-white/20 text-white"
                          : "text-gray-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <button
                        onClick={() => {
                          setCurrentAudioIndex(index)
                          setIsAudioPlaying(false)
                          setAudioProgress(0)
                          setCurrentTime(0)
                        }}
                        className="flex-1 text-left"
                      >
                        {index + 1}. {audio.name}
                      </button>
                      <Button
                        onClick={() => downloadAudio(audio)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white hover:bg-white/10 ml-2"
                        title={`Download ${audio.name}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentPage === "gallery") {
    return (
      <div className={`min-h-screen ${getThemeGradient(theme)} p-4`}>
        <div className="fixed top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="text-white bg-transparent hover:bg-transparent hover:scale-110 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.5),0_0_40px_rgba(255,255,255,0.3),inset_0_0_0_2px_rgba(255,255,255,0.4),inset_0_0_0_4px_rgba(255,255,255,0.2)] transition-all duration-300 ease-out"
          >
            <Settings className="h-6 w-6" />
          </Button>
        </div>

        {isSettingsOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center p-4">
            <Card className="bg-transparent backdrop-blur-md border border-white/20 w-full max-w-md shadow-[0_0_30px_rgba(255,255,255,0.1),0_0_60px_rgba(255,255,255,0.05),inset_0_0_0_1px_rgba(255,255,255,0.1)]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">Settings</CardTitle>
                  <CardDescription className="text-gray-400">
                    Customize your experience (Ctrl+, to toggle)
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-white hover:bg-slate-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-white" />
                    <label className="text-sm font-medium text-white">Display</label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Show Logo Instead of Text</span>
                    <Switch
                      checked={showLogo}
                      onCheckedChange={setShowLogo}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-400 data-[state=checked]:to-pink-400"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-white" />
                    <label className="text-sm font-medium text-white">Interface</label>
                  </div>
                  <Button
                    onClick={() => setIsGuiOpen(true)}
                    variant="outline"
                    className="w-full bg-transparent border border-white/30 text-white hover:bg-slate-700/50 hover:border-white/50 transition-all duration-200"
                  >
                    GUI
                  </Button>
                  <Button
                    onClick={() => setIsGuiSettingsOpen(true)}
                    variant="outline"
                    className="w-full bg-transparent border border-white/30 text-white hover:bg-slate-700/50 hover:border-white/50 transition-all duration-200"
                  >
                    GUI Settings
                  </Button>
                  <Button
                    onClick={() => setIsRoastGeneratorSettingsOpen(true)}
                    variant="outline"
                    className="w-full bg-transparent border border-white/30 text-white hover:bg-slate-700/50 hover:border-white/50 transition-all duration-200"
                  >
                    Roast Generator Settings
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Keyboard Shortcuts</label>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Toggle Settings:</span>
                      <kbd className="px-2 py-1 bg-slate-700 rounded text-white">Ctrl + ,</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Close Settings:</span>
                      <kbd className="px-2 py-1 bg-slate-700 rounded text-white">Esc</kbd>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {isGuiOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <Card className="bg-transparent backdrop-blur-md border border-white/20 w-full max-w-md shadow-[0_0_30px_rgba(255,255,255,0.1),0_0_60px_rgba(255,255,255,0.05),inset_0_0_0_1px_rgba(255,255,255,0.1)]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">GUI</CardTitle>
                  <CardDescription className="text-gray-400">Interface controls</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsGuiOpen(false)}
                  className="text-white hover:bg-slate-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setCurrentPage("main")
                      setIsGuiOpen(false)
                    }}
                    variant="outline"
                    className={`w-full bg-transparent border border-white/30 text-white hover:bg-transparent hover:text-transparent hover:bg-gradient-to-r ${themeColors.hover} hover:bg-clip-text font-bold py-3 text-lg transition-all duration-300 ${currentPage === "main" ? "ring-2 ring-white/50" : ""}`}
                    size="lg"
                  >
                    Generator
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentPage("gallery")
                      setIsGuiOpen(false)
                    }}
                    variant="outline"
                    className={`w-full bg-transparent border border-white/30 text-white hover:bg-transparent hover:text-transparent hover:bg-gradient-to-r ${themeColors.hover} hover:bg-clip-text font-bold py-3 text-lg transition-all duration-300 ${currentPage === "gallery" ? "ring-2 ring-white/50" : ""}`}
                    size="lg"
                  >
                    Roast Gallery
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentPage("audio-gallery")
                      setIsGuiOpen(false)
                    }}
                    variant="outline"
                    className={`w-full bg-transparent border border-white/30 text-white hover:bg-transparent hover:text-transparent hover:bg-gradient-to-r from-purple-400 to-pink-400 hover:bg-clip-text font-bold py-3 text-lg transition-all duration-300 ${currentPage === "audio-gallery" ? "ring-2 ring-white/50" : ""}`}
                    size="lg"
                  >
                    Audio Gallery
                  </Button>
                </div>
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-400 text-center italic">More features coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {isGuiSettingsOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <Card className="bg-transparent backdrop-blur-md border border-white/20 w-full max-w-lg shadow-[0_0_30px_rgba(255,255,255,0.1),0_0_60px_rgba(255,255,255,0.05),inset_0_0_0_1px_rgba(255,255,255,0.1)]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">GUI Settings</CardTitle>
                  <CardDescription className="text-gray-400">Advanced interface customization options</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsGuiSettingsOpen(false)}
                  className="text-white hover:bg-slate-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                    <h3 className="text-white font-medium mb-4">Theme Selection</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => setTheme("blue-pink")}
                        variant={theme === "blue-pink" ? "default" : "outline"}
                        className={`bg-gradient-to-r from-blue-400 to-pink-400 text-white border-0 hover:from-blue-500 hover:to-pink-500 ${
                          theme === "blue-pink" ? "ring-2 ring-white" : ""
                        }`}
                      >
                        Tenacity
                      </Button>
                      <Button
                        onClick={() => setTheme("orange-red")} // Updated theme
                        variant={theme === "orange-red" ? "default" : "outline"}
                        className={`bg-gradient-to-r from-orange-400 to-red-400 text-white border-0 hover:from-orange-500 hover:to-red-500 ${
                          theme === "orange-red" ? "ring-2 ring-white" : ""
                        }`}
                      >
                        Sunset
                      </Button>
                      <Button
                        onClick={() => setTheme("green-teal")}
                        variant={theme === "green-teal" ? "default" : "outline"}
                        className={`bg-gradient-to-r from-green-400 to-teal-400 text-white border-0 hover:from-green-500 hover:to-teal-500 ${
                          theme === "green-teal" ? "ring-2 ring-white" : ""
                        }`}
                      >
                        Mint
                      </Button>
                      <Button
                        onClick={() => setTheme("yellow-orange")} // Updated theme
                        variant={theme === "yellow-orange" ? "default" : "outline"}
                        className={`bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 hover:from-yellow-500 hover:to-orange-500 ${
                          theme === "yellow-orange" ? "ring-2 ring-white" : ""
                        }`}
                      >
                        Mango
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                    <h3 className="text-white font-medium mb-4">Animation Settings</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-sm font-medium text-white">Roast Fade Duration</label>
                          <span className="text-sm text-gray-400">{fadeDuration}ms</span>
                        </div>
                        <Slider
                          value={[fadeDuration]}
                          onValueChange={(value: number[]) => setFadeDuration(value[0])}
                          max={1000}
                          min={100}
                          step={50}
                          className="w-full [&>span[role=slider]]:transition-all [&>span[role=slider]]:duration-300 [&>span[role=slider]]:ease-out"
                          style={
                            {
                              "--slider-from": themeColors.sliderFrom,
                              "--slider-to": themeColors.sliderTo,
                            } as React.CSSProperties
                          }
                        />
                        <style jsx>{`
                          .w-full [data-orientation="horizontal"] [data-slider-range] {
                            background: linear-gradient(to right, ${themeColors.sliderFrom}, ${themeColors.sliderTo}) !important;
                          }
                          .w-full [role="slider"] {
                            background: white !important;
                            border: 2px solid white !important;
                          }
                          .w-full:hover [role="slider"] {
                            background: white !important;
                            border: 2px solid white !important;
                            transform: scale(1.1) !important;
                          }
                        `}</style>
                      </div>
                      <div className="space-y-3 text-sm text-gray-400">
                        <div className="flex items-center justify-between">
                          <span>Logo Switch Animation</span>
                          <Switch
                            checked={showLogo}
                            onCheckedChange={setShowLogo}
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-400 data-[state=checked]:to-pink-400"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Fade Animation</span>
                          <Switch
                            checked={fadeAnimation}
                            onCheckedChange={setFadeAnimation}
                            className={`${
                              fadeAnimation
                                ? `data-[state=checked]:bg-gradient-to-r data-[state=checked]:${themeColors.from} data-[state=checked]:${themeColors.to}`
                                : "data-[state=unchecked]:bg-slate-600"
                            }`}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span>Dock</span>
                          <Switch
                            checked={dock}
                            onCheckedChange={setDock}
                            className={`${
                              dock
                                ? `data-[state=checked]:bg-gradient-to-r data-[state=checked]:${themeColors.from} data-[state=checked]:${themeColors.to}`
                                : "data-[state=unchecked]:bg-slate-600"
                            }`}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span>Button Hover Effects</span>
                          <span className="text-white">Enhanced</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                    <h3 className="text-white font-medium mb-4">Text Effects</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-white">Title Gradient Effect</label>
                          <p className="text-xs text-gray-400">Add an animated gradient to the Tenacity V1 text</p>
                        </div>
                        <Switch
                          checked={textGradient}
                          onCheckedChange={setTextGradient}
                          className={`${
                            textGradient
                              ? `data-[state=checked]:bg-gradient-to-r data-[state=checked]:${themeColors.from} data-[state=checked]:${themeColors.to}`
                              : "data-[state=unchecked]:bg-slate-600"
                          }`}
                        />
                      </div>

                      {textGradient && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-white">Animation Speed</label>
                            <span className="text-xs text-gray-400">{gradientSpeed}s</span>
                          </div>
                          <input
                            type="range"
                            min="2"
                            max="20"
                            step="1"
                            value={gradientSpeed}
                            onChange={(e) => setGradientSpeed(Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                    <h3 className="text-white font-medium mb-2">Future Features</h3>
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>Custom Color Themes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>Sound Effects</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>Export Options</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>Roast History</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                    <h3 className="text-white font-medium mb-2">Performance</h3>
                    <div className="space-y-3 text-sm text-gray-400">
                      <div className="flex items-center justify-between">
                        <span>Render Mode</span>
                        <span className="text-green-400">Optimized</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Memory Usage</span>
                        <span className="text-green-400">Low</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showCompletionNotification && (
          <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 duration-500">
            <Card className="bg-black/20 backdrop-blur-md border border-white/20 text-white shadow-2xl shadow-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-black text-sm font-bold">!</span>
                  </div>
                  <div>
                    <p className="font-medium">All images generated!</p>
                    <p className="text-sm opacity-90">You've seen all the roast images</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showResetModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="bg-transparent backdrop-blur-md border border-white/20 w-full max-w-md shadow-[0_0_30px_rgba(255,255,255,0.1),0_0_60px_rgba(255,255,255,0.05),inset_0_0_0_1px_rgba(255,255,255,0.1)]">
              <CardHeader>
                <CardTitle className="text-white">Gallery Complete!</CardTitle>
                <CardDescription className="text-gray-400">
                  You've generated all {GALLERY_IMAGES.length} images. Reset to start over?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleResetGallery}
                  className={`w-full bg-transparent border border-white/30 text-white hover:bg-transparent hover:text-transparent hover:bg-gradient-to-r ${themeColors.hover} hover:bg-clip-text font-bold py-3 text-lg transition-all duration-300`}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Gallery
                </Button>
                <Button
                  onClick={() => setShowResetModal(false)}
                  variant="outline"
                  className="w-full bg-transparent border border-white/30 text-white hover:bg-slate-700/50 hover:border-white/50 transition-all duration-200"
                >
                  Keep as is
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-4">Roast Gallery</h1>
            <p className="text-xl text-gray-300">Your collection of devastating roast images</p>
            <p className="text-sm text-gray-400 mt-2">
              Progress: {usedImages.size}/{GALLERY_IMAGES.length} images generated
            </p>
          </div>

          <div className="flex items-center justify-center mb-6">
            <Button
              onClick={handleGalleryGenerate}
              disabled={isGenerating}
              className={`bg-transparent border border-white/30 text-white hover:bg-transparent hover:text-transparent hover:bg-gradient-to-r ${themeColors.hover} hover:bg-clip-text font-bold py-3 px-6 text-lg transition-all duration-300`}
              size="lg"
            >
              {isGenerating ? "Generating..." : "Get Roast"}
            </Button>
          </div>

          <Card className="bg-transparent backdrop-blur-md border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1),0_0_60px_rgba(255,255,255,0.05),inset_0_0_0_1px_rgba(255,255,255,0.1)]">
            <CardHeader>
              <CardTitle className="text-white">Roast Image</CardTitle>
              <CardDescription className="text-gray-400">Click "Get Roast" to see a random roast image</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[400px] p-4 bg-slate-900/50 rounded-lg border border-slate-600 flex items-center justify-center">
                {currentGalleryImage ? (
                  <div
                    className={`transition-all duration-500 ${isRoastFading ? "opacity-0" : "opacity-100"}`}
                    style={{ transitionDuration: `${fadeDuration}ms` }}
                  >
                    <img
                      src={currentGalleryImage || "/placeholder.svg"}
                      alt="Roast Gallery Image"
                      className="max-w-full max-h-[350px] object-contain rounded-lg shadow-lg"
                    />
                  </div>
                ) : (
                  <p className="text-gray-500 text-center italic">Click "Get Roast" to generate your first image...</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${getThemeGradient(theme)} relative overflow-hidden`}>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Header */}
        <div
          className={`text-center mb-8 transition-all duration-700 ease-in-out ${!showLogo ? "transform -translate-y-16" : ""}`}
        >
          <div
            className={`mb-4 transition-all duration-700 ease-in-out ${
              showLogo
                ? "opacity-100 transform translate-y-0 scale-100"
                : "opacity-0 transform -translate-y-4 scale-95 pointer-events-none"
            }`}
            style={{ height: showLogo ? "auto" : "0px", overflow: "hidden" }}
          >
            <img
              src="/tenacitylogo.png"
              alt="Tenacity Logo"
              className="w-24 h-24 mx-auto object-contain"
              style={{
                filter: "drop-shadow(0 0 0 transparent)",
                background: "transparent",
                border: "none",
                outline: "none",
              }}
            />
          </div>
          <h1
            className={`text-6xl font-bold mb-4 transition-all duration-700 ease-in-out ${
              textGradient
                ? `bg-gradient-to-r ${themeColors.from} ${themeColors.to} bg-clip-text text-transparent animate-gradient-x`
                : "text-white"
            }`}
            style={
              textGradient
                ? ({
                    backgroundSize: "200% 200%",
                    animation: `gradient-x ${gradientSpeed}s ease-in-out infinite`,
                  } as React.CSSProperties)
                : undefined
            }
          >
            Tenacity V1
          </h1>
          <p className="text-xl text-white/80">
            {currentUser ? `Welcome back, ${currentUser.displayName}!` : "The Ultimate Roast Generator"}
          </p>
        </div>

        <div id="roast-generator">   {/* 👈 ADD THIS LINE */}
  <div className={`transition-all duration-700 ease-in-out ${!showLogo ? "transform -translate-y-16" : ""}`}>
    <Card className="bg-transparent backdrop-blur-md border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1),0_0_60px_rgba(255,255,255,0.05),inset_0_0_0_1px_rgba(255,255,255,0.1)]">
      <CardHeader>
        <CardTitle className="text-white text-center">Generate Your Roast</CardTitle>
        <CardDescription className="text-gray-400 text-center">
          Click the button below to generate a devastating roast
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`bg-transparent border border-white/30 text-white hover:bg-transparent hover:text-transparent hover:bg-gradient-to-r ${themeColors.hover} hover:bg-clip-text font-bold py-3 px-6 text-lg transition-all duration-300`}
            size="lg"
          >
            {isGenerating ? "Generating..." : "Get Roast"}
          </Button>
        </div>

              {roast && (
                <div className="space-y-4">
                  <div
                    className={`p-6 bg-slate-900/50 rounded-lg border border-slate-600 transition-all duration-500 ${
                      isRoastFading ? "opacity-0" : "opacity-100"
                    }`}
                    style={{ transitionDuration: `${fadeDuration}ms` }}
                  >
                    <p
                      className={`text-lg leading-relaxed transition-all duration-150 ease-out ${
                        isRoastTextAnimating
                          ? `bg-gradient-to-r ${themeColors.from} ${themeColors.to} bg-clip-text text-transparent animate-gradient-x`
                          : "text-white"
                      }`}
                      style={
                        isRoastTextAnimating
                          ? ({
                              backgroundSize: "200% 200%",
                              animation: `gradient-x 0.5s ease-in-out infinite`,
                              opacity: roastTextOpacity,
                            } as React.CSSProperties)
                          : ({ opacity: roastTextOpacity } as React.CSSProperties)
                      }
                    >
                      {roast}
                    </p>
                  </div>
                  <div className="text-center">
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      className={`bg-transparent border border-white/30 text-white hover:bg-slate-700/50 hover:border-white/50 transition-all duration-200 ${
                        isRoastAnimating ? "animate-pulse" : ""
                      }`}
                    >
                      Copy Roast
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

        {/* Settings Button */}
        <Button
          onClick={() => setIsSettingsOpen(true)}
          variant="outline"
          size="icon"
          className="fixed top-4 right-4 bg-transparent border border-white/30 text-white hover:bg-slate-700/50 hover:border-white/50 transition-all duration-200"
        >
          <Settings className="h-4 w-4" />
        </Button>

        {/* Account Manager Button */}
        <Button
          onClick={() => setShowAccountManager(true)}
          variant="outline"
          size="icon"
          className="fixed top-4 right-16 bg-transparent border border-white/30 text-white hover:bg-slate-700/50 hover:border-white/50 transition-all duration-200"
        >
          <User className="h-4 w-4" />
        </Button>

        {/* Settings Modal */}
        {isSettingsOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center p-4">
            <Card className="bg-transparent backdrop-blur-md border border-white/20 w-full max-w-md shadow-[0_0_30px_rgba(255,255,255,0.1),0_0_60px_rgba(255,255,255,0.05),inset_0_0_0_1px_rgba(255,255,255,0.1)]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">Settings</CardTitle>
                  <CardDescription className="text-gray-400">Customize your experience</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-white hover:bg-slate-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-white" />
                    <label className="text-sm font-medium text-white">Display</label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Show Logo Instead of Text</span>
                    <Switch
                      checked={showLogo}
                      onCheckedChange={setShowLogo}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-400 data-[state=checked]:to-pink-400"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-white" />
                    <label className="text-sm font-medium text-white">Interface</label>
                  </div>
                  <Button
                    onClick={() => setIsGuiOpen(true)}
                    variant="outline"
                    className="w-full bg-transparent border border-white/30 text-white hover:bg-slate-700/50 hover:border-white/50 transition-all duration-200"
                  >
                    GUI
                  </Button>
                  <Button
                    onClick={() => setIsGuiSettingsOpen(true)}
                    variant="outline"
                    className="w-full bg-transparent border border-white/30 text-white hover:bg-slate-700/50 hover:border-white/50 transition-all duration-200"
                  >
                    GUI Settings
                  </Button>
                  <Button
                    onClick={() => setIsRoastGeneratorSettingsOpen(true)}
                    variant="outline"
                    className="w-full bg-transparent border border-white/30 text-white hover:bg-slate-700/50 hover:border-white/50 transition-all duration-200"
                  >
                    Roast Generator Settings
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Keyboard Shortcuts</label>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Toggle Settings:</span>
                      <kbd className="px-2 py-1 bg-slate-700 rounded text-white">Ctrl + ,</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Close Settings:</span>
                      <kbd className="px-2 py-1 bg-slate-700 rounded text-white">Esc</kbd>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Account Manager Modal */}
        {showAccountManager && (
          <AccountManager
            currentUser={currentUser}
            onUserChange={setCurrentUser}
            onClose={() => setShowAccountManager(false)}
          />
        )}

        {isGuiOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <Card className="bg-transparent backdrop-blur-md border border-white/20 w-full max-w-md shadow-[0_0_30px_rgba(255,255,255,0.1),0_0_60px_rgba(255,255,255,0.05),inset_0_0_0_1px_rgba(255,255,255,0.1)]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">GUI</CardTitle>
                  <CardDescription className="text-gray-400">Interface controls</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsGuiOpen(false)}
                  className="text-white hover:bg-slate-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setCurrentPage("main")
                      setIsGuiOpen(false)
                    }}
                    variant="outline"
                    className={`w-full bg-transparent border border-white/30 text-white hover:bg-transparent hover:text-transparent hover:bg-gradient-to-r ${themeColors.hover} hover:bg-clip-text font-bold py-3 text-lg transition-all duration-300 ${currentPage === "main" ? "ring-2 ring-white/50" : ""}`}
                    size="lg"
                  >
                    Generator
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentPage("gallery")
                      setIsGuiOpen(false)
                    }}
                    variant="outline"
                    className={`w-full bg-transparent border border-white/30 text-white hover:bg-transparent hover:text-transparent hover:bg-gradient-to-r ${themeColors.hover} hover:bg-clip-text font-bold py-3 text-lg transition-all duration-300 ${currentPage === "gallery" ? "ring-2 ring-white/50" : ""}`}
                    size="lg"
                  >
                    Roast Gallery
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentPage("audio-gallery")
                      setIsGuiOpen(false)
                    }}
                    variant="outline"
                    className={`w-full bg-transparent border border-white/30 text-white hover:bg-transparent hover:text-transparent hover:bg-gradient-to-r from-purple-400 to-pink-400 hover:bg-clip-text font-bold py-3 text-lg transition-all duration-300 ${currentPage === "audio-gallery" ? "ring-2 ring-white/50" : ""}`}
                    size="lg"
                  >
                    Audio Gallery
                  </Button>
                </div>
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-400 text-center italic">More features coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {isGuiSettingsOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <Card className="bg-transparent backdrop-blur-md border border-white/20 w-full max-w-lg shadow-[0_0_30px_rgba(255,255,255,0.1),0_0_60px_rgba(255,255,255,0.05),inset_0_0_0_1px_rgba(255,255,255,0.1)]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">GUI Settings</CardTitle>
                  <CardDescription className="text-gray-400">Advanced interface customization options</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsGuiSettingsOpen(false)}
                  className="text-white hover:bg-slate-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                    <h3 className="text-white font-medium mb-4">Theme Selection</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => setTheme("blue-pink")}
                        variant={theme === "blue-pink" ? "default" : "outline"}
                        className={`bg-gradient-to-r from-blue-400 to-pink-400 text-white border-0 hover:from-blue-500 hover:to-pink-500 ${
                          theme === "blue-pink" ? "ring-2 ring-white" : ""
                        }`}
                      >
                        Tenacity
                      </Button>
                      <Button
                        onClick={() => setTheme("orange-red")} // Updated theme
                        variant={theme === "orange-red" ? "default" : "outline"}
                        className={`bg-gradient-to-r from-orange-400 to-red-400 text-white border-0 hover:from-orange-500 hover:to-red-500 ${
                          theme === "orange-red" ? "ring-2 ring-white" : ""
                        }`}
                      >
                        Sunset
                      </Button>
                      <Button
                        onClick={() => setTheme("green-teal")}
                        variant={theme === "green-teal" ? "default" : "outline"}
                        className={`bg-gradient-to-r from-green-400 to-teal-400 text-white border-0 hover:from-green-500 hover:to-teal-500 ${
                          theme === "green-teal" ? "ring-2 ring-white" : ""
                        }`}
                      >
                        Mint
                      </Button>
                      <Button
                        onClick={() => setTheme("yellow-orange")} // Updated theme
                        variant={theme === "yellow-orange" ? "default" : "outline"}
                        className={`bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 hover:from-yellow-500 hover:to-orange-500 ${
                          theme === "yellow-orange" ? "ring-2 ring-white" : ""
                        }`}
                      >
                        Mango
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                    <h3 className="text-white font-medium mb-4">Animation Settings</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-sm font-medium text-white">Roast Fade Duration</label>
                          <span className="text-sm text-gray-400">{fadeDuration}ms</span>
                        </div>
                        <Slider
                          value={[fadeDuration]}
                          onValueChange={(value: number[]) => setFadeDuration(value[0])}
                          max={1000}
                          min={100}
                          step={50}
                          className="w-full [&>span[role=slider]]:transition-all [&>span[role=slider]]:duration-300 [&>span[role=slider]]:ease-out"
                          style={
                            {
                              "--slider-from": themeColors.sliderFrom,
                              "--slider-to": themeColors.sliderTo,
                            } as React.CSSProperties
                          }
                        />
                        <style jsx>{`
                          .w-full [data-orientation="horizontal"] [data-slider-range] {
                            background: linear-gradient(to right, ${themeColors.sliderFrom}, ${themeColors.sliderTo}) !important;
                          }
                          .w-full [role="slider"] {
                            background: white !important;
                            border: 2px solid white !important;
                          }
                          .w-full:hover [role="slider"] {
                            background: white !important;
                            border: 2px solid white !important;
                            transform: scale(1.1) !important;
                          }
                        `}</style>
                      </div>
                      <div className="space-y-3 text-sm text-gray-400">
                        <div className="flex items-center justify-between">
                         <span>Logo Switch Animation</span>
                         <Switch
                           checked={showLogo}
                           onCheckedChange={setShowLogo}
                           className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-400 data-[state=checked]:to-pink-400"
                         />
                       </div>
                       <div className="flex items-center justify-between">
                         <span>Fade Animation</span>
                         <Switch
                           checked={fadeAnimation}
                           onCheckedChange={setFadeAnimation}
                           className={`${
                             fadeAnimation
                               ? `data-[state=checked]:bg-gradient-to-r data-[state=checked]:${themeColors.from} data-[state=checked]:${themeColors.to}`
                               : "data-[state=unchecked]:bg-slate-600"
                           }`}
                         />
                       </div>

                     


                       <div className="flex items-center justify-between">
                         <span>Dock</span>
                         <Switch
                           checked={dock}
                           onCheckedChange={setDock}
                           className={`${
                             dock
                               ? `data-[state=checked]:bg-gradient-to-r data-[state=checked]:${themeColors.from} data-[state=checked]:${themeColors.to}`
                               : "data-[state=unchecked]:bg-slate-600"
                           }`}
                         />
                       </div>

                       <div className="flex items-center justify-between">
                         <span>Button Hover Effects</span>
                         <span className="text-white">Enhanced</span>
                       </div>
                     </div>

                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                    <h3 className="text-white font-medium mb-4">Text Effects</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-white">Title Gradient Effect</label>
                          <p className="text-xs text-gray-400">Add an animated gradient to the Tenacity V1 text</p>
                        </div>
                        <Switch
                          checked={textGradient}
                          onCheckedChange={setTextGradient}
                          className={`${
                            textGradient
                              ? `data-[state=checked]:bg-gradient-to-r data-[state=checked]:${themeColors.from} data-[state=checked]:${themeColors.to}`
                              : "data-[state=unchecked]:bg-slate-600"
                          }`}
                        />
                      </div>

                      {textGradient && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-white">Animation Speed</label>
                            <span className="text-xs text-gray-400">{gradientSpeed}s</span>
                          </div>
                          <input
                            type="range"
                            min="2"
                            max="20"
                            step="1"
                            value={gradientSpeed}
                            onChange={(e) => setGradientSpeed(Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                    <h3 className="text-white font-medium mb-2">Future Features</h3>
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>Custom Color Themes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>Sound Effects</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>Export Options</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>Roast History</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                    <h3 className="text-white font-medium mb-2">Performance</h3>
                    <div className="space-y-3 text-sm text-gray-400">
                      <div className="flex items-center justify-between">
                        <span>Render Mode</span>
                        <span className="text-green-400">Optimized</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Memory Usage</span>
                        <span className="text-green-400">Low</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {isRoastGeneratorSettingsOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <Card className="bg-transparent backdrop-blur-md border border-white/20 w-full max-w-lg shadow-[0_0_30px_rgba(255,255,255,0.1),0_0_60px_rgba(255,255,255,0.05),inset_0_0_0_1px_rgba(255,255,255,0.1)]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">Roast Generator Settings</CardTitle>
                  <CardDescription className="text-gray-400">Configure roast generation parameters</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsRoastGeneratorSettingsOpen(false)}
                  className="text-white hover:bg-slate-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6 max-h-96 overflow-y-auto">
                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                  <h3 className="text-white font-medium mb-4">Scenario Distribution</h3>
                  <div className="space-y-6">
                    {/* Regular Roasts Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium text-white">Regular Roasts</label>
                        <span className="text-sm text-gray-400">{normalizedSettings.roastPercentage}%</span>
                      </div>
                      <Slider
                        value={[settings.roastPercentage]}
                        onValueChange={(value: number[]) => updatePercentage("roastPercentage", value[0])}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full [&>span[role=slider]]:transition-all [&>span[role=slider]]:duration-300 [&>span[role=slider]]:ease-out"
                        style={
                          {
                            "--slider-from": themeColors.sliderFrom,
                            "--slider-to": themeColors.sliderTo,
                          } as React.CSSProperties
                        }
                      />
                    </div>

                    {/* Scenario 1 Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium text-white">Scenario 1 (Family Roasts)</label>
                        <span className="text-sm text-gray-400">{normalizedSettings.scenario1Percentage}%</span>
                      </div>
                      <Slider
                        value={[settings.scenario1Percentage]}
                        onValueChange={(value: number[]) => updatePercentage("scenario1Percentage", value[0])}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full [&>span[role=slider]]:transition-all [&>span[role=slider]]:duration-300 [&>span[role=slider]]:ease-out"
                        style={
                          {
                            "--slider-from": themeColors.sliderFrom,
                            "--slider-to": themeColors.sliderTo,
                          } as React.CSSProperties
                        }
                      />
                    </div>

                    {/* Scenario 2 Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium text-white">Scenario 2 (Personal Roasts)</label>
                        <span className="text-sm text-gray-400">{normalizedSettings.scenario2Percentage}%</span>
                      </div>
                      <Slider
                        value={[settings.scenario2Percentage]}
                        onValueChange={(value: number[]) => updatePercentage("scenario2Percentage", value[0])}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full [&>span[role=slider]]:transition-all [&>span[role=slider]]:duration-300 [&>span[role=slider]]:ease-out"
                        style={
                          {
                            "--slider-from": themeColors.sliderFrom,
                            "--slider-to": themeColors.sliderTo,
                          } as React.CSSProperties
                        }
                      />
                    </div>

                    <style jsx>{`
                      .w-full [data-orientation="horizontal"] [data-slider-range] {
                        background: linear-gradient(to right, ${themeColors.sliderFrom}, ${themeColors.sliderTo}) !important;
                      }
                      .w-full [role="slider"] {
                        background: white !important;
                        border: 2px solid white !important;
                      }
                      .w-full:hover [role="slider"] {
                        background: white !important;
                        border: 2px solid white !important;
                        transform: scale(1.1) !important;
                      }
                    `}</style>
                  </div>

                  <div className="mt-6 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-xs text-gray-400 text-center">
                      Percentages are automatically normalized to total 100%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

 {console.log({ DockHome, DockArchive, DockUser, DockSettings })}

                      {dock && (
  <>
    {console.log("🚀 Dock render:", {
      DockHome,
      DockArchive,
      DockUser,
      DockSettings
    })}

    <Dock
        
      items={[
  { icon: <DockHome size={18} />, label: "Roast Generator", onClick: () => alert("Coming Soon...") },
  { icon: <DockHome size={18} />, label: "Roast Gallery", onClick: () => alert("Coming Soon...") },
  { icon: <DockHome size={18} />, label: "Audio Gallery", onClick: () => alert("Coming Soon...") },
  { icon: <DockHome size={18} />, label: "Settings", onClick: () => alert("Coming Soon...") },
]}

      panelHeight={68}
      baseItemSize={50}
      magnification={70}
    />
  </>
)}

      </div>
    </div>
  )
}
