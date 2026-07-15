import { Navigate, useLocation } from 'react-router-dom'
import { useDemoSession } from '@/hooks/useDemoSession'
import { isPortalAuthenticated } from '@/lib/authGate'

type Props = {
  children: React.ReactNode
  /** partner = any logged-in portal user; staff = admin OS */
  role?: 'partner' | 'staff'
}

/**
 * Blocks unauthenticated access. Redirects to /login with return path.
 * Staff routes reject pure partner sessions.
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
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (role === 'staff' && session.role !== 'staff') {
    return <Navigate to="/portal" replace />
  }

  return <>{children}</>
}
