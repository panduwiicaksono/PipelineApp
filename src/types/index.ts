export type Role = 'admin' | 'appraisal' | 'investasi' | 'legal' | 'rm'

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin',
  appraisal: 'Appraisal',
  investasi: 'Investasi',
  legal: 'Legal',
  rm: 'Relationship Manager',
}

export type ReviewRole = 'rm' | 'appraisal' | 'investasi' | 'legal'

export type ItemStatus = 'OK' | 'Revisi' | 'NO' | null

export type ChecklistSection = 'inisiasi' | 'kualitatif' | 'kuantitatif' | 'revolving'

export interface ChecklistItem {
  id: string
  section: ChecklistSection
  group: string
  label: string
  reviewRole: ReviewRole
  fileName?: string
  status: ItemStatus
  notes?: string
  remarksLocked: boolean
  remarks?: string
}

export type PipelineStatus = 'Berjalan' | 'Siap Release' | 'Released'

export interface PipelineData {
  code: string
  tanggal: string
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

export interface Pipeline extends PipelineData {
  id: string
  nomor: number
  checklist: ChecklistItem[]
  released: boolean
  disbursements: Record<string, MonthDisbursement>
}

export interface CurrentUser {
  role: Role
  username: string
}
