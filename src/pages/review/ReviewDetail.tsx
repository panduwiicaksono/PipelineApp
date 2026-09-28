import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FileCheck2, Save, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LikertSelector } from '@/components/LikertSelector'
import { StatusBadge } from '@/components/ChecklistSectionView'
import { ProgressSummaryCard } from '@/components/ProgressSummaryCard'
import { useAppStore } from '@/store/useAppStore'
import { computeProgress, computeSkorPoints, formatPoin, formatSkorPoin } from '@/lib/checklist'
import { computeFase1, FASE1_LOCK_MESSAGE } from '@/lib/fase1'
import { formatDateID } from '@/lib/utils'
import { SECTION_ORDER, SECTION_TITLES } from '@/components/ChecklistSectionView'
import type { ChecklistSection, Likert, ReviewRole } from '@/types'

interface EditState {
  likert: Likert | null
  notes: string
  remarks: string
}

export default function ReviewDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const currentUser = useAppStore((s) => s.currentUser)
  const pipeline = useAppStore((s) => s.pipelines.find((p) => p.id === id))
  const applyReviewUpdates = useAppStore((s) => s.applyReviewUpdates)
  const role = currentUser?.role as ReviewRole

  // SLIK & APU PPT dikecualikan — dinilai langsung oleh Admin (06-update-round2 poin 7).
  const scopedItems = useMemo(() => pipeline?.checklist.filter((i) => i.reviewRole === role && !i.adminScored) ?? [], [pipeline, role])

  const [edits, setEdits] = useState<Record<string, EditState>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const initial: Record<string, EditState> = {}
    scopedItems.forEach((item) => {
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
        <Button variant="outline" onClick={() => navigate('/review')}>
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
      </div>
    )
  }

  const fase1 = computeFase1(pipeline.checklist)

  if (!fase1.passed) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate('/review')}>
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <ShieldAlert className="h-8 w-8 text-amber-500" />
            <p className="text-sm font-semibold text-foreground">Pipeline ini masih terkunci</p>
            <p className="max-w-sm text-sm text-muted-foreground">{FASE1_LOCK_MESSAGE}</p>
            <p className="text-xs text-muted-foreground">
              Skor Fase 1 saat ini: {formatSkorPoin(fase1.points, fase1.maxPoints)}
              {fase1.hasRedFlag && ' (ada nilai merah)'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const summary = computeProgress(pipeline.checklist)
  const score = computeSkorPoints(pipeline.checklist)

  const grouped = new Map<ChecklistSection, Map<string, typeof scopedItems>>()
  for (const section of SECTION_ORDER) grouped.set(section, new Map())
  for (const item of scopedItems) {
    const groups = grouped.get(item.section)!
    if (!groups.has(item.group)) groups.set(item.group, [])
    groups.get(item.group)!.push(item)
  }

  function updateEdit(itemId: string, patch: Partial<EditState>) {
    setEdits((prev) => ({ ...prev, [itemId]: { ...prev[itemId], ...patch } }))
  }

  function handleSave() {
    const updates = scopedItems.map((item) => ({
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
        <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => navigate('/review')}>
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <h1 className="text-2xl font-bold text-foreground">
          {pipeline.namaEntitas} <span className="text-muted-foreground">— {pipeline.code}</span>
        </h1>
        <p className="text-sm text-muted-foreground">Review dokumen sesuai scope Anda. Skor pakai Likert 1 (Sangat Kurang) — 5 (Sangat Baik).</p>
      </div>

      {saved && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">Review berhasil disimpan.</div>}

      <Card>
        <CardHeader>
          <CardTitle>Data Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Code" value={pipeline.code} />
          <Field label="Nama Entitas" value={pipeline.namaEntitas} />
          <Field label="Fasilitas" value={pipeline.fasilitas} />
          <Field label="Batch" value={pipeline.batch} />
          <Field label="Tanggal" value={formatDateID(pipeline.tanggal)} />
        </CardContent>
      </Card>

      {scopedItems.length === 0 && (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Tidak ada item checklist dalam scope role Anda untuk pipeline ini.</CardContent>
        </Card>
      )}

      {SECTION_ORDER.map((section) => {
        const groups = grouped.get(section)
        if (!groups || groups.size === 0) return null
        return (
          <Card key={section}>
            <CardHeader>
              <CardTitle className="text-base">{SECTION_TITLES[section]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Array.from(groups.entries()).map(([groupName, items]) => (
                <div key={groupName} className="space-y-3">
                  <div className="text-sm font-semibold text-foreground/80">{groupName}</div>
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
                            <span className={cnFileText(hasFile)}>
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
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}

      <ProgressSummaryCard summary={summary} score={score} />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={scopedItems.length === 0}>
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

function cnFileText(hasFile: boolean) {
  return hasFile ? 'flex items-center gap-1.5 text-xs text-foreground' : 'flex items-center gap-1.5 text-xs font-semibold text-destructive'
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} disabled />
    </div>
  )
}
