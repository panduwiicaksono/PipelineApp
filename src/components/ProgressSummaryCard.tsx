import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatPoin, type ProgressSummary, type ScoreSummary } from '@/lib/checklist'

function ProgressRow({ label, value, sub }: { label: string; value: number; sub?: string }) {
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

function ScoreRow({ label, sub, value, max }: { label: string; sub?: string; value: number; max: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="font-medium text-foreground">
        {label}
        {sub && <span className="ml-1 text-xs font-normal text-muted-foreground">{sub}</span>}
      </span>
      <span className="font-semibold tabular-nums">
        {formatPoin(value)} <span className="font-normal text-muted-foreground">dari {formatPoin(max)} poin</span>
      </span>
    </div>
  )
}

// "Progress" (%, kelengkapan status) dan "Skor" (poin, Likert x Bobot) sengaja ditampilkan
// sebagai dua metrik terpisah dengan satuan berbeda — 07-koreksi-skor-poin.
export function ProgressSummaryCard({ summary, score }: { summary: ProgressSummary; score?: ScoreSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary (Bobot)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProgressRow label="Inisiasi" sub="(bobot 30%)" value={summary.inisiasi} />
        <ProgressRow label="Proposal Investasi" sub="(bobot 70%)" value={summary.proposal} />
        <div className="grid grid-cols-2 gap-4 pl-4">
          <ProgressRow label="— Kualitatif" sub="(50%)" value={summary.kualitatif} />
          <ProgressRow label="— Kuantitatif" sub="(50%)" value={summary.kuantitatif} />
        </div>
        <ProgressRow label="Revolving — Internal Memo" sub="(kategori terpisah, bobot 100%)" value={summary.revolving} />
        <div className="mt-2 flex items-center justify-between rounded-xl bg-primary/5 px-4 py-3">
          <span className="text-sm font-semibold text-foreground">Total Progress</span>
          <span className="text-xl font-bold text-primary">{summary.total}%</span>
        </div>

        {score && (
          <div className="space-y-3 border-t border-border/60 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Skor (Likert x Bobot)</p>
            <ScoreRow label="Inisiasi" value={score.inisiasi} max={score.inisiasiMax} />
            <ScoreRow label="Proposal Investasi" value={score.proposal} max={score.proposalMax} />
            <div className="grid grid-cols-2 gap-4 pl-4">
              <ScoreRow label="— Kualitatif" value={score.kualitatif} max={score.kualitatifMax} />
              <ScoreRow label="— Kuantitatif" value={score.kuantitatif} max={score.kuantitatifMax} />
            </div>
            <ScoreRow label="Revolving — Internal Memo" sub="(kategori terpisah)" value={score.revolving} max={score.revolvingMax} />
            <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3">
              <span className="text-sm font-semibold text-foreground">Total Skor</span>
              <span className="text-xl font-bold text-foreground">
                {formatPoin(score.total)} <span className="text-sm font-normal text-muted-foreground">dari {formatPoin(score.totalMax)} poin</span>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
