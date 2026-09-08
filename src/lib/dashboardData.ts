export interface TargetRow {
  entitas: string
  oktNew: number
  oktRevolving: number
  novNew: number
  novRevolving: number
  desNew: number
  desRevolving: number
}

// Data statis "Target Pipelines" — sesuai sheet Excel sumber, tidak ada modul input terpisah
// untuk target sehingga tetap hardcoded (lihat catatan asumsi).
export const TARGET_PIPELINES: TargetRow[] = [
  { entitas: 'BroilerX', oktNew: 1_000_000_000, oktRevolving: 0, novNew: 2_000_000_000, novRevolving: 0, desNew: 0, desRevolving: 1_000_000_000 },
  { entitas: 'ACML', oktNew: 1_000_000_000, oktRevolving: 0, novNew: 1_000_000_000, novRevolving: 0, desNew: 0, desRevolving: 0 },
  { entitas: 'Kinglab', oktNew: 0, oktRevolving: 0, novNew: 1_000_000, novRevolving: 0, desNew: 1_000_000_000, desRevolving: 0 },
  { entitas: 'MyRobin', oktNew: 0, oktRevolving: 0, novNew: 1_000_000_000, novRevolving: 0, desNew: 0, desRevolving: 1_000_000_000 },
  { entitas: 'Snackzone', oktNew: 0, oktRevolving: 0, novNew: 1_000_000_000, novRevolving: 0, desNew: 0, desRevolving: 0 },
  { entitas: 'Matador Lectro', oktNew: 0, oktRevolving: 0, novNew: 0, novRevolving: 0, desNew: 1_000_000_000, desRevolving: 0 },
  { entitas: 'Merpati Wahana Raya', oktNew: 0, oktRevolving: 0, novNew: 0, novRevolving: 0, desNew: 0, desRevolving: 0 },
  { entitas: 'Tangga', oktNew: 0, oktRevolving: 0, novNew: 2_000_000, novRevolving: 0, desNew: 0, desRevolving: 0 },
  { entitas: 'Arkopay', oktNew: 0, oktRevolving: 0, novNew: 500_000_000, novRevolving: 0, desNew: 0, desRevolving: 0 },
  { entitas: 'BGR', oktNew: 0, oktRevolving: 0, novNew: 0, novRevolving: 0, desNew: 0, desRevolving: 0 },
  { entitas: 'Yoona', oktNew: 0, oktRevolving: 500_000_000, novNew: 0, novRevolving: 500_000_000, desNew: 0, desRevolving: 500_000_000 },
  { entitas: 'Rakamin', oktNew: 0, oktRevolving: 500_000_000, novNew: 0, novRevolving: 500_000_000, desNew: 0, desRevolving: 0 },
  { entitas: 'ACMD', oktNew: 0, oktRevolving: 1_000_000_000, novNew: 0, novRevolving: 1_000_000_000, desNew: 0, desRevolving: 2_000_000_000 },
  { entitas: 'Pamelindo', oktNew: 0, oktRevolving: 0, novNew: 0, novRevolving: 500_000_000, desNew: 0, desRevolving: 0 },
  { entitas: 'Eshan', oktNew: 0, oktRevolving: 0, novNew: 0, novRevolving: 0, desNew: 0, desRevolving: 500_000_000 },
  { entitas: 'Taitat', oktNew: 0, oktRevolving: 0, novNew: 1_000_000_000, novRevolving: 0, desNew: 0, desRevolving: 0 },
]

export function targetRowTotal(row: TargetRow): number {
  return row.oktNew + row.oktRevolving + row.novNew + row.novRevolving + row.desNew + row.desRevolving
}

// SUBTOTAL "Target Pipelines" — diambil literal dari spec (bukan hasil penjumlahan baris di
// atas), karena angka per-baris pada spec sumber tidak persis menjumlah ke subtotalnya
// (selisih kecil, kemungkinan artefak pembulatan/transkripsi dari Excel asli). Baris individual
// tetap ditampilkan apa adanya sesuai spec; SUBTOTAL & KPI memakai angka eksplisit ini supaya
// konsisten dengan angka yang diberikan di bagian KPI (lihat catatan asumsi).
export const TARGET_SUBTOTAL = {
  oktNew: 2_000_000_000,
  oktRevolving: 2_000_000_000,
  novNew: 6_000_000_000,
  novRevolving: 2_000_000_000,
  desNew: 2_000_000_000,
  desRevolving: 5_000_000_000,
  total: 19_000_000_000,
}

export interface SaldoKasRow {
  tanggal: string
  proyeksi: number
  realisasi: number
  isTotal?: boolean
}

// Data statis "Saldo Kas" — tidak ada modul input terpisah untuk ini di spesifikasi manapun.
export const SALDO_KAS: SaldoKasRow[] = [
  { tanggal: '22 Okt 2024', proyeksi: 17_900_000_000, realisasi: 17_900_000_000 },
  { tanggal: '31 Okt 2024', proyeksi: 16_000_000_000, realisasi: 16_000_000_000 },
  { tanggal: '30 Nov 2024', proyeksi: 10_000_000_000, realisasi: 16_000_000_000 },
  { tanggal: '31 Des 2024', proyeksi: 8_000_000_000, realisasi: 16_000_000_000 },
  { tanggal: 'Reserves', proyeksi: 5_000_000_000, realisasi: 5_000_000_000 },
  { tanggal: 'Sisa Saldo Kas', proyeksi: 3_000_000_000, realisasi: 11_000_000_000, isTotal: true },
]

// Status kolom pada tabel "Realisasi Pipelines" bersifat statis mengikuti sheet sumber
// (tidak ada formula eksplisit yang didefinisikan di spesifikasi — lihat catatan asumsi).
export const REALISASI_STATUS: Record<string, string> = {
  BroilerX: 'OK',
  ACML: 'Deficit',
}

export const MONTHS_DASHBOARD = ['Oktober', 'November', 'Desember'] as const
