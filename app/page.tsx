"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"
import { api } from "@/lib/api"
import Link from "next/link"
import {
  FileText, Users, Wrench, ShoppingBag, Eye,
  Clock, CheckCircle2, TrendingUp, RefreshCw,
  ArrowRight, MapPin, Building2,
} from "lucide-react"

const statusMap: Record<string, { label: string; cls: string }> = {
  active:   { label: "Идэвхтэй",  cls: "badge-active"   },
  pending:  { label: "Хүлээгдэж", cls: "badge-pending"  },
  rejected: { label: "Татгалзсан",cls: "badge-rejected" },
  inactive: { label: "Идэвхгүй",  cls: "badge-inactive" },
}

function StatCard({ label, value, sub, icon: Icon, gradient, textColor }: any) {
  return (
    <div className="card p-5 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${gradient}`}>
          <Icon size={18} className={textColor} />
        </div>
        <TrendingUp size={14} className="text-gray-300" />
      </div>
      <div className="text-2xl font-bold text-gray-900 font-mono mb-1">{value}</div>
      <div className="text-sm text-gray-500 font-medium">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const [stats,   setStats]   = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try { setStats(await api.stats()) } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="ml-[240px] flex-1 p-8 min-w-0">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">Хянах самбар</p>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Өнөөдрийн тоймлол</h1>
            </div>
            <button onClick={load} className="btn-secondary text-xs">
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Шинэчлэх
            </button>
          </div>

          {loading && !stats ? (
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Ачааллаж байна...</p>
              </div>
            </div>
          ) : stats && (
            <>
              {/* Stats grid */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <StatCard label="Нийт зар"    value={stats.total_listings}   sub={`${stats.pending_listings} хүлээгдэж байна`} icon={FileText}    gradient="bg-blue-50"    textColor="text-blue-600" />
                <StatCard label="Идэвхтэй"    value={stats.active_listings}  sub="нийтлэгдсэн"    icon={CheckCircle2} gradient="bg-emerald-50" textColor="text-emerald-600" />
                <StatCard label="Хэрэглэгчид" value={stats.total_users}                           icon={Users}        gradient="bg-violet-50"  textColor="text-violet-600" />
                <StatCard label="Нийт үзэлт"  value={(stats.total_views||0).toLocaleString()}     icon={Eye}          gradient="bg-amber-50"   textColor="text-amber-600" />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <StatCard label="Хүлээгдэж байна" value={stats.pending_listings} icon={Clock}       gradient="bg-orange-50" textColor="text-orange-600" />
                <StatCard label="Үйлчилгээ"        value={stats.total_services}   icon={Wrench}      gradient="bg-teal-50"   textColor="text-teal-600" />
                <StatCard label="Дэлгүүр"          value={stats.total_products}   icon={ShoppingBag} gradient="bg-pink-50"   textColor="text-pink-600" />
              </div>

              {/* Recent tables */}
              <div className="grid grid-cols-2 gap-6">

                {/* Recent listings */}
                <div className="card overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                        <FileText size={12} className="text-blue-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">Сүүлийн зарууд</span>
                    </div>
                    <Link href="/listings" className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1">
                      Бүгдийг харах <ArrowRight size={12} />
                    </Link>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {(stats.recent_listings || []).slice(0, 6).map((l: any) => {
                      const st = statusMap[l.status] || statusMap.pending
                      return (
                        <Link key={l.id} href={`/listings/${l.id}`}
                          className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/80 transition-colors group">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            {l.cover_image
                              ? <img src={l.cover_image} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><Building2 size={14} className="text-gray-400" /></div>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-gray-800 truncate group-hover:text-brand-600 transition-colors">
                              {l.title}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5 text-gray-400">
                              <MapPin size={10} />
                              <span className="text-[11px]">{l.location_name || "—"}</span>
                            </div>
                          </div>
                          <span className={st.cls}>{st.label}</span>
                        </Link>
                      )
                    })}
                    {!(stats.recent_listings?.length) && (
                      <div className="px-5 py-8 text-center text-sm text-gray-400">Зар байхгүй</div>
                    )}
                  </div>
                </div>

                {/* Recent users */}
                <div className="card overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-violet-50 flex items-center justify-center">
                        <Users size={12} className="text-violet-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">Шинэ хэрэглэгчид</span>
                    </div>
                    <Link href="/users" className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1">
                      Бүгдийг харах <ArrowRight size={12} />
                    </Link>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {(stats.recent_users || []).slice(0, 6).map((u: any) => (
                      <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-gray-800 truncate">{u.name}</div>
                          <div className="text-[11px] text-gray-400 font-mono">{u.phone}</div>
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {new Date(u.created_at).toLocaleDateString("mn-MN")}
                        </div>
                      </div>
                    ))}
                    {!(stats.recent_users?.length) && (
                      <div className="px-5 py-8 text-center text-sm text-gray-400">Хэрэглэгч байхгүй</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}
