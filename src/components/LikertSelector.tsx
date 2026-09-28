import { cn } from '@/lib/utils'
import { LIKERT_LABELS } from '@/lib/checklist'
import type { Likert } from '@/types'

const LIKERT_VALUES: Likert[] = [1, 2, 3, 4, 5]

const LIKERT_ACTIVE_CLASS: Record<Likert, string> = {
  1: 'bg-red-600 text-white border-red-600',
  2: 'bg-orange-500 text-white border-orange-500',
  3: 'bg-amber-500 text-white border-amber-500',
  4: 'bg-lime-600 text-white border-lime-600',
  5: 'bg-emerald-600 text-white border-emerald-600',
}

interface LikertSelectorProps {
  value: Likert | null
  onChange: (value: Likert) => void
  disabled?: boolean
}

export function LikertSelector({ value, onChange, disabled }: LikertSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {LIKERT_VALUES.map((v) => (
        <button
          key={v}
          type="button"
          disabled={disabled}
          onClick={() => onChange(v)}
          title={LIKERT_LABELS[v]}
          className={cn(
            'flex flex-col items-center rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40',
            value === v ? LIKERT_ACTIVE_CLASS[v] : 'border-border bg-white text-muted-foreground hover:bg-secondary',
          )}
        >
          <span>{v}</span>
          <span className="text-[9px] font-normal">{LIKERT_LABELS[v]}</span>
        </button>
      ))}
    </div>
  )
}
