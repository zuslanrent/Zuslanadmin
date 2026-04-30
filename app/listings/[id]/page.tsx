"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { Sidebar } from "@/components/sidebar";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  Square,
  Phone,
  Tag,
  Calendar,
  Eye,
  Star,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  User,
  Home,
  Clock,
  Wifi,
  Coffee,
  ChevronDown,
  Trash2,
  Loader2,
  Shield,
} from "lucide-react";
import { clsx } from "clsx";

const statusMap: Record<string, { label: string; cls: string }> = {
  active: { label: "Идэвхтэй", cls: "badge-active" },
  pending: { label: "Хүлээгдэж", cls: "badge-pending" },
  rejected: { label: "Татгалзсан", cls: "badge-rejected" },
  inactive: { label: "Идэвхгүй", cls: "badge-inactive" },
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getListing(id);
        setListing(data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const images: string[] = listing?.images
    ? listing.images.map((i: any) => i.url || i).filter(Boolean)
    : listing?.cover_image
      ? [listing.cover_image]
      : [];

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      if (status === "active") await api.approveListing(id);
      else if (status === "rejected") await api.rejectListing(id);
      else await api.updateListingStatus(id, status);
      setListing((p: any) => ({ ...p, status }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Зарыг устгах уу?")) return;
    setDeleting(true);
    try {
      await api.deleteListing(id);
      router.push("/listings");
    } catch (err: any) {
      alert(err.message);
      setDeleting(false);
    }
  };

  if (loading)
    return (
      <AuthGuard>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <main className="ml-[240px] flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </main>
        </div>
      </AuthGuard>
    );

  if (!listing)
    return (
      <AuthGuard>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <main className="ml-[240px] flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-3">😕</div>
              <p className="text-gray-500 font-medium">Зар олдсонгүй</p>
              <button
                onClick={() => router.push("/listings")}
                className="btn-secondary mt-4 text-xs"
              >
                Буцах
              </button>
            </div>
          </main>
        </div>
      </AuthGuard>
    );

  const st = statusMap[listing.status] || statusMap.pending;
  const price = listing.price_per_day
    ? parseFloat(String(listing.price_per_day)).toLocaleString()
    : "—";
  const area = listing.area_sqm ? parseFloat(String(listing.area_sqm)) : "—";
  const rating = listing.avg_rating
    ? parseFloat(String(listing.avg_rating))
    : 0;
  const amenities = listing.amenities
    ? typeof listing.amenities === "string"
      ? JSON.parse(listing.amenities)
      : listing.amenities
    : [];
  const tags = listing.tags
    ? typeof listing.tags === "string"
      ? JSON.parse(listing.tags)
      : listing.tags
    : [];

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="ml-[240px] flex-1 p-8 min-w-0">
          {/* Back */}
          <button
            onClick={() => router.push("/listings")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 font-medium mb-6 transition-colors group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Зарын жагсаалт руу буцах
          </button>

          <div className="grid grid-cols-[1fr_360px] gap-6">
            {/* LEFT */}
            <div className="space-y-5">
              {/* Gallery */}
              <div className="card overflow-hidden">
                <div className="relative aspect-video bg-gray-100">
                  {images.length > 0 ? (
                    <>
                      <img
                        key={imgIdx}
                        src={images[imgIdx]}
                        alt={listing.title}
                        className="w-full h-full object-cover animate-fade-in"
                      />
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              setImgIdx(
                                (i) => (i - 1 + images.length) % images.length,
                              )
                            }
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors"
                          >
                            <ChevronLeft size={16} className="text-gray-700" />
                          </button>
                          <button
                            onClick={() =>
                              setImgIdx((i) => (i + 1) % images.length)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors"
                          >
                            <ChevronRight size={16} className="text-gray-700" />
                          </button>
                          <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-mono rounded-lg">
                            {imgIdx + 1} / {images.length}
                          </div>
                        </>
                      )}
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {listing.is_new && (
                          <span className="px-2.5 py-1 bg-brand-600 text-white text-xs font-bold rounded-lg shadow">
                            ШИНЭ
                          </span>
                        )}
                        {listing.is_featured && (
                          <span className="px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg shadow">
                            ТОП
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Home size={48} />
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-2 p-3 border-t border-gray-50 overflow-x-auto">
                    {images.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        className={clsx(
                          "w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all",
                          imgIdx === i
                            ? "border-brand-500 scale-105"
                            : "border-gray-100 opacity-60 hover:opacity-100",
                        )}
                      >
                        <img
                          src={src}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title + Description */}
              <div className="card p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 leading-snug mb-2">
                      {listing.title}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={14} className="text-brand-500" />
                      <span>
                        {listing.location_name || "Байршил тодорхойгүй"}
                      </span>
                      {listing.address && (
                        <span className="text-gray-300">·</span>
                      )}
                      {listing.address && <span>{listing.address}</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-brand-600 font-mono">
                      {price}₮
                    </div>
                    <div className="text-xs text-gray-400">/өдөр</div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-3 mb-5">
                  {[
                    {
                      icon: BedDouble,
                      label: "Өрөө",
                      value: listing.rooms || "—",
                    },
                    {
                      icon: Bath,
                      label: "Ариун цэвэр",
                      value: listing.bathrooms || "—",
                    },
                    { icon: Square, label: "Талбай", value: `${area}м²` },
                    {
                      icon: Eye,
                      label: "Үзэлт",
                      value: listing.view_count || 0,
                    },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <Icon size={16} className="text-brand-500" />
                      <div className="text-sm font-bold text-gray-800">
                        {value}
                      </div>
                      <div className="text-[11px] text-gray-400">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Description */}
                {listing.description && (
                  <div>
                    <p className="label">Тайлбар</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {listing.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Amenities */}
              {amenities.length > 0 && (
                <div className="card p-6">
                  <p className="label mb-3">Тохижилт</p>
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((a: string) => (
                      <span
                        key={a}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-100 rounded-xl text-xs font-medium"
                      >
                        <CheckCircle2 size={12} /> {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="card p-6">
                  <p className="label mb-3 flex items-center gap-1.5">
                    <Tag size={12} /> Шошгонууд
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t: string) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT — Admin panel */}
            <div className="space-y-4">
              {/* Status control */}
              <div className="card p-5">
                <p className="label mb-3 flex items-center gap-1.5">
                  <Shield size={12} /> Зарын статус
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <span className={st.cls}>{st.label}</span>
                </div>
                <div className="relative">
                  <select
                    value={listing.status}
                    disabled={updating}
                    onChange={(e) => updateStatus(e.target.value)}
                    className="input text-sm appearance-none pr-8 font-medium cursor-pointer"
                  >
                    <option value="pending">⏳ Хүлээгдэж байна</option>
                    <option value="active">✅ Идэвхжүүлэх</option>
                    <option value="rejected">❌ Татгалзах</option>
                    <option value="inactive">🔒 Идэвхгүй болгох</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
                {updating && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Loader2 size={12} className="animate-spin" />
                    Хадгалж байна...
                  </div>
                )}
              </div>

              {/* Owner info */}
              <div className="card p-5">
                <p className="label mb-3 flex items-center gap-1.5">
                  <User size={12} /> Зар оруулагч
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold">
                    {listing.owner_name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">
                      {listing.owner_name || "Тодорхойгүй"}
                    </div>
                    {listing.owner_phone && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 font-mono mt-0.5">
                        <Phone size={11} /> {listing.owner_phone}
                      </div>
                    )}
                  </div>
                </div>
                {listing.phone && listing.phone !== listing.owner_phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
                    <Phone size={12} className="text-brand-500" />
                    <span className="font-mono">{listing.phone}</span>
                  </div>
                )}
              </div>

              {/* Meta info */}
              <div className="card p-5">
                <p className="label mb-3">Мэдээлэл</p>
                <div className="space-y-3">
                  {[
                    {
                      icon: Calendar,
                      label: "Огноо",
                      value: new Date(listing.created_at).toLocaleDateString(
                        "mn-MN",
                        { year: "numeric", month: "long", day: "numeric" },
                      ),
                    },
                    {
                      icon: Home,
                      label: "Ангилал",
                      value: listing.category_name || "—",
                    },
                    {
                      icon: Eye,
                      label: "Үзэлт",
                      value: `${listing.view_count || 0} удаа`,
                    },
                    {
                      icon: Star,
                      label: "Үнэлгээ",
                      value:
                        rating > 0
                          ? `${rating.toFixed(1)} ⭐`
                          : "Үнэлгээ байхгүй",
                    },
                    {
                      icon: Clock,
                      label: "Check-in",
                      value: listing.checkin_time || "14:00",
                    },
                    {
                      icon: Clock,
                      label: "Check-out",
                      value: listing.checkout_time || "12:00",
                    },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Icon size={12} className="text-gray-400" />
                        {label}
                      </div>
                      <div className="text-xs font-semibold text-gray-700 text-right">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prices */}
              {(listing.price_per_week ||
                listing.price_per_month ||
                listing.deposit) && (
                <div className="card p-5">
                  <p className="label mb-3">Үнийн мэдээлэл</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">1 өдөр</span>
                      <span className="font-bold text-brand-600 font-mono">
                        {price}₮
                      </span>
                    </div>
                    {listing.price_per_week && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">7 хоног</span>
                        <span className="font-bold text-gray-800 font-mono">
                          {parseFloat(
                            String(listing.price_per_week),
                          ).toLocaleString()}
                          ₮
                        </span>
                      </div>
                    )}
                    {listing.price_per_month && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">30 хоног</span>
                        <span className="font-bold text-gray-800 font-mono">
                          {parseFloat(
                            String(listing.price_per_month),
                          ).toLocaleString()}
                          ₮
                        </span>
                      </div>
                    )}
                    {listing.deposit && (
                      <div className="flex justify-between text-xs pt-2 border-t border-gray-100">
                        <span className="text-gray-500">Баталгааны мөнгө</span>
                        <span className="font-bold text-blue-600 font-mono">
                          {parseFloat(String(listing.deposit)).toLocaleString()}
                          ₮
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Зарын багц */}
              <div className="card p-5">
                <p className="label mb-3">Зарын багц</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Төрөл</span>
                    {listing.listing_type === "vip" ? (
                      <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs font-bold">
                        ⭐ VIP
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-full text-xs font-semibold">
                        Энгийн
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Хугацаа</span>
                    <span className="font-semibold text-gray-700">
                      {listing.package_days || 7} хоног
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Төлсөн дүн</span>
                    <span className="font-bold font-mono text-brand-600">
                      {(listing.paid_amount || 0).toLocaleString()}₮
                    </span>
                  </div>
                  {listing.expires_at &&
                    (() => {
                      const days = Math.ceil(
                        (new Date(listing.expires_at).getTime() - Date.now()) /
                          86400000,
                      );
                      const expired = days <= 0;
                      const urgent = days > 0 && days <= 3;
                      return (
                        <div
                          className={clsx(
                            "flex justify-between items-center text-xs pt-2 border-t border-gray-100",
                          )}
                        >
                          <span className="text-gray-500">Дуусах огноо</span>
                          <span
                            className={clsx(
                              "font-semibold px-2 py-0.5 rounded-full text-[11px]",
                              expired
                                ? "bg-red-50 text-red-600"
                                : urgent
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-emerald-50 text-emerald-700",
                            )}
                          >
                            {expired
                              ? "Дууссан"
                              : urgent
                                ? `${days} хоног үлдсэн`
                                : `${days} хоног үлдсэн`}
                          </span>
                        </div>
                      );
                    })()}
                </div>
              </div>

              {/* Danger zone */}
              <div className="card p-5 border-red-100">
                <p className="label mb-3 text-red-400">Аюулын бүс</p>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl border border-red-100 transition-all"
                >
                  {deleting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  {deleting ? "Устгаж байна..." : "Зарыг устгах"}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
