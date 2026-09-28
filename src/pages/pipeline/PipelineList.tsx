import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Plus, Eye, Rocket, Download, PartyPopper, ClipboardCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { useAppStore } from '@/store/useAppStore'
import { allItemsHaveStatus, computeProgress, computeSkorPoints, formatSkorPoin } from '@/lib/checklist'
import { formatDateID } from '@/lib/utils'
import type { PipelineStatus } from '@/types'

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

export default function PipelineList() {
  const navigate = useNavigate()
  const pipelines = useAppStore((s) => s.pipelines)
  const releasePipeline = useAppStore((s) => s.releasePipeline)
  const [exportTarget, setExportTarget] = useState<string | null>(null)
  const [releaseTarget, setReleaseTarget] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data Pipeline</h1>
          <p className="text-sm text-muted-foreground">Kelola seluruh pipeline pembiayaan yang sedang berjalan.</p>
        </div>
        <Button onClick={() => navigate('/pipeline/new')}>
          <Plus className="h-4 w-4" />
          Tambah Pipeline
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Nama Entitas</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Fasilitas</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="min-w-[160px]">Total Progress</TableHead>
                <TableHead>Skor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pipelines.map((p) => {
                const progress = computeProgress(p.checklist)
                const status = deriveStatus(progress.total, p.released)
                const canRelease = progress.total >= 90 && !p.released
                const canExport = allItemsHaveStatus(p.checklist)
                const score = computeSkorPoints(p.checklist)
                return (
                  <TableRow key={p.id}>
                    <TableCell>{p.nomor}</TableCell>
                    <TableCell className="font-medium">{p.code}</TableCell>
                    <TableCell>{p.namaEntitas}</TableCell>
                    <TableCell className="max-w-[160px] truncate">{p.keterangan}</TableCell>
                    <TableCell>{p.fasilitas}</TableCell>
                    <TableCell>{p.batch}</TableCell>
                    <TableCell>{formatDateID(p.tanggal)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={progress.total} className="w-24" />
                        <span className="text-xs font-semibold tabular-nums">{progress.total}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{formatSkorPoin(score.total, score.totalMax)}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => navigate(`/pipeline/${p.id}`)}>
                          <Eye className="h-3.5 w-3.5" />
                          Detail
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/pipeline/${p.id}/review-fase1`)}>
                          <ClipboardCheck className="h-3.5 w-3.5" />
                          Review
                        </Button>
                        <Button size="sm" variant="outline" disabled={!canRelease} onClick={() => setReleaseTarget(p.id)}>
                          <Rocket className="h-3.5 w-3.5" />
                          Release
                        </Button>
                        <Button size="sm" variant="outline" disabled={!canExport} onClick={() => setExportTarget(p.id)}>
                          <Download className="h-3.5 w-3.5" />
                          Export
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!releaseTarget} onOpenChange={(open) => !open && setReleaseTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-primary" /> Release Pipeline
            </DialogTitle>
            <DialogDescription>Pipeline ini akan ditandai sebagai "Released" dan siap masuk ke menu Input Realisasi.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReleaseTarget(null)}>
              Batal
            </Button>
            <Button
              onClick={() => {
                if (releaseTarget) releasePipeline(releaseTarget)
                setReleaseTarget(null)
              }}
            >
              Ya, Release
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!exportTarget} onOpenChange={(open) => !open && setExportTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Dokumen Ringkasan Review</DialogTitle>
            <DialogDescription>
              Fitur ini akan terhubung ke template & backend di tahap berikutnya. Untuk saat ini, export belum menghasilkan file sungguhan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setExportTarget(null)}>Mengerti</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
