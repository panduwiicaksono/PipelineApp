import type { ChecklistItem, ChecklistSection, ItemStatus, Likert, ReviewRole } from '@/types'

let idCounter = 0
function nextId(prefix: string) {
  idCounter += 1
  return `${prefix}-${idCounter}-${Math.random().toString(36).slice(2, 7)}`
}

interface RawGroup {
  group: string
  reviewRole: ReviewRole
  items: string[]
  // Label item yang dinilai langsung oleh Admin (bukan lewat Review) — lihat 06-update-round2
  // poin 7. Skoring dipindah ke halaman Fase 1 Review tersendiri (07-koreksi-skor-poin poin 4).
  adminScoredItems?: string[]
}

const INISIASI: RawGroup[] = [
  {
    group: 'Inisiasi',
    reviewRole: 'rm',
    items: ['Intro Meeting', 'NDA', 'SLIK', 'Data', 'Onsite Visit', 'Call Report', 'APU PPT'],
    adminScoredItems: ['SLIK', 'APU PPT'],
  },
]

const KUALITATIF: RawGroup[] = [
  { group: 'Aspek CPU', reviewRole: 'appraisal', items: ['Profil', 'Pasar/Market', 'Produk Jasa/Barang', 'Tim/Manajemen', 'SLIK'] },
  {
    group: 'Aspek Bouwheer',
    reviewRole: 'legal',
    items: [
      'Profil',
      'Reputasi',
      'Track-Record Kerjasama',
      'Kontrak Payung/SPK',
      'Alur/Skema Kerjasama dengan CPU',
      'PIC Bouwheer - Konfirmasi',
    ],
  },
  {
    group: 'Hasil Kunjungan',
    reviewRole: 'rm',
    items: ['Kunjungan & Komunikasi CPU', 'Kunjungan & Komunikasi Bouwheer', 'OR Validasi Sistem Online Bouwheer'],
  },
  { group: 'Aspek Jaminan', reviewRole: 'appraisal', items: ['Aspek Jaminan'] },
  { group: 'Aspek Risiko', reviewRole: 'appraisal', items: ['Risiko Yang Timbul', 'Mitigasi Risiko'] },
  { group: 'Ikhtisar Pembiayaan', reviewRole: 'investasi', items: ['Ikhtisar Pembiayaan'] },
]

const KUANTITATIF: RawGroup[] = [
  { group: 'Kinerja CPU', reviewRole: 'investasi', items: ['Kinerja CPU (Overall)'] },
  { group: 'Aspek Keuangan', reviewRole: 'investasi', items: ['Neraca/Balance Sheet', 'Laba Rugi/Profit & Loss', 'Rasio Keuangan'] },
  { group: 'Rekap PO/Invoice CPU', reviewRole: 'investasi', items: ['Rekap PO/Invoice CPU (Historis)'] },
  { group: 'Aging Piutang CPU', reviewRole: 'investasi', items: ['Aging Piutang CPU'] },
  { group: 'Simulasi Skema Pembiayaan', reviewRole: 'investasi', items: ['Simulasi Skema Pembiayaan'] },
]

const REVOLVING: RawGroup[] = [
  {
    group: 'Revolving - Internal Memo',
    reviewRole: 'investasi',
    items: ['Historis Pembiayaan PU', 'Kinerja PU (Overall)', 'Detil PO/Invoice PU', 'Konfirmasi Bouwheer', 'Simulasi Skema Pembiayaan'],
  },
]

function buildSection(section: ChecklistSection, groups: RawGroup[]): ChecklistItem[] {
  const out: ChecklistItem[] = []
  for (const g of groups) {
    for (const label of g.items) {
      out.push({
        id: nextId(section),
        section,
        group: g.group,
        label,
        reviewRole: g.reviewRole,
        fileName: undefined,
        status: null,
        likert: null,
        maxPoints: 0, // diisi di createChecklistTemplate, lihat SECTION_TOTAL_POINTS
        notes: '',
        remarksLocked: true,
        remarks: '',
        adminScored: g.adminScoredItems?.includes(label) ?? false,
      })
    }
  }
  return out
}

