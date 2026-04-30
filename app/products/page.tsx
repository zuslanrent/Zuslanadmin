"use client"

import { useEffect, useRef, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"
import { api } from "@/lib/api"
import {
  Plus, Trash2, Pencil, X, Loader2, RefreshCw,
  ShoppingBag, ImagePlus, Star,
} from "lucide-react"

const API = process.env.NEXT_PUBLIC_API_URL || "https://rentbackend-z26v.onrender.com"

const cats = [
  { id:"camping",label:"Кемпинг"}, {id:"bbq",label:"Барбекю"},
  { id:"kitchen",label:"Гал тогоо"}, {id:"power",label:"Эрчим хүч"},
  { id:"hygiene",label:"Эрүүл ахуй"}, {id:"other",label:"Бусад"},
]

const empty = {
  name:"", category:"camping", description:"", price:"",
  original_price:"", stock:"", tags:"", is_sale:false,
}

// ── Image uploader (Cloudinary) ───────────────────────
function ImageUploader({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const inputRef    = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState("")

  const upload = async (files: FileList | null) => {
    if (!files || !files.length) return
    setUploading(true); setError("")
    try {
      const formData = new FormData()
      Array.from(files).forEach(f => formData.append("images", f))
      const res  = await fetch(`${API}/api/upload/images`, { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload амжилтгүй")
      const urls = (data.urls || []).map((u: any) => u.url || u)
      onChange([...images, ...urls])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx))

  return (
    <div>
      <label className="label">Зурагнууд</label>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all mb-3
          ${uploading ? "opacity-50 cursor-not-allowed border-gray-200" : "border-gray-200 hover:border-brand-300 hover:bg-brand-50/30"}`}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-2">
            <Loader2 size={16} className="animate-spin text-brand-500" />
            Зураг upload хийж байна...
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 py-2">
            <ImagePlus size={22} className="text-gray-300" />
            <p className="text-xs text-gray-500 font-medium">Дарж зураг оруулах</p>
            <p className="text-[11px] text-gray-400">PNG, JPG, WEBP • 5MB хүртэл</p>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => upload(e.target.files)} />
      </div>

      {error && (
        <p className="text-xs text-red-500 mb-2">{error}</p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
              <img src={url} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <div className="absolute top-1 left-1 flex items-center gap-0.5 px-1.5 py-0.5 bg-brand-600 text-white text-[9px] font-bold rounded-md">
                  <Star size={8} className="fill-white" /> НҮҮР
                </div>
              )}
              <button
                onClick={() => remove(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────
export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)
  const [editing,  setEditing]  = useState<any>(null)
  const [form,     setForm]     = useState<any>(empty)
  const [images,   setImages]   = useState<string[]>([])
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState("")

  const load = async () => {
    setLoading(true)
    try { const d = await api.products(); setProducts(d.data || d) }
    catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null); setForm(empty); setImages([]); setError(""); setModal(true)
  }

  const openEdit = (p: any) => {
    setEditing(p)
    setForm({
      name: p.name||"", category: p.category||"camping", description: p.description||"",
      price: p.price ? String(p.price) : "", original_price: p.original_price ? String(p.original_price) : "",
      stock: p.stock ? String(p.stock) : "", is_sale: p.is_sale||false,
      tags: Array.isArray(p.tags) ? p.tags.join(", ") : p.tags||"",
    })
    setImages(Array.isArray(p.images) ? p.images : [])
    setError(""); setModal(true)
  }

  const save = async () => {
    if (!form.name || !form.price || !form.stock) { setError("Нэр, үнэ, нөөц шаардлагатай"); return }
    setSaving(true); setError("")
    try {
      const payload = {
        ...form,
        price:          parseInt(form.price),
        original_price: form.original_price ? parseInt(form.original_price) : null,
        stock:          parseInt(form.stock),
        tags:           form.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
        images,
      }
      editing ? await api.updateProduct(editing.id, payload) : await api.createProduct(payload)
      setModal(false); load()
    } catch (err: any) { setError(err.message) }
    finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm("Устгах уу?")) return
    try { await api.deleteProduct(id); setProducts(p => p.filter(x => x.id !== id)) }
    catch (err: any) { alert(err.message) }
  }

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }))

  return (
    <AuthGuard requireRole="super_admin">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="ml-[240px] flex-1 p-8 min-w-0">

          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-1">Super Admin · Дэлгүүр</p>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Дэлгүүрийн бараа</h1>
            </div>
            <div className="flex gap-2">
              <button onClick={load} className="btn-secondary h-9 px-3">
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              </button>
              <button onClick={openCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm">
                <Plus size={15} /> Бараа нэмэх
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 font-medium mb-6">
            <ShoppingBag size={14} /> Зөвхөн Super Admin дэлгүүрийн барааг засах эрхтэй.
          </div>

          {loading ? (
            <div className="card flex items-center justify-center py-24">
              <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-24 text-gray-400">
              <ShoppingBag size={40} className="mb-3 text-gray-200" />
              <p className="text-sm font-medium mb-4">Бараа байхгүй байна</p>
              <button onClick={openCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-xs font-semibold rounded-xl">
                Эхний барааг нэмэх
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.map(p => {
                const price = parseInt(p.price) || 0
                const orig  = p.original_price ? parseInt(p.original_price) : null
                const disc  = orig ? Math.round((1 - price / orig) * 100) : 0
                const imgs  = Array.isArray(p.images) ? p.images : []
                return (
                  <div key={p.id} className="card overflow-hidden hover:shadow-card-hover transition-shadow">
                    <div className="h-40 bg-gray-100 overflow-hidden relative">
                      {imgs[0]
                        ? <img src={imgs[0]} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={32} className="text-gray-200" /></div>
                      }
                      {imgs.length > 1 && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/50 text-white text-[11px] font-mono rounded-md">
                          +{imgs.length - 1}
                        </div>
                      )}
                      {p.is_sale && disc > 0 && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500 text-white text-[11px] font-bold rounded-lg">
                          -{disc}%
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="text-sm font-bold text-gray-900 mb-1">{p.name}</div>
                          <span className="text-[11px] px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg font-semibold">
                            {cats.find(c => c.id === p.category)?.label || p.category}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-base font-bold text-amber-600 font-mono">{price.toLocaleString()}₮</div>
                          {orig && <div className="text-[11px] text-gray-400 line-through">{orig.toLocaleString()}₮</div>}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg
                          ${p.stock > 5 ? "bg-emerald-50 text-emerald-700" : p.stock > 0 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600"}`}>
                          {p.stock} ширхэг
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="btn-secondary flex-1 justify-center text-xs h-8">
                          <Pencil size={12} /> Засах
                        </button>
                        <button onClick={() => del(p.id)} className="btn-danger h-8 px-3">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>

      {/* Modal — fixed, centered, proper z-index */}
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setModal(false)}
          />

          {/* Modal box */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-modal animate-scale-in max-h-[88vh] flex flex-col z-10">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-base font-bold text-gray-900">
                {editing ? "Бараа засах" : "Шинэ бараа нэмэх"}
              </h3>
              <button onClick={() => setModal(false)} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">

              {/* Image uploader — FIRST */}
              <ImageUploader images={images} onChange={setImages} />

              <div>
                <label className="label">Нэр *</label>
                <input value={form.name} onChange={e => set("name", e.target.value)}
                  placeholder="Кемпинг майхан 4 хүний" className="input text-sm" />
              </div>

              <div>
                <label className="label">Ангилал</label>
                <select value={form.category} onChange={e => set("category", e.target.value)} className="input text-sm">
                  {cats.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Тайлбар</label>
                <textarea value={form.description} onChange={e => set("description", e.target.value)}
                  placeholder="Барааны онцлог, материал, хэмжээ..."
                  rows={3} className="input text-sm resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Үнэ (₮) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₮</span>
                    <input type="number" value={form.price} onChange={e => set("price", e.target.value)}
                      placeholder="45000" className="input text-sm pl-7" />
                  </div>
                </div>
                <div>
                  <label className="label">Анх үнэ (₮)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₮</span>
                    <input type="number" value={form.original_price} onChange={e => set("original_price", e.target.value)}
                      placeholder="60000" className="input text-sm pl-7" />
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Нөөцийн тоо *</label>
                <input type="number" value={form.stock} onChange={e => set("stock", e.target.value)}
                  placeholder="10" className="input text-sm" />
              </div>

              <div>
                <label className="label">Шошго (таслалаар)</label>
                <input value={form.tags} onChange={e => set("tags", e.target.value)}
                  placeholder="Хөнгөн, Усны тусгаарлалт..." className="input text-sm" />
              </div>

              {/* Sale toggle */}
              <div
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer border border-gray-100 hover:border-amber-200 transition-colors"
                onClick={() => set("is_sale", !form.is_sale)}
              >
                <div className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${form.is_sale ? "bg-amber-500" : "bg-gray-300"}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.is_sale ? "left-5" : "left-1"}`} />
                </div>
                <div>
                  <span className="text-sm text-gray-700 font-medium">Хямдралтай гэж тэмдэглэх</span>
                  {form.price && form.original_price && parseInt(form.original_price) > parseInt(form.price) && (
                    <p className="text-xs text-amber-600 font-semibold">
                      {Math.round((1 - parseInt(form.price) / parseInt(form.original_price)) * 100)}% хямдрал
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
              {error && (
                <div className="mb-3 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setModal(false)} className="btn-secondary flex-1 justify-center">
                  Цуцлах
                </button>
                <button onClick={save} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60">
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving ? "Хадгалж байна..." : "Хадгалах"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  )
}