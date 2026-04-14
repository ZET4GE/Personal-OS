import { create } from 'zustand'

export type AuthModalMode = 'login' | 'signup' | 'forgot'

interface AuthModalState {
  open:       boolean
  mode:       AuthModalMode
  openModal:  (mode?: AuthModalMode) => void
  closeModal: () => void
  setMode:    (mode: AuthModalMode) => void
}

export const useAuthModal = create<AuthModalState>((set) => ({
  open:       false,
  mode:       'login',
  openModal:  (mode = 'login') => set({ open: true, mode }),
  closeModal: ()               => set({ open: false }),
  setMode:    (mode)           => set({ mode }),
}))