// Alokasi poin per item (total 100 poin per pipeline) — 07-koreksi-skor-poin poin 1.
const INISIASI_POINTS: Record<string, number> = {
  SLIK: 10,
  'APU PPT': 5,
  'Intro Meeting': 3,
  NDA: 3,
  Data: 3,
  'Onsite Visit': 3,
  'Call Report': 3,
}

const SECTION_TOTAL_POINTS: Record<ChecklistSection, number> = {
  inisiasi: 30,
  kualitatif: 35,
  kuantitatif: 35,
  revolving: 100,
}

export function createChecklistTemplate(): ChecklistItem[] {
  const inisiasi = buildSection('inisiasi', INISIASI)
  inisiasi.forEach((item) => {
    item.maxPoints = INISIASI_POINTS[item.label] ?? 0
  })

  const kualitatif = buildSection('kualitatif', KUALITATIF)
  kualitatif.forEach((item) => {
    item.maxPoints = SECTION_TOTAL_POINTS.kualitatif / kualitatif.length
  })

  const kuantitatif = buildSection('kuantitatif', KUANTITATIF)
  kuantitatif.forEach((item) => {
    item.maxPoints = SECTION_TOTAL_POINTS.kuantitatif / kuantitatif.length
  })

  const revolving = buildSection('revolving', REVOLVING)
  revolving.forEach((item) => {
    item.maxPoints = SECTION_TOTAL_POINTS.revolving / revolving.length
  })

  return [...inisiasi, ...kualitatif, ...kuantitatif, ...revolving]
}

// Sistem Skor Likert x Bobot — ASUMSI SEMENTARA (06-update-round2 poin 6, direvisi jadi poin
// (bukan %) di 07-koreksi-skor-poin).
export const LIKERT_LABELS: Record<Likert, string> = {
  1: 'Sangat Kurang',
  2: 'Kurang',
  3: 'Cukup',
  4: 'Baik',
  5: 'Sangat Baik',
}

// Derivasi status dari Likert supaya logic lama (badge OK/Revisi/NO, gating Release/Export,
// Total Progress) tetap kompatibel. ASUMSI SEMENTARA — ambang batas 1-2/3/4-5 belum final.
export function deriveStatusFromLikert(likert: Likert | null): ItemStatus {
  if (likert === null) return null
  if (likert <= 2) return 'NO'
  if (likert === 3) return 'Revisi'
  return 'OK'
}

// "Nilai merah" = skor Likert 1 pada item SLIK atau APU PPT (06-update-round2 poin 6).
export function isRedFlag(item: ChecklistItem): boolean {
  return !!item.adminScored && item.likert === 1
}

// Bobot (%): dipakai HANYA untuk metrik Progress (kelengkapan status item), TIDAK berubah
// oleh 07-koreksi-skor-poin — lihat computeProgress. Metrik Skor sekarang pakai poin
// (computeSkorPoints), bukan bobot % ini.
export const WEIGHTS = {
  inisiasi: 30,
  kualitatif: 35,
  kuantitatif: 35,
  proposal: 70,
  revolving: 100,
}

function sectionCompletion(items: ChecklistItem[], section: ChecklistSection): number {
  const scoped = items.filter((i) => i.section === section)
  if (scoped.length === 0) return 0
  const done = scoped.filter((i) => i.status === 'OK').length
  return (done / scoped.length) * 100
}

export interface ProgressSummary {
  inisiasi: number
  kualitatif: number
  kuantitatif: number
  proposal: number
  revolving: number
  total: number
}

