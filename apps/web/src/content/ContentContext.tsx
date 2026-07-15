import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { homePage, type HomePageContent } from '@/content/site-vi'

const STORAGE_KEY = '3h-partner-home-content-v1'
const ADMIN_KEY = '3h-admin-unlocked'

function loadHome(): HomePageContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(homePage)
    const parsed = JSON.parse(raw) as Partial<HomePageContent>
    const base = structuredClone(homePage)
    // Merge carefully so corrupted localStorage never nulls arrays (runtime crash)
    return {
      ...base,
      ...parsed,
      heroImage: { ...base.heroImage, ...(parsed.heroImage ?? {}) },
      benefitsImage: { ...base.benefitsImage, ...(parsed.benefitsImage ?? {}) },
      supportImage: { ...base.supportImage, ...(parsed.supportImage ?? {}) },
      networkBridge: { ...base.networkBridge, ...(parsed.networkBridge ?? {}) },
      closingCta: { ...base.closingCta, ...(parsed.closingCta ?? {}) },
      heroCtas: Array.isArray(parsed.heroCtas) && parsed.heroCtas.length ? parsed.heroCtas : base.heroCtas,
      partnerTypes:
        Array.isArray(parsed.partnerTypes) && parsed.partnerTypes.length
          ? parsed.partnerTypes
          : base.partnerTypes,
      benefits:
        Array.isArray(parsed.benefits) && parsed.benefits.length ? parsed.benefits : base.benefits,
      roles: Array.isArray(parsed.roles) && parsed.roles.length ? parsed.roles : base.roles,
      supportItems:
        Array.isArray(parsed.supportItems) && parsed.supportItems.length
          ? parsed.supportItems
          : base.supportItems,
      trustBadges:
        Array.isArray(parsed.trustBadges) && parsed.trustBadges.length
          ? parsed.trustBadges
          : base.trustBadges,
    }
  } catch {
    return structuredClone(homePage)
  }
}

function saveHome(data: HomePageContent) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

type ContentContextValue = {
  home: HomePageContent
  setHome: (next: HomePageContent) => void
  updateHome: (patch: Partial<HomePageContent>) => void
  resetHome: () => void
  isDirty: boolean
  isAdminUnlocked: boolean
  unlockAdmin: (password: string) => boolean
  lockAdmin: () => void
}

const ContentContext = createContext<ContentContextValue | null>(null)

export function ContentProvider({ children }: { children: ReactNode }) {
  const [home, setHomeState] = useState<HomePageContent>(() =>
    typeof window === 'undefined' ? structuredClone(homePage) : loadHome(),
  )
  const [isAdminUnlocked, setUnlocked] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(ADMIN_KEY) === '1'
  })

  const setHome = useCallback((next: HomePageContent) => {
    setHomeState(next)
    saveHome(next)
  }, [])

  const updateHome = useCallback((patch: Partial<HomePageContent>) => {
    setHomeState((prev) => {
      const next = { ...prev, ...patch }
      saveHome(next)
      return next
    })
  }, [])

  const resetHome = useCallback(() => {
    const fresh = structuredClone(homePage)
    setHomeState(fresh)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const unlockAdmin = useCallback((password: string) => {
    // Demo gate only — replace with real auth later
    if (password.trim() === '3horizons') {
      localStorage.setItem(ADMIN_KEY, '1')
      setUnlocked(true)
      return true
    }
    return false
  }, [])

  const lockAdmin = useCallback(() => {
    localStorage.removeItem(ADMIN_KEY)
    setUnlocked(false)
  }, [])

  const isDirty = useMemo(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) != null
    } catch {
      return false
    }
  }, [home])

  const value = useMemo(
    () => ({
      home,
      setHome,
      updateHome,
      resetHome,
      isDirty,
      isAdminUnlocked,
      unlockAdmin,
      lockAdmin,
    }),
    [home, setHome, updateHome, resetHome, isDirty, isAdminUnlocked, unlockAdmin, lockAdmin],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useSiteContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useSiteContent must be used within ContentProvider')
  return ctx
}
