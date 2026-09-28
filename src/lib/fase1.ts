import type { ChecklistItem } from '@/types'
import { isRedFlag, itemPoints } from './checklist'

// Fase 1 gate: SLIK & APU PPT dinilai langsung oleh Admin Investasi/Administrator (lewat
// halaman Review Fase 1 tersendiri, lihat 07-koreksi-skor-poin poin 4), dan harus memenuhi
// skor minimum sebelum role lain (RM/Appraisal/Investasi/Legal) bisa mulai Review.
// ASUMSI SEMENTARA — mekanisme "nilai merah" belum final dari client.
// Skor gabungan SLIK (maks 10 poin) + APU PPT (maks 5 poin) = maks 15 poin; ambang lolos
// 10.5 poin (07-koreksi-skor-poin poin 4).
export const FASE1_THRESHOLD_POINTS = 10.5

export interface Fase1Result {
  slikItem?: ChecklistItem
  apuPptItem?: ChecklistItem
  points: number
  maxPoints: number
  hasRedFlag: boolean
  passed: boolean
}

export function computeFase1(checklist: ChecklistItem[]): Fase1Result {
  const adminScoredItems = checklist.filter((i) => i.section === 'inisiasi' && i.adminScored)
  const slikItem = adminScoredItems.find((i) => i.label === 'SLIK')
  const apuPptItem = adminScoredItems.find((i) => i.label === 'APU PPT')

  const points = adminScoredItems.reduce((sum, i) => sum + itemPoints(i), 0)
  const maxPoints = adminScoredItems.reduce((sum, i) => sum + i.maxPoints, 0)
  const hasRedFlag = adminScoredItems.some((i) => isRedFlag(i))
  const passed = points >= FASE1_THRESHOLD_POINTS && !hasRedFlag

  return { slikItem, apuPptItem, points, maxPoints, hasRedFlag, passed }
}

export const FASE1_LOCK_MESSAGE = 'Menunggu Fase 1 (SLIK & APU PPT) memenuhi syarat skor minimum'
