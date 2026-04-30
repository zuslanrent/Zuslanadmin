"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"
import { api } from "@/lib/api"
import Link from "next/link"
import {
  Search, Trash2, RefreshCw, MapPin, BedDouble,
  Eye, ExternalLink, ChevronDown, Building2,
  CheckCircle2, XCircle, Filter,
} from "lucide-react"
import { clsx } from "clsx"

const statusMap: Record<string, { label: string; cls: string; dot: string }> = {
  active:   { label: "Идэвхтэй",  cls: "badge-active",   dot: "bg-emerald-500" },
  pending:  { label: "Хүлээгдэж", cls: "badge-pending",  dot: "bg-amber-500"   },
  rejected: { label: "Татгалзсан",cls: "badge-rejected", dot: "bg-red-500"     },
  inactive: { label: "Идэвхгүй",  cls: "badge-inactive", dot: "bg-gray-400"    },
}

const filters = [
  { val: "all",      label: "Бүгд"        },
  { val: "pending",  label: "Хүлээгдэж"  },
  { val: "active",   label: "Идэвхтэй"   },
  { val: "rejected", label: "Татгалзсан" },
  { val: "inactive", label: "Идэвхгүй"   },
]

export default function ListingsPage() {
  const [listings, setListings] = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState("all")
  const [search,   setSearch]   = useState("")
  const [updating, setUpdating] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.listings(filter !== "all" ? `?status=${filter}` : "")
      setListings(data.data || data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter])

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    try {
      if (status === "active")   await api.approveListing(id)
      else if (status === "rejected") await api.rejectListing(id)
      else await api.updateListingStatus(id, status)
      setListings(prev => prev.map(l => l.id === id ? { ...l, status } : l))
    } catch (err: any) { alert(err.message) }
    finally { setUpdating(null) }
  }

  const del = async (id: string) => {
    if (!confirm("Зарыг устгах уу?")) return
    try {
      await api.deleteListing(id)
      setListings(prev => prev.filter(l => l.id !== id))
    } catch (err: any) { alert(err.message) }
  }

  const filtered = listings.filter(l =>
    !search ||
    l.title?.toLowerCase().includes(search.toLowerCase()) ||
    l.location_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.owner_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="ml-[240px] flex-1 p-8 min-w-0">

          {/* Header */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">Зарын удирдлага</p>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Зарууд</h1>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Зар, байршил, эзэн хайх..."
                className="input pl-9 text-xs h-9"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1">
              {filters.map(f => (
                <button key={f.val} onClick={() => setFilter(f.val)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    filter === f.val
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  )}>
                  {f.label}
                </button>
              ))}
            </div>

            <button onClick={load} className="btn-secondary h-9 px-3">
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Count */}
          <p className="text-xs text-gray-400 font-medium mb-4">
            <span className="text-gray-700 font-bold">{filtered.length}</span> зар
          </p>

          {/* Table */}
          {loading ? (
            <div className="card flex items-center justify-center py-24">
              <div className="w-7 h-7 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-24 text-gray-400">
              <Building2 size={40} className="mb-3 text-gray-200" />
              <p className="text-sm font-medium">Зар олдсонгүй</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-gray-50 bg-gray-50/50">
                {["Зар", "Байршил / Үнэ", "Статус", "Үйлдэл"].map(h => (
                  <div key={h} className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</div>
                ))}
              </div>

              <div className="divide-y divide-gray-50">
                {filtered.map(listing => {
                  const st = statusMap[listing.status] || statusMap.pending
                  const price = listing.price_per_day
                    ? `${parseFloat(listing.price_per_day).toLocaleString()}₮`
                    : "—"
                  return (
                    <div key={listing.id}
                      className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors items-center">

                      {/* Listing info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                          {listing.cover_image
                            ? <img src={listing.cover_image} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><Building2 size={14} className="text-gray-300" /></div>
                          }
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-800 truncate">{listing.title}</div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <BedDouble size={11} /> {listing.rooms} өрөө
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye size={11} /> {listing.view_count || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Location / Price */}
                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-600 font-medium">
                          <MapPin size={11} className="text-gray-400" />
                          {listing.location_name || "—"}
                        </div>
                        <div className="text-xs font-mono text-brand-600 font-bold mt-0.5">{price}/өдөр</div>
                      </div>

                      {/* Status select */}
                      <div>
                        <div className="relative inline-block">
                          <select
                            value={listing.status}
                            disabled={updating === listing.id}
                            onChange={e => updateStatus(listing.id, e.target.value)}
                            className={clsx(
                              "text-xs font-semibold pl-2 pr-6 py-1.5 rounded-lg border appearance-none cursor-pointer outline-none transition-all",
                              listing.status === "active"   && "bg-emerald-50 text-emerald-700 border-emerald-100",
                              listing.status === "pending"  && "bg-amber-50   text-amber-700   border-amber-100",
                              listing.status === "rejected" && "bg-red-50     text-red-600     border-red-100",
                              listing.status === "inactive" && "bg-gray-100   text-gray-500   border-gray-200",
                            )}
                          >
                            <option value="pending">Хүлээгдэж</option>
                            <option value="active">Идэвхтэй</option>
                            <option value="rejected">Татгалзсан</option>
                            <option value="inactive">Идэвхгүй</option>
                          </select>
                          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-60" />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link href={`/listings/${listing.id}`}
                          className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-600 transition-colors"
                          title="Дэлгэрэнгүй харах">
                          <ExternalLink size={13} />
                        </Link>
                        <button
                          onClick={() => del(listing.id)}
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors"
                          title="Устгах">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}
