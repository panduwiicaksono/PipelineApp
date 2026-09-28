import { FileUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SlikForm } from '@/components/SlikForm'
import type { ChecklistItem, SlikRow } from '@/types'

interface AdminScoredSectionProps {
  slikItem?: ChecklistItem
  apuPptItem?: ChecklistItem
  onChooseFile: (itemId: string, fileName: string) => void
  slikRows: SlikRow[]
  onAddSlikRow: (row: Omit<SlikRow, 'id'>) => void
  onUpdateSlikRow: (rowId: string, patch: Partial<Omit<SlikRow, 'id'>>) => void
  onRemoveSlikRow: (rowId: string) => void
  onBulkImportSlikRows: (rows: Omit<SlikRow, 'id'>[]) => void
}

// SLIK & APU PPT: di halaman Add New/Detail Pipeline, Admin Investasi/Administrator HANYA
// mengisi data (Choose File + form SLIK) — TIDAK ADA input skor di sini. Skor Likert kedua
// item ini dinilai lewat halaman Review Fase 1 tersendiri (tombol "Review" di Daftar
// Pipeline). Lihat 07-koreksi-skor-poin poin 4.
export function AdminScoredSection({
  slikItem,
  apuPptItem,
  onChooseFile,
  slikRows,
  onAddSlikRow,
  onUpdateSlikRow,
  onRemoveSlikRow,
  onBulkImportSlikRows,
}: AdminScoredSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">SLIK & APU PPT</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-xs text-muted-foreground">
          Skor Fase 1 untuk kedua item ini dinilai lewat tombol "Review" di halaman Daftar Pipeline, bukan di sini.
        </p>

        {slikItem && (
          <div className="space-y-3 rounded-xl border border-border/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-foreground">SLIK</span>
              <FileControl item={slikItem} onChooseFile={onChooseFile} />
            </div>
            <div className="pt-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Form SLIK (Fasilitas per Bank/Lembaga)</p>
              <SlikForm
                rows={slikRows}
                onAddRow={onAddSlikRow}
                onUpdateRow={onUpdateSlikRow}
                onRemoveRow={onRemoveSlikRow}
                onBulkImport={onBulkImportSlikRows}
              />
            </div>
          </div>
        )}

        {apuPptItem && (
          <div className="space-y-3 rounded-xl border border-border/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-foreground">APU PPT</span>
              <FileControl item={apuPptItem} onChooseFile={onChooseFile} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function FileControl({ item, onChooseFile }: { item: ChecklistItem; onChooseFile: (itemId: string, fileName: string) => void }) {
  const inputId = `admin-file-${item.id}`
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={inputId}>
        <Button asChild size="sm" variant="outline">
          <span>
            <FileUp className="h-3.5 w-3.5" />
            Choose File
          </span>
        </Button>
      </label>
      <input
        id={inputId}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onChooseFile(item.id, file.name)
          e.target.value = ''
        }}
      />
      <span className="max-w-[160px] truncate text-xs text-muted-foreground">{item.fileName ?? 'Belum ada file'}</span>
    </div>
  )
}
