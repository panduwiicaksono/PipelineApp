import { create } from 'zustand'
import type {
  ActivityLogEntry,
  ChecklistItem,
  CurrentUser,
  DisbursementEntry,
  Likert,
  Pipeline,
  PipelineData,
  Role,
  SlikRow,
} from '@/types'
import { createChecklistTemplate, deriveStatusFromLikert } from '@/lib/checklist'
import { createSeedPipelines } from './seed'

let disbursementIdCounter = 1000
function nextDisbursementId() {
  disbursementIdCounter += 1
  return `dsb-${disbursementIdCounter}`
}

let activityIdCounter = 1000
function nextActivityId() {
  activityIdCounter += 1
  return `act-${activityIdCounter}`
}

let slikRowIdCounter = 1000
function nextSlikRowId() {
  slikRowIdCounter += 1
  return `slik-${slikRowIdCounter}`
}

export interface ReviewUpdate {
  itemId: string
  likert?: Likert | null
  notes?: string
  remarks?: string
}

interface AppState {
  currentUser: CurrentUser | null
  pipelines: Pipeline[]

  login: (role: Role, username: string) => void
  logout: () => void

  addPipeline: (data: PipelineData) => string
  setItemFile: (pipelineId: string, itemId: string, fileName: string) => void
  // Dipakai halaman Review biasa & Review Fase 1 (SLIK/APU PPT) — lihat
  // 07-koreksi-skor-poin poin 4.
  applyReviewUpdates: (pipelineId: string, updates: ReviewUpdate[]) => void
  releasePipeline: (pipelineId: string) => void

  addDisbursementMonth: (pipelineId: string, month: string) => void
  addDisbursementEntry: (pipelineId: string, month: string, type: 'new' | 'revolving', nominal: number, fileName?: string) => void
  removeDisbursementEntry: (pipelineId: string, month: string, type: 'new' | 'revolving', entryId: string) => void

  addSlikRow: (pipelineId: string, row: Omit<SlikRow, 'id'>) => void
  addSlikRows: (pipelineId: string, rows: Omit<SlikRow, 'id'>[]) => void
  updateSlikRow: (pipelineId: string, rowId: string, patch: Partial<Omit<SlikRow, 'id'>>) => void
  removeSlikRow: (pipelineId: string, rowId: string) => void

  addActivityLog: (pipelineId: string, entry: Omit<ActivityLogEntry, 'id'>) => void
}

