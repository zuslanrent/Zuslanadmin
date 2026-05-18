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
  ShoppingBag,
  ImagePlus,
  Star,
  Camera,
  FileText,
  Tag,
  DollarSign,
  Package,
  Sparkles,
  CheckCircle2,
  TreePine,
  Flame,
  ChefHat,
  Zap,
  Droplets,
  TrendingDown,
} from "lucide-react";

const API =
  process.env.NEXT_PUBLIC_API_URL || "https://rentbackend-z26v.onrender.com";

const cats = [
  {
    id: "camping",
    label: "Кемпинг",
    icon: TreePine,
    color: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  {
    id: "bbq",
    label: "Барбекю",
    icon: Flame,
    color: "from-red-500 to-red-600",
    bg: "bg-red-50",
    text: "text-red-700",
  },
  {
    id: "kitchen",
    label: "Гал тогоо",
    icon: ChefHat,
    color: "from-orange-500 to-orange-600",
    bg: "bg-orange-50",
    text: "text-orange-700",
  },
  {
    id: "power",
    label: "Эрчим хүч",
    icon: Zap,
    color: "from-yellow-500 to-yellow-600",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
  },
  {
    id: "hygiene",
    label: "Эрүүл ахуй",
    icon: Droplets,
    color: "from-cyan-500 to-cyan-600",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
  },
  {
    id: "other",
    label: "Бусад",
    icon: Package,
    color: "from-gray-500 to-gray-600",
    bg: "bg-gray-50",
    text: "text-gray-700",
  },
];

const TAG_PRESETS = [
  "Хөнгөн",
  "Усанд тэсвэртэй",
  "Олон удаа ашиглах",
  "Эх тэжээлтэй",
  "Бат бөх",
  "Авсаархан",
  "Шинэ загвар",
  "Премиум",
  "Гарын авлагатай",
  "Багц",
];

const empty = {
  name: "",
  category: "camping",
  description: "",
  price: "",
  original_price: "",
  stock: "",
  tags: [] as string[],
  is_sale: false,
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

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      if (file.size <= 5 * 1024 * 1024) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxWidth = 1920;
          const maxHeight = 1920;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error("Compression failed"));
              }
            },
            "image/jpeg",
            0.8,
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const upload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const maxSize = 10 * 1024 * 1024;
    const oversizedFiles: string[] = [];

    for (let i = 0; i < files.length; i++) {
      if (files[i].size > maxSize) {
        oversizedFiles.push(
          `${files[i].name} (${(files[i].size / (1024 * 1024)).toFixed(1)}MB)`,
        );
      }
    }

    if (oversizedFiles.length > 0) {
      setError(
        `Дараах ${oversizedFiles.length} файл(ууд) хэт том байна (max 10MB):\n${oversizedFiles.join("\n")}`,
      );
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          try {
            file = await compressImage(file);
          } catch (compressError) {
            console.warn("Compression failed, using original", compressError);
          }
        }
        formData.append("images", file);
      }

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
    onChange([images[idx], ...images.filter((_, i) => i !== idx)]);
  };

  return (
    <div>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all
          ${
            uploading
              ? "opacity-50 cursor-not-allowed border-gray-200"
              : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/40"
          }`}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-2">
            <Loader2 size={16} className="animate-spin text-amber-500" />
            Зураг upload хийж байна...
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-1">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-1">
              <ImagePlus size={20} className="text-amber-500" />
            </div>
            <p className="text-sm text-gray-700 font-semibold">Зураг нэмэх</p>
            <p className="text-[11px] text-gray-400">
              PNG, JPG, WEBP • 10MB хүртэл • Автомат шахагдана
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

      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-600 whitespace-pre-line">{error}</p>
        </div>
      )}

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
                  <div className="absolute top-1 left-1 flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-600 text-white text-[9px] font-bold rounded-md shadow">
                    <Star size={8} className="fill-white" /> НҮҮР
                  </div>
                ) : (
                  <button
                    onClick={() => setCover(i)}
                    className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[9px] font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-amber-600"
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
        <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
          <Icon size={14} className="text-amber-600" />
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
export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(empty);
  const [images, setImages] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const d = await api.products();
      setProducts(d.data || d);
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
    setCustomTag("");
    setError("");
    setModal(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    const tagsArr = Array.isArray(p.tags)
      ? p.tags
      : typeof p.tags === "string"
        ? p.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : [];
    setForm({
      name: p.name || "",
      category: p.category || "camping",
      description: p.description || "",
      price: p.price ? String(p.price) : "",
      original_price: p.original_price ? String(p.original_price) : "",
      stock: p.stock ? String(p.stock) : "",
      is_sale: p.is_sale || false,
      tags: tagsArr,
    });
    setImages(Array.isArray(p.images) ? p.images : []);
    setCustomTag("");
    setError("");
    setModal(true);
  };

  const save = async () => {
    if (!form.name || !form.price || !form.stock) {
      setError("Нэр, үнэ, нөөц шаардлагатай");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        price: parseInt(form.price),
        original_price: form.original_price
          ? parseInt(form.original_price)
          : null,
        stock: parseInt(form.stock),
        tags: form.tags,
        images,
      };
      if (editing) {
        await api.updateProduct(editing.id, payload);
      } else {
        await api.createProduct(payload);
      }
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
      await api.deleteProduct(id);
      setProducts((p) => p.filter((x) => x.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const toggleTag = (tag: string) => {
    set(
      "tags",
      form.tags.includes(tag)
        ? form.tags.filter((t: string) => t !== tag)
        : [...form.tags, tag],
    );
  };

  const addCustomTag = () => {
    const trimmed = customTag.trim();
    if (!trimmed || form.tags.includes(trimmed)) return;
    set("tags", [...form.tags, trimmed]);
    setCustomTag("");
  };

  // Real-time discount calculation
  const discount =
    form.price && form.original_price && parseInt(form.original_price) > parseInt(form.price)
      ? Math.round((1 - parseInt(form.price) / parseInt(form.original_price)) * 100)
      : 0;

  return (
    <AuthGuard requireRole="super_admin">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="lg:ml-[240px] flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
                Super Admin · Дэлгүүр
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Дэлгүүрийн бараа
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
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
              >
                <Plus size={15} />
                <span className="hidden sm:inline">Бараа нэмэх</span>
                <span className="sm:hidden">Нэмэх</span>
              </button>
            </div>
          </div>

          {/* Info banner */}
          <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 font-medium mb-6">
            <ShoppingBag size={14} className="shrink-0" />
            <span>Зөвхөн Super Admin дэлгүүрийн барааг засах эрхтэй.</span>
          </div>

          {/* Products grid */}
          {loading ? (
            <div className="card flex items-center justify-center py-24">
              <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-24 text-gray-400">
              <ShoppingBag size={48} className="mb-3 text-gray-200" />
              <p className="text-sm font-medium mb-4">Бараа байхгүй байна</p>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-xs font-semibold rounded-xl"
              >
                Эхний барааг нэмэх
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {products.map((p) => {
                const price = parseInt(p.price) || 0;
                const orig = p.original_price ? parseInt(p.original_price) : null;
                const disc = orig ? Math.round((1 - price / orig) * 100) : 0;
                const imgs = Array.isArray(p.images) ? p.images : [];
                const cat = cats.find((c) => c.id === p.category);
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                  >
                    {/* Image */}
                    <div className="aspect-square bg-gray-100 overflow-hidden relative">
                      {imgs[0] ? (
                        <img
                          src={imgs[0]}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag size={40} className="text-gray-200" />
                        </div>
                      )}
                      {imgs.length > 1 && (
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-black/60 text-white text-[11px] font-mono rounded-md backdrop-blur-sm">
                          <Camera size={10} /> +{imgs.length - 1}
                        </div>
                      )}
                      {p.is_sale && disc > 0 && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-[11px] font-bold rounded-lg shadow">
                          <TrendingDown size={10} /> -{disc}%
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 truncate mb-1">
                            {p.name}
                          </h3>
                          {cat && (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 ${cat.bg} ${cat.text} text-[11px] font-semibold rounded-lg border border-current/10`}
                            >
                              <cat.icon size={10} />
                              {cat.label}
                            </span>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-base font-bold text-amber-600 font-mono">
                            {price.toLocaleString()}₮
                          </div>
                          {orig && (
                            <div className="text-[11px] text-gray-400 line-through">
                              {orig.toLocaleString()}₮
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                        {p.description || "Тайлбар байхгүй"}
                      </p>

                      {/* Stock badge */}
                      <div className="mb-3">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg inline-block
                          ${
                            p.stock > 5
                              ? "bg-emerald-50 text-emerald-700"
                              : p.stock > 0
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-600"
                          }`}
                        >
                          {p.stock > 0 ? `${p.stock} ширхэг` : "Дууссан"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white border border-gray-200 hover:border-amber-300 hover:bg-amber-50 text-gray-600 hover:text-amber-600 text-xs font-semibold rounded-lg transition-all"
                        >
                          <Pencil size={12} />
                          <span className="hidden sm:inline">Засах</span>
                        </button>
                        <button
                          onClick={() => del(p.id)}
                          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-all"
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

          <div className="relative w-full max-w-2xl bg-gray-50 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col z-10 overflow-hidden">
            {/* Header */}
            <div className="bg-white px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-sm">
                    <ShoppingBag size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {editing ? "Бараа засах" : "Шинэ бараа бүртгэх"}
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Дэлгүүрт байршуулах бараагаа бүх мэдээллээр бөглөнө үү
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
                      Барааны нэр *
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="Кемпинг майхан 4 хүний"
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 mb-1.5 block">
                      Тайлбар
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      placeholder="Барааны онцлог, материал, хэмжээ..."
                      rows={3}
                      className="input text-sm resize-none"
                    />
                  </div>
                </div>
              </Section>

              {/* ── Category ── */}
              <Section icon={Tag} title="Ангилал" required>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {cats.map((c) => {
                    const selected = form.category === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => set("category", c.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all text-left
                          ${
                            selected
                              ? "border-amber-500 bg-amber-50/60"
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
                          {c.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* ── Pricing ── */}
              <Section icon={DollarSign} title="Үнэ" required>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 mb-1.5 block">
                        Зарах үнэ *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                          ₮
                        </span>
                        <input
                          type="number"
                          value={form.price}
                          onChange={(e) => set("price", e.target.value)}
                          placeholder="45000"
                          className="input text-sm pl-7 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 mb-1.5 block">
                        Анхны үнэ (хямдралд)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                          ₮
                        </span>
                        <input
                          type="number"
                          value={form.original_price}
                          onChange={(e) =>
                            set("original_price", e.target.value)
                          }
                          placeholder="60000"
                          className="input text-sm pl-7 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Discount display */}
                  {discount > 0 && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-red-50 to-amber-50 border border-amber-200">
                      <TrendingDown size={16} className="text-red-500" />
                      <p className="text-xs font-semibold text-amber-800">
                        <span className="text-red-600 font-bold">
                          {discount}% хямдрал
                        </span>{" "}
                        — Зочид{" "}
                        {(parseInt(form.original_price) - parseInt(form.price)).toLocaleString()}₮
                        хэмнэнэ
                      </p>
                    </div>
                  )}

                  {/* Sale toggle */}
                  <div
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all
                      ${
                        form.is_sale
                          ? "border-amber-500 bg-amber-50/60"
                          : "border-gray-100 bg-white hover:border-gray-200"
                      }`}
                    onClick={() => set("is_sale", !form.is_sale)}
                  >
                    <div
                      className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0
                        ${form.is_sale ? "bg-amber-500" : "bg-gray-300"}`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all
                          ${form.is_sale ? "left-5" : "left-1"}`}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        Хямдралтай гэж тэмдэглэх
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Дэлгүүрт улаан badge харуулна
                      </p>
                    </div>
                    {form.is_sale && (
                      <CheckCircle2 size={18} className="text-amber-500" />
                    )}
                  </div>
                </div>
              </Section>

              {/* ── Stock ── */}
              <Section icon={Package} title="Нөөц" required>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 mb-1.5 block">
                      Нөөцийн тоо *
                    </label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) => set("stock", e.target.value)}
                      placeholder="10"
                      className="input text-sm font-mono"
                    />
                  </div>

                  {/* Quick stock presets */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "Нөөц байхгүй", value: "0" },
                      { label: "5 ширхэг", value: "5" },
                      { label: "10 ширхэг", value: "10" },
                      { label: "20 ширхэг", value: "20" },
                      { label: "50 ширхэг", value: "50" },
                    ].map(({ label, value }) => (
                      <button
                        key={value}
                        onClick={() => set("stock", value)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border-2 transition-all
                          ${
                            form.stock === value
                              ? "border-amber-500 bg-amber-50 text-amber-700"
                              : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Stock indicator */}
                  {form.stock !== "" && (
                    <div
                      className={`text-xs font-semibold px-3 py-2 rounded-lg
                        ${
                          parseInt(form.stock) === 0
                            ? "bg-red-50 text-red-700"
                            : parseInt(form.stock) <= 5
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                        }`}
                    >
                      {parseInt(form.stock) === 0
                        ? "⛔ Нөөц байхгүй — дэлгүүрт 'Дууссан' гэж харагдана"
                        : parseInt(form.stock) <= 5
                          ? "⚠️ Цөөн үлдсэн — яаралтай нөөцлөх шаардлагатай"
                          : "✅ Хангалттай нөөцтэй"}
                    </div>
                  )}
                </div>
              </Section>

              {/* ── Tags ── */}
              <Section icon={Sparkles} title="Шошго">
                <p className="text-[11px] text-gray-500 mb-3">
                  Барааны онцлог тэмдэглэгээ — дэлгүүрт хайхад тус болно
                </p>

                {/* Preset tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {TAG_PRESETS.map((tag) => {
                    const selected = form.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                          ${
                            selected
                              ? "bg-amber-500 text-white border-amber-500"
                              : "bg-white text-gray-600 border-gray-200 hover:border-amber-300 hover:text-amber-700"
                          }`}
                      >
                        {selected && <CheckCircle2 size={11} />}
                        {tag}
                      </button>
                    );
                  })}
                </div>

                {/* Custom tags */}
                {form.tags.filter((t: string) => !TAG_PRESETS.includes(t))
                  .length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Тусгай шошго
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {form.tags
                        .filter((t: string) => !TAG_PRESETS.includes(t))
                        .map((tag: string) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200"
                          >
                            <Sparkles size={10} />
                            {tag}
                            <button
                              onClick={() => toggleTag(tag)}
                              className="ml-1 hover:bg-orange-200 rounded-full w-3.5 h-3.5 flex items-center justify-center"
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
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomTag();
                      }
                    }}
                    placeholder="Өөрийн шошго нэмэх... (Enter дарж нэмнэ)"
                    className="input text-sm flex-1"
                  />
                  <button
                    onClick={addCustomTag}
                    disabled={!customTag.trim()}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    Нэмэх
                  </button>
                </div>

                {form.tags.length > 0 && (
                  <p className="text-[10px] text-gray-400 mt-2">
                    {form.tags.length} шошго сонгосон
                  </p>
                )}
              </Section>
            </div>

            {/* Footer */}
            <div className="bg-white px-6 py-4 border-t border-gray-100 flex-shrink-0">
              {error && (
                <div className="mb-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 whitespace-pre-line">
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
                  className="flex-[2] flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60 shadow-sm"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving
                    ? "Хадгалж байна..."
                    : editing
                      ? "Шинэчлэх"
                      : "Бараа нэмэх"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}