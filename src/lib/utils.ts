import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(value: number): string {
  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(Math.round(value))
  return `${sign}Rp ${abs.toLocaleString('id-ID')}`
}

export function formatNumberID(value: number): string {
  return Math.round(value).toLocaleString('id-ID')
}

export function formatDateID(iso: string): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const INDO_MONTHS: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  mei: 4,
  jun: 5,
  jul: 6,
  agu: 7,
  sep: 8,
  okt: 9,
  nov: 10,
  des: 11,
}

// Parser kecil untuk format dummy "25 Sep 2026 10:15" yang dipakai Activity Log — dipakai
// hanya untuk sorting, bukan tanggal bisnis sungguhan (06-update-round2 poin 10).
export function parseIndoDateTime(text: string): number {
  const match = text.match(/(\d{1,2})\s+(\w{3})\w*\s+(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/)
  if (!match) return 0
  const [, day, monRaw, year, hour, minute] = match
  const month = INDO_MONTHS[monRaw.toLowerCase()] ?? 0
  return new Date(Number(year), month, Number(day), Number(hour ?? 0), Number(minute ?? 0)).getTime()
}
