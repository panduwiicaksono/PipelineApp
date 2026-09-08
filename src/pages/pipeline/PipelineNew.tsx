import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChecklistSectionView } from '@/components/ChecklistSectionView'
import { ProgressSummaryCard } from '@/components/ProgressSummaryCard'
import { useAppStore } from '@/store/useAppStore'
import { createChecklistTemplate, computeProgress } from '@/lib/checklist'
import type { ChecklistItem, PipelineData } from '@/types'

export default function PipelineNew() {
  const navigate = useNavigate()
  const addPipeline = useAppStore((s) => s.addPipeline)

  const [data, setData] = useState<PipelineData>({
    code: '',
    tanggal: '',
    namaEntitas: '',
    keterangan: '',
    fasilitas: '',
    batch: '',
  })
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => createChecklistTemplate())

  const summary = computeProgress(checklist)

  function handleChooseFile(itemId: string, fileName: string) {
    setChecklist((prev) => prev.map((i) => (i.id === itemId ? { ...i, fileName } : i)))
  }

  function handleSave() {
    if (!data.code.trim() || !data.namaEntitas.trim() || !data.tanggal) {
      alert('Mohon lengkapi minimal Code, Tanggal, dan Nama Entitas.')
      return
    }
    const id = addPipeline(data)
    // Attach any files already chosen before save (new pipeline starts with fresh
    // checklist in the store, so re-apply file selections made in this form).
    const setItemFile = useAppStore.getState().setItemFile
    checklist.forEach((item) => {
      if (item.fileName) setItemFile(id, item.id, item.fileName)
    })
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

      <ChecklistSectionView items={checklist} mode="upload" onChooseFile={handleChooseFile} />

      <ProgressSummaryCard summary={summary} />

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
