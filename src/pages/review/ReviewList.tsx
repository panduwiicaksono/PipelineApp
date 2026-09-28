import { useNavigate } from 'react-router-dom'
import { ClipboardList, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAppStore } from '@/store/useAppStore'
import { formatDateID } from '@/lib/utils'
import { formatSkorPoin, scopeMaxPoints, scopePoints } from '@/lib/checklist'
import { computeFase1, FASE1_LOCK_MESSAGE } from '@/lib/fase1'
import type { ReviewRole } from '@/types'

type ReviewStatus = 'Belum Direview' | 'Sedang Berjalan' | 'Selesai'

function reviewStatusFor(items: { status: string | null }[]): ReviewStatus {
  if (items.length === 0) return 'Belum Direview'
  const reviewed = items.filter((i) => i.status !== null).length
  if (reviewed === 0) return 'Belum Direview'
  if (reviewed === items.length) return 'Selesai'
  return 'Sedang Berjalan'
}

const STATUS_VARIANT: Record<ReviewStatus, 'secondary' | 'warning' | 'success'> = {
  'Belum Direview': 'secondary',
  'Sedang Berjalan': 'warning',
  Selesai: 'success',
}

export default function ReviewList() {
  const navigate = useNavigate()
  const currentUser = useAppStore((s) => s.currentUser)
  const pipelines = useAppStore((s) => s.pipelines)
  const role = currentUser?.role as ReviewRole
  const scopeMax = scopeMaxPoints(role)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Review Pipeline</h1>
        <p className="text-sm text-muted-foreground">Daftar pipeline yang perlu ditindaklanjuti sesuai scope Anda.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Nama Entitas</TableHead>
                <TableHead>Fasilitas</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jumlah Dokumen</TableHead>
                <TableHead>Status Review</TableHead>
                <TableHead>Skor</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pipelines.map((p) => {
                // SLIK & APU PPT dikecualikan dari scope Review (dinilai langsung oleh Admin,
                // lihat 06-update-round2 poin 7).
                const scoped = p.checklist.filter((i) => i.reviewRole === role && !i.adminScored)
                const status = reviewStatusFor(scoped)
                const fase1 = computeFase1(p.checklist)
                return (
                  <TableRow key={p.id}>
                    <TableCell>{p.nomor}</TableCell>
                    <TableCell className="font-medium">{p.code}</TableCell>
                    <TableCell>{p.namaEntitas}</TableCell>
                    <TableCell>{p.fasilitas}</TableCell>
                    <TableCell>{p.batch}</TableCell>
                    <TableCell>{formatDateID(p.tanggal)}</TableCell>
                    <TableCell>{scoped.length}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{formatSkorPoin(scopePoints(p.checklist, role), scopeMax)}</TableCell>
                    <TableCell className="text-right">
                      {fase1.passed ? (
                        <Button size="sm" onClick={() => navigate(`/review/${p.id}`)}>
                          <ClipboardList className="h-3.5 w-3.5" />
                          Review
                        </Button>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          <Button size="sm" disabled title={FASE1_LOCK_MESSAGE}>
                            <Lock className="h-3.5 w-3.5" />
                            Review
                          </Button>
                          <span className="max-w-[220px] text-right text-[11px] text-muted-foreground">{FASE1_LOCK_MESSAGE}</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
