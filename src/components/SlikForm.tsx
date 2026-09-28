import { useState } from 'react'
import { Plus, Trash2, ClipboardPaste, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatRupiah } from '@/lib/utils'
import type { Kolektibilitas, SlikRow } from '@/types'

const KOLEKTIBILITAS_OPTIONS: Kolektibilitas[] = ['Lancar', 'Dalam Perhatian Khusus', 'Kurang Lancar', 'Diragukan', 'Macet']

type DraftRow = Omit<SlikRow, 'id'>

function emptyDraft(): DraftRow {
  return { bank: '', jenisFasilitas: '', plafond: 0, bakiDebet: 0, kolektibilitas: 'Lancar', tanggalData: '' }
}

function parsePasteText(text: string): DraftRow[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const cols = line.split('\t').map((c) => c.trim())
      const kolektibilitasRaw = cols[4] ?? ''
      const kolektibilitas = (KOLEKTIBILITAS_OPTIONS.find((k) => k.toLowerCase() === kolektibilitasRaw.toLowerCase()) ??
        'Lancar') as Kolektibilitas
      return {
        bank: cols[0] ?? '',
        jenisFasilitas: cols[1] ?? '',
        plafond: Number((cols[2] ?? '0').replace(/[^0-9]/g, '')) || 0,
        bakiDebet: Number((cols[3] ?? '0').replace(/[^0-9]/g, '')) || 0,
        kolektibilitas,
        tanggalData: cols[5] ?? '',
      }
    })
}

interface SlikFormProps {
  rows: SlikRow[]
  onAddRow: (row: DraftRow) => void
  onUpdateRow: (rowId: string, patch: Partial<DraftRow>) => void
  onRemoveRow: (rowId: string) => void
  onBulkImport: (rows: DraftRow[]) => void
}

export function SlikForm({ rows, onAddRow, onUpdateRow, onRemoveRow, onBulkImport }: SlikFormProps) {
  const [draft, setDraft] = useState<DraftRow>(emptyDraft())
  const [pasteText, setPasteText] = useState('')
  const [preview, setPreview] = useState<DraftRow[] | null>(null)

  function handleAddRow() {
    if (!draft.bank.trim() || !draft.jenisFasilitas.trim()) {
      alert('Nama Bank/Lembaga dan Jenis Fasilitas wajib diisi.')
      return
    }
    onAddRow(draft)
    setDraft(emptyDraft())
  }

  function handleParse() {
    const parsed = parsePasteText(pasteText)
    if (parsed.length === 0) {
      alert('Tidak ada baris yang bisa di-parse. Pastikan format tab-separated sesuai urutan kolom.')
      return
    }
    setPreview(parsed)
  }

  function handleImport() {
    if (!preview) return
    onBulkImport(preview)
    setPreview(null)
    setPasteText('')
  }

  function updatePreviewCell(index: number, patch: Partial<DraftRow>) {
    setPreview((prev) => (prev ? prev.map((r, i) => (i === index ? { ...r, ...patch } : r)) : prev))
  }

  return (
    <div className="space-y-4">
      {rows.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bank/Lembaga</TableHead>
              <TableHead>Jenis Fasilitas</TableHead>
              <TableHead>Plafond</TableHead>
              <TableHead>Baki Debet</TableHead>
              <TableHead>Kolektibilitas</TableHead>
              <TableHead>Tanggal Data</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.bank}</TableCell>
                <TableCell>{r.jenisFasilitas}</TableCell>
                <TableCell>{formatRupiah(r.plafond)}</TableCell>
                <TableCell>{formatRupiah(r.bakiDebet)}</TableCell>
                <TableCell>{r.kolektibilitas}</TableCell>
                <TableCell>{r.tanggalData}</TableCell>
                <TableCell>
                  <button onClick={() => onRemoveRow(r.id)} className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-dashed border-border p-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="space-y-1.5">
          <Label className="text-xs">Nama Bank/Lembaga</Label>
          <Input value={draft.bank} onChange={(e) => setDraft({ ...draft, bank: e.target.value })} className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Jenis Fasilitas</Label>
          <Input value={draft.jenisFasilitas} onChange={(e) => setDraft({ ...draft, jenisFasilitas: e.target.value })} className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Plafond</Label>
          <Input type="number" value={draft.plafond || ''} onChange={(e) => setDraft({ ...draft, plafond: Number(e.target.value) })} className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Baki Debet</Label>
          <Input type="number" value={draft.bakiDebet || ''} onChange={(e) => setDraft({ ...draft, bakiDebet: Number(e.target.value) })} className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Kolektibilitas</Label>
          <Select value={draft.kolektibilitas} onValueChange={(v) => setDraft({ ...draft, kolektibilitas: v as Kolektibilitas })}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KOLEKTIBILITAS_OPTIONS.map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Tanggal Data</Label>
          <Input type="date" value={draft.tanggalData} onChange={(e) => setDraft({ ...draft, tanggalData: e.target.value })} className="h-9 text-sm" />
        </div>
        <div className="sm:col-span-2 lg:col-span-6">
          <Button size="sm" variant="outline" onClick={handleAddRow}>
            <Plus className="h-3.5 w-3.5" />
            Tambah Baris
          </Button>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-dashed border-border p-3">
        <Label className="text-xs">Paste dari Excel di sini (tab-separated, urutan: Bank, Jenis Fasilitas, Plafond, Baki Debet, Kolektibilitas, Tanggal Data)</Label>
        <Textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder={'Bank Mandiri\tKMK\t2000000000\t850000000\tLancar\t2024-09-20'}
          className="min-h-[80px] font-mono text-xs"
        />
        <Button size="sm" variant="outline" onClick={handleParse}>
          <ClipboardPaste className="h-3.5 w-3.5" />
          Parse
        </Button>

        {preview && (
          <div className="space-y-2 rounded-lg bg-secondary/40 p-2">
            <p className="text-xs text-muted-foreground">Preview — masih bisa diedit sebelum Import:</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bank/Lembaga</TableHead>
                  <TableHead>Jenis Fasilitas</TableHead>
                  <TableHead>Plafond</TableHead>
                  <TableHead>Baki Debet</TableHead>
                  <TableHead>Kolektibilitas</TableHead>
                  <TableHead>Tanggal Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Input value={row.bank} onChange={(e) => updatePreviewCell(idx, { bank: e.target.value })} className="h-8 text-xs" />
                    </TableCell>
                    <TableCell>
                      <Input value={row.jenisFasilitas} onChange={(e) => updatePreviewCell(idx, { jenisFasilitas: e.target.value })} className="h-8 text-xs" />
                    </TableCell>
                    <TableCell>
                      <Input type="number" value={row.plafond} onChange={(e) => updatePreviewCell(idx, { plafond: Number(e.target.value) })} className="h-8 text-xs" />
                    </TableCell>
                    <TableCell>
                      <Input type="number" value={row.bakiDebet} onChange={(e) => updatePreviewCell(idx, { bakiDebet: Number(e.target.value) })} className="h-8 text-xs" />
                    </TableCell>
                    <TableCell>
                      <Select value={row.kolektibilitas} onValueChange={(v) => updatePreviewCell(idx, { kolektibilitas: v as Kolektibilitas })}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {KOLEKTIBILITAS_OPTIONS.map((k) => (
                            <SelectItem key={k} value={k}>
                              {k}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input type="date" value={row.tanggalData} onChange={(e) => updatePreviewCell(idx, { tanggalData: e.target.value })} className="h-8 text-xs" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button size="sm" onClick={handleImport}>
              <Check className="h-3.5 w-3.5" />
              Import ke Form SLIK
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
