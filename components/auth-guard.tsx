"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getToken, getAdmin } from "@/lib/api"

export function AuthGuard({ children, requireRole }: { children: React.ReactNode; requireRole?: string }) {
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    const token = getToken()
    const admin = getAdmin()
    if (!token || !admin) { router.replace("/login"); return }
    if (requireRole && admin.role !== requireRole) { router.replace("/"); return }
    setOk(true)
  }, [router, requireRole])

  if (!ok) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Ачааллаж байна...</p>
      </div>
    </div>
  )
  return <>{children}</>
}
