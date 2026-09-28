import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth, RequireRole } from '@/components/RouteGuards'
import { AppLayout } from '@/components/layout/AppLayout'
import { ADMIN_ROLES } from '@/types'
import Login from '@/pages/Login'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import PipelineList from '@/pages/pipeline/PipelineList'
import PipelineNew from '@/pages/pipeline/PipelineNew'
import PipelineDetail from '@/pages/pipeline/PipelineDetail'
import Fase1Review from '@/pages/pipeline/Fase1Review'
import ReviewList from '@/pages/review/ReviewList'
import ReviewDetail from '@/pages/review/ReviewDetail'
import RealisasiList from '@/pages/realisasi/RealisasiList'
import RealisasiDetail from '@/pages/realisasi/RealisasiDetail'
import Portofolio from '@/pages/portofolio/Portofolio'
import ActivityLogPage from '@/pages/activitylog/ActivityLogPage'

const REVIEWER_ROLES = ['appraisal', 'investasi', 'legal', 'rm'] as const

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route element={<RequireRole allowed={ADMIN_ROLES} />}>
            <Route path="/pipeline" element={<PipelineList />} />
            <Route path="/pipeline/new" element={<PipelineNew />} />
            <Route path="/pipeline/:id" element={<PipelineDetail />} />
            <Route path="/pipeline/:id/review-fase1" element={<Fase1Review />} />
            <Route path="/portofolio" element={<Portofolio />} />
            <Route path="/input-realisasi" element={<RealisasiList />} />
            <Route path="/input-realisasi/:id" element={<RealisasiDetail />} />
            <Route path="/activity-log" element={<ActivityLogPage />} />
          </Route>

          <Route element={<RequireRole allowed={[...REVIEWER_ROLES]} />}>
            <Route path="/review" element={<ReviewList />} />
            <Route path="/review/:id" element={<ReviewDetail />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
