import { createChecklistTemplate, deriveStatusFromLikert } from '@/lib/checklist'
import type { ActivityLogEntry, AssetItem, ChecklistItem, ChecklistSection, Likert, Pipeline, SlikRow } from '@/types'

function fileNameFor(label: string) {
  return `${label.replace(/[^a-zA-Z0-9]+/g, '_')}.pdf`
}

// Item SLIK & APU PPT (adminScored) sengaja DIKECUALIKAN dari helper generik di bawah karena
// dinilai langsung oleh Admin lewat setAdminScore, bukan lewat alur Review biasa.
function nonAdminItems(items: ChecklistItem[], section: ChecklistSection) {
  return items.filter((i) => i.section === section && !i.adminScored)
}

function setLikertRange(items: ChecklistItem[], section: ChecklistSection, count: number, likert: Likert, opts?: { withNotes?: boolean }) {
  const scoped = nonAdminItems(items, section)
  scoped.slice(0, count).forEach((item, idx) => {
    item.likert = likert
    item.status = deriveStatusFromLikert(likert)
    item.remarksLocked = false
    item.fileName = fileNameFor(item.label)
    if (opts?.withNotes && idx === 0) {
      item.notes = 'Sudah sesuai, tidak ada catatan tambahan.'
      item.remarks = 'Disetujui.'
    }
  })
}

function setSingleLikert(items: ChecklistItem[], section: ChecklistSection, index: number, likert: Likert, note: string) {
  const scoped = nonAdminItems(items, section)
  const item = scoped[index]
  if (item) {
    item.likert = likert
    item.status = deriveStatusFromLikert(likert)
    item.remarksLocked = false
    item.fileName = fileNameFor(item.label)
    item.notes = note
  }
}

function uploadOnly(items: ChecklistItem[], section: ChecklistSection, fromIndex: number, toIndex: number) {
  const scoped = nonAdminItems(items, section)
  scoped.slice(fromIndex, toIndex).forEach((item) => {
    item.fileName = fileNameFor(item.label)
  })
}

// Fase 1 (poin 7): SLIK & APU PPT dinilai langsung oleh Admin Investasi/Administrator.
function setAdminScore(items: ChecklistItem[], label: 'SLIK' | 'APU PPT', likert: Likert | null) {
  const item = items.find((i) => i.section === 'inisiasi' && i.adminScored && i.label === label)
  if (item) {
    item.likert = likert
    item.status = deriveStatusFromLikert(likert)
    item.fileName = likert !== null ? fileNameFor(`${label}_admin`) : item.fileName
  }
}

let pipelineIdCounter = 0
function pid() {
  pipelineIdCounter += 1
  return `pl-${pipelineIdCounter}`
}

let slikIdCounter = 0
function slikId() {
  slikIdCounter += 1
  return `slik-seed-${slikIdCounter}`
}

let assetIdCounter = 0
function assetId() {
  assetIdCounter += 1
  return `asset-seed-${assetIdCounter}`
}

let activityIdCounter = 0
function activityId() {
  activityIdCounter += 1
  return `act-seed-${activityIdCounter}`
}

function slik(bank: string, jenisFasilitas: string, plafond: number, bakiDebet: number, kolektibilitas: SlikRow['kolektibilitas'], tanggalData: string): SlikRow {
  return { id: slikId(), bank, jenisFasilitas, plafond, bakiDebet, kolektibilitas, tanggalData }
}

function asset(nama: string, jenisDokumen: string): AssetItem {
  return { id: assetId(), nama, jenisDokumen }
}

function activity(aktor: string, aktorRole: ActivityLogEntry['aktorRole'], aksi: string, waktu: string, waktuRelatif: string): ActivityLogEntry {
  return { id: activityId(), aktor, aktorRole, aksi, waktu, waktuRelatif }
}

