import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type KpiTone = 'dark' | 'mint' | 'pink' | 'white'

const TONE_STYLES: Record<KpiTone, string> = {
  dark: 'bg-slate-900 text-white',
  mint: 'bg-emerald-50 text-emerald-950',
  pink: 'bg-pink-50 text-pink-950',
  white: 'bg-white text-foreground',
}

const ICON_TONE_STYLES: Record<KpiTone, string> = {
  dark: 'bg-white/10 text-white',
  mint: 'bg-emerald-500/15 text-emerald-700',
  pink: 'bg-pink-500/15 text-pink-700',
  white: 'bg-primary/10 text-primary',
}

interface KpiCardProps {
  icon: LucideIcon
  title: string
  value: string
  tone?: KpiTone
  trend?: { value: string; direction: 'up' | 'down' }
  valueClassName?: string
  subtitle?: string
}

export function KpiCard({ icon: Icon, title, value, tone = 'white', trend, valueClassName, subtitle }: KpiCardProps) {
  return (
    <div className={cn('rounded-2xl p-5 shadow-sm', TONE_STYLES[tone])}>
      <div className={cn('mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full', ICON_TONE_STYLES[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className={cn('text-sm font-medium opacity-70')}>{title}</div>
      <div className={cn('mt-1 text-2xl font-bold tracking-tight', valueClassName)}>{value}</div>
      {subtitle && <div className="mt-1 text-xs opacity-60">{subtitle}</div>}
      {trend && (
        <div className={cn('mt-3 inline-flex items-center gap-1 text-xs font-semibold', trend.direction === 'up' ? 'text-emerald-500' : 'text-red-500')}>
          {trend.direction === 'up' ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {trend.value}
        </div>
      )}
    </div>
  )
}
