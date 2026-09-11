import { createChecklistTemplate } from '@/lib/checklist'
import type { ChecklistItem, ChecklistSection, Pipeline } from '@/types'

function markOk(items: ChecklistItem[], section: ChecklistSection, count: number, opts?: { withNotes?: boolean }) {
  const scoped = items.filter((i) => i.section === section)
  scoped.slice(0, count).forEach((item, idx) => {
    item.status = 'OK'
    item.remarksLocked = false
    item.fileName = `${item.label.replace(/[^a-zA-Z0-9]+/g, '_')}.pdf`
    if (opts?.withNotes && idx === 0) {
      item.notes = 'Sudah sesuai, tidak ada catatan tambahan.'
      item.remarks = 'Disetujui.'
    }
  })
}

function markStatus(items: ChecklistItem[], section: ChecklistSection, index: number, status: 'Revisi' | 'NO', note: string) {
  const scoped = items.filter((i) => i.section === section)
  const item = scoped[index]
  if (item) {
    item.status = status
    item.remarksLocked = false
    item.fileName = `${item.label.replace(/[^a-zA-Z0-9]+/g, '_')}.pdf`
    item.notes = note
  }
}

function uploadOnly(items: ChecklistItem[], section: ChecklistSection, fromIndex: number, toIndex: number) {
  const scoped = items.filter((i) => i.section === section)
  scoped.slice(fromIndex, toIndex).forEach((item) => {
    item.fileName = `${item.label.replace(/[^a-zA-Z0-9]+/g, '_')}.pdf`
  })
}

let pipelineIdCounter = 0
function pid() {
  pipelineIdCounter += 1
  return `pl-${pipelineIdCounter}`
}

function basePipeline(nomor: number, code: string, tanggal: string, namaEntitas: string, keterangan: string, fasilitas: string, batch: string): Pipeline {
  return {
    id: pid(),
    nomor,
    code,
    tanggal,
    namaEntitas,
    keterangan,
    fasilitas,
    batch,
    checklist: createChecklistTemplate(),
    released: false,
    disbursements: {},
  }
}

