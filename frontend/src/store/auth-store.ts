import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, LoginCredentials, RegisterData, User } from '@/types/auth.types';
import { authService } from '@/services/auth.service';
import { setAuthToken, removeAuthToken } from '@/lib/auth';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (credentials: LoginCredentials) => {
        try {
          const response = await authService.login(credentials);
          setAuthToken(response.access_token);
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
          });
        } catch (error) {
          removeAuthToken();
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        try {
          const response = await authService.register(data);
          setAuthToken(response.access_token);
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
          });
        } catch (error) {
          removeAuthToken();
          throw error;
        }
      },

      logout: () => {
        removeAuthToken();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
