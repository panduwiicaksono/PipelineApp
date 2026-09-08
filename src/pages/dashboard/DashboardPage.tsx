import { useAppStore } from '@/store/useAppStore'
import AdminDashboard from './AdminDashboard'
import ReviewerDashboard from './ReviewerDashboard'

export default function DashboardPage() {
  const currentUser = useAppStore((s) => s.currentUser)
  if (!currentUser) return null
  if (currentUser.role === 'admin') return <AdminDashboard />
  return <ReviewerDashboard role={currentUser.role} />
}
