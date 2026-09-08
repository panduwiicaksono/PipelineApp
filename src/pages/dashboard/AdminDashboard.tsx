import { Fragment } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Banknote, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { KpiCard } from '@/components/KpiCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAppStore } from '@/store/useAppStore'
import { formatRupiah } from '@/lib/utils'
import { SALDO_KAS, TARGET_PIPELINES, TARGET_SUBTOTAL, targetRowTotal } from '@/lib/dashboardData'
import { buildAchievementRows, buildMonthlyFigures, buildRealisasiRows, totalRealisasi, totalTargetPipeline } from '@/lib/dashboardCompute'

function cell(value: number) {
  return value === 0 ? <span className="text-muted-foreground">-</span> : formatRupiah(value)
}

export default function AdminDashboard() {
  const pipelines = useAppStore((s) => s.pipelines)

  const targetTotal = totalTargetPipeline()
  const realisasiTotal = totalRealisasi(pipelines)
  const achievement = realisasiTotal - targetTotal
  const sisaSaldoKas = SALDO_KAS.find((r) => r.isTotal)?.realisasi ?? 0

  const realisasiRows = buildRealisasiRows(pipelines)
  const monthlyFigures = buildMonthlyFigures(pipelines)
  const achievementRows = buildAchievementRows(monthlyFigures)

  const chartData = monthlyFigures.map((m) => ({
    bulan: m.month,
    'Target New': m.targetNew,
    'Realisasi New': m.realisasiNew,
    'Target Revolving': m.targetRevolving,
    'Realisasi Revolving': m.realisasiRevolving,
  }))

  const targetSubtotal = TARGET_SUBTOTAL

  const realisasiSubtotal = {
    oktNew: realisasiRows.reduce((s, r) => s + r.oktNew, 0),
    oktRevolving: realisasiRows.reduce((s, r) => s + r.oktRevolving, 0),
    novNew: realisasiRows.reduce((s, r) => s + r.novNew, 0),
    novRevolving: realisasiRows.reduce((s, r) => s + r.novRevolving, 0),
    desNew: realisasiRows.reduce((s, r) => s + r.desNew, 0),
    desRevolving: realisasiRows.reduce((s, r) => s + r.desRevolving, 0),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Admin</h1>
        <p className="text-sm text-muted-foreground">Ringkasan target, realisasi, dan saldo kas pipeline pembiayaan.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={TrendingUp} title="Total Target Pipeline" value={formatRupiah(targetTotal)} tone="dark" />
        <KpiCard icon={Wallet} title="Total Realisasi" value={formatRupiah(realisasiTotal)} tone="mint" />
        <KpiCard
          icon={TrendingDown}
          title="Achievement (Deficit)"
          value={formatRupiah(achievement)}
          tone="pink"
          valueClassName={achievement < 0 ? 'text-red-600' : 'text-emerald-600'}
        />
        <KpiCard icon={Banknote} title="Sisa Saldo Kas (Realisasi)" value={formatRupiah(sisaSaldoKas)} tone="white" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Target vs Realisasi — New Disbursement & Revolving</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="bulan" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${(v / 1_000_000_000).toFixed(1)}M`} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatRupiah(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Target New" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Realisasi New" fill="#c7d2fe" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Target Revolving" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Realisasi Revolving" fill="#99f6e4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Target Pipelines</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entitas</TableHead>
                <TableHead>Okt New</TableHead>
                <TableHead>Okt Revolving</TableHead>
                <TableHead>Nov New</TableHead>
                <TableHead>Nov Revolving</TableHead>
                <TableHead>Des New</TableHead>
                <TableHead>Des Revolving</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TARGET_PIPELINES.map((row) => (
                <TableRow key={row.entitas}>
                  <TableCell className="font-medium">{row.entitas}</TableCell>
                  <TableCell>{cell(row.oktNew)}</TableCell>
                  <TableCell>{cell(row.oktRevolving)}</TableCell>
                  <TableCell>{cell(row.novNew)}</TableCell>
                  <TableCell>{cell(row.novRevolving)}</TableCell>
                  <TableCell>{cell(row.desNew)}</TableCell>
                  <TableCell>{cell(row.desRevolving)}</TableCell>
                  <TableCell className="font-semibold">{formatRupiah(targetRowTotal(row))}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-secondary/60 font-bold">
                <TableCell>SUBTOTAL</TableCell>
                <TableCell>{formatRupiah(targetSubtotal.oktNew)}</TableCell>
                <TableCell>{formatRupiah(targetSubtotal.oktRevolving)}</TableCell>
                <TableCell>{formatRupiah(targetSubtotal.novNew)}</TableCell>
                <TableCell>{formatRupiah(targetSubtotal.novRevolving)}</TableCell>
                <TableCell>{formatRupiah(targetSubtotal.desNew)}</TableCell>
                <TableCell>{formatRupiah(targetSubtotal.desRevolving)}</TableCell>
                <TableCell>{formatRupiah(targetTotal)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Realisasi Pipelines</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entitas</TableHead>
                <TableHead>Okt New</TableHead>
                <TableHead>Okt Revolving</TableHead>
                <TableHead>Nov New</TableHead>
                <TableHead>Nov Revolving</TableHead>
                <TableHead>Des New</TableHead>
                <TableHead>Des Revolving</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {realisasiRows.map((row) => (
                <TableRow key={row.entitas}>
                  <TableCell className="font-medium">{row.entitas}</TableCell>
                  <TableCell>{cell(row.oktNew)}</TableCell>
                  <TableCell>{cell(row.oktRevolving)}</TableCell>
                  <TableCell>{cell(row.novNew)}</TableCell>
                  <TableCell>{cell(row.novRevolving)}</TableCell>
                  <TableCell>{cell(row.desNew)}</TableCell>
                  <TableCell>{cell(row.desRevolving)}</TableCell>
                  <TableCell className="font-semibold">{formatRupiah(row.total)}</TableCell>
                  <TableCell>{row.status}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-secondary/60 font-bold">
                <TableCell>TOTAL</TableCell>
                <TableCell>{formatRupiah(realisasiSubtotal.oktNew)}</TableCell>
                <TableCell>{formatRupiah(realisasiSubtotal.oktRevolving)}</TableCell>
                <TableCell>{formatRupiah(realisasiSubtotal.novNew)}</TableCell>
                <TableCell>{formatRupiah(realisasiSubtotal.novRevolving)}</TableCell>
                <TableCell>{formatRupiah(realisasiSubtotal.desNew)}</TableCell>
                <TableCell>{formatRupiah(realisasiSubtotal.desRevolving)}</TableCell>
                <TableCell>{formatRupiah(realisasiTotal)}</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Target vs Realisasi & Achievement</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                {achievementRows.map((r) => (
                  <TableHead key={r.month} colSpan={2}>
                    {r.month}
                  </TableHead>
                ))}
              </TableRow>
              <TableRow>
                <TableHead></TableHead>
                {achievementRows.map((r) => (
                  <Fragment key={r.month}>
                    <TableHead>Target</TableHead>
                    <TableHead>Realisasi</TableHead>
                  </Fragment>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">New Disbursement</TableCell>
                {monthlyFigures.map((m) => (
                  <Fragment key={m.month}>
                    <TableCell>{formatRupiah(m.targetNew)}</TableCell>
                    <TableCell>{formatRupiah(m.realisasiNew)}</TableCell>
                  </Fragment>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Revolving</TableCell>
                {monthlyFigures.map((m) => (
                  <Fragment key={m.month}>
                    <TableCell>{formatRupiah(m.targetRevolving)}</TableCell>
                    <TableCell>{formatRupiah(m.realisasiRevolving)}</TableCell>
                  </Fragment>
                ))}
              </TableRow>
              <TableRow className="bg-secondary/60 font-bold">
                <TableCell>SUBTOTAL</TableCell>
                {achievementRows.map((r) => (
                  <Fragment key={r.month}>
                    <TableCell>{formatRupiah(r.cumulativeTarget)}</TableCell>
                    <TableCell>{formatRupiah(r.realisasi)}</TableCell>
                  </Fragment>
                ))}
              </TableRow>
              <TableRow className="font-bold">
                <TableCell>ACHIEVEMENT (Deficit)</TableCell>
                {achievementRows.map((r) => (
                  <TableCell key={`${r.month}-a`} colSpan={2} className={r.achievement < 0 ? 'text-red-600' : 'text-emerald-600'}>
                    {formatRupiah(r.achievement)}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saldo Kas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Proyeksi</TableHead>
                <TableHead>Realisasi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SALDO_KAS.map((row) => (
                <TableRow key={row.tanggal} className={row.isTotal ? 'bg-secondary/60 font-bold' : ''}>
                  <TableCell className="font-medium">{row.tanggal}</TableCell>
                  <TableCell>{formatRupiah(row.proyeksi)}</TableCell>
                  <TableCell>{formatRupiah(row.realisasi)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
