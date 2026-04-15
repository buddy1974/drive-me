import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

export const API_BASE = 'https://drive-me.onrender.com/api/v1'

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
})

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('dm_access')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = await SecureStore.getItemAsync('dm_refresh')
        if (!refreshToken) throw new Error('No refresh token')
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken })
        await SecureStore.setItemAsync('dm_access',  data.accessToken)
        await SecureStore.setItemAsync('dm_refresh', data.refreshToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch {
        await SecureStore.deleteItemAsync('dm_access')
        await SecureStore.deleteItemAsync('dm_refresh')
      }
    }
    return Promise.reject(error)
  }
)
