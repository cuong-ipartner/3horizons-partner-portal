import { useEffect, useState } from 'react'
import { useSeedData, config } from '@/lib/config'
import { isAuthLocalFallback } from '@/lib/auth'

/** Seed mode and/or local-auth fallback strip. */
export function DemoModeBanner() {
  const seed = useSeedData()
  const [localAuth, setLocalAuth] = useState(false)

  useEffect(() => {
    setLocalAuth(isAuthLocalFallback())
    const onUpd = () => setLocalAuth(isAuthLocalFallback())
    window.addEventListener('3h-session-updated', onUpd)
    window.addEventListener('storage', onUpd)
    return () => {
      window.removeEventListener('3h-session-updated', onUpd)
      window.removeEventListener('storage', onUpd)
    }
  }, [])

  if (!seed && !localAuth) return null

  if (localAuth) {
    return (
      <div className="border-b border-amber-500/30 bg-amber-50 px-3 py-1.5 text-center text-[10px] font-medium tracking-wide text-amber-950 sm:text-[11px]">
        Phiên local — UI demo · PDF Storage & dữ liệu RLS cần đăng nhập Supabase Auth (không spam login khi rate limit)
      </div>
    )
  }

  return (
    <div className="border-b border-espresso-900/10 bg-espresso-900 px-3 py-1.5 text-center text-[10px] font-medium tracking-wide text-cream-200/80 sm:text-[11px]">
      Demo seed · {config.targetDomain}
    </div>
  )
}