function basePipeline(
  nomor: number,
  code: string,
  tanggal: string,
  dueDate: string,
  namaEntitas: string,
  keterangan: string,
  fasilitas: string,
  batch: string,
): Pipeline {
  return {
    id: pid(),
    nomor,
    code,
    tanggal,
    dueDate,
    namaEntitas,
    keterangan,
    fasilitas,
    batch,
    checklist: createChecklistTemplate(),
    released: false,
    disbursements: {},
    assetsUnderManagement: [],
    activityLog: [],
    slikRows: [],
  }
}

export function createSeedPipelines(): Pipeline[] {
  const pipelines: Pipeline[] = []

  // 1. Ternakita — 100%, fully reviewed, released, ada disbursement, Fase 1 LOLOS penuh
  const ternakita = basePipeline(1, 'JV-001', '2024-10-02', '2024-11-15', 'Ternakita', 'Pembiayaan modal kerja peternakan ayam', 'New Disbursement', 'Batch Oktober 2024')
  setLikertRange(ternakita.checklist, 'inisiasi', 5, 5, { withNotes: true })
  setLikertRange(ternakita.checklist, 'kualitatif', 18, 5, { withNotes: true })
  setLikertRange(ternakita.checklist, 'kuantitatif', 7, 5, { withNotes: true })
  setLikertRange(ternakita.checklist, 'revolving', 5, 5)
  setAdminScore(ternakita.checklist, 'SLIK', 5)
  setAdminScore(ternakita.checklist, 'APU PPT', 5)
  ternakita.released = true
  ternakita.disbursements = {
    Oktober: {
      new: [{ id: 'd-1', nominal: 1_150_000_000, fileName: 'BAST_Pencairan_New_Okt.pdf' }],
      revolving: [{ id: 'd-2', nominal: 725_000_000, fileName: 'BAST_Pencairan_Revolving_Okt.pdf' }],
    },
  }
  ternakita.assetsUnderManagement = [asset('Tanah & Bangunan — Kandang Ayam', 'Sertifikat SHM'), asset('Kendaraan Operasional', 'BPKB Truk')]
  ternakita.slikRows = [
    slik('Bank Mandiri', 'KMK', 2_000_000_000, 850_000_000, 'Lancar', '2024-09-20'),
    slik('Bank BRI', 'KI', 500_000_000, 120_000_000, 'Lancar', '2024-09-20'),
  ]
  ternakita.activityLog = [
    activity('Admin Investasi', 'admin_investasi', 'Mengupload dokumen SLIK', '25 Sep 2026 10:15', '1 hari lalu'),
    activity('RM', 'rm', 'Menilai status Notes pada item Call Report', '24 Sep 2026 14:30', '2 hari lalu'),
    activity('Appraisal', 'appraisal', 'Menilai Aspek CPU dengan skor 5', '23 Sep 2026 11:05', '3 hari lalu'),
  ]
  pipelines.push(ternakita)

  // 2. Invonex — ~93%, released, belum ada disbursement (Deficit), Fase 1 LOLOS
  const invonex = basePipeline(2, 'JV-002', '2024-10-05', '2024-11-20', 'Invonex', 'Pembiayaan invoice financing', 'New Disbursement', 'Batch Oktober 2024')
  setLikertRange(invonex.checklist, 'inisiasi', 5, 5)
  setLikertRange(invonex.checklist, 'kualitatif', 17, 5)
  setSingleLikert(invonex.checklist, 'kualitatif', 17, 3, 'Dokumen kontrak payung perlu diperbarui, mohon revisi.')
  setLikertRange(invonex.checklist, 'kuantitatif', 6, 5)
  setSingleLikert(invonex.checklist, 'kuantitatif', 6, 2, 'Simulasi skema pembiayaan belum sesuai template.')
  setAdminScore(invonex.checklist, 'SLIK', 4)
  setAdminScore(invonex.checklist, 'APU PPT', 4)
  invonex.released = true
  invonex.assetsUnderManagement = [asset('Piutang Invoice Terverifikasi', 'Invoice Pembelian')]
  invonex.activityLog = [
    activity('Admin Investasi', 'admin_investasi', 'Me-release pipeline', '23 Sep 2026 09:00', '3 hari lalu'),
    activity('Legal', 'legal', 'Memberi Revisi pada item Kontrak Payung/SPK', '22 Sep 2026 15:40', '3 hari lalu'),
  ]
  pipelines.push(invonex)

  // 3. Labmentari — 0%, belum ada progress sama sekali, Fase 1 BELUM dimulai (LOCKED)
  const labmentari = basePipeline(3, 'JV-003', '2024-11-10', '2024-12-05', 'Labmentari', 'Pembiayaan pengadaan alat lab', 'New Disbursement', 'Batch November 2024')
  labmentari.activityLog = [activity('Admin Investasi', 'admin_investasi', 'Menambahkan pipeline baru', '20 Sep 2026 11:00', '5 hari lalu')]
  pipelines.push(labmentari)

  // 4. Kerjabantu — ~44%, sedang berjalan, campuran status, Fase 1 GAGAL (nilai merah di SLIK)
  const kerjabantu = basePipeline(4, 'JV-004', '2024-11-12', '2024-11-25', 'Kerjabantu', 'Pembiayaan payroll outsourcing', 'New Disbursement', 'Batch November 2024')
  setLikertRange(kerjabantu.checklist, 'inisiasi', 2, 5)
  uploadOnly(kerjabantu.checklist, 'inisiasi', 2, 4)
  setLikertRange(kerjabantu.checklist, 'kualitatif', 9, 5)
  setSingleLikert(kerjabantu.checklist, 'kualitatif', 9, 3, 'Aspek risiko perlu mitigasi tambahan.')
  uploadOnly(kerjabantu.checklist, 'kualitatif', 10, 12)
  setLikertRange(kerjabantu.checklist, 'kuantitatif', 2, 5)
  setAdminScore(kerjabantu.checklist, 'SLIK', 1)
  setAdminScore(kerjabantu.checklist, 'APU PPT', 5)
  kerjabantu.activityLog = [
    activity('Admin Investasi', 'admin_investasi', 'Menilai SLIK dengan skor 1 (nilai merah)', '25 Sep 2026 08:45', '1 hari lalu'),
  ]
  pipelines.push(kerjabantu)

  // 5. Cahaya Fatura — released, ada disbursement revolving, Fase 1 LOLOS
  const cahayaFatura = basePipeline(5, 'JV-005', '2024-10-08', '2024-11-05', 'Cahaya Fatura', 'Fasilitas revolving invoice', 'Revolving', 'Batch Oktober 2024')
  setLikertRange(cahayaFatura.checklist, 'inisiasi', 5, 5)
  setLikertRange(cahayaFatura.checklist, 'kualitatif', 18, 5)
  setLikertRange(cahayaFatura.checklist, 'kuantitatif', 7, 5)
  setLikertRange(cahayaFatura.checklist, 'revolving', 5, 5)
  setAdminScore(cahayaFatura.checklist, 'SLIK', 5)
  setAdminScore(cahayaFatura.checklist, 'APU PPT', 4)
  cahayaFatura.released = true
  cahayaFatura.disbursements = {
    Oktober: { new: [], revolving: [{ id: 'd-3', nominal: 450_000_000, fileName: 'Pencairan_Revolving_CahayaFatura_Okt.pdf' }] },
  }
  cahayaFatura.assetsUnderManagement = [asset('Mesin Produksi', 'Invoice Pembelian')]
  cahayaFatura.activityLog = [
    activity('Investasi', 'investasi', 'Menilai item Simulasi Skema Pembiayaan', '22 Sep 2026 16:00', '3 hari lalu'),
    activity('Admin Investasi', 'admin_investasi', 'Menginput pencairan Revolving Oktober', '21 Sep 2026 10:30', '4 hari lalu'),
  ]
  pipelines.push(cahayaFatura)

  // 6. Nusantara Piutang — released, ada disbursement revolving bulan November, Fase 1 LOLOS
  const nusantaraPiutang = basePipeline(6, 'JV-006', '2024-10-15', '2024-11-10', 'Nusantara Piutang', 'Fasilitas revolving invoice', 'Revolving', 'Batch Oktober 2024')
  setLikertRange(nusantaraPiutang.checklist, 'inisiasi', 5, 5)
  setLikertRange(nusantaraPiutang.checklist, 'kualitatif', 18, 5)
  setLikertRange(nusantaraPiutang.checklist, 'kuantitatif', 7, 5)
  setAdminScore(nusantaraPiutang.checklist, 'SLIK', 4)
  setAdminScore(nusantaraPiutang.checklist, 'APU PPT', 4)
  nusantaraPiutang.released = true
  nusantaraPiutang.disbursements = {
    November: { new: [], revolving: [{ id: 'd-4', nominal: 460_000_000, fileName: 'Pencairan_Revolving_NusantaraPiutang_Nov.pdf' }] },
  }
  nusantaraPiutang.activityLog = [activity('Legal', 'legal', 'Menilai item PIC Bouwheer - Konfirmasi', '21 Sep 2026 13:20', '4 hari lalu')]
  pipelines.push(nusantaraPiutang)

  // 7. Dana Fatura Prima — released, ada disbursement revolving besar, Fase 1 LOLOS penuh
  const danaFaturaPrima = basePipeline(7, 'JV-007', '2024-10-18', '2024-11-08', 'Dana Fatura Prima', 'Fasilitas revolving invoice', 'Revolving', 'Batch Oktober 2024')
  setLikertRange(danaFaturaPrima.checklist, 'inisiasi', 5, 5)
  setLikertRange(danaFaturaPrima.checklist, 'kualitatif', 18, 5)
  setLikertRange(danaFaturaPrima.checklist, 'kuantitatif', 7, 5)
  setAdminScore(danaFaturaPrima.checklist, 'SLIK', 5)
  setAdminScore(danaFaturaPrima.checklist, 'APU PPT', 5)
  danaFaturaPrima.released = true
  danaFaturaPrima.disbursements = {
    Oktober: { new: [], revolving: [{ id: 'd-5', nominal: 912_430_580, fileName: 'Pencairan_Revolving_DanaFaturaPrima_Okt.pdf' }] },
  }
  danaFaturaPrima.assetsUnderManagement = [asset('Gudang Distribusi', 'Sertifikat SHM'), asset('Armada Truk (3 unit)', 'BPKB Truk')]
  danaFaturaPrima.activityLog = [
    activity('Appraisal', 'appraisal', 'Menilai Aspek Jaminan', '25 Sep 2026 15:10', '1 hari lalu'),
    activity('Admin Investasi', 'admin_investasi', 'Me-release pipeline', '18 Sep 2026 10:00', '7 hari lalu'),
  ]
  pipelines.push(danaFaturaPrima)

  // 8. Kudapan Rasa — belum ada progress (0%), Fase 1 di bawah ambang batas (LOCKED, tanpa nilai merah)
  const kudapanRasa = basePipeline(8, 'JV-008', '2024-11-20', '2024-12-15', 'Kudapan Rasa', 'Pembiayaan modal kerja produksi snack', 'New Disbursement', 'Batch November 2024')
  uploadOnly(kudapanRasa.checklist, 'inisiasi', 0, 2)
  setAdminScore(kudapanRasa.checklist, 'SLIK', 3)
  setAdminScore(kudapanRasa.checklist, 'APU PPT', 3)
  kudapanRasa.activityLog = [activity('Admin Investasi', 'admin_investasi', 'Menilai SLIK & APU PPT (skor 60%, belum lolos Fase 1)', '19 Sep 2026 09:30', '6 hari lalu')]
  pipelines.push(kudapanRasa)

  return pipelines
}
