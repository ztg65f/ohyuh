"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { generateRoast, type GenerationSettings } from "@/lib/roast-generator"
import { LoginScreen } from "@/components/login-screen"
import { AccountManager, type UserAccount } from "@/components/account-manager"
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Settings,
  User,
  Palette,
  Zap,
  Timer,
  Waves,
  Download,
  Music,
  Image as ImageIcon,
  Copy,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

// Audio files data
const audioFiles = [
  { id: 1, name: "Chill Beats", src: "/audio/chill-beats.mp3", duration: "3:24" },
  { id: 2, name: "Lo-Fi Study", src: "/audio/lofi-study.mp3", duration: "4:12" },
  { id: 3, name: "Ambient Waves", src: "/audio/ambient-waves.mp3", duration: "5:08" },
  { id: 4, name: "Jazz Cafe", src: "/audio/jazz-cafe.mp3", duration: "3:45" },
  { id: 5, name: "Electronic Dreams", src: "/audio/electronic-dreams.mp3", duration: "4:33" },
]

// Gallery images data
const galleryImages = [
  { id: 1, src: "/gallery/pic1.webp", alt: "Gallery Image 1" },
  { id: 2, src: "/gallery/pic2.webp", alt: "Gallery Image 2" },
  { id: 3, src: "/gallery/pic3.webp", alt: "Gallery Image 3" },
  { id: 4, src: "/gallery/pic4.webp", alt: "Gallery Image 4" },
  { id: 5, src: "/gallery/pic5.webp", alt: "Gallery Image 5" },
  { id: 6, src: "/gallery/pic6.webp", alt: "Gallery Image 6" },
  { id: 7, src: "/gallery/pic7.webp", alt: "Gallery Image 7" },
  { id: 8, src: "/gallery/pic8.webp", alt: "Gallery Image 8" },
  { id: 9, src: "/gallery/pic9.webp", alt: "Gallery Image 9" },
  { id: 10, src: "/gallery/pic10.webp", alt: "Gallery Image 10" },
]

