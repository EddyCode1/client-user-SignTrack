import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (token, user, refreshToken = null) =>
        set({ token, user, refreshToken, isAuthenticated: true }),

      setTokens: (token, refreshToken = null) => set({ token, refreshToken }),
      setUser: (user) => set({ user }),

      logout: () =>
        set({
          token: null,
          user: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      getToken: () => get().token,
      getUser: () => get().user,
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
