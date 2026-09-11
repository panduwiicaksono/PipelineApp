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
  { entitas: 'Ternakita', oktNew: 1_100_000_000, oktRevolving: 0, novNew: 2_200_000_000, novRevolving: 0, desNew: 0, desRevolving: 1_100_000_000 },
  { entitas: 'Invonex', oktNew: 1_100_000_000, oktRevolving: 0, novNew: 1_100_000_000, novRevolving: 0, desNew: 0, desRevolving: 0 },
  { entitas: 'Labmentari', oktNew: 0, oktRevolving: 0, novNew: 1_200_000, novRevolving: 0, desNew: 1_100_000_000, desRevolving: 0 },
  { entitas: 'Kerjabantu', oktNew: 0, oktRevolving: 0, novNew: 1_100_000_000, novRevolving: 0, desNew: 0, desRevolving: 1_100_000_000 },
  { entitas: 'Kudapan Rasa', oktNew: 0, oktRevolving: 0, novNew: 1_100_000_000, novRevolving: 0, desNew: 0, desRevolving: 0 },
  { entitas: 'Motorika Jaya', oktNew: 0, oktRevolving: 0, novNew: 0, novRevolving: 0, desNew: 1_100_000_000, desRevolving: 0 },
  { entitas: 'Merapi Wahana Sejahtera', oktNew: 0, oktRevolving: 0, novNew: 0, novRevolving: 0, desNew: 0, desRevolving: 0 },
  { entitas: 'Anak Tangga', oktNew: 0, oktRevolving: 0, novNew: 2_200_000, novRevolving: 0, desNew: 0, desRevolving: 0 },
  { entitas: 'Dompet Rukun', oktNew: 0, oktRevolving: 0, novNew: 550_000_000, novRevolving: 0, desNew: 0, desRevolving: 0 },
  { entitas: 'Gudang Rapi', oktNew: 0, oktRevolving: 0, novNew: 0, novRevolving: 0, desNew: 0, desRevolving: 0 },
  { entitas: 'Cahaya Fatura', oktNew: 0, oktRevolving: 450_000_000, novNew: 0, novRevolving: 450_000_000, desNew: 0, desRevolving: 450_000_000 },
  { entitas: 'Nusantara Piutang', oktNew: 0, oktRevolving: 460_000_000, novNew: 0, novRevolving: 460_000_000, desNew: 0, desRevolving: 0 },
  { entitas: 'Dana Fatura Prima', oktNew: 0, oktRevolving: 1_050_000_000, novNew: 0, novRevolving: 1_050_000_000, desNew: 0, desRevolving: 2_100_000_000 },
  { entitas: 'Palapa Lintas', oktNew: 0, oktRevolving: 0, novNew: 0, novRevolving: 550_000_000, desNew: 0, desRevolving: 0 },
  { entitas: 'Eltara', oktNew: 0, oktRevolving: 0, novNew: 0, novRevolving: 0, desNew: 0, desRevolving: 550_000_000 },
  { entitas: 'Tirtayasa', oktNew: 0, oktRevolving: 0, novNew: 1_100_000_000, novRevolving: 0, desNew: 0, desRevolving: 0 },
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
  oktNew: 2_200_000_000,
  oktRevolving: 2_200_000_000,
  novNew: 6_600_000_000,
  novRevolving: 2_200_000_000,
  desNew: 2_200_000_000,
  desRevolving: 5_500_000_000,
  total: 20_900_000_000,
}

export interface SaldoKasRow {
  tanggal: string
  proyeksi: number
  realisasi: number
  isTotal?: boolean
}

// Data statis "Saldo Kas" — tidak ada modul input terpisah untuk ini di spesifikasi manapun.
export const SALDO_KAS: SaldoKasRow[] = [
  { tanggal: '22 Okt 2024', proyeksi: 19_700_000_000, realisasi: 19_700_000_000 },
  { tanggal: '31 Okt 2024', proyeksi: 17_600_000_000, realisasi: 17_600_000_000 },
  { tanggal: '30 Nov 2024', proyeksi: 11_000_000_000, realisasi: 17_600_000_000 },
  { tanggal: '31 Des 2024', proyeksi: 8_800_000_000, realisasi: 17_600_000_000 },
  { tanggal: 'Reserves', proyeksi: 5_500_000_000, realisasi: 5_500_000_000 },
  { tanggal: 'Sisa Saldo Kas', proyeksi: 3_300_000_000, realisasi: 12_100_000_000, isTotal: true },
]

// Status kolom pada tabel "Realisasi Pipelines" bersifat statis mengikuti sheet sumber
// (tidak ada formula eksplisit yang didefinisikan di spesifikasi — lihat catatan asumsi).
export const REALISASI_STATUS: Record<string, string> = {
  Ternakita: 'OK',
  Invonex: 'Deficit',
}

export const MONTHS_DASHBOARD = ['Oktober', 'November', 'Desember'] as const
