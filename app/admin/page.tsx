"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

export default function AdminPage() {
  const router = useRouter()
  const [currentCountry, setCurrentCountry] = useState<Country>("PANAMÁ")
  const [v1, setV1] = useState("")
  const [v2, setV2] = useState("")
  const [v3, setV3] = useState("")
  const [db, setDb] = useState<Database>({
    PANAMÁ: [],
    MONAZOS: [],
    NICARAGUA: [],
    "COSTA RICA": [],
    HONDURAS: [],
    DOMINICANA: [],
  })
  const [view, setView] = useState<"register" | "recent" | "trends">("register")

  useEffect(() => {
    const stored = localStorage.getItem("ticanacional_v11")
    if (stored) {
      setDb(JSON.parse(stored))
    }
  }, [])

  const saveResult = () => {
    if (!v1) {
      alert("Ingresa el primer resultado")
      return
    }

    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
    const hourKey = now.getHours().toString().padStart(2, "0") + ":00"

    const newResult: LotteryResult = {
      p1: v1.padStart(2, "0"),
      p2: v2 ? v2.padStart(2, "0") : "--",
      p3: v3 ? v3.padStart(2, "0") : "--",
      pais: currentCountry,
      hora: timeStr,
      hKey: hourKey,
      ts: now.getTime(),
    }

    const newDb = { ...db }
    newDb[currentCountry] = [newResult, ...newDb[currentCountry]]

    setDb(newDb)
    localStorage.setItem("ticanacional_v11", JSON.stringify(newDb))

    // Clear inputs
    setV1("")
    setV2("")
    setV3("")

    // Show success
    alert("✅ Resultado publicado exitosamente")
  }

  const countries: { name: Country; flag?: string; emoji?: string }[] = [
    { name: "PANAMÁ", flag: "https://flagcdn.com/w40/pa.png" },
    { name: "MONAZOS", emoji: "🐒" },
    { name: "NICARAGUA", flag: "https://flagcdn.com/w40/ni.png" },
    { name: "HONDURAS", flag: "https://flagcdn.com/w40/hn.png" },
    { name: "COSTA RICA", flag: "https://flagcdn.com/w40/cr.png" },
    { name: "DOMINICANA", flag: "https://flagcdn.com/w40/do.png" },
  ]

  // Get all results
  const allResults: LotteryResult[] = []
  Object.values(db).forEach((list) => allResults.push(...list))
  allResults.sort((a, b) => b.ts - a.ts)

  // Calculate trends
  const currentData = db[currentCountry] || []
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
        <div className="relative w-28 h-28 mx-auto mb-3">
          <Image
            src="/logo.png"
            alt="TicaNacional.PTY"
            fill
            className="object-contain rounded-full border-2 border-yellow-400"
          />
        </div>
        <h1 className="font-black text-2xl text-white">TICANACIONAL.PTY</h1>
        <p className="text-yellow-400 text-xs mt-1 font-semibold tracking-wider">PANEL DE ADMINISTRACIÓN</p>
      </header>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        {/* Country Tabs */}
        <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800 mb-6">
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

        {/* Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {/* Recent Results */}
          <Card className="bg-slate-900/95 border-slate-800 shadow-2xl">
            <div className="p-6">
              <h3 className="text-emerald-400 text-xs font-black tracking-widest uppercase mb-4 pb-3 border-b border-emerald-400/20">
                📡 RESULTADOS EN VIVO
              </h3>
              <div className="max-h-[500px] overflow-y-auto space-y-3">
                {allResults.length === 0 ? (
                  <p className="text-slate-500 text-center">Sin datos</p>
                ) : (
                  allResults.map((result, idx) => (
                    <div key={idx} className="pb-3 border-b border-slate-800 last:border-0">
                      <div className="text-emerald-400 text-xs font-black mb-1">
                        {result.pais} - {result.hora}
                      </div>
                      <div className="text-2xl font-black">
                        <span className="text-yellow-400">{result.p1}</span>{" "}
                        <span className="text-slate-500 text-sm">
                          {result.p2} {result.p3}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>

          {/* Register Form */}
          <Card className="bg-slate-900/95 border-slate-800 shadow-2xl">
            <div className="p-6">
              <h3 className="text-emerald-400 text-xs font-black tracking-widest uppercase mb-4 pb-3 border-b border-emerald-400/20">
                🎲 REGISTRAR {currentCountry}
              </h3>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div>
                  <Input
                    type="number"
                    placeholder="1°"
                    value={v1}
                    onChange={(e) => setV1(e.target.value)}
                    className="bg-slate-950 border-slate-700 text-yellow-400 text-3xl font-black text-center h-20"
                    max={99}
                    min={0}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="2°"
                    value={v2}
                    onChange={(e) => setV2(e.target.value)}
                    className="bg-slate-950 border-slate-700 text-yellow-400 text-3xl font-black text-center h-20"
                    max={99}
                    min={0}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="3°"
                    value={v3}
                    onChange={(e) => setV3(e.target.value)}
                    className="bg-slate-950 border-slate-700 text-yellow-400 text-3xl font-black text-center h-20"
                    max={99}
                    min={0}
                  />
                </div>
              </div>

              <Button
                onClick={saveResult}
                className="w-full bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white font-black py-6 text-lg uppercase"
              >
                PUBLICAR RESULTADOS
              </Button>

              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full mt-3 border-slate-700 text-slate-400 hover:bg-slate-800"
              >
                Ver Vista Pública
              </Button>
            </div>
          </Card>

          {/* Trends */}
          <Card className="bg-slate-900/95 border-slate-800 shadow-2xl">
            <div className="p-6">
              <h3 className="text-emerald-400 text-xs font-black tracking-widest uppercase mb-4 pb-3 border-b border-emerald-400/20">
                📊 TENDENCIAS
              </h3>
              <div className="space-y-0">
                {trends.length === 0 ? (
                  <p className="text-slate-500 text-center">Sin tendencias</p>
                ) : (
                  trends.map((trend, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-3 border-b border-slate-800/50 last:border-0"
                    >
                      <span className="text-slate-400 text-sm">Hora {trend.hora}</span>
                      <span className="bg-yellow-400/20 text-yellow-400 px-4 py-1 rounded-lg font-black text-xl border border-yellow-400">
                        {trend.numero}
                      </span>
                      <span className="text-sm">{trend.veces} veces</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden">
          {view === "register" && (
            <Card className="bg-slate-900/95 border-slate-800 shadow-2xl">
              <div className="p-6">
                <h3 className="text-emerald-400 text-xs font-black tracking-widest uppercase mb-4 pb-3 border-b border-emerald-400/20">
                  🎲 REGISTRAR {currentCountry}
                </h3>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <Input
                    type="number"
                    placeholder="1°"
                    value={v1}
                    onChange={(e) => setV1(e.target.value)}
                    className="bg-slate-950 border-slate-700 text-yellow-400 text-3xl font-black text-center h-20"
                  />
                  <Input
                    type="number"
                    placeholder="2°"
                    value={v2}
                    onChange={(e) => setV2(e.target.value)}
                    className="bg-slate-950 border-slate-700 text-yellow-400 text-3xl font-black text-center h-20"
                  />
                  <Input
                    type="number"
                    placeholder="3°"
                    value={v3}
                    onChange={(e) => setV3(e.target.value)}
                    className="bg-slate-950 border-slate-700 text-yellow-400 text-3xl font-black text-center h-20"
                  />
                </div>

                <Button
                  onClick={saveResult}
                  className="w-full bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white font-black py-6 text-lg uppercase"
                >
                  PUBLICAR RESULTADOS
                </Button>
              </div>
            </Card>
          )}

          {view === "recent" && (
            <Card className="bg-slate-900/95 border-slate-800 shadow-2xl">
              <div className="p-6">
                <h3 className="text-emerald-400 text-xs font-black tracking-widest uppercase mb-4 pb-3 border-b border-emerald-400/20">
                  📡 RESULTADOS RECIENTES
                </h3>
                <div className="space-y-3">
                  {allResults.slice(0, 20).map((result, idx) => (
                    <div key={idx} className="pb-3 border-b border-slate-800 last:border-0">
                      <div className="text-emerald-400 text-xs font-black mb-1">
                        {result.pais} - {result.hora}
                      </div>
                      <div className="text-2xl font-black">
                        <span className="text-yellow-400">{result.p1}</span>{" "}
                        <span className="text-slate-500 text-sm">
                          {result.p2} {result.p3}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {view === "trends" && (
            <Card className="bg-slate-900/95 border-slate-800 shadow-2xl">
              <div className="p-6">
                <h3 className="text-emerald-400 text-xs font-black tracking-widest uppercase mb-4 pb-3 border-b border-emerald-400/20">
                  📊 TENDENCIAS
                </h3>
                <div className="space-y-0">
                  {trends.length === 0 ? (
                    <p className="text-slate-500 text-center">Sin tendencias</p>
                  ) : (
                    trends.map((trend, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center py-3 border-b border-slate-800/50 last:border-0"
                      >
                        <span className="text-slate-400 text-sm">Hora {trend.hora}</span>
                        <span className="bg-yellow-400/20 text-yellow-400 px-4 py-1 rounded-lg font-black text-xl border border-yellow-400">
                          {trend.numero}
                        </span>
                        <span className="text-sm">{trend.veces}x</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-emerald-900 border-t-2 border-yellow-400 z-50">
        <div className="flex justify-around py-4">
          <button
            onClick={() => setView("register")}
            className={`flex-1 text-center font-bold text-xs ${
              view === "register" ? "text-yellow-400" : "text-emerald-200"
            }`}
          >
            REGISTRO
          </button>
          <button
            onClick={() => setView("recent")}
            className={`flex-1 text-center font-bold text-xs ${
              view === "recent" ? "text-yellow-400" : "text-emerald-200"
            }`}
          >
            RECIENTES
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
