"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
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
    const auth = sessionStorage.getItem("admin_auth")
    if (auth === "2000") setIsAuthenticated(true)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      const { data } = await supabase
        .from("resultados")
        .select("*")
        .order("ts", { ascending: false })

      if (data) {
        const grouped: any = {
          PANAMÁ: [],
          MONAZOS: [],
          NICARAGUA: [],
          "COSTA RICA": [],
          HONDURAS: [],
          DOMINICANA: [],
        }

        data.forEach((r: any) => {
          grouped[r.pais]?.push(r)
        })

        setDb(grouped)
      }
    }

    loadData()
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "2000") {
      setIsAuthenticated(true)
      sessionStorage.setItem("admin_auth", "2000")
    } else {
      alert("Contraseña incorrecta")
      setPassword("")
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <Card className="bg-slate-900 border-slate-800 w-full max-w-md">
          <div className="p-8">
            <h1 className="text-2xl font-black text-center text-white mb-6">
              ACCESO ADMINISTRATIVO
            </h1>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-950 border-slate-700 text-white text-center text-lg h-14"
              />
              <Button type="submit" className="w-full bg-emerald-700 text-white">
                ENTRAR
              </Button>
            </form>
          </div>
        </Card>
      </div>
    )
  }

  const saveResult = async () => {
    if (!v1) return alert("Ingresa el primer resultado")

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

    await supabase.from("resultados").insert([newResult])

    setDb((prev) => ({
      ...prev,
      [currentCountry]: [newResult, ...prev[currentCountry]],
    }))

    setV1("")
    setV2("")
    setV3("")
    alert("✅ Resultado publicado")
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-black mb-4">Panel Admin</h1>

      <Input placeholder="1°" value={v1} onChange={(e) => setV1(e.target.value)} />
      <Input placeholder="2°" value={v2} onChange={(e) => setV2(e.target.value)} />
      <Input placeholder="3°" value={v3} onChange={(e) => setV3(e.target.value)} />

      <Button onClick={saveResult} className="mt-4">
        PUBLICAR
      </Button>
    </div>
  )
}
