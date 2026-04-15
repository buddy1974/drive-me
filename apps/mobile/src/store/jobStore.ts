import { create } from 'zustand'

interface JobStoreState {
  jobIds:     string[]
  activeJobId: string | null
  addJobId:   (id: string) => void
  setActiveJobId: (id: string | null) => void
}

export const useJobStore = create<JobStoreState>((set) => ({
  jobIds:      [],
  activeJobId: null,

  addJobId: (id) =>
    set((state) => ({
      jobIds: state.jobIds.includes(id) ? state.jobIds : [id, ...state.jobIds],
    })),

  setActiveJobId: (id) => set({ activeJobId: id }),
}))
