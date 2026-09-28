import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FileUp, Plus, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/store/useAppStore'
import { cn, formatRupiah } from '@/lib/utils'
import type { DisbursementEntry } from '@/types'

type DisbType = 'new' | 'revolving'

function sumEntries(entries: DisbursementEntry[] | undefined): number {
  return entries?.reduce((s, e) => s + e.nominal, 0) ?? 0
}

export default function RealisasiDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const pipeline = useAppStore((s) => s.pipelines.find((p) => p.id === id))
  const addDisbursementMonth = useAppStore((s) => s.addDisbursementMonth)
  const addDisbursementEntry = useAppStore((s) => s.addDisbursementEntry)
  const removeDisbursementEntry = useAppStore((s) => s.removeDisbursementEntry)

  const [openCell, setOpenCell] = useState<string | null>(null)
  const [nominalInput, setNominalInput] = useState('')
  const [fileInput, setFileInput] = useState('')
  const [newMonthName, setNewMonthName] = useState('')
  const [saved, setSaved] = useState(false)

  if (!pipeline) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Pipeline tidak ditemukan.</p>
        <Button variant="outline" onClick={() => navigate('/input-realisasi')}>
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
      </div>
    )
  }

  const defaultMonths = ['September', 'Oktober', 'November']
  const existingMonths = Object.keys(pipeline.disbursements)
  const months = Array.from(new Set([...defaultMonths, ...existingMonths]))

  const grandTotal = months.reduce((sum, m) => {
    const monthData = pipeline.disbursements[m]
    return sum + sumEntries(monthData?.new) + sumEntries(monthData?.revolving)
  }, 0)

  function cellKey(month: string, type: DisbType) {
    return `${month}-${type}`
  }

  function openAddForm(month: string, type: DisbType) {
    setOpenCell(cellKey(month, type))
    setNominalInput('')
    setFileInput('')
  }

  function handleAddEntry(month: string, type: DisbType) {
    const nominal = Number(nominalInput.replace(/[^0-9]/g, ''))
    if (!nominal || nominal <= 0) {
      alert('Nominal wajib diisi dengan angka lebih dari 0.')
      return
    }
    if (!pipeline!.disbursements[month]) addDisbursementMonth(pipeline!.id, month)
    addDisbursementEntry(pipeline!.id, month, type, nominal, fileInput || undefined)
    setOpenCell(null)
    setNominalInput('')
    setFileInput('')
  }

  function handleAddMonth() {
    const name = newMonthName.trim()
    if (!name) return
    addDisbursementMonth(pipeline!.id, name)
    setNewMonthName('')
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => navigate('/input-realisasi')}>
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <h1 className="text-2xl font-bold text-foreground">
          Input Pencairan — {pipeline.namaEntitas} <span className="text-muted-foreground">({pipeline.code})</span>
        </h1>
      </div>

      {saved && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">Data pencairan berhasil disimpan.</div>}

      <Card>
        <CardHeader>
          <CardTitle>Data Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Code" value={pipeline.code} />
          <Field label="Nama Entitas" value={pipeline.namaEntitas} />
          <Field label="Fasilitas" value={pipeline.fasilitas} />
          <Field label="Batch" value={pipeline.batch} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Pencairan per Bulan</CardTitle>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Nama bulan baru, mis. Desember"
              value={newMonthName}
              onChange={(e) => setNewMonthName(e.target.value)}
              className="h-9 w-56"
            />
            <Button size="sm" variant="outline" onClick={handleAddMonth}>
              <Plus className="h-3.5 w-3.5" />
              Tambah Bulan
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {months.map((month) => {
            const monthData = pipeline.disbursements[month]
            return (
              <div key={month} className="space-y-3 rounded-xl border border-border/60 p-4">
                <div className="text-sm font-semibold text-foreground">{month}</div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {(['new', 'revolving'] as DisbType[]).map((type) => {
                    const entries = monthData?.[type] ?? []
                    const key = cellKey(month, type)
                    return (
                      <div key={type} className="space-y-2 rounded-lg bg-secondary/40 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {type === 'new' ? 'New' : 'Revolving'}
                          </span>
                          <span className="text-xs font-semibold tabular-nums">{formatRupiah(sumEntries(entries))}</span>
                        </div>

                        <div className="space-y-1.5">
                          {entries.length === 0 && <p className="text-xs text-muted-foreground">Belum ada entri pencairan.</p>}
                          {entries.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-1.5 text-xs shadow-sm">
                              <div className="min-w-0">
                                <div className="font-semibold tabular-nums">{formatRupiah(entry.nominal)}</div>
                                <div className="truncate text-muted-foreground">{entry.fileName ?? 'Tanpa file'}</div>
                              </div>
                              <button
                                onClick={() => removeDisbursementEntry(pipeline.id, month, type, entry.id)}
                                className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {openCell === key ? (
                          <div className="space-y-2 rounded-lg border border-dashed border-border p-2.5">
                            <Input
                              type="number"
                              placeholder="Nominal (Rp)"
                              value={nominalInput}
                              onChange={(e) => setNominalInput(e.target.value)}
                              className="h-8 text-xs"
                            />
                            <label className="block">
                              <Button asChild size="sm" variant="outline" className="w-full">
                                <span>
                                  <FileUp className="h-3.5 w-3.5" />
                                  {fileInput || 'Choose File'}
                                </span>
                              </Button>
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => setFileInput(e.target.files?.[0]?.name ?? '')}
                              />
                            </label>
                            <div className="flex gap-2">
                              <Button size="sm" className="flex-1" onClick={() => handleAddEntry(month, type)}>
                                Tambah
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setOpenCell(null)}>
                                Batal
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" className="w-full" onClick={() => openAddForm(month, type)}>
                            <Plus className="h-3.5 w-3.5" />
                            Tambah Pencairan
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardContent className={cn('flex items-center justify-between p-6')}>
          <span className="text-sm font-semibold text-foreground">Total Keseluruhan Pencairan</span>
          <span className="text-xl font-bold text-primary">{formatRupiah(grandTotal)}</span>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4" />
          Simpan
        </Button>
      </div>
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
