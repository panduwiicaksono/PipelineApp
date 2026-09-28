import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FileCheck2, Save, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LikertSelector } from '@/components/LikertSelector'
import { StatusBadge } from '@/components/ChecklistSectionView'
import { useAppStore } from '@/store/useAppStore'
import { formatDateID, cn } from '@/lib/utils'
import { formatPoin, formatSkorPoin } from '@/lib/checklist'
import { computeFase1, FASE1_THRESHOLD_POINTS } from '@/lib/fase1'
import type { Likert } from '@/types'

interface EditState {
  likert: Likert | null
  notes: string
  remarks: string
}

// Halaman Review Fase 1 (khusus Admin Investasi/Administrator): menilai SLIK & APU PPT
// dengan skor Likert, terpisah dari halaman Add New/Detail Pipeline (yang sekarang cuma
// untuk isi data & upload file). Lihat 07-koreksi-skor-poin poin 4.
export default function Fase1Review() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const pipeline = useAppStore((s) => s.pipelines.find((p) => p.id === id))
  const applyReviewUpdates = useAppStore((s) => s.applyReviewUpdates)

  const items = useMemo(
    () => pipeline?.checklist.filter((i) => i.section === 'inisiasi' && i.adminScored) ?? [],
    [pipeline],
  )

  const [edits, setEdits] = useState<Record<string, EditState>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const initial: Record<string, EditState> = {}
    items.forEach((item) => {
      initial[item.id] = { likert: item.likert, notes: item.notes ?? '', remarks: item.remarks ?? '' }
    })
    setEdits(initial)
    setSaved(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

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

  const fase1 = computeFase1(pipeline.checklist)

  function updateEdit(itemId: string, patch: Partial<EditState>) {
    setEdits((prev) => ({ ...prev, [itemId]: { ...prev[itemId], ...patch } }))
  }

  function handleSave() {
    const updates = items.map((item) => ({
      itemId: item.id,
      likert: edits[item.id]?.likert ?? item.likert,
      notes: edits[item.id]?.notes ?? item.notes,
      remarks: edits[item.id]?.remarks ?? item.remarks,
    }))
    applyReviewUpdates(pipeline!.id, updates)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => navigate('/pipeline')}>
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <h1 className="text-2xl font-bold text-foreground">
          Review Fase 1 — {pipeline.namaEntitas} <span className="text-muted-foreground">({pipeline.code})</span>
        </h1>
        <p className="text-sm text-muted-foreground">Penilaian SLIK & APU PPT oleh Admin Investasi/Administrator.</p>
      </div>

      {saved && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">Review Fase 1 berhasil disimpan.</div>}

      <Card>
        <CardHeader>
          <CardTitle>Data Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Code" value={pipeline.code} />
          <Field label="Nama Entitas" value={pipeline.namaEntitas} />
          <Field label="Fasilitas" value={pipeline.fasilitas} />
          <Field label="Tanggal" value={formatDateID(pipeline.tanggal)} />
        </CardContent>
      </Card>

      <div
        className={cn(
          'flex flex-wrap items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium',
          fase1.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
        )}
      >
        {fase1.passed ? <ShieldCheck className="h-4 w-4 shrink-0" /> : <ShieldAlert className="h-4 w-4 shrink-0" />}
        <span>
          Skor Fase 1: {formatSkorPoin(fase1.points, fase1.maxPoints)} (ambang batas {FASE1_THRESHOLD_POINTS} poin)
          {fase1.hasRedFlag && ' — ada nilai merah'} — {fase1.passed ? 'LOLOS, role reviewer sudah bisa mulai review.' : 'BELUM lolos, role reviewer masih terkunci.'}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fase 1: SLIK & APU PPT</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => {
            const edit = edits[item.id] ?? { likert: item.likert, notes: item.notes ?? '', remarks: item.remarks ?? '' }
            const hasFile = !!item.fileName
            const remarksEnabled = hasFile && edit.likert !== null
            return (
              <div key={item.id} className="space-y-3 rounded-xl border border-border/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {item.label} <span className="text-xs font-normal text-muted-foreground">(maks. {formatPoin(item.maxPoints)} poin)</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={cn('flex items-center gap-1.5 text-xs', hasFile ? 'text-foreground' : 'font-semibold text-destructive')}>
                      {hasFile && <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />}
                      {hasFile ? item.fileName : 'Belum ada file dari admin'}
                    </span>
                    <StatusBadge status={edit.likert !== null ? deriveDisplayStatus(edit.likert) : null} />
                  </div>
                </div>

                <LikertSelector value={edit.likert} disabled={!hasFile} onChange={(v) => updateEdit(item.id, { likert: v })} />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Notes</Label>
                    <Textarea
                      disabled={!hasFile}
                      value={edit.notes}
                      onChange={(e) => updateEdit(item.id, { notes: e.target.value })}
                      placeholder="Catatan review..."
                      className="min-h-[70px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Remarks</Label>
                    <Textarea
                      disabled={!remarksEnabled}
                      value={edit.remarks}
                      onChange={(e) => updateEdit(item.id, { remarks: e.target.value })}
                      placeholder="Isi status dulu untuk menulis remarks"
                      className="min-h-[70px]"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4" />
          Simpan Review
        </Button>
      </div>
    </div>
  )
}

function deriveDisplayStatus(likert: Likert) {
  if (likert <= 2) return 'NO' as const
  if (likert === 3) return 'Revisi' as const
  return 'OK' as const
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} disabled />
    </div>
  )
}
