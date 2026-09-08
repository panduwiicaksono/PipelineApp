import type { ChecklistItem, ChecklistSection, ReviewRole } from '@/types'

let idCounter = 0
function nextId(prefix: string) {
  idCounter += 1
  return `${prefix}-${idCounter}-${Math.random().toString(36).slice(2, 7)}`
}

interface RawGroup {
  group: string
  reviewRole: ReviewRole
  items: string[]
}

const INISIASI: RawGroup[] = [
  { group: 'Inisiasi', reviewRole: 'rm', items: ['Intro Meeting', 'NDA', 'SLIK', 'Data', 'Onsite Visit', 'Call Report'] },
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
        notes: '',
        remarksLocked: true,
        remarks: '',
      })
    }
  }
  return out
}

export function createChecklistTemplate(): ChecklistItem[] {
  return [
    ...buildSection('inisiasi', INISIASI),
    ...buildSection('kualitatif', KUALITATIF),
    ...buildSection('kuantitatif', KUANTITATIF),
    ...buildSection('revolving', REVOLVING),
  ]
}

// Bobot (weights): Inisiasi 30% + Proposal Investasi 70% (Kualitatif 50% & Kuantitatif 50%
// dari 70% tsb) menyusun Total Progress utama. Revolving - Internal Memo adalah "kategori
// terpisah" (mengikuti sheet asli) sehingga dilacak & ditampilkan sendiri, tidak diikutkan ke
// Total Progress. Lihat catatan asumsi di akhir percakapan.
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

export function allItemsHaveStatus(items: ChecklistItem[]): boolean {
  return items.length > 0 && items.every((i) => i.status !== null)
}