function nextNomor(pipelines: Pipeline[]): number {
  return pipelines.reduce((max, p) => Math.max(max, p.nomor), 0) + 1
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  pipelines: createSeedPipelines(),

  login: (role, username) => set({ currentUser: { role, username } }),
  logout: () => set({ currentUser: null }),

  addPipeline: (data) => {
    const id = `pl-${Date.now()}`
    set((state) => ({
      pipelines: [
        ...state.pipelines,
        {
          id,
          nomor: nextNomor(state.pipelines),
          ...data,
          checklist: createChecklistTemplate(),
          released: false,
          disbursements: {},
          assetsUnderManagement: [],
          activityLog: [],
          slikRows: [],
        },
      ],
    }))
    return id
  },

  setItemFile: (pipelineId, itemId, fileName) => {
    set((state) => ({
      pipelines: state.pipelines.map((p) =>
        p.id !== pipelineId
          ? p
          : {
              ...p,
              checklist: p.checklist.map((item: ChecklistItem) => (item.id === itemId ? { ...item, fileName } : item)),
            },
      ),
    }))
  },

  applyReviewUpdates: (pipelineId, updates) => {
    const map = new Map(updates.map((u) => [u.itemId, u]))
    set((state) => ({
      pipelines: state.pipelines.map((p) => {
        if (p.id !== pipelineId) return p
        return {
          ...p,
          checklist: p.checklist.map((item) => {
            const u = map.get(item.id)
            if (!u) return item
            const nextLikert = u.likert !== undefined ? u.likert : item.likert
            const nextStatus = deriveStatusFromLikert(nextLikert ?? null)
            return {
              ...item,
              likert: nextLikert ?? null,
              status: nextStatus,
              notes: u.notes !== undefined ? u.notes : item.notes,
              remarks: u.remarks !== undefined ? u.remarks : item.remarks,
              remarksLocked: nextStatus === null,
            }
          }),
        }
      }),
    }))
  },

  releasePipeline: (pipelineId) => {
    set((state) => ({
      pipelines: state.pipelines.map((p) => (p.id === pipelineId ? { ...p, released: true } : p)),
    }))
    get().addActivityLog(pipelineId, {
      aktor: get().currentUser?.username ?? 'Admin',
      aktorRole: get().currentUser?.role ?? 'admin_investasi',
      aksi: 'Me-release pipeline',
      waktu: 'Baru saja',
      waktuRelatif: 'Baru saja',
    })
  },

  addDisbursementMonth: (pipelineId, month) => {
    set((state) => ({
      pipelines: state.pipelines.map((p) => {
        if (p.id !== pipelineId) return p
        if (p.disbursements[month]) return p
        return { ...p, disbursements: { ...p.disbursements, [month]: { new: [], revolving: [] } } }
      }),
    }))
  },

  addDisbursementEntry: (pipelineId, month, type, nominal, fileName) => {
    const entry: DisbursementEntry = { id: nextDisbursementId(), nominal, fileName }
    set((state) => ({
      pipelines: state.pipelines.map((p) => {
        if (p.id !== pipelineId) return p
        const monthData = p.disbursements[month] ?? { new: [], revolving: [] }
        const updatedMonth = { ...monthData, [type]: [...monthData[type], entry] }
        return { ...p, disbursements: { ...p.disbursements, [month]: updatedMonth } }
      }),
    }))
  },

  removeDisbursementEntry: (pipelineId, month, type, entryId) => {
    set((state) => ({
      pipelines: state.pipelines.map((p) => {
        if (p.id !== pipelineId) return p
        const monthData = p.disbursements[month]
        if (!monthData) return p
        const updatedMonth = { ...monthData, [type]: monthData[type].filter((e) => e.id !== entryId) }
        return { ...p, disbursements: { ...p.disbursements, [month]: updatedMonth } }
      }),
    }))
  },

  addSlikRow: (pipelineId, row) => {
    set((state) => ({
      pipelines: state.pipelines.map((p) =>
        p.id !== pipelineId ? p : { ...p, slikRows: [...p.slikRows, { ...row, id: nextSlikRowId() }] },
      ),
    }))
  },

  addSlikRows: (pipelineId, rows) => {
    set((state) => ({
      pipelines: state.pipelines.map((p) =>
        p.id !== pipelineId ? p : { ...p, slikRows: [...p.slikRows, ...rows.map((r) => ({ ...r, id: nextSlikRowId() }))] },
      ),
    }))
  },

  updateSlikRow: (pipelineId, rowId, patch) => {
    set((state) => ({
      pipelines: state.pipelines.map((p) =>
        p.id !== pipelineId ? p : { ...p, slikRows: p.slikRows.map((r) => (r.id === rowId ? { ...r, ...patch } : r)) },
      ),
    }))
  },

  removeSlikRow: (pipelineId, rowId) => {
    set((state) => ({
      pipelines: state.pipelines.map((p) => (p.id !== pipelineId ? p : { ...p, slikRows: p.slikRows.filter((r) => r.id !== rowId) })),
    }))
  },

  addActivityLog: (pipelineId, entry) => {
    set((state) => ({
      pipelines: state.pipelines.map((p) =>
        p.id !== pipelineId ? p : { ...p, activityLog: [{ ...entry, id: nextActivityId() }, ...p.activityLog] },
      ),
    }))
  },
}))

export function getPipelineById(pipelineId: string): Pipeline | undefined {
  return useAppStore.getState().pipelines.find((p) => p.id === pipelineId)
}
