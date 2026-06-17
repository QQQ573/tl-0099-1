import { create } from 'zustand'
import type { FireworkPreset, ParticleData, FireworkInstance } from '../types'
import { DEFAULT_PRESET } from '../types'

interface FireworkState {
  preset: FireworkPreset
  isPaused: boolean
  fireworkInstances: FireworkInstance[]
  selectedParticle: ParticleData | null
  showGUI: boolean
  setPreset: (preset: FireworkPreset) => void
  updatePreset: (updates: Partial<FireworkPreset>) => void
  togglePause: () => void
  setPaused: (paused: boolean) => void
  addFireworkInstance: (fw: FireworkInstance) => void
  removeFireworkInstance: (id: string) => void
  clearFireworkInstances: () => void
  updateFireworkInstance: (id: string, fw: FireworkInstance) => void
  selectParticle: (particle: ParticleData | null) => void
  clearSelection: () => void
  importPreset: (preset: FireworkPreset) => void
  toggleGUI: () => void
}

export const useFireworkStore = create<FireworkState>((set) => ({
  preset: DEFAULT_PRESET,
  isPaused: false,
  fireworkInstances: [],
  selectedParticle: null,
  showGUI: true,
  setPreset: (preset: FireworkPreset) => set({ preset }),
  updatePreset: (updates: Partial<FireworkPreset>) =>
    set((state) => ({
      preset: { ...state.preset, ...updates },
    })),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused, selectedParticle: state.isPaused ? state.selectedParticle : null })),
  setPaused: (paused: boolean) => set({ isPaused: paused, selectedParticle: paused ? undefined : null }),
  addFireworkInstance: (fw: FireworkInstance) =>
    set((state) => ({ fireworkInstances: [...state.fireworkInstances, fw] })),
  removeFireworkInstance: (id: string) =>
    set((state) => ({
      fireworkInstances: state.fireworkInstances.filter((fw) => fw.id !== id),
    })),
  clearFireworkInstances: () => set({ fireworkInstances: [], selectedParticle: null }),
  updateFireworkInstance: (id: string, fw: FireworkInstance) =>
    set((state) => ({
      fireworkInstances: state.fireworkInstances.map((f) => (f.id === id ? fw : f)),
    })),
  selectParticle: (particle: ParticleData | null) => set({ selectedParticle: particle }),
  clearSelection: () => set({ selectedParticle: null }),
  importPreset: (preset: FireworkPreset) => set({ preset }),
  toggleGUI: () => set((state) => ({ showGUI: !state.showGUI })),
}))
