import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Download, Rocket, Landmark, History as HistoryIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ChecklistSectionView } from '@/components/ChecklistSectionView'
import { AdminScoredSection } from '@/components/AdminScoredSection'
import { ProgressSummaryCard } from '@/components/ProgressSummaryCard'
import { useAppStore } from '@/store/useAppStore'
import { allItemsHaveStatus, computeProgress, computeSkorPoints } from '@/lib/checklist'
import { formatDateID } from '@/lib/utils'
import { ROLE_LABEL, type PipelineStatus } from '@/types'

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

export default function PipelineDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const pipeline = useAppStore((s) => s.pipelines.find((p) => p.id === id))
  const setItemFile = useAppStore((s) => s.setItemFile)
  const releasePipeline = useAppStore((s) => s.releasePipeline)
  const addSlikRow = useAppStore((s) => s.addSlikRow)
  const addSlikRows = useAppStore((s) => s.addSlikRows)
  const updateSlikRow = useAppStore((s) => s.updateSlikRow)
  const removeSlikRow = useAppStore((s) => s.removeSlikRow)

  const [showReleaseDialog, setShowReleaseDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showReleasedToast, setShowReleasedToast] = useState(false)

  if (!pipeline) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Pipeline tidak ditemukan.</p>
        <Button variant="outline" onClick={() => navigate('/pipeline')}>
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
      </div>
    )
  }

  const summary = computeProgress(pipeline.checklist)
  const score = computeSkorPoints(pipeline.checklist)
  const status = deriveStatus(summary.total, pipeline.released)
  const canRelease = summary.total >= 90 && !pipeline.released
  const canExport = allItemsHaveStatus(pipeline.checklist)
  const slikItem = pipeline.checklist.find((i) => i.section === 'inisiasi' && i.adminScored && i.label === 'SLIK')
  const apuPptItem = pipeline.checklist.find((i) => i.section === 'inisiasi' && i.adminScored && i.label === 'APU PPT')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => navigate('/pipeline')}>
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {pipeline.namaEntitas} <span className="text-muted-foreground">— {pipeline.code}</span>
          </h1>
        </div>
        <Badge variant={STATUS_VARIANT[status]} className="text-sm">
          {status}
        </Badge>
      </div>

      {showReleasedToast && (
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Pipeline berhasil di-release.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Data Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Nomor" value={String(pipeline.nomor)} />
          <Field label="Code" value={pipeline.code} />
          <Field label="Tanggal" value={formatDateID(pipeline.tanggal)} />
          <Field label="Due Date" value={formatDateID(pipeline.dueDate)} />
          <Field label="Nama Entitas" value={pipeline.namaEntitas} />
          <Field label="Keterangan" value={pipeline.keterangan} />
          <Field label="Fasilitas" value={pipeline.fasilitas} />
          <Field label="Batch" value={pipeline.batch} />
        </CardContent>
      </Card>

      <AdminScoredSection
        slikItem={slikItem}
        apuPptItem={apuPptItem}
        onChooseFile={(itemId, fileName) => setItemFile(pipeline.id, itemId, fileName)}
        slikRows={pipeline.slikRows}
        onAddSlikRow={(row) => addSlikRow(pipeline.id, row)}
        onUpdateSlikRow={(rowId, patch) => updateSlikRow(pipeline.id, rowId, patch)}
        onRemoveSlikRow={(rowId) => removeSlikRow(pipeline.id, rowId)}
        onBulkImportSlikRows={(rows) => addSlikRows(pipeline.id, rows)}
      />

      <ChecklistSectionView
        items={pipeline.checklist}
        mode="readonly"
        onReviseFile={(itemId, fileName) => setItemFile(pipeline.id, itemId, fileName)}
      />

      <ProgressSummaryCard summary={summary} score={score} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Landmark className="h-4 w-4" />
            Asset Under Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pipeline.assetsUnderManagement.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada aset yang dijaminkan.</p>
          ) : (
            <ul className="divide-y divide-border/60 rounded-xl border border-border/60">
              {pipeline.assetsUnderManagement.map((a) => (
                <li key={a.id} className="flex items-center justify-between p-3 text-sm">
                  <span className="font-medium text-foreground">{a.nama}</span>
                  <span className="text-xs text-muted-foreground">{a.jenisDokumen}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HistoryIcon className="h-4 w-4" />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pipeline.activityLog.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada aktivitas.</p>
          ) : (
            <ul className="divide-y divide-border/60 rounded-xl border border-border/60">
              {pipeline.activityLog.map((entry) => (
                <li key={entry.id} className="p-3 text-sm">
                  <span className="font-medium text-foreground">{entry.aktor}</span>{' '}
                  <span className="text-xs text-muted-foreground">({ROLE_LABEL[entry.aktorRole]})</span> {entry.aksi}
                  <span className="ml-2 text-xs text-muted-foreground">— {entry.waktuRelatif}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aksi</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button disabled={!canRelease} onClick={() => setShowReleaseDialog(true)}>
            <Rocket className="h-4 w-4" />
            Release
          </Button>
          <Button variant="outline" disabled={!canExport} onClick={() => setShowExportDialog(true)}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          {!canRelease && !pipeline.released && (
            <p className="flex items-center text-xs text-muted-foreground">Total Progress harus mencapai minimal 90% untuk bisa di-release.</p>
          )}
          {!canExport && (
            <p className="flex items-center text-xs text-muted-foreground">Semua item checklist harus memiliki status untuk bisa export.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={showReleaseDialog} onOpenChange={setShowReleaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Release</DialogTitle>
            <DialogDescription>Pipeline ini akan ditandai "Released" dan bisa diinput pencairannya di menu Input Realisasi.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReleaseDialog(false)}>
              Batal
            </Button>
            <Button
              onClick={() => {
                releasePipeline(pipeline.id)
                setShowReleaseDialog(false)
                setShowReleasedToast(true)
                setTimeout(() => setShowReleasedToast(false), 3000)
              }}
            >
              Ya, Release
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Dokumen Ringkasan Review</DialogTitle>
            <DialogDescription>
              Fitur ini akan terhubung ke template & backend di tahap berikutnya. Untuk saat ini, export belum menghasilkan file sungguhan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowExportDialog(false)}>Mengerti</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} disabled />
    </div>
  )
}