// Progress (%, berbasis kelengkapan status) — TIDAK berubah oleh 07-koreksi-skor-poin.
export function computeProgress(items: ChecklistItem[]): ProgressSummary {
  const inisiasi = sectionCompletion(items, 'inisiasi')
  const kualitatif = sectionCompletion(items, 'kualitatif')
  const kuantitatif = sectionCompletion(items, 'kuantitatif')
  const revolving = sectionCompletion(items, 'revolving')
  const proposal = (kualitatif + kuantitatif) / 2
  const total = inisiasi * (WEIGHTS.inisiasi / 100) + proposal * (WEIGHTS.proposal / 100)
  return {
    inisiasi: Math.round(inisiasi),
    kualitatif: Math.round(kualitatif),
    kuantitatif: Math.round(kuantitatif),
    proposal: Math.round(proposal),
    revolving: Math.round(revolving),
    total: Math.round(total),
  }
}

// Poin yang didapat 1 item: (Likert / 5) x maxPoints. Item yang belum discore (likert null)
// dianggap 0 poin. 07-koreksi-skor-poin poin 1.
export function itemPoints(item: ChecklistItem): number {
  return item.likert ? (item.likert / 5) * item.maxPoints : 0
}

// Format angka poin: 1 desimal, tanpa ".0" yang tidak perlu (mis. "8" bukan "8.0").
export function formatPoin(value: number): string {
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

export function formatSkorPoin(value: number, max: number): string {
  return `${formatPoin(value)} dari ${formatPoin(max)} poin`
}

interface SectionPoints {
  achieved: number
  max: number
}

function sectionPoints(items: ChecklistItem[], section: ChecklistSection): SectionPoints {
  const scoped = items.filter((i) => i.section === section)
  return {
    achieved: scoped.reduce((sum, i) => sum + itemPoints(i), 0),
    max: scoped.reduce((sum, i) => sum + i.maxPoints, 0),
  }
}

export interface ScoreSummary {
  inisiasi: number
  inisiasiMax: number
  kualitatif: number
  kualitatifMax: number
  kuantitatif: number
  kuantitatifMax: number
  proposal: number
  proposalMax: number
  revolving: number
  revolvingMax: number
  total: number
  totalMax: number
}

// Skor (poin, dari total 100) — menggantikan computeSkor (%) versi 06-update-round2, sesuai
// 07-koreksi-skor-poin. Revolving tetap kategori terpisah (max 100 poin sendiri), tidak
// diikutkan ke Total Skor (konsisten dengan computeProgress).
export function computeSkorPoints(items: ChecklistItem[]): ScoreSummary {
  const ini = sectionPoints(items, 'inisiasi')
  const kual = sectionPoints(items, 'kualitatif')
  const kuan = sectionPoints(items, 'kuantitatif')
  const rev = sectionPoints(items, 'revolving')
  const proposalAchieved = kual.achieved + kuan.achieved
  const proposalMax = kual.max + kuan.max
  return {
    inisiasi: ini.achieved,
    inisiasiMax: ini.max,
    kualitatif: kual.achieved,
    kualitatifMax: kual.max,
    kuantitatif: kuan.achieved,
    kuantitatifMax: kuan.max,
    proposal: proposalAchieved,
    proposalMax,
    revolving: rev.achieved,
    revolvingMax: rev.max,
    total: ini.achieved + proposalAchieved,
    totalMax: ini.max + proposalMax,
  }
}

// Poin yang didapat pada item-item scope 1 role review tertentu (SLIK & APU PPT dikecualikan
// karena dinilai langsung oleh Admin — lihat lib/fase1.ts). 07-koreksi-skor-poin poin 3.
export function scopePoints(items: ChecklistItem[], role: ReviewRole): number {
  return items.filter((i) => i.reviewRole === role && !i.adminScored).reduce((sum, i) => sum + itemPoints(i), 0)
}

// Poin maksimal scope 1 role review — konstan (struktur checklist sama di semua pipeline).
export function scopeMaxPoints(role: ReviewRole): number {
  return createChecklistTemplate()
    .filter((i) => i.reviewRole === role && !i.adminScored)
    .reduce((sum, i) => sum + i.maxPoints, 0)
}

export function allItemsHaveStatus(items: ChecklistItem[]): boolean {
  return items.length > 0 && items.every((i) => i.status !== null)
}
