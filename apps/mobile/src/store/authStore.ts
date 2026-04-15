import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { api } from '../services/api'
import type { User } from '../types'

interface AuthState {
  user:        User | null
  isLoading:   boolean
  isHydrated:  boolean
  setUser:     (user: User | null) => void
  login:       (accessToken: string, refreshToken: string, user: User) => Promise<void>
  logout:      () => Promise<void>
  hydrate:     () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user:       null,
  isLoading:  false,
  isHydrated: false,

  setUser: (user) => set({ user }),

  login: async (accessToken, refreshToken, user) => {
    await SecureStore.setItemAsync('dm_access',  accessToken)
    await SecureStore.setItemAsync('dm_refresh', refreshToken)
    set({ user })
  },

  logout: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('dm_refresh')
      if (refreshToken) await api.post('/auth/logout', { refreshToken })
    } catch { /* best-effort */ }
    await SecureStore.deleteItemAsync('dm_access')
    await SecureStore.deleteItemAsync('dm_refresh')
    set({ user: null })
  },

  hydrate: async () => {
    set({ isLoading: true })
    try {
      const token = await SecureStore.getItemAsync('dm_access')
      if (token) {
        const { data } = await api.get<User>('/auth/me')
        set({ user: data })
      }
    } catch {
      await SecureStore.deleteItemAsync('dm_access')
      await SecureStore.deleteItemAsync('dm_refresh')
    } finally {
      set({ isLoading: false, isHydrated: true })
    }
  },
}))
