import { useNavigate } from 'react-router-dom'
import { FolderKanban, CheckCircle2, Clock, FileClock, FileCheck, Gauge, Eye } from 'lucide-react'
import { KpiCard } from '@/components/KpiCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAppStore } from '@/store/useAppStore'
import { computeProgress, computeSkorPoints, formatSkorPoin } from '@/lib/checklist'
import { formatDateID } from '@/lib/utils'
import { ROLE_LABEL, type Pipeline, type PipelineStatus } from '@/types'

function deriveStatus(totalProgress: number, released: boolean): PipelineStatus {
  if (released) return 'Released'
  if (totalProgress >= 90) return 'Siap Release'
  return 'Berjalan'
}

const STATUS_VARIANT: Record<PipelineStatus, 'secondary' | 'warning' | 'success'> = {
  Berjalan: 'secondary',
  'Siap Release': 'warning',
  Released: 'success',
}

// Dashboard baru khusus Admin Investasi & Administrator (06-update-round2 poin 3), MENGGANTIKAN
// konten lama yang sekarang dipindah ke menu "Portofolio". KPI 1-5 dihitung dari SEMUA pipeline
// (tidak di-scope per role), berbeda dengan dashboard reviewer yang di-scope per reviewRole.
export default function AdminInvestasiDashboard() {
  const navigate = useNavigate()
  const currentUser = useAppStore((s) => s.currentUser)
  const pipelines = useAppStore((s) => s.pipelines)

  const totalPipeline = pipelines.length
  let pipelineReviewed = 0
  let pipelineNotReviewed = 0
  let docsWaiting = 0
  let docsReviewed = 0

  for (const p of pipelines) {
    const waiting = p.checklist.filter((i) => i.status === null).length
    docsWaiting += waiting
    docsReviewed += p.checklist.length - waiting
    if (waiting === 0) pipelineReviewed += 1
    else pipelineNotReviewed += 1
  }

  const scoreByPipeline = new Map(pipelines.map((p) => [p.id, computeSkorPoints(p.checklist)]))
  const scoreMax = scoreByPipeline.values().next().value?.totalMax ?? 100
  const rataRataSkor =
    pipelines.length > 0 ? pipelines.reduce((sum, p) => sum + (scoreByPipeline.get(p.id)?.total ?? 0), 0) / pipelines.length : 0

  const jatuhTempo = [...pipelines].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 10)

  function progressOf(p: Pipeline) {
    return computeProgress(p.checklist).total
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard {currentUser ? ROLE_LABEL[currentUser.role] : ''}</h1>
        <p className="text-sm text-muted-foreground">Ringkasan progres & skor seluruh pipeline, serta jatuh tempo terdekat.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard icon={FolderKanban} title="Total Pipeline" value={String(totalPipeline)} tone="dark" />
        <KpiCard icon={CheckCircle2} title="Pipeline Sudah Direview" value={String(pipelineReviewed)} tone="mint" />
        <KpiCard icon={Clock} title="Pipeline Belum Direview" value={String(pipelineNotReviewed)} tone="pink" />
        <KpiCard icon={FileClock} title="Dokumen Menunggu Review" value={String(docsWaiting)} tone="white" />
        <KpiCard icon={FileCheck} title="Dokumen Sudah Direview" value={String(docsReviewed)} tone="white" />
        <KpiCard icon={Gauge} title="Rata-rata Skor" value={formatSkorPoin(rataRataSkor, scoreMax)} tone="mint" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline Jatuh Tempo Terdekat</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Nama Entitas</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Progress (%)</TableHead>
                <TableHead>Skor</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jatuhTempo.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.code}</TableCell>
                  <TableCell>{p.namaEntitas}</TableCell>
                  <TableCell>{formatDateID(p.dueDate)}</TableCell>
                  <TableCell>{progressOf(p)}%</TableCell>
                  <TableCell className="whitespace-nowrap">{formatSkorPoin(scoreByPipeline.get(p.id)?.total ?? 0, scoreMax)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/pipeline/${p.id}`)}>
                      <Eye className="h-3.5 w-3.5" />
                      Lihat Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress vs Skor per Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Nama Entitas</TableHead>
                <TableHead>Progress (%)</TableHead>
                <TableHead>Skor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pipelines.map((p) => {
                const progress = progressOf(p)
                const status = deriveStatus(progress, p.released)
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.code}</TableCell>
                    <TableCell>{p.namaEntitas}</TableCell>
                    <TableCell>{progress}%</TableCell>
                    <TableCell className="whitespace-nowrap">{formatSkorPoin(scoreByPipeline.get(p.id)?.total ?? 0, scoreMax)}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
