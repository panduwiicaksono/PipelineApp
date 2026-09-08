import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { ProgressSummary } from '@/lib/checklist'

function Row({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">
          {label}
          {sub && <span className="ml-1 text-xs font-normal text-muted-foreground">{sub}</span>}
        </span>
        <span className="font-semibold tabular-nums">{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  )
}

export function ProgressSummaryCard({ summary }: { summary: ProgressSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary (Bobot)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Row label="Inisiasi" sub="(bobot 30%)" value={summary.inisiasi} />
        <Row label="Proposal Investasi" sub="(bobot 70%)" value={summary.proposal} />
        <div className="grid grid-cols-2 gap-4 pl-4">
          <Row label="— Kualitatif" sub="(50%)" value={summary.kualitatif} />
          <Row label="— Kuantitatif" sub="(50%)" value={summary.kuantitatif} />
        </div>
        <Row label="Revolving — Internal Memo" sub="(kategori terpisah, bobot 100%)" value={summary.revolving} />
        <div className="mt-2 flex items-center justify-between rounded-xl bg-primary/5 px-4 py-3">
          <span className="text-sm font-semibold text-foreground">Total Progress</span>
          <span className="text-xl font-bold text-primary">{summary.total}%</span>
        </div>
      </CardContent>
    </Card>
  )
}
