"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"
import { api } from "@/lib/api"
import { Search, Trash2, RefreshCw, Phone, FileText, ToggleLeft, ToggleRight, X, Loader2 } from "lucide-react"
import { clsx } from "clsx"

export default function UsersPage() {
  const [users,   setUsers]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState("")
  const [acting,  setActing]  = useState<string|null>(null)
  const [confirm, setConfirm] = useState<any>(null)

  const load = async () => {
    setLoading(true)
    try { const d = await api.users(); setUsers(d.data || d) }
    catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const toggleActive = async (user: any) => {
    setActing(user.id)
    try {
      await api.updateUser(user.id, { is_active: !user.is_active })
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u))
    } catch (err: any) { alert(err.message) }
    finally { setActing(null) }
  }

  const deleteUser = async (id: string) => {
    setActing(id)
    try {
      await api.deleteUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (err: any) { alert(err.message) }
    finally { setActing(null); setConfirm(null) }
  }

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search)
  )

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="ml-[240px] flex-1 p-8 min-w-0">
          <div className="mb-6">
            <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest mb-1">Хэрэглэгчийн удирдлага</p>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Хэрэглэгчид</h1>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Нэр, утасны дугаар..." className="input pl-9 text-xs h-9" />
            </div>
            <button onClick={load} className="btn-secondary h-9 px-3">
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          <p className="text-xs text-gray-400 font-medium mb-4">
            <span className="text-gray-700 font-bold">{filtered.length}</span> хэрэглэгч
          </p>

          {loading ? (
            <div className="card flex items-center justify-center py-24">
              <div className="w-7 h-7 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="grid grid-cols-[1fr_140px_80px_80px_100px] gap-4 px-5 py-3 border-b border-gray-50 bg-gray-50/50">
                {["Хэрэглэгч", "Утас", "Зар", "Статус", "Үйлдэл"].map(h => (
                  <div key={h} className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</div>
                ))}
              </div>

              {filtered.length === 0 ? (
                <div className="py-16 text-center text-sm text-gray-400">Хэрэглэгч олдсонгүй</div>
              ) : filtered.map((user, idx) => (
                <div key={user.id} className={clsx(
                  "grid grid-cols-[1fr_140px_80px_80px_100px] gap-4 px-5 py-3.5 items-center hover:bg-gray-50/60 transition-colors",
                  idx < filtered.length - 1 && "border-b border-gray-50"
                )}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={clsx(
                      "w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0",
                      user.is_active !== false
                        ? "bg-gradient-to-br from-violet-400 to-violet-600"
                        : "bg-gray-300"
                    )}>
                      {user.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{user.name}</div>
                      <div className="text-[11px] text-gray-400">
                        {new Date(user.created_at).toLocaleDateString("mn-MN")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-600 font-mono">
                    <Phone size={11} className="text-gray-400 flex-shrink-0" />
                    {user.phone}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <FileText size={11} className="text-gray-400" />
                    {user.listing_count || 0}
                  </div>

                  <div>
                    {user.is_active !== false
                      ? <span className="badge-active">Идэвхтэй</span>
                      : <span className="badge-inactive">Хаасан</span>
                    }
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleActive(user)} disabled={acting === user.id}
                      title={user.is_active !== false ? "Хаах" : "Нээх"}
                      className={clsx(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        user.is_active !== false
                          ? "bg-amber-50 hover:bg-amber-100 text-amber-600"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                      )}>
                      {acting === user.id
                        ? <Loader2 size={13} className="animate-spin" />
                        : user.is_active !== false ? <ToggleRight size={14} /> : <ToggleLeft size={14} />
                      }
                    </button>
                    <button onClick={() => setConfirm(user)}
                      className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Confirm delete */}
      {confirm && (
        <>
          <div onClick={() => setConfirm(null)} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 bg-white rounded-2xl shadow-modal p-6 animate-scale-in">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <button onClick={() => setConfirm(null)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Устгах уу?</h3>
            <p className="text-sm text-gray-500 mb-5">
              <strong className="text-gray-800">{confirm.name}</strong>-г системээс бүрмөсөн устгана.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="btn-secondary flex-1 justify-center text-xs">Цуцлах</button>
              <button onClick={() => deleteUser(confirm.id)} disabled={acting === confirm.id}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-xl transition-all">
                {acting === confirm.id && <Loader2 size={12} className="animate-spin" />}
                Устгах
              </button>
            </div>
          </div>
        </>
      )}
    </AuthGuard>
  )
}
