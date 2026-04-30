"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, FileText, Wrench, ShoppingBag,
  Users, LogOut, ChevronRight, Tent, Star,
} from "lucide-react"
import { clearSession, getAdmin } from "@/lib/api"
import { clsx } from "clsx"

const navItems = [
  { href: "/",         icon: LayoutDashboard, label: "Самбар",      color: "text-violet-600",  bg: "bg-violet-50" },
  { href: "/listings", icon: FileText,        label: "Зарууд",      color: "text-blue-600",    bg: "bg-blue-50"   },
  { href: "/services", icon: Wrench,          label: "Үйлчилгээ",   color: "text-emerald-600", bg: "bg-emerald-50"},
  { href: "/products", icon: ShoppingBag,     label: "Дэлгүүр",     color: "text-amber-600",   bg: "bg-amber-50"  },
  { href: "/users",    icon: Users,           label: "Хэрэглэгчид", color: "text-rose-600",    bg: "bg-rose-50"   },
]

export function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const admin    = getAdmin()

  const logout = () => { clearSession(); router.push("/login") }

  const initials = admin?.name?.split(" ").map((n: string) => n[0]).join("").slice(0,2).toUpperCase() || "A"

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-white border-r border-gray-100 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
            <Tent size={18} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 tracking-tight">Зуслан</div>
            <div className="text-[10px] font-mono text-gray-400 tracking-widest uppercase">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-3">Үндсэн цэс</div>
        {navItems.map(({ href, icon: Icon, label, color, bg }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <div className={clsx(
                "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                active ? "bg-brand-100" : `${bg} group-hover:scale-110`
              )}>
                <Icon size={14} className={active ? "text-brand-600" : color} />
              </div>
              <span className={clsx("text-sm font-medium flex-1", active ? "text-brand-700" : "")}>
                {label}
              </span>
              {active && <ChevronRight size={14} className="text-brand-500" />}
            </Link>
          )
        })}
      </nav>

      {/* User card */}
      <div className="p-3 border-t border-gray-50">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-gray-900 truncate">{admin?.name || "Admin"}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <Star size={10} className="text-amber-500 fill-amber-500" />
              <span className="text-[10px] text-amber-600 font-semibold">
                {admin?.role === "super_admin" ? "Super Admin" : "Admin"}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium"
        >
          <LogOut size={13} />
          Гарах
        </button>
      </div>
    </aside>
  )
}
