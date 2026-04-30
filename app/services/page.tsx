"use client";

import { useEffect, useRef, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { Sidebar } from "@/components/sidebar";
import { api } from "@/lib/api";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Loader2,
  RefreshCw,
  Wrench,
  Phone,
  ImagePlus,
  Star,
} from "lucide-react";

const API =
  process.env.NEXT_PUBLIC_API_URL || "https://rentbackend-z26v.onrender.com";

const serviceCategories = [
  { id: 1, name: "Түрээс" },
  { id: 2, name: "Байгаль" },
  { id: 3, name: "Усны үйлчилгээ" },
  { id: 4, name: "Аялал" },
  { id: 5, name: "Хоол" },
];

const empty = {
  title: "",
  provider_name: "",
  phone: "",
  category_id: 1,
  description: "",
  price_amount: "",
  price_label: "₮/цаг",
  is_free: false,
  duration: "",
  features: "",
};

// ── Image uploader ────────────────────────────────────
function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("images", f));
      const res = await fetch(`${API}/api/upload/images`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload амжилтгүй");
      const urls = (data.urls || []).map((u: any) => u.url || u);
      onChange([...images, ...urls]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div>
      <label className="label">Зурагнууд</label>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all mb-3
          ${uploading ? "opacity-50 cursor-not-allowed border-gray-200" : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30"}`}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-2">
            <Loader2 size={16} className="animate-spin text-emerald-500" />
            Зураг upload хийж байна...
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 py-2">
            <ImagePlus size={22} className="text-gray-300" />
            <p className="text-xs text-gray-500 font-medium">
              Дарж зураг оруулах
            </p>
            <p className="text-[11px] text-gray-400">
              PNG, JPG, WEBP • 5MB хүртэл
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
      </div>
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((url, i) => (
            <div
              key={i}
              className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50"
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <div className="absolute top-1 left-1 flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded-md">
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
  );
}

// ── Main Page ─────────────────────────────────────────
export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(empty);
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const d = await api.services();
      setServices(d.data || d);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setImages([]);
    setError("");
    setModal(true);
  };

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({
      title: s.title || "",
      provider_name: s.provider_name || "",
      phone: s.phone || "",
      category_id: s.category_id || 1,
      description: s.description || "",
      price_amount: s.price_amount ? String(s.price_amount) : "",
      price_label: s.price_label || "₮/цаг",
      is_free: s.is_free || false,
      duration: s.duration || "",
      features: Array.isArray(s.features)
        ? s.features.join(", ")
        : s.features || "",
    });
    setImages(Array.isArray(s.images) ? s.images : []);
    setError("");
    setModal(true);
  };

  const save = async () => {
    if (!form.title || !form.description) {
      setError("Гарчиг болон тайлбар шаардлагатай");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        category_id: parseInt(String(form.category_id)),
        price_amount: form.is_free
          ? null
          : form.price_amount
            ? parseInt(form.price_amount)
            : null,
        features: form.features
          .split(",")
          .map((f: string) => f.trim())
          .filter(Boolean),
        images,
      };
      editing
        ? await api.updateService(editing.id, payload)
        : await api.createService(payload);
      setModal(false);
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Устгах уу?")) return;
    try {
      await api.deleteService(id);
      setServices((p) => p.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="ml-[240px] flex-1 p-8 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1">
                Үйлчилгээний удирдлага
              </p>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Үйлчилгээ
              </h1>
            </div>
            <div className="flex gap-2">
              <button onClick={load} className="btn-secondary h-9 px-3">
                <RefreshCw
                  size={13}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
              >
                <Plus size={15} /> Нэмэх
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="card flex items-center justify-center py-24">
              <div className="w-7 h-7 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : services.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-24 text-gray-400">
              <Wrench size={40} className="mb-3 text-gray-200" />
              <p className="text-sm font-medium mb-4">
                Үйлчилгээ байхгүй байна
              </p>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl"
              >
                Эхний үйлчилгээг нэмэх
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {services.map((svc) => {
                const cat = serviceCategories.find(
                  (c) => c.id === svc.category_id,
                );
                const imgs = Array.isArray(svc.images) ? svc.images : [];
                return (
                  <div
                    key={svc.id}
                    className="card overflow-hidden hover:shadow-card-hover transition-shadow"
                  >
                    {/* Cover image */}
                    <div className="h-36 bg-gray-100 overflow-hidden relative">
                      {imgs[0] ? (
                        <img
                          src={imgs[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Wrench size={28} className="text-gray-200" />
                        </div>
                      )}
                      {imgs.length > 1 && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/50 text-white text-[11px] font-mono rounded-md">
                          +{imgs.length - 1}
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="text-sm font-bold text-gray-900 mb-1">
                            {svc.title}
                          </div>
                          {cat && (
                            <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-lg border border-emerald-100">
                              {cat.name}
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-bold text-emerald-600 font-mono flex-shrink-0">
                          {svc.is_free
                            ? "Үнэгүй"
                            : svc.price_amount
                              ? `${parseInt(svc.price_amount).toLocaleString()}₮`
                              : "—"}
                        </div>
                      </div>
                      {svc.provider_name && (
                        <div className="text-xs text-gray-500 mb-1">
                          👤 {svc.provider_name}
                        </div>
                      )}
                      {svc.phone && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <Phone size={11} /> {svc.phone}
                        </div>
                      )}
                      {svc.duration && (
                        <div className="text-xs text-gray-400 mb-2">
                          ⏱ {svc.duration}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                        {svc.description}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(svc)}
                          className="btn-secondary flex-1 justify-center text-xs h-8"
                        >
                          <Pencil size={12} /> Засах
                        </button>
                        <button
                          onClick={() => del(svc.id)}
                          className="btn-danger h-8 px-3"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Modal — fixed, centered */}
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
                {editing ? "Үйлчилгээ засах" : "Шинэ үйлчилгээ"}
              </h3>
              <button
                onClick={() => setModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              {/* Images first */}
              <ImageUploader images={images} onChange={setImages} />

              {[
                { label: "Гарчиг *", key: "title", placeholder: "Морин аялал" },
                {
                  label: "Нийлүүлэгч",
                  key: "provider_name",
                  placeholder: "Компани / хувь хүн",
                },
                { label: "Утас", key: "phone", placeholder: "9900-0000" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="label">{f.label}</label>
                  <input
                    value={form[f.key]}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="input text-sm"
                  />
                </div>
              ))}

              <div>
                <label className="label">Ангилал</label>
                <select
                  value={form.category_id}
                  onChange={(e) => set("category_id", parseInt(e.target.value))}
                  className="input text-sm"
                >
                  {serviceCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Тайлбар *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Үйлчилгээний дэлгэрэнгүй тайлбар..."
                  rows={3}
                  className="input text-sm resize-none"
                />
              </div>

              {/* Free toggle */}
              <div
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer border border-gray-100 hover:border-emerald-200 transition-colors"
                onClick={() => set("is_free", !form.is_free)}
              >
                <div
                  className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${form.is_free ? "bg-emerald-500" : "bg-gray-300"}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.is_free ? "left-5" : "left-1"}`}
                  />
                </div>
                <span className="text-sm text-gray-700 font-medium">
                  Үнэгүй үйлчилгээ
                </span>
              </div>

              {!form.is_free && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Үнэ (₮)</label>
                    <input
                      type="number"
                      value={form.price_amount}
                      onChange={(e) => set("price_amount", e.target.value)}
                      placeholder="45000"
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <label className="label">Нэгж</label>
                    <input
                      value={form.price_label}
                      onChange={(e) => set("price_label", e.target.value)}
                      placeholder="₮/цаг"
                      className="input text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="label">Хугацаа</label>
                <input
                  value={form.duration}
                  onChange={(e) => set("duration", e.target.value)}
                  placeholder="Өдрийн аялал, 2 цаг..."
                  className="input text-sm"
                />
              </div>

              <div>
                <label className="label">Онцлогууд (таслалаар)</label>
                <input
                  value={form.features}
                  onChange={(e) => set("features", e.target.value)}
                  placeholder="Мэргэжлийн хөтөч, Тоног хэрэгсэл..."
                  className="input text-sm"
                />
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
                <button
                  onClick={() => setModal(false)}
                  className="btn-secondary flex-1 justify-center"
                >
                  Цуцлах
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving ? "Хадгалж байна..." : "Хадгалах"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
