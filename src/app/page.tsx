"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { generateRoast, type GenerationSettings } from "@/lib/roast-generator"

export default function Home() {
  const [roast, setRoast] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [settings, setSettings] = useState<GenerationSettings>({
    roastPercentage: 50,
    scenario1Percentage: 25,
    scenario2Percentage: 25,
  })

  const handleGenerate = async () => {
    setIsGenerating(true)
    // Add a small delay for dramatic effect
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

  // Ensure percentages add up to 100
  const totalPercentage = settings.roastPercentage + settings.scenario1Percentage + settings.scenario2Percentage
  const normalizedSettings = {
    roastPercentage: Math.round((settings.roastPercentage / totalPercentage) * 100),
    scenario1Percentage: Math.round((settings.scenario1Percentage / totalPercentage) * 100),
    scenario2Percentage: Math.round((settings.scenario2Percentage / totalPercentage) * 100),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">🔥 Roast Generator 🔥</h1>
          <p className="text-xl text-gray-300">Generate the most devastating roasts with the click of a button</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Controls */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Generation Settings</CardTitle>
              <CardDescription className="text-gray-400">Adjust the probability of each roast type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Roast Percentage */}
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
                  className="w-full"
                />
              </div>

              {/* Scenario 1 Percentage */}
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
                  className="w-full"
                />
              </div>

              {/* Scenario 2 Percentage */}
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
                  className="w-full"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-lg"
                size="lg"
              >
                {isGenerating ? "🔥 Generating..." : "🔥 Generate Roast 🔥"}
              </Button>
            </CardContent>
          </Card>

          {/* Output */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Your Roast</CardTitle>
              <CardDescription className="text-gray-400">Click generate to get a fresh roast</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[200px] p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                {roast ? (
                  <p className="text-white text-lg leading-relaxed">{roast}</p>
                ) : (
                  <p className="text-gray-500 text-center italic mt-16">
                    Click the generate button to create your first roast...
                  </p>
                )}
              </div>

              {roast && (
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(roast)
                  }}
                  variant="outline"
                  className="mt-4 w-full border-slate-600 text-white hover:bg-slate-700"
                >
                  📋 Copy to Clipboard
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm hover:text-transparent hover:bg-gradient-to-r hover:from-blue-500 hover:to-pink-500 hover:bg-clip-text hover:scale-110 transition-all duration-500 cursor-pointer">
            ⚠️ Warning: Use these roasts responsibly and with friends who can take a joke! ⚠️
          </p>
        </div>
      </div>
    </div>
  )
}
