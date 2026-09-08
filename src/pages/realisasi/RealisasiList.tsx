import { useNavigate } from 'react-router-dom'
import { Inbox, PencilLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAppStore } from '@/store/useAppStore'
import { computeProgress } from '@/lib/checklist'

export default function RealisasiList() {
  const navigate = useNavigate()
  const pipelines = useAppStore((s) => s.pipelines.filter((p) => p.released))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Realisasi</h1>
        <p className="text-sm text-muted-foreground">Input data pencairan untuk pipeline yang sudah di-release.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline Released</CardTitle>
        </CardHeader>
        <CardContent>
          {pipelines.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Belum ada pipeline yang di-release untuk realisasi</p>
              <p className="max-w-sm text-xs text-muted-foreground">
                Release pipeline terlebih dahulu di modul Pipeline setelah Total Progress mencapai minimal 90%.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Nama Entitas</TableHead>
                  <TableHead>Fasilitas</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead className="min-w-[160px]">Total Progress</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pipelines.map((p) => {
                  const progress = computeProgress(p.checklist)
                  return (
                    <TableRow key={p.id}>
                      <TableCell>{p.nomor}</TableCell>
                      <TableCell className="font-medium">{p.code}</TableCell>
                      <TableCell>{p.namaEntitas}</TableCell>
                      <TableCell>{p.fasilitas}</TableCell>
                      <TableCell>{p.batch}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={progress.total} className="w-24" />
                          <span className="text-xs font-semibold tabular-nums">{progress.total}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => navigate(`/realisasi/${p.id}`)}>
                          <PencilLine className="h-3.5 w-3.5" />
                          Input Pencairan
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
