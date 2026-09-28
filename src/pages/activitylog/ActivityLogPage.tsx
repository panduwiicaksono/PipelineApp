import { History } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAppStore } from '@/store/useAppStore'
import { parseIndoDateTime } from '@/lib/utils'
import { ROLE_LABEL } from '@/types'

// Halaman baru (06-update-round2 poin 10) — agregasi Activity Log dari seluruh pipeline
// (data dummy, belum ada backend event log sungguhan).
export default function ActivityLogPage() {
  const pipelines = useAppStore((s) => s.pipelines)

  const rows = pipelines
    .flatMap((p) => p.activityLog.map((entry) => ({ ...entry, pipelineTerkait: p.namaEntitas })))
    .sort((a, b) => parseIndoDateTime(b.waktu) - parseIndoDateTime(a.waktu))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Activity Log</h1>
        <p className="text-sm text-muted-foreground">Riwayat aktivitas di seluruh pipeline (data dummy).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Riwayat Aktivitas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Belum ada aktivitas.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Aktor</TableHead>
                  <TableHead>Aksi</TableHead>
                  <TableHead>Pipeline Terkait</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap">{row.waktu}</TableCell>
                    <TableCell>
                      {row.aktor} <span className="text-xs text-muted-foreground">({ROLE_LABEL[row.aktorRole]})</span>
                    </TableCell>
                    <TableCell>{row.aksi}</TableCell>
                    <TableCell>{row.pipelineTerkait}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
