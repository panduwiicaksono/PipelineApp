import { create } from 'zustand'
import type { ChecklistItem, CurrentUser, DisbursementEntry, ItemStatus, Pipeline, PipelineData, Role } from '@/types'
import { createChecklistTemplate } from '@/lib/checklist'
import { createSeedPipelines } from './seed'

let disbursementIdCounter = 1000
function nextDisbursementId() {
  disbursementIdCounter += 1
  return `dsb-${disbursementIdCounter}`
}

export interface ReviewUpdate {
  itemId: string
  status?: ItemStatus
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
  applyReviewUpdates: (pipelineId: string, updates: ReviewUpdate[]) => void
  releasePipeline: (pipelineId: string) => void

  addDisbursementMonth: (pipelineId: string, month: string) => void
  addDisbursementEntry: (pipelineId: string, month: string, type: 'new' | 'revolving', nominal: number, fileName?: string) => void
  removeDisbursementEntry: (pipelineId: string, month: string, type: 'new' | 'revolving', entryId: string) => void
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
            const nextStatus = u.status !== undefined ? u.status : item.status
            return {
              ...item,
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
}))

export function getPipelineById(pipelineId: string): Pipeline | undefined {
  return useAppStore.getState().pipelines.find((p) => p.id === pipelineId)
}
