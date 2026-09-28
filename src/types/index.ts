export type Role = 'admin_investasi' | 'administrator' | 'appraisal' | 'investasi' | 'legal' | 'rm'

export const ROLE_LABEL: Record<Role, string> = {
  admin_investasi: 'Admin Investasi',
  administrator: 'Administrator',
  appraisal: 'Appraisal',
  investasi: 'Investasi',
  legal: 'Legal',
  // Koreksi round 2 (lihat 06-update-round2): sebelumnya salah label "Relationship Manager".
  // Scope review RM TIDAK berubah (tetap Inisiasi + Hasil Kunjungan).
  rm: 'Risk Management',
}

// Admin Investasi & Administrator: fungsi & halaman PERSIS SAMA (lihat 06-update-round2 poin 1).
export const ADMIN_ROLES: Role[] = ['admin_investasi', 'administrator']

export function isAdminRole(role: Role): role is 'admin_investasi' | 'administrator' {
  return ADMIN_ROLES.includes(role)
}

export type ReviewRole = 'rm' | 'appraisal' | 'investasi' | 'legal'

export type ItemStatus = 'OK' | 'Revisi' | 'NO' | null

export type ChecklistSection = 'inisiasi' | 'kualitatif' | 'kuantitatif' | 'revolving'

// Skor Likert 1-5 (ASUMSI SEMENTARA, lihat 06-update-round2 poin 6).
export type Likert = 1 | 2 | 3 | 4 | 5

export interface ChecklistItem {
  id: string
  section: ChecklistSection
  group: string
  label: string
  reviewRole: ReviewRole
  fileName?: string
  // status kini DERIVED dari `likert` (lihat lib/checklist.ts#deriveStatusFromLikert),
  // tetap disimpan supaya UI lama (badge OK/Revisi/NO) tidak perlu berubah.
  status: ItemStatus
  likert: Likert | null
  // Poin maksimal item ini dari total 100 poin per pipeline (07-koreksi-skor-poin poin 1).
  // Skor item = (likert / 5) x maxPoints.
  maxPoints: number
  notes?: string
  remarksLocked: boolean
  remarks?: string
  // true HANYA untuk item SLIK & APU PPT di section Inisiasi — dinilai langsung oleh
  // Admin Investasi/Administrator (Fase 1), tidak muncul di halaman Review manapun.
  // Lihat 06-update-round2 poin 7.
  adminScored?: boolean
}

export type PipelineStatus = 'Berjalan' | 'Siap Release' | 'Released'

export interface PipelineData {
  code: string
  tanggal: string
  // Field baru round 2 (poin 3): dipakai tabel "Pipeline Jatuh Tempo Terdekat".
  dueDate: string
  namaEntitas: string
  keterangan: string
  fasilitas: string
  batch: string
}

export interface DisbursementEntry {
  id: string
  nominal: number
  fileName?: string
}

export interface MonthDisbursement {
  new: DisbursementEntry[]
  revolving: DisbursementEntry[]
}

// Asset Under Management — data DUMMY saja, field lengkap menyusul (ASUMSI SEMENTARA,
// 06-update-round2 poin 4).
export interface AssetItem {
  id: string
  nama: string
  jenisDokumen: string
}

// Activity Log per-pipeline & global memakai struktur yang sama: `waktu` (absolut, dipakai
// halaman Activity Log global) dan `waktuRelatif` (dipakai section Activity Log di Detail
// Pipeline). Data dummy (06-update-round2 poin 4 & 10).
export interface ActivityLogEntry {
  id: string
  aktor: string
  aktorRole: Role
  aksi: string
  waktu: string
  waktuRelatif: string
}

export type Kolektibilitas = 'Lancar' | 'Dalam Perhatian Khusus' | 'Kurang Lancar' | 'Diragukan' | 'Macet'

// Form terstruktur SLIK (06-update-round2 poin 8, ASUMSI SEMENTARA).
export interface SlikRow {
  id: string
  bank: string
  jenisFasilitas: string
  plafond: number
  bakiDebet: number
  kolektibilitas: Kolektibilitas
  tanggalData: string
}

export interface Pipeline extends PipelineData {
  id: string
  nomor: number
  checklist: ChecklistItem[]
  released: boolean
  disbursements: Record<string, MonthDisbursement>
  assetsUnderManagement: AssetItem[]
  activityLog: ActivityLogEntry[]
  slikRows: SlikRow[]
}

export interface CurrentUser {
  role: Role
  username: string
}
