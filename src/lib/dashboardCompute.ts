import type { Pipeline } from '@/types'
import { MONTHS_DASHBOARD, REALISASI_STATUS, TARGET_PIPELINES, TARGET_SUBTOTAL } from './dashboardData'

export type DashboardMonth = (typeof MONTHS_DASHBOARD)[number]

function sumEntries(pipelines: Pipeline[], entitas: string, month: string, type: 'new' | 'revolving'): number {
  return pipelines
    .filter((p) => p.released && p.namaEntitas.toLowerCase() === entitas.toLowerCase())
    .reduce((sum, p) => sum + (p.disbursements[month]?.[type]?.reduce((s, e) => s + e.nominal, 0) ?? 0), 0)
}

export interface RealisasiRow {
  entitas: string
  oktNew: number
  oktRevolving: number
  novNew: number
  novRevolving: number
  desNew: number
  desRevolving: number
  total: number
  status: string
}

export function buildRealisasiRows(pipelines: Pipeline[]): RealisasiRow[] {
  return TARGET_PIPELINES.map((row) => {
    const oktNew = sumEntries(pipelines, row.entitas, 'Oktober', 'new')
    const oktRevolving = sumEntries(pipelines, row.entitas, 'Oktober', 'revolving')
    const novNew = sumEntries(pipelines, row.entitas, 'November', 'new')
    const novRevolving = sumEntries(pipelines, row.entitas, 'November', 'revolving')
    const desNew = sumEntries(pipelines, row.entitas, 'Desember', 'new')
    const desRevolving = sumEntries(pipelines, row.entitas, 'Desember', 'revolving')
    const total = oktNew + oktRevolving + novNew + novRevolving + desNew + desRevolving
    return {
      entitas: row.entitas,
      oktNew,
      oktRevolving,
      novNew,
      novRevolving,
      desNew,
      desRevolving,
      total,
      status: REALISASI_STATUS[row.entitas] ?? '-',
    }
  })
}

export interface MonthlyFigure {
  month: DashboardMonth
  targetNew: number
  targetRevolving: number
  realisasiNew: number
  realisasiRevolving: number
}

export function buildMonthlyFigures(pipelines: Pipeline[]): MonthlyFigure[] {
  const realisasiRows = buildRealisasiRows(pipelines)
  return [
    {
      month: 'Oktober',
      targetNew: TARGET_SUBTOTAL.oktNew,
      targetRevolving: TARGET_SUBTOTAL.oktRevolving,
      realisasiNew: realisasiRows.reduce((s, r) => s + r.oktNew, 0),
      realisasiRevolving: realisasiRows.reduce((s, r) => s + r.oktRevolving, 0),
    },
    {
      month: 'November',
      targetNew: TARGET_SUBTOTAL.novNew,
      targetRevolving: TARGET_SUBTOTAL.novRevolving,
      realisasiNew: realisasiRows.reduce((s, r) => s + r.novNew, 0),
      realisasiRevolving: realisasiRows.reduce((s, r) => s + r.novRevolving, 0),
    },
    {
      month: 'Desember',
      targetNew: TARGET_SUBTOTAL.desNew,
      targetRevolving: TARGET_SUBTOTAL.desRevolving,
      realisasiNew: realisasiRows.reduce((s, r) => s + r.desNew, 0),
      realisasiRevolving: realisasiRows.reduce((s, r) => s + r.desRevolving, 0),
    },
  ]
}

export interface AchievementRow {
  month: DashboardMonth
  target: number
  realisasi: number
  cumulativeTarget: number
  achievement: number
}

export function buildAchievementRows(monthly: MonthlyFigure[]): AchievementRow[] {
  const rows: AchievementRow[] = []
  let prevCarry = 0
  for (const m of monthly) {
    const freshTarget = m.targetNew + m.targetRevolving
    const realisasi = m.realisasiNew + m.realisasiRevolving
    const cumulativeTarget = freshTarget + prevCarry
    const achievement = realisasi - cumulativeTarget
    rows.push({ month: m.month, target: freshTarget, realisasi, cumulativeTarget, achievement })
    prevCarry = cumulativeTarget - realisasi
  }
  return rows
}

export function totalTargetPipeline(): number {
  return TARGET_SUBTOTAL.total
}

export function totalRealisasi(pipelines: Pipeline[]): number {
  return buildRealisasiRows(pipelines).reduce((sum, r) => sum + r.total, 0)
}
