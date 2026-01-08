"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Country = "PANAMÁ" | "MONAZOS" | "NICARAGUA" | "HONDURAS" | "COSTA RICA" | "DOMINICANA"

interface LotteryResult {
  p1: string
  p2: string
  p3: string
  pais: Country
  hora: string
  hKey: string
  ts: number
}

type Database = Record<Country, LotteryResult[]>

export default function HomePage() {
  const [currentCountry, setCurrentCountry] = useState<Country>("PANAMÁ")
  const [db, setDb] = useState<Database>({
    PANAMÁ: [],
    MONAZOS: [],
    NICARAGUA: [],
    "COSTA RICA": [],
    HONDURAS: [],
    DOMINICANA: [],
  })
  const [view, setView] = useState<"results" | "trends">("results")

  useEffect(() => {
    const stored = localStorage.getItem("ticanacional_v11")
    if (stored) {
      setDb(JSON.parse(stored))
    }

    // Listen for storage changes
    const handleStorage = () => {
      const updated = localStorage.getItem("ticanacional_v11")
      if (updated) {
        setDb(JSON.parse(updated))
      }
    }

    window.addEventListener("storage", handleStorage)
    // Poll for changes every 2 seconds
    const interval = setInterval(handleStorage, 2000)

    return () => {
      window.removeEventListener("storage", handleStorage)
      clearInterval(interval)
    }
  }, [])

  const countries: { name: Country; flag?: string; emoji?: string }[] = [
    { name: "PANAMÁ", flag: "https://flagcdn.com/w40/pa.png" },
    { name: "MONAZOS", emoji: "🐒" },
    { name: "NICARAGUA", flag: "https://flagcdn.com/w40/ni.png" },
    { name: "HONDURAS", flag: "https://flagcdn.com/w40/hn.png" },
    { name: "COSTA RICA", flag: "https://flagcdn.com/w40/cr.png" },
    { name: "DOMINICANA", flag: "https://flagcdn.com/w40/do.png" },
  ]

  const currentData = db[currentCountry] || []

  // Calculate trends
  const hourly: Record<string, Record<string, number>> = {}
  currentData.forEach((x) => {
    if (!hourly[x.hKey]) hourly[x.hKey] = {}
    hourly[x.hKey][x.p1] = (hourly[x.hKey][x.p1] || 0) + 1
  })

  const trends = Object.keys(hourly)
    .sort()
    .map((h) => {
      const nums = hourly[h]
      const top = Object.keys(nums).reduce((a, b) => (nums[a] > nums[b] ? a : b))
      return { hora: h, numero: top, veces: nums[top] }
    })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-24">
      {/* Header */}
      <header className="bg-emerald-900 border-b-4 border-yellow-400 py-6 text-center">
        <div className="relative w-24 h-24 mx-auto mb-3">
          <Image
            src="/logo.png"
            alt="TicaNacional.PTY"
            fill
            className="object-contain rounded-full border-2 border-yellow-400"
          />
        </div>
        <h1 className="font-black text-2xl text-white">TICANACIONAL.PTY</h1>
        <p className="text-emerald-300 text-xs mt-1 font-semibold tracking-wider">RESULTADOS EN TIEMPO REAL</p>
      </header>

      {/* Country Tabs */}
      <div className="max-w-2xl mx-auto px-4 mt-6">
        <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800">
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
            {countries.map((country) => (
              <Button
                key={country.name}
                onClick={() => setCurrentCountry(country.name)}
                variant={currentCountry === country.name ? "default" : "ghost"}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-bold flex items-center gap-2 flex-shrink-0 ${
                  currentCountry === country.name
                    ? "bg-yellow-400 text-black hover:bg-yellow-500"
                    : "bg-slate-950 text-slate-400 border border-slate-700 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {country.flag && (
                  <img src={country.flag || "/placeholder.svg"} alt="" className="w-5 h-auto rounded-sm" />
                )}
                {country.emoji && <span className="text-lg">{country.emoji}</span>}
                {country.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 mt-6">
        {view === "results" ? (
          <Card className="bg-slate-900/95 border-slate-800 shadow-2xl">
            <div className="p-6">
              <h2 className="text-emerald-400 text-xs font-black tracking-widest uppercase mb-4 pb-3 border-b border-emerald-400/20">
                📡 ÚLTIMOS SORTEOS ({currentCountry})
              </h2>

              {currentData.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Esperando resultados...</p>
              ) : (
                <div className="space-y-0">
                  {currentData.map((result, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-4 border-b border-slate-800 last:border-0"
                    >
                      <div>
                        <div className="text-emerald-400 text-xs font-black mb-1">{result.hora}</div>
                        <div className="flex items-baseline gap-3">
                          <span className="text-4xl font-black text-yellow-400">{result.p1}</span>
                          <span className="text-slate-500 text-lg font-bold">
                            {result.p2} - {result.p3}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card className="bg-slate-900/95 border-slate-800 shadow-2xl">
            <div className="p-6">
              <h2 className="text-emerald-400 text-xs font-black tracking-widest uppercase mb-4 pb-3 border-b border-emerald-400/20">
                📊 NÚMEROS MÁS SALIDOS
              </h2>

              {trends.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No hay tendencias suficientes</p>
              ) : (
                <div className="space-y-0">
                  {trends.map((trend, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-3 border-b border-slate-800/50 last:border-0"
                    >
                      <span className="text-slate-400 text-sm">Hora {trend.hora}</span>
                      <span className="bg-yellow-400/20 text-yellow-400 px-4 py-1 rounded-lg font-black text-xl border border-yellow-400">
                        {trend.numero}
                      </span>
                      <span className="text-emerald-400 text-xs font-semibold">Ha salido {trend.veces} veces</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}
      </main>

      {/* Admin Link */}
      <div className="max-w-2xl mx-auto px-4 mt-6 text-center">
        <Link href="/admin">
          <Button variant="outline" className="text-slate-400 border-slate-700 hover:bg-slate-800 bg-transparent">
            🔒 Acceso Administrativo
          </Button>
        </Link>
      </div>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-emerald-900 border-t-2 border-yellow-400 z-50">
        <div className="flex justify-around py-4">
          <button
            onClick={() => setView("results")}
            className={`flex-1 text-center font-bold text-xs ${
              view === "results" ? "text-yellow-400" : "text-emerald-200"
            }`}
          >
            RESULTADOS
          </button>
          <button
            onClick={() => setView("trends")}
            className={`flex-1 text-center font-bold text-xs ${
              view === "trends" ? "text-yellow-400" : "text-emerald-200"
            }`}
          >
            TENDENCIAS
          </button>
        </div>
      </nav>
    </div>
  )
}
