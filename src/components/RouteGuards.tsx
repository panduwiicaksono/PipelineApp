import { Navigate, Outlet } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import type { Role } from '@/types'

export function RequireAuth() {
  const currentUser = useAppStore((s) => s.currentUser)
  if (!currentUser) return <Navigate to="/login" replace />
  return <Outlet />
}

export function RequireRole({ allowed }: { allowed: Role[] }) {
  const currentUser = useAppStore((s) => s.currentUser)
  if (!currentUser) return <Navigate to="/login" replace />
  if (!allowed.includes(currentUser.role)) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
