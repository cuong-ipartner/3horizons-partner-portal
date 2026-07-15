import { Navigate, useLocation } from 'react-router-dom'
import { useDemoSession } from '@/hooks/useDemoSession'
import { isPortalAuthenticated } from '@/lib/authGate'

type Props = {
  children: React.ReactNode
  /** partner = any logged-in portal user; staff = admin OS */
  role?: 'partner' | 'staff'
}

/**
 * Blocks unauthenticated access.
 * Staff → /admin/login · Partner → /login
 */
export function RequireAuth({ children, role = 'partner' }: Props) {
  const location = useLocation()
  const { session, sessionOrNull, ready } = useDemoSession()
  const authed = isPortalAuthenticated() && Boolean(sessionOrNull)

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-100 text-sm text-espresso-500">
        Đang xác thực phiên…
      </div>
    )
  }

  if (!authed) {
    const loginTo = role === 'staff' ? '/admin/login' : '/login'
    return <Navigate to={loginTo} replace state={{ from: location.pathname }} />
  }

  if (role === 'staff' && session.role !== 'staff') {
    // Partner accounts cannot open Admin OS
    return <Navigate to="/portal" replace />
  }

  // Staff may also open /portal (preview partner view) after admin login
  return <>{children}</>
}
