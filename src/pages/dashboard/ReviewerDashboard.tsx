import { FolderKanban, CheckCircle2, Clock, FileClock, FileCheck, Gauge } from 'lucide-react'
import { KpiCard } from '@/components/KpiCard'
import { useAppStore } from '@/store/useAppStore'
import { formatSkorPoin, scopeMaxPoints, scopePoints } from '@/lib/checklist'
import { ROLE_LABEL, type ReviewRole } from '@/types'

export default function ReviewerDashboard({ role }: { role: ReviewRole }) {
  const pipelines = useAppStore((s) => s.pipelines)

  const totalPipeline = pipelines.length
  let pipelineReviewed = 0
  let pipelineNotReviewed = 0
  let docsWaiting = 0
  let docsReviewed = 0
  let pointsSum = 0

  for (const p of pipelines) {
    // Item SLIK & APU PPT (adminScored) dikecualikan dari scope role manapun karena dinilai
    // langsung oleh Admin Investasi/Administrator (06-update-round2 poin 7).
    const scoped = p.checklist.filter((i) => i.reviewRole === role && !i.adminScored)
    const waiting = scoped.filter((i) => i.status === null).length
    docsWaiting += waiting
    docsReviewed += scoped.length - waiting
    if (waiting === 0) pipelineReviewed += 1
    else pipelineNotReviewed += 1
    pointsSum += scopePoints(p.checklist, role)
  }

  const scopeMax = scopeMaxPoints(role)
  const rataRataSkor = pipelines.length > 0 ? pointsSum / pipelines.length : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard {ROLE_LABEL[role]}</h1>
        <p className="text-sm text-muted-foreground">Ringkasan progres review dokumen sesuai scope Anda.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard icon={FolderKanban} title="Total Pipeline" value={String(totalPipeline)} tone="dark" />
        <KpiCard icon={CheckCircle2} title="Pipeline Sudah Direview" value={String(pipelineReviewed)} tone="mint" />
        <KpiCard icon={Clock} title="Pipeline Belum Direview" value={String(pipelineNotReviewed)} tone="pink" />
        <KpiCard icon={FileClock} title="Dokumen Menunggu Review" value={String(docsWaiting)} tone="white" />
        <KpiCard icon={FileCheck} title="Dokumen Sudah Direview" value={String(docsReviewed)} tone="white" />
        <KpiCard icon={Gauge} title="Rata-rata Skor" value={formatSkorPoin(rataRataSkor, scopeMax)} tone="mint" />
      </div>
    </div>
  )
}
