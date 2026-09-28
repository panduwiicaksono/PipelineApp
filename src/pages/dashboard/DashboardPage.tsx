import { useAppStore } from '@/store/useAppStore'
import { isAdminRole } from '@/types'
import AdminInvestasiDashboard from './AdminInvestasiDashboard'
import ReviewerDashboard from './ReviewerDashboard'

export default function DashboardPage() {
  const currentUser = useAppStore((s) => s.currentUser)
  if (!currentUser) return null
  if (isAdminRole(currentUser.role)) return <AdminInvestasiDashboard />
  return <ReviewerDashboard role={currentUser.role} />
}