export default function Home() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null)
  const [showAccountManager, setShowAccountManager] = useState(false)
  const [roast, setRoast] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  const [settings, setSettings] = useState<GenerationSettings>({
    roastPercentage: 50,
    scenario1Percentage: 25,
    scenario2Percentage: 25,
  })

  // Audio player state
  const [currentAudio, setCurrentAudio] = useState<(typeof audioFiles)[0] | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // User preferences state
  const [preferences, setPreferences] = useState({
    showLogo: true,
    textGradient: false,
    fadeAnimation: false,
    fadeDuration: 300,
    gradientSpeed: 8,
  })

  // Theme state
  const [currentTheme, setCurrentTheme] = useState("Tenacity")

  // Load user data on mount
  useEffect(() => {
    if (currentUser) {
      setSettings(currentUser.generationSettings)
      setPreferences(currentUser.preferences)
      setCurrentTheme(currentUser.theme)
    }
  }, [currentUser])

  // Save user data when settings change
  useEffect(() => {
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        generationSettings: settings,
        preferences,
        theme: currentTheme,
      }
      setCurrentUser(updatedUser)

      // Update in localStorage
      const savedAccounts = localStorage.getItem("tenacity-accounts")
      if (savedAccounts) {
        try {
          const accounts = JSON.parse(savedAccounts)
          const updatedAccounts = accounts.map((acc: UserAccount) =>
            acc.id === currentUser.id ? updatedUser : acc
          )
          localStorage.setItem("tenacity-accounts", JSON.stringify(updatedAccounts))
        } catch (error) {
          console.error("Error updating user data:", error)
        }
      }
    }
  }, [settings, preferences, currentTheme, currentUser])

  // Audio player effects
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", () => setIsPlaying(false))

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("ended", () => setIsPlaying(false))
    }
  }, [currentAudio])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const handleGenerate = async () => {
    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newRoast = generateRoast(settings)
    setRoast(newRoast)
    setIsGenerating(false)
  }

  const updatePercentage = (type: keyof GenerationSettings, value: number) => {
    setSettings((prev) => ({
      ...prev,
      [type]: value,
    }))
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates((prev) => ({ ...prev, [id]: true }))
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [id]: false }))
      }, 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  // Audio player functions
  const playAudio = (audio: (typeof audioFiles)[0]) => {
    if (currentAudio?.id === audio.id) {
      togglePlayPause()
    } else {
      setCurrentAudio(audio)
      setIsPlaying(true)
    }
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const skipForward = () => {
    const currentIndex = audioFiles.findIndex((audio) => audio.id === currentAudio?.id)
    const nextIndex = (currentIndex + 1) % audioFiles.length
    setCurrentAudio(audioFiles[nextIndex])
    setIsPlaying(true)
  }

  const skipBackward = () => {
    const currentIndex = audioFiles.findIndex((audio) => audio.id === currentAudio?.id)
    const prevIndex = currentIndex === 0 ? audioFiles.length - 1 : currentIndex - 1
    setCurrentAudio(audioFiles[prevIndex])
    setIsPlaying(true)
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    setIsMuted(false)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const downloadAudio = (audioFile: (typeof audioFiles)[0]) => {
    const link = document.createElement("a")
    link.href = audioFile.src
    link.download = `${audioFile.name}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadImage = (image: (typeof galleryImages)[0]) => {
    const link = document.createElement("a")
    link.href = image.src
    link.download = `gallery-image-${image.id}.webp`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Dock items
  const dockItems = [
    { 
      icon: <Zap size={18} />, 
      label: 'Generator', 
      onClick: () => {
        const generatorTab = document.querySelector('[value="generator"]')
        if (generatorTab) generatorTab.click()
      }
    },
    { 
      icon: <Music size={18} />, 
      label: 'Audio', 
      onClick: () => {
        const audioTab = document.querySelector('[value="audio"]')
        if (audioTab) audioTab.click()
      }
    },
    { 
      icon: <ImageIcon size={18} />, 
      label: 'Gallery', 
      onClick: () => {
        const galleryTab = document.querySelector('[value="gallery"]')
        if (galleryTab) galleryTab.click()
      }
    },
    { 
      icon: <Settings size={18} />, 
      label: 'Settings', 
      onClick: () => {
        const settingsTab = document.querySelector('[value="settings"]')
        if (settingsTab) settingsTab.click()
      }
    },
  ]

  // Theme configurations
  const themes = {
    Tenacity: {
      name: "Tenacity",
      gradient: "from-slate-900 via-purple-900 to-slate-900",
      cardBg: "bg-slate-800/50",
      cardBorder: "border-slate-700",
      textPrimary: "text-white",
      textSecondary: "text-gray-300",
      textMuted: "text-gray-400",
      button: "bg-red-600 hover:bg-red-700",
      accent: "text-red-400",
    },
    "Ocean Breeze": {
      name: "Ocean Breeze",
      gradient: "from-blue-900 via-teal-800 to-cyan-900",
      cardBg: "bg-blue-800/50",
      cardBorder: "border-blue-600",
      textPrimary: "text-white",
      textSecondary: "text-blue-100",
      textMuted: "text-blue-300",
      button: "bg-teal-600 hover:bg-teal-700",
      accent: "text-teal-400",
    },
    "Sunset Glow": {
      name: "Sunset Glow",
      gradient: "from-orange-900 via-red-800 to-pink-900",
      cardBg: "bg-orange-800/50",
      cardBorder: "border-orange-600",
      textPrimary: "text-white",
      textSecondary: "text-orange-100",
      textMuted: "text-orange-300",
      button: "bg-pink-600 hover:bg-pink-700",
      accent: "text-pink-400",
    },
    "Forest Night": {
      name: "Forest Night",
      gradient: "from-green-900 via-emerald-800 to-teal-900",
      cardBg: "bg-green-800/50",
      cardBorder: "border-green-600",
      textPrimary: "text-white",
      textSecondary: "text-green-100",
      textMuted: "text-green-300",
      button: "bg-emerald-600 hover:bg-emerald-700",
      accent: "text-emerald-400",
    },
    "Royal Purple": {
      name: "Royal Purple",
      gradient: "from-purple-900 via-indigo-800 to-blue-900",
      cardBg: "bg-purple-800/50",
      cardBorder: "border-purple-600",
      textPrimary: "text-white",
      textSecondary: "text-purple-100",
      textMuted: "text-purple-300",
      button: "bg-indigo-600 hover:bg-indigo-700",
      accent: "text-indigo-400",
    },
  }

  const theme = themes[currentTheme as keyof typeof themes] || themes.Tenacity

  // Calculate normalized percentages
  const totalPercentage = settings.roastPercentage + settings.scenario1Percentage + settings.scenario2Percentage
  const normalizedSettings = {
    roastPercentage: Math.round((settings.roastPercentage / totalPercentage) * 100),
    scenario1Percentage: Math.round((settings.scenario1Percentage / totalPercentage) * 100),
    scenario2Percentage: Math.round((settings.scenario2Percentage / totalPercentage) * 100),
  }

  // Show login screen if no user is logged in
  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} />
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.gradient} p-4 transition-all duration-500`}>
      {/* Account Manager Modal */}
      {showAccountManager && (
        <AccountManager
          currentUser={currentUser}
          onUserChange={setCurrentUser}
          onClose={() => setShowAccountManager(false)}
        />
      )}

      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {preferences.showLogo && (
                <img src="/tenacitylogo.png" alt="Tenacity Logo" className="w-12 h-12 rounded-lg shadow-lg" />
              )}
              <div>
                <h1
                  className={`text-5xl font-bold mb-2 transition-all duration-500 ${
                    preferences.textGradient
                      ? "bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse"
                      : theme.textPrimary
                  }`}
                  style={
                    preferences.textGradient
                      ? {
                          backgroundSize: "200% 200%",
                          animation: `gradient-x ${preferences.gradientSpeed}s ease infinite`,
                        }
                      : {}
                  }
                >
                  🔥 Tenacity V1 🔥
                </h1>
                <p className={`text-xl ${theme.textSecondary}`}>
                  Welcome back, <span className="font-semibold">{currentUser.displayName}</span>!
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowAccountManager(true)}
              variant="outline"
              className={`${theme.cardBg} ${theme.cardBorder} ${theme.textPrimary} hover:bg-slate-700`}
            >
              <User className="w-4 h-4 mr-2" />
              Account
            </Button>
          </div>
          <p className={`text-xl ${theme.textSecondary}`}>Generate devastating roasts with advanced settings</p>
        </div>

        <Tabs defaultValue="generator" className="w-full">
          <TabsList className={`grid w-full grid-cols-4 ${theme.cardBg} ${theme.cardBorder}`}>
            <TabsTrigger value="generator" className={`${theme.textPrimary} data-[state=active]:bg-slate-600`}>
              <Zap className="w-4 h-4 mr-2" />
              Generator
            </TabsTrigger>
            <TabsTrigger value="audio" className={`${theme.textPrimary} data-[state=active]:bg-slate-600`}>
              <Music className="w-4 h-4 mr-2" />
              Audio Gallery
            </TabsTrigger>
            <TabsTrigger value="gallery" className={`${theme.textPrimary} data-[state=active]:bg-slate-600`}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Image Gallery
            </TabsTrigger>
            <TabsTrigger value="settings" className={`${theme.textPrimary} data-[state=active]:bg-slate-600`}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Generator Tab */}
          <TabsContent value="generator" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Controls */}
              <Card className={`${theme.cardBg} ${theme.cardBorder}`}>
                <CardHeader>
                  <CardTitle className={theme.textPrimary}>Generation Settings</CardTitle>
                  <CardDescription className={theme.textMuted}>
                    Adjust the probability of each roast type
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Roast Percentage */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className={`text-sm font-medium ${theme.textPrimary}`}>Regular Roasts</label>
                      <span className={`text-sm ${theme.textMuted}`}>{normalizedSettings.roastPercentage}%</span>
                    </div>
                    <Slider
                      value={[settings.roastPercentage]}
                      onValueChange={(value: number[]) => updatePercentage("roastPercentage", value[0])}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* Scenario 1 Percentage */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className={`text-sm font-medium ${theme.textPrimary}`}>Scenario 1 (Family Roasts)</label>
                      <span className={`text-sm ${theme.textMuted}`}>{normalizedSettings.scenario1Percentage}%</span>
                    </div>
                    <Slider
                      value={[settings.scenario1Percentage]}
                      onValueChange={(value: number[]) => updatePercentage("scenario1Percentage", value[0])}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* Scenario 2 Percentage */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className={`text-sm font-medium ${theme.textPrimary}`}>Scenario 2 (Personal Roasts)</label>
                      <span className={`text-sm ${theme.textMuted}`}>{normalizedSettings.scenario2Percentage}%</span>
                    </div>
                    <Slider
                      value={[settings.scenario2Percentage]}
                      onValueChange={(value: number[]) => updatePercentage("scenario2Percentage", value[0])}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`w-full ${theme.button} text-white font-bold py-3 text-lg`}
                    size="lg"
                  >
                    {isGenerating ? "🔥 Generating..." : "🔥 Generate Roast 🔥"}
                  </Button>
                </CardContent>
              </Card>

              {/* Output */}
              <Card className={`${theme.cardBg} ${theme.cardBorder}`}>
                <CardHeader>
                  <CardTitle className={theme.textPrimary}>Your Roast</CardTitle>
                  <CardDescription className={theme.textMuted}>Click generate to get a fresh roast</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`min-h-[200px] p-4 bg-slate-900/50 rounded-lg border border-slate-600 transition-all duration-300 ${
                      preferences.fadeAnimation ? "animate-pulse" : ""
                    }`}
                    style={
                      preferences.fadeAnimation
                        ? {
                            animationDuration: `${preferences.fadeDuration}ms`,
                          }
                        : {}
                    }
                  >
                    {roast ? (
                      <p className={`${theme.textPrimary} text-lg leading-relaxed`}>{roast}</p>
                    ) : (
                      <p className={`${theme.textMuted} text-center italic mt-16`}>
                        Click the generate button to create your first roast...
                      </p>
                    )}
                  </div>

                  {roast && (
                    <Button
                      onClick={() => copyToClipboard(roast, "main-roast")}
                      variant="outline"
                      className={`mt-4 w-full ${theme.cardBorder} ${theme.textPrimary} hover:bg-slate-700`}
                    >
                      {copiedStates["main-roast"] ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy to Clipboard
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audio Gallery Tab */}
          <TabsContent value="audio" className="space-y-6">
            <Card className={`${theme.cardBg} ${theme.cardBorder}`}>
              <CardHeader>
                <CardTitle className={theme.textPrimary}>Audio Gallery</CardTitle>
                <CardDescription className={theme.textMuted}>Listen to our curated audio collection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Audio List */}
                <div className="space-y-3">
                  {audioFiles.map((audio) => (
                    <div
                      key={audio.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                        currentAudio?.id === audio.id
                          ? `${theme.cardBorder} bg-blue-400/10`
                          : `border-slate-600 hover:border-slate-500`
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={() => playAudio(audio)}
                          variant="outline"
                          size="icon"
                          className={`${theme.cardBorder} ${theme.textPrimary} hover:bg-slate-700`}
                        >
                          {currentAudio?.id === audio.id && isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <div>
                          <p className={`${theme.textPrimary} font-medium`}>{audio.name}</p>
                          <p className={`${theme.textMuted} text-sm`}>{audio.duration}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => downloadAudio(audio)}
                        variant="outline"
                        size="sm"
                        className={`${theme.cardBorder} ${theme.textPrimary} hover:bg-slate-700`}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Audio Player */}
                {currentAudio && (
                  <div className={`p-6 rounded-lg border ${theme.cardBorder} bg-slate-900/50`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className={`${theme.textPrimary} font-medium`}>{currentAudio.name}</h3>
                        <p className={`${theme.textMuted} text-sm`}>
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <Slider
                        value={[currentTime]}
                        onValueChange={handleSeek}
                        max={duration || 100}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={skipBackward}
                          variant="outline"
                          size="icon"
                          className={`${theme.cardBorder} ${theme.textPrimary} hover:bg-slate-700`}
                        >
                          <SkipBack className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={togglePlayPause}
                          variant="outline"
                          size="icon"
                          className={`${theme.cardBorder} ${theme.textPrimary} hover:bg-slate-700`}
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          onClick={skipForward}
                          variant="outline"
                          size="icon"
                          className={`${theme.cardBorder} ${theme.textPrimary} hover:bg-slate-700`}
                        >
                          <SkipForward className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Volume Control */}
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={toggleMute}
                          variant="outline"
                          size="icon"
                          className={`${theme.cardBorder} ${theme.textPrimary} hover:bg-slate-700`}
                        >
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                        <div className="w-24">
                          <Slider
                            value={[isMuted ? 0 : volume]}
                            onValueChange={handleVolumeChange}
                            max={1}
                            min={0}
                            step={0.1}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    <audio ref={audioRef} src={currentAudio.src} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Image Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            <Card className={`${theme.cardBg} ${theme.cardBorder}`}>
              <CardHeader>
                <CardTitle className={theme.textPrimary}>Image Gallery</CardTitle>
                <CardDescription className={theme.textMuted}>Browse our image collection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImages.map((image) => (
                    <div key={image.id} className="group relative">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-48 object-cover rounded-lg transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button
                          onClick={() => downloadImage(image)}
                          variant="outline"
                          size="sm"
                          className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Theme Settings */}
              <Card className={`${theme.cardBg} ${theme.cardBorder}`}>
                <CardHeader>
                  <CardTitle className={`${theme.textPrimary} flex items-center gap-2`}>
                    <Palette className="w-5 h-5" />
                    Theme Settings
                  </CardTitle>
                  <CardDescription className={theme.textMuted}>Customize the appearance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label className={theme.textPrimary}>Choose Theme</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(themes).map(([key, themeOption]) => (
                        <Button
                          key={key}
                          onClick={() => setCurrentTheme(key)}
                          variant={currentTheme === key ? "default" : "outline"}
                          className={`justify-start ${
                            currentTheme === key
                              ? themeOption.button
                              : `${theme.cardBorder} ${theme.textPrimary} hover:bg-slate-700`
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full mr-2 bg-gradient-to-r ${themeOption.gradient}`}
                          ></div>
                          {themeOption.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* UI Preferences */}
              <Card className={`${theme.cardBg} ${theme.cardBorder}`}>
                <CardHeader>
                  <CardTitle className={`${theme.textPrimary} flex items-center gap-2`}>
                    <Settings className="w-5 h-5" />
                    UI Preferences
                  </CardTitle>
                  <CardDescription className={theme.textMuted}>Customize interface behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className={theme.textPrimary}>Show Logo</Label>
                      <p className={`text-sm ${theme.textMuted}`}>Display the Tenacity logo in header</p>
                    </div>
                    <Switch
                      checked={preferences.showLogo}
                      onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, showLogo: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className={theme.textPrimary}>Text Gradient</Label>
                      <p className={`text-sm ${theme.textMuted}`}>Apply animated gradient to title</p>
                    </div>
                    <Switch
                      checked={preferences.textGradient}
                      onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, textGradient: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className={theme.textPrimary}>Fade Animation</Label>
                      <p className={`text-sm ${theme.textMuted}`}>Add fade effect to roast output</p>
                    </div>
                    <Switch
                      checked={preferences.fadeAnimation}
                      onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, fadeAnimation: checked }))}
                    />
                  </div>

                  {preferences.fadeAnimation && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className={theme.textPrimary}>Fade Duration</Label>
                        <span className={`text-sm ${theme.textMuted}`}>{preferences.fadeDuration}ms</span>
                      </div>
                      <Slider
                        value={[preferences.fadeDuration]}
                        onValueChange={(value) =>
                          setPreferences((prev) => ({ ...prev, fadeDuration: value[0] }))
                        }
                        max={2000}
                        min={100}
                        step={100}
                        className="w-full"
                      />
                    </div>
                  )}

                  {preferences.textGradient && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className={theme.textPrimary}>Gradient Speed</Label>
                        <span className={`text-sm ${theme.textMuted}`}>{preferences.gradientSpeed}s</span>
                      </div>
                      <Slider
                        value={[preferences.gradientSpeed]}
                        onValueChange={(value) =>
                          setPreferences((prev) => ({ ...prev, gradientSpeed: value[0] }))
                        }
                        max={20}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Dock Settings */}
              <Card className={`${theme.cardBg} ${theme.cardBorder}`}>
                <CardHeader>
                  <CardTitle className={`${theme.textPrimary} flex items-center gap-2`}>
                    <Settings className="w-5 h-5" />
                    Dock Settings
                  </CardTitle>
                  <CardDescription className={theme.textMuted}>Configure the floating dock</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className={theme.textPrimary}>Show Dock</Label>
                      <p className={`text-sm ${theme.textMuted}`}>Display floating dock with quick navigation</p>
                    </div>
                    <Switch
                      checked={preferences.showDock}
                      onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, showDock: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-8">
          <p
            className={`${theme.textMuted} text-sm hover:text-transparent hover:bg-gradient-to-r hover:from-blue-500 hover:to-pink-500 hover:bg-clip-text hover:scale-110 transition-all duration-500 cursor-pointer`}
          >
            ⚠️ Warning: Use these roasts responsibly and with friends who can take a joke! ⚠️
          </p>
        </div>
      </div>

      {/* Dock */}
      {preferences.showDock && (
        <Dock 
          items={dockItems}
          panelHeight={68}
          baseItemSize={50}
          magnification={70}
        />
      )}
    </div>
  )
}