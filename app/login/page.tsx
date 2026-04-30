"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api, saveSession } from "@/lib/api"
import { Eye, EyeOff, Tent, ArrowRight, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")
  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !password) { setError("И-мэйл болон нууц үгээ оруулна уу"); return }
    setLoading(true); setError("")
    try {
      const data = await api.login(email, password)
      saveSession(data.admin || data.user, data.token)
      router.replace("/")
    } catch (err: any) {
      setError(err.message || "Нэвтрэх амжилтгүй")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />

      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.15]"
        style={{ backgroundImage: "radial-gradient(#6172f3 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      <div className="relative w-full max-w-[400px]">
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-modal border border-white/60 p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg mb-4">
              <Tent size={26} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Зуслан Admin</h1>
            <p className="text-sm text-gray-500 mt-1">Удирдлагын самбарт нэвтрэх</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="label">И-мэйл хаяг</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="admin@turees.mn"
                className="input"
              />
            </div>

            <div>
              <label className="label">Нууц үг</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  placeholder="••••••••••"
                  className="input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? <Loader2 size={16} className="animate-spin" />
                : <ArrowRight size={16} />
              }
              {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 font-mono tracking-wider">
          ЗУСЛАН ПОРТАЛ © 2026
        </p>
      </div>
    </div>
  )
}
