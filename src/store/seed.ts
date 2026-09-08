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

  // 1. BroilerX — 100%, fully reviewed, released, ada disbursement
  const broilerX = basePipeline(1, 'JV-001', '2024-10-02', 'BroilerX', 'Pembiayaan modal kerja peternakan ayam', 'New Disbursement', 'Batch Oktober 2024')
  markOk(broilerX.checklist, 'inisiasi', 6, { withNotes: true })
  markOk(broilerX.checklist, 'kualitatif', 18, { withNotes: true })
  markOk(broilerX.checklist, 'kuantitatif', 7, { withNotes: true })
  markOk(broilerX.checklist, 'revolving', 5)
  broilerX.released = true
  broilerX.disbursements = {
    Oktober: {
      new: [{ id: 'd-1', nominal: 1_088_000_000, fileName: 'BAST_Pencairan_New_Okt.pdf' }],
      revolving: [{ id: 'd-2', nominal: 682_000_000, fileName: 'BAST_Pencairan_Revolving_Okt.pdf' }],
    },
  }
  pipelines.push(broilerX)

  // 2. ACML — ~93%, released, belum ada disbursement (Deficit)
  const acml = basePipeline(2, 'JV-002', '2024-10-05', 'ACML', 'Pembiayaan invoice financing', 'New Disbursement', 'Batch Oktober 2024')
  markOk(acml.checklist, 'inisiasi', 6)
  markOk(acml.checklist, 'kualitatif', 17)
  markStatus(acml.checklist, 'kualitatif', 17, 'Revisi', 'Dokumen kontrak payung perlu diperbarui, mohon revisi.')
  markOk(acml.checklist, 'kuantitatif', 6)
  markStatus(acml.checklist, 'kuantitatif', 6, 'NO', 'Simulasi skema pembiayaan belum sesuai template.')
  acml.released = true
  pipelines.push(acml)

  // 3. Kinglab — 0%, belum ada progress sama sekali
  const kinglab = basePipeline(3, 'JV-003', '2024-11-10', 'Kinglab', 'Pembiayaan pengadaan alat lab', 'New Disbursement', 'Batch November 2024')
  pipelines.push(kinglab)

  // 4. MyRobin — ~44%, sedang berjalan, campuran status
  const myRobin = basePipeline(4, 'JV-004', '2024-11-12', 'MyRobin', 'Pembiayaan payroll outsourcing', 'New Disbursement', 'Batch November 2024')
  markOk(myRobin.checklist, 'inisiasi', 3)
  uploadOnly(myRobin.checklist, 'inisiasi', 3, 5)
  markOk(myRobin.checklist, 'kualitatif', 9)
  markStatus(myRobin.checklist, 'kualitatif', 9, 'Revisi', 'Aspek risiko perlu mitigasi tambahan.')
  uploadOnly(myRobin.checklist, 'kualitatif', 10, 12)
  markOk(myRobin.checklist, 'kuantitatif', 2)
  pipelines.push(myRobin)

  // 5. Yoona — released, ada disbursement revolving
  const yoona = basePipeline(5, 'JV-005', '2024-10-08', 'Yoona', 'Fasilitas revolving invoice', 'Revolving', 'Batch Oktober 2024')
  markOk(yoona.checklist, 'inisiasi', 6)
  markOk(yoona.checklist, 'kualitatif', 18)
  markOk(yoona.checklist, 'kuantitatif', 7)
  markOk(yoona.checklist, 'revolving', 5)
  yoona.released = true
  yoona.disbursements = {
    Oktober: { new: [], revolving: [{ id: 'd-3', nominal: 500_000_000, fileName: 'Pencairan_Revolving_Yoona_Okt.pdf' }] },
  }
  pipelines.push(yoona)

  // 6. Rakamin — released, ada disbursement revolving bulan November
  const rakamin = basePipeline(6, 'JV-006', '2024-10-15', 'Rakamin', 'Fasilitas revolving invoice', 'Revolving', 'Batch Oktober 2024')
  markOk(rakamin.checklist, 'inisiasi', 6)
  markOk(rakamin.checklist, 'kualitatif', 18)
  markOk(rakamin.checklist, 'kuantitatif', 7)
  rakamin.released = true
  rakamin.disbursements = {
    November: { new: [], revolving: [{ id: 'd-4', nominal: 500_000_000, fileName: 'Pencairan_Revolving_Rakamin_Nov.pdf' }] },
  }
  pipelines.push(rakamin)

  // 7. ACMD — released, ada disbursement revolving besar
  const acmd = basePipeline(7, 'JV-007', '2024-10-18', 'ACMD', 'Fasilitas revolving invoice', 'Revolving', 'Batch Oktober 2024')
  markOk(acmd.checklist, 'inisiasi', 6)
  markOk(acmd.checklist, 'kualitatif', 18)
  markOk(acmd.checklist, 'kuantitatif', 7)
  acmd.released = true
  acmd.disbursements = {
    Oktober: { new: [], revolving: [{ id: 'd-5', nominal: 997_759_695, fileName: 'Pencairan_Revolving_ACMD_Okt.pdf' }] },
  }
  pipelines.push(acmd)

  // 8. Snackzone — belum ada progress (0%)
  const snackzone = basePipeline(8, 'JV-008', '2024-11-20', 'Snackzone', 'Pembiayaan modal kerja produksi snack', 'New Disbursement', 'Batch November 2024')
  uploadOnly(snackzone.checklist, 'inisiasi', 0, 2)
  pipelines.push(snackzone)

  return pipelines
}
