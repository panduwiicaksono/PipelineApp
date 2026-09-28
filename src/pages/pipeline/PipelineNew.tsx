import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChecklistSectionView } from '@/components/ChecklistSectionView'
import { AdminScoredSection } from '@/components/AdminScoredSection'
import { ProgressSummaryCard } from '@/components/ProgressSummaryCard'
import { useAppStore } from '@/store/useAppStore'
import { createChecklistTemplate, computeProgress, computeSkorPoints } from '@/lib/checklist'
import type { ChecklistItem, PipelineData, SlikRow } from '@/types'

let localSlikIdCounter = 0
function localSlikId() {
  localSlikIdCounter += 1
  return `local-slik-${localSlikIdCounter}`
}

export default function PipelineNew() {
  const navigate = useNavigate()
  const addPipeline = useAppStore((s) => s.addPipeline)

  const [data, setData] = useState<PipelineData>({
    code: '',
    tanggal: '',
    dueDate: '',
    namaEntitas: '',
    keterangan: '',
    fasilitas: '',
    batch: '',
  })
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => createChecklistTemplate())
  const [slikRows, setSlikRows] = useState<SlikRow[]>([])

  const summary = computeProgress(checklist)
  const score = computeSkorPoints(checklist)
  const slikItem = checklist.find((i) => i.section === 'inisiasi' && i.adminScored && i.label === 'SLIK')
  const apuPptItem = checklist.find((i) => i.section === 'inisiasi' && i.adminScored && i.label === 'APU PPT')

  function handleChooseFile(itemId: string, fileName: string) {
    setChecklist((prev) => prev.map((i) => (i.id === itemId ? { ...i, fileName } : i)))
  }

  function handleSave() {
    if (!data.code.trim() || !data.namaEntitas.trim() || !data.tanggal) {
      alert('Mohon lengkapi minimal Code, Tanggal, dan Nama Entitas.')
      return
    }
    const id = addPipeline(data)
    // Pipeline baru start dengan checklist & slikRows kosong di store, jadi re-apply pilihan
    // file yang sudah dibuat di form ini (pola sama seperti sebelumnya). Skor Likert TIDAK
    // diisi di sini lagi — lihat AdminScoredSection & 07-koreksi-skor-poin poin 4.
    const store = useAppStore.getState()
    checklist.forEach((item) => {
      if (item.fileName) store.setItemFile(id, item.id, item.fileName)
    })
    if (slikRows.length > 0) {
      store.addSlikRows(
        id,
        slikRows.map(({ id: _rowId, ...rest }) => rest),
      )
    }
    navigate('/pipeline')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tambah Pipeline Baru</h1>
        <p className="text-sm text-muted-foreground">Lengkapi data pipeline lalu unggah dokumen checklist yang tersedia.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>Nomor</Label>
            <Input value="Akan digenerate otomatis" disabled />
          </div>
          <div className="space-y-2">
            <Label>Code</Label>
            <Input value={data.code} onChange={(e) => setData({ ...data, code: e.target.value })} placeholder="JV-009" />
          </div>
          <div className="space-y-2">
            <Label>Tanggal</Label>
            <Input type="date" value={data.tanggal} onChange={(e) => setData({ ...data, tanggal: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Input type="date" value={data.dueDate} onChange={(e) => setData({ ...data, dueDate: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Nama Entitas</Label>
            <Input value={data.namaEntitas} onChange={(e) => setData({ ...data, namaEntitas: e.target.value })} placeholder="Nama perusahaan" />
          </div>
          <div className="space-y-2">
            <Label>Keterangan</Label>
            <Input value={data.keterangan} onChange={(e) => setData({ ...data, keterangan: e.target.value })} placeholder="Keterangan singkat" />
          </div>
          <div className="space-y-2">
            <Label>Fasilitas</Label>
            <Input value={data.fasilitas} onChange={(e) => setData({ ...data, fasilitas: e.target.value })} placeholder="New Disbursement / Revolving" />
          </div>
          <div className="space-y-2">
            <Label>Batch</Label>
            <Input value={data.batch} onChange={(e) => setData({ ...data, batch: e.target.value })} placeholder="Batch Oktober 2024" />
          </div>
        </CardContent>
      </Card>

      <AdminScoredSection
        slikItem={slikItem}
        apuPptItem={apuPptItem}
        onChooseFile={handleChooseFile}
        slikRows={slikRows}
        onAddSlikRow={(row) => setSlikRows((prev) => [...prev, { ...row, id: localSlikId() }])}
        onUpdateSlikRow={(rowId, patch) => setSlikRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r)))}
        onRemoveSlikRow={(rowId) => setSlikRows((prev) => prev.filter((r) => r.id !== rowId))}
        onBulkImportSlikRows={(rows) => setSlikRows((prev) => [...prev, ...rows.map((r) => ({ ...r, id: localSlikId() }))])}
      />

      <ChecklistSectionView items={checklist} mode="upload" onChooseFile={handleChooseFile} />

      <ProgressSummaryCard summary={summary} score={score} />

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate('/pipeline')}>
          Batal
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4" />
          Simpan
        </Button>
      </div>
    </div>
  )
}
