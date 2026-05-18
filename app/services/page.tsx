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
  Clock,
  Sparkles,
  Tag,
  FileText,
  DollarSign,
  User,
  CheckCircle2,
  Camera,
  Trees,
  Waves,
  Map,
  UtensilsCrossed,
} from "lucide-react";

const API =
  process.env.NEXT_PUBLIC_API_URL || "https://rentbackend-z26v.onrender.com";

const serviceCategories = [
  { id: 1, name: "Түрээс", icon: Wrench, color: "from-blue-500 to-blue-600", bg: "bg-blue-50", text: "text-blue-700" },
  { id: 2, name: "Байгаль", icon: Trees, color: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50", text: "text-emerald-700" },
  { id: 3, name: "Усны үйлчилгээ", icon: Waves, color: "from-cyan-500 to-cyan-600", bg: "bg-cyan-50", text: "text-cyan-700" },
  { id: 4, name: "Аялал", icon: Map, color: "from-amber-500 to-amber-600", bg: "bg-amber-50", text: "text-amber-700" },
  { id: 5, name: "Хоол", icon: UtensilsCrossed, color: "from-red-500 to-red-600", bg: "bg-red-50", text: "text-red-700" },
];

const DURATION_PRESETS = [
  "30 минут",
  "1 цаг",
  "2 цаг",
  "Хагас өдөр",
  "Бүтэн өдөр",
  "2 өдөр",
];

const FEATURE_PRESETS = [
  "Мэргэжлийн хөтөч",
  "Тоног хэрэгсэл багтсан",
  "Тээвэр багтсан",
  "Хоол ундаа",
  "Гэрэл зураг",
  "Хүүхдэд тохиромжтой",
  "Бүлгээр захиалах",
  "WiFi",
  "Зогсоол",
  "24/7 туслалцаа",
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
  features: [] as string[],
};

// ═══════════════ Image Uploader ═══════════════
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

  const setCover = (idx: number) => {
    if (idx === 0) return;
    const reordered = [images[idx], ...images.filter((_, i) => i !== idx)];
    onChange(reordered);
  };

  return (
    <div>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all
          ${uploading
            ? "opacity-50 cursor-not-allowed border-gray-200"
            : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40"
          }`}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-2">
            <Loader2 size={16} className="animate-spin text-emerald-500" />
            Зураг upload хийж байна...
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-1">
              <ImagePlus size={20} className="text-emerald-500" />
            </div>
            <p className="text-sm text-gray-700 font-semibold">
              Зураг нэмэх
            </p>
            <p className="text-[11px] text-gray-400">
              PNG, JPG, WEBP • 5MB хүртэл • Олон зураг сонгох боломжтой
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

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

      {images.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              {images.length} зураг
            </p>
            <p className="text-[10px] text-gray-400">
              Эхний зураг = нүүр зураг
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {images.map((url, i) => (
              <div
                key={i}
                className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
                {i === 0 ? (
                  <div className="absolute top-1 left-1 flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded-md shadow">
                    <Star size={8} className="fill-white" /> НҮҮР
                  </div>
                ) : (
                  <button
                    onClick={() => setCover(i)}
                    className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[9px] font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-600"
                  >
                    Нүүр болгох
                  </button>
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
        </div>
      )}
    </div>
  );
}

// ═══════════════ Section Wrapper ═══════════════
function Section({
  icon: Icon,
  title,
  required,
  children,
}: {
  icon: any;
  title: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
          <Icon size={14} className="text-emerald-600" />
        </div>
        <h4 className="text-sm font-bold text-gray-900">
          {title}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </h4>
      </div>
      {children}
    </div>
  );
}

// ═══════════════ Main Page ═══════════════
export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(empty);
  const [images, setImages] = useState<string[]>([]);
  const [customDuration, setCustomDuration] = useState(false);
  const [customFeature, setCustomFeature] = useState("");
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
    setCustomDuration(false);
    setCustomFeature("");
    setError("");
    setModal(true);
  };

  const openEdit = (s: any) => {
    setEditing(s);
    const featuresArr = Array.isArray(s.features)
      ? s.features
      : typeof s.features === "string"
        ? s.features.split(",").map((f: string) => f.trim()).filter(Boolean)
        : [];
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
      features: featuresArr,
    });
    setCustomDuration(s.duration && !DURATION_PRESETS.includes(s.duration));
    setImages(Array.isArray(s.images) ? s.images : []);
    setCustomFeature("");
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
        features: form.features,
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
    if (!confirm("Устгах уу? (Soft delete — DB-д хадгалагдана)")) return;
    try {
      await api.deleteService(id);
      setServices((p) => p.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const toggleFeature = (feat: string) => {
    set(
      "features",
      form.features.includes(feat)
        ? form.features.filter((f: string) => f !== feat)
        : [...form.features, feat],
    );
  };

  const addCustomFeature = () => {
    const trimmed = customFeature.trim();
    if (!trimmed || form.features.includes(trimmed)) return;
    set("features", [...form.features, trimmed]);
    setCustomFeature("");
  };

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
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-black/60 text-white text-[11px] font-mono rounded-md backdrop-blur-sm">
                          <Camera size={10} /> +{imgs.length - 1}
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
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 ${cat.bg} ${cat.text} text-[11px] font-semibold rounded-lg border border-current/10`}
                            >
                              <cat.icon size={10} />
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
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <User size={11} /> {svc.provider_name}
                        </div>
                      )}
                      {svc.phone && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                          <Phone size={11} /> {svc.phone}
                        </div>
                      )}
                      {svc.duration && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                          <Clock size={11} /> {svc.duration}
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

      {/* ═══════════════ Modal ═══════════════ */}
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModal(false)}
          />

          <div className="relative w-full max-w-2xl bg-gray-50 rounded-3xl shadow-2xl animate-scale-in max-h-[92vh] flex flex-col z-10 overflow-hidden">
            {/* Header */}
            <div className="bg-white px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
                    <Wrench size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {editing ? "Үйлчилгээ засах" : "Шинэ үйлчилгээ бүртгэх"}
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Бүх мэдээллийг бөглөж үйлчилгээгээ нэмнэ үү
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModal(false)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              {/* ── Images ── */}
              <Section icon={Camera} title="Зураг">
                <ImageUploader images={images} onChange={setImages} />
              </Section>

              {/* ── Basic info ── */}
              <Section icon={FileText} title="Үндсэн мэдээлэл" required>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 mb-1.5 block">
                      Гарчиг *
                    </label>
                    <input
                      value={form.title}
                      onChange={(e) => set("title", e.target.value)}
                      placeholder="Морин аялал — Хөвсгөл нуурын эрэг дагуу"
                      className="input text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 mb-1.5 block">
                        Нийлүүлэгч
                      </label>
                      <div className="relative">
                        <User
                          size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          value={form.provider_name}
                          onChange={(e) =>
                            set("provider_name", e.target.value)
                          }
                          placeholder="Компани / хувь хүн"
                          className="input text-sm pl-9"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 mb-1.5 block">
                        Утас
                      </label>
                      <div className="relative">
                        <Phone
                          size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          value={form.phone}
                          onChange={(e) => set("phone", e.target.value)}
                          placeholder="9900-0000"
                          className="input text-sm pl-9"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Section>

              {/* ── Category ── */}
              <Section icon={Tag} title="Ангилал" required>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {serviceCategories.map((c) => {
                    const selected = form.category_id === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => set("category_id", c.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all text-left
                          ${selected
                            ? "border-emerald-500 bg-emerald-50/60"
                            : "border-gray-100 bg-white hover:border-gray-200"
                          }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                          ${selected ? `bg-gradient-to-br ${c.color}` : c.bg}`}
                        >
                          <c.icon
                            size={14}
                            className={selected ? "text-white" : c.text}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-700">
                          {c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* ── Description ── */}
              <Section icon={FileText} title="Тайлбар" required>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Үйлчилгээний дэлгэрэнгүй тайлбар... Ямар туршлага үзүүлэх, юу багтаасан вэ?"
                  rows={4}
                  className="input text-sm resize-none"
                />
              </Section>

              {/* ── Pricing ── */}
              <Section icon={DollarSign} title="Үнэ" required>
                <div className="space-y-3">
                  <div
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all
                      ${form.is_free
                        ? "border-emerald-500 bg-emerald-50/60"
                        : "border-gray-100 bg-white hover:border-gray-200"
                      }`}
                    onClick={() => set("is_free", !form.is_free)}
                  >
                    <div
                      className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0
                        ${form.is_free ? "bg-emerald-500" : "bg-gray-300"}`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all
                          ${form.is_free ? "left-5" : "left-1"}`}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        Үнэгүй үйлчилгээ
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Зочдод үнэгүй санал болгох
                      </p>
                    </div>
                    {form.is_free && (
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    )}
                  </div>

                  {!form.is_free && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-gray-600 mb-1.5 block">
                          Үнэ (₮)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                            ₮
                          </span>
                          <input
                            type="number"
                            value={form.price_amount}
                            onChange={(e) =>
                              set("price_amount", e.target.value)
                            }
                            placeholder="45000"
                            className="input text-sm pl-7 font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-gray-600 mb-1.5 block">
                          Нэгж
                        </label>
                        <select
                          value={form.price_label}
                          onChange={(e) => set("price_label", e.target.value)}
                          className="input text-sm"
                        >
                          <option value="₮/цаг">₮/цаг</option>
                          <option value="₮/хүн">₮/хүн</option>
                          <option value="₮/өдөр">₮/өдөр</option>
                          <option value="₮/багц">₮/багц</option>
                          <option value="₮">₮ (нэг удаа)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </Section>

              {/* ── Duration ── */}
              <Section icon={Clock} title="Үргэлжлэх хугацаа">
                <div className="flex flex-wrap gap-2 mb-3">
                  {DURATION_PRESETS.map((preset) => {
                    const selected = !customDuration && form.duration === preset;
                    return (
                      <button
                        key={preset}
                        onClick={() => {
                          setCustomDuration(false);
                          set("duration", preset);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border-2 transition-all
                          ${selected
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
                          }`}
                      >
                        {selected && (
                          <CheckCircle2
                            size={11}
                            className="inline mr-1 -mt-0.5"
                          />
                        )}
                        {preset}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => {
                      setCustomDuration(true);
                      if (DURATION_PRESETS.includes(form.duration)) {
                        set("duration", "");
                      }
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border-2 border-dashed transition-all
                      ${customDuration
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                      }`}
                  >
                    + Тусгай
                  </button>
                </div>

                {customDuration && (
                  <input
                    value={form.duration}
                    onChange={(e) => set("duration", e.target.value)}
                    placeholder="Жишээ: 3 өдрийн trekking, аялал гаргах өдөр..."
                    className="input text-sm"
                    autoFocus
                  />
                )}
              </Section>

              {/* ── Features ── */}
              <Section icon={Sparkles} title="Онцлог багтаамж">
                <p className="text-[11px] text-gray-500 mb-3">
                  Үйлчилгээнд багтсан зүйлс — дарж сонгох, эсвэл өөрөө нэмэх
                </p>

                {/* Preset chips */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {FEATURE_PRESETS.map((feat) => {
                    const selected = form.features.includes(feat);
                    return (
                      <button
                        key={feat}
                        onClick={() => toggleFeature(feat)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                          ${selected
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-700"
                          }`}
                      >
                        {selected && <CheckCircle2 size={11} />}
                        {feat}
                      </button>
                    );
                  })}
                </div>

                {/* Custom features (non-preset items already selected) */}
                {form.features.filter(
                  (f: string) => !FEATURE_PRESETS.includes(f),
                ).length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Тусгай онцлог
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {form.features
                        .filter((f: string) => !FEATURE_PRESETS.includes(f))
                        .map((feat: string) => (
                          <span
                            key={feat}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200"
                          >
                            <Sparkles size={10} />
                            {feat}
                            <button
                              onClick={() => toggleFeature(feat)}
                              className="ml-1 hover:bg-amber-200 rounded-full w-3.5 h-3.5 flex items-center justify-center"
                            >
                              <X size={9} />
                            </button>
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Add custom */}
                <div className="flex gap-2">
                  <input
                    value={customFeature}
                    onChange={(e) => setCustomFeature(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomFeature();
                      }
                    }}
                    placeholder="Өөрийн онцлог нэмэх... (Enter дарж нэмнэ)"
                    className="input text-sm flex-1"
                  />
                  <button
                    onClick={addCustomFeature}
                    disabled={!customFeature.trim()}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    Нэмэх
                  </button>
                </div>

                {form.features.length > 0 && (
                  <p className="text-[10px] text-gray-400 mt-2">
                    {form.features.length} онцлог сонгосон
                  </p>
                )}
              </Section>
            </div>

            {/* Footer */}
            <div className="bg-white px-6 py-4 border-t border-gray-100 flex-shrink-0">
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
                  className="flex-[2] flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60 shadow-sm"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving
                    ? "Хадгалж байна..."
                    : editing
                      ? "Шинэчлэх"
                      : "Үйлчилгээ нэмэх"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}