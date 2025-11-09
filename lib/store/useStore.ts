import { create } from 'zustand'
import type { Profile, Session, Observation } from '@/types'

interface AppState {
  // User
  user: Profile | null
  setUser: (user: Profile | null) => void

  // Active Session
  activeSession: Session | null
  setActiveSession: (session: Session | null) => void

  // Observations (real-time)
  observations: Observation[]
  addObservation: (observation: Observation) => void
  updateObservation: (id: string, data: Partial<Observation>) => void
  removeObservation: (id: string) => void
  clearObservations: () => void

  // Voice Recognition
  isListening: boolean
  setIsListening: (listening: boolean) => void
  currentTranscript: string
  setCurrentTranscript: (transcript: string) => void

  // UI State
  isSidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useStore = create<AppState>((set) => ({
  // User
  user: null,
  setUser: (user) => set({ user }),

  // Active Session
  activeSession: null,
  setActiveSession: (session) => set({ activeSession: session }),

  // Observations
  observations: [],
  addObservation: (observation) =>
    set((state) => ({
      observations: [observation, ...state.observations],
    })),
  updateObservation: (id, data) =>
    set((state) => ({
      observations: state.observations.map((obs) =>
        obs.id === id ? { ...obs, ...data } : obs
      ),
    })),
  removeObservation: (id) =>
    set((state) => ({
      observations: state.observations.filter((obs) => obs.id !== id),
    })),
  clearObservations: () => set({ observations: [] }),

  // Voice Recognition
  isListening: false,
  setIsListening: (listening) => set({ isListening: listening }),
  currentTranscript: '',
  setCurrentTranscript: (transcript) => set({ currentTranscript: transcript }),

  // UI State
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
}))