export function createSeedPipelines(): Pipeline[] {
  const pipelines: Pipeline[] = []

  // 1. Ternakita — 100%, fully reviewed, released, ada disbursement
  const ternakita = basePipeline(1, 'JV-001', '2024-10-02', 'Ternakita', 'Pembiayaan modal kerja peternakan ayam', 'New Disbursement', 'Batch Oktober 2024')
  markOk(ternakita.checklist, 'inisiasi', 6, { withNotes: true })
  markOk(ternakita.checklist, 'kualitatif', 18, { withNotes: true })
  markOk(ternakita.checklist, 'kuantitatif', 7, { withNotes: true })
  markOk(ternakita.checklist, 'revolving', 5)
  ternakita.released = true
  ternakita.disbursements = {
    Oktober: {
      new: [{ id: 'd-1', nominal: 1_150_000_000, fileName: 'BAST_Pencairan_New_Okt.pdf' }],
      revolving: [{ id: 'd-2', nominal: 725_000_000, fileName: 'BAST_Pencairan_Revolving_Okt.pdf' }],
    },
  }
  pipelines.push(ternakita)

  // 2. Invonex — ~93%, released, belum ada disbursement (Deficit)
  const invonex = basePipeline(2, 'JV-002', '2024-10-05', 'Invonex', 'Pembiayaan invoice financing', 'New Disbursement', 'Batch Oktober 2024')
  markOk(invonex.checklist, 'inisiasi', 6)
  markOk(invonex.checklist, 'kualitatif', 17)
  markStatus(invonex.checklist, 'kualitatif', 17, 'Revisi', 'Dokumen kontrak payung perlu diperbarui, mohon revisi.')
  markOk(invonex.checklist, 'kuantitatif', 6)
  markStatus(invonex.checklist, 'kuantitatif', 6, 'NO', 'Simulasi skema pembiayaan belum sesuai template.')
  invonex.released = true
  pipelines.push(invonex)

  // 3. Labmentari — 0%, belum ada progress sama sekali
  const labmentari = basePipeline(3, 'JV-003', '2024-11-10', 'Labmentari', 'Pembiayaan pengadaan alat lab', 'New Disbursement', 'Batch November 2024')
  pipelines.push(labmentari)

  // 4. Kerjabantu — ~44%, sedang berjalan, campuran status
  const kerjabantu = basePipeline(4, 'JV-004', '2024-11-12', 'Kerjabantu', 'Pembiayaan payroll outsourcing', 'New Disbursement', 'Batch November 2024')
  markOk(kerjabantu.checklist, 'inisiasi', 3)
  uploadOnly(kerjabantu.checklist, 'inisiasi', 3, 5)
  markOk(kerjabantu.checklist, 'kualitatif', 9)
  markStatus(kerjabantu.checklist, 'kualitatif', 9, 'Revisi', 'Aspek risiko perlu mitigasi tambahan.')
  uploadOnly(kerjabantu.checklist, 'kualitatif', 10, 12)
  markOk(kerjabantu.checklist, 'kuantitatif', 2)
  pipelines.push(kerjabantu)

  // 5. Cahaya Fatura — released, ada disbursement revolving
  const cahayaFatura = basePipeline(5, 'JV-005', '2024-10-08', 'Cahaya Fatura', 'Fasilitas revolving invoice', 'Revolving', 'Batch Oktober 2024')
  markOk(cahayaFatura.checklist, 'inisiasi', 6)
  markOk(cahayaFatura.checklist, 'kualitatif', 18)
  markOk(cahayaFatura.checklist, 'kuantitatif', 7)
  markOk(cahayaFatura.checklist, 'revolving', 5)
  cahayaFatura.released = true
  cahayaFatura.disbursements = {
    Oktober: { new: [], revolving: [{ id: 'd-3', nominal: 450_000_000, fileName: 'Pencairan_Revolving_CahayaFatura_Okt.pdf' }] },
  }
  pipelines.push(cahayaFatura)

  // 6. Nusantara Piutang — released, ada disbursement revolving bulan November
  const nusantaraPiutang = basePipeline(6, 'JV-006', '2024-10-15', 'Nusantara Piutang', 'Fasilitas revolving invoice', 'Revolving', 'Batch Oktober 2024')
  markOk(nusantaraPiutang.checklist, 'inisiasi', 6)
  markOk(nusantaraPiutang.checklist, 'kualitatif', 18)
  markOk(nusantaraPiutang.checklist, 'kuantitatif', 7)
  nusantaraPiutang.released = true
  nusantaraPiutang.disbursements = {
    November: { new: [], revolving: [{ id: 'd-4', nominal: 460_000_000, fileName: 'Pencairan_Revolving_NusantaraPiutang_Nov.pdf' }] },
  }
  pipelines.push(nusantaraPiutang)

  // 7. Dana Fatura Prima — released, ada disbursement revolving besar
  const danaFaturaPrima = basePipeline(7, 'JV-007', '2024-10-18', 'Dana Fatura Prima', 'Fasilitas revolving invoice', 'Revolving', 'Batch Oktober 2024')
  markOk(danaFaturaPrima.checklist, 'inisiasi', 6)
  markOk(danaFaturaPrima.checklist, 'kualitatif', 18)
  markOk(danaFaturaPrima.checklist, 'kuantitatif', 7)
  danaFaturaPrima.released = true
  danaFaturaPrima.disbursements = {
    Oktober: { new: [], revolving: [{ id: 'd-5', nominal: 912_430_580, fileName: 'Pencairan_Revolving_DanaFaturaPrima_Okt.pdf' }] },
  }
  pipelines.push(danaFaturaPrima)

  // 8. Kudapan Rasa — belum ada progress (0%)
  const kudapanRasa = basePipeline(8, 'JV-008', '2024-11-20', 'Kudapan Rasa', 'Pembiayaan modal kerja produksi snack', 'New Disbursement', 'Batch November 2024')
  uploadOnly(kudapanRasa.checklist, 'inisiasi', 0, 2)
  pipelines.push(kudapanRasa)

  return pipelines
}
