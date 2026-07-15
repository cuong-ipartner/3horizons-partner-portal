import { useSeedData, config } from '@/lib/config'

/**
 * Only shows when Supabase is not configured on the build.
 * Production builds with VITE_SUPABASE_* never show this.
 */
export function DemoModeBanner() {
  const seed = useSeedData()
  if (!seed) return null

  return (
    <div className="border-b border-terracotta-500/30 bg-terracotta-500/10 px-3 py-1.5 text-center text-[10px] font-medium tracking-wide text-terracotta-700 sm:text-[11px]">
      Cấu hình thiếu — cần VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY · {config.targetDomain}
    </div>
  )
}
