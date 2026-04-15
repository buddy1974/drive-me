import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { api } from '../services/api'
import type { User, Agent, ActorType } from '../types'

interface AuthState {
  actor:      ActorType | null
  user:       User  | null
  agent:      Agent | null
  isLoading:  boolean
  isHydrated: boolean
  loginUser:  (accessToken: string, refreshToken: string, user: User)   => Promise<void>
  loginAgent: (accessToken: string, refreshToken: string, agent: Agent) => Promise<void>
  logout:     () => Promise<void>
  hydrate:    () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  actor:      null,
  user:       null,
  agent:      null,
  isLoading:  false,
  isHydrated: false,

  loginUser: async (accessToken, refreshToken, user) => {
    await SecureStore.setItemAsync('dm_access',  accessToken)
    await SecureStore.setItemAsync('dm_refresh', refreshToken)
    await SecureStore.setItemAsync('dm_actor',   'user')
    set({ actor: 'user', user, agent: null })
  },

  loginAgent: async (accessToken, refreshToken, agent) => {
    await SecureStore.setItemAsync('dm_access',  accessToken)
    await SecureStore.setItemAsync('dm_refresh', refreshToken)
    await SecureStore.setItemAsync('dm_actor',   'agent')
    set({ actor: 'agent', agent, user: null })
  },

  logout: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('dm_refresh')
      if (refreshToken) await api.post('/auth/logout', { refreshToken })
    } catch { /* best-effort */ }
    await SecureStore.deleteItemAsync('dm_access')
    await SecureStore.deleteItemAsync('dm_refresh')
    await SecureStore.deleteItemAsync('dm_actor')
    set({ actor: null, user: null, agent: null })
  },

  hydrate: async () => {
    set({ isLoading: true })
    try {
      const token = await SecureStore.getItemAsync('dm_access')
      const storedActor = await SecureStore.getItemAsync('dm_actor') as ActorType | null
      if (token && storedActor) {
        const { data } = await api.get<User | Agent>('/auth/me')
        if (storedActor === 'user') {
          set({ actor: 'user', user: data as User, agent: null })
        } else {
          set({ actor: 'agent', agent: data as Agent, user: null })
        }
      }
    } catch {
      await SecureStore.deleteItemAsync('dm_access')
      await SecureStore.deleteItemAsync('dm_refresh')
      await SecureStore.deleteItemAsync('dm_actor')
    } finally {
      set({ isLoading: false, isHydrated: true })
    }
  },
}))
