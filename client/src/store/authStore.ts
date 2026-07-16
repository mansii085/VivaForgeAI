import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IUser } from 'shared';

interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDarkMode: boolean;
  isSidebarCollapsed: boolean;

  // Actions
  setAuth: (user: IUser, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  setUser: (user: IUser) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  demoLogin: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      isDarkMode: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
      isSidebarCollapsed: false,

      setAuth: (user, accessToken) => {
        set({
          user,
          accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      setAccessToken: (token) => {
        set({ accessToken: token });
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      toggleDarkMode: () => {
        const newMode = !get().isDarkMode;
        set({ isDarkMode: newMode });
        if (newMode) {
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.add('light');
        }
      },

      toggleSidebar: () => {
        set({ isSidebarCollapsed: !get().isSidebarCollapsed });
      },

      demoLogin: () => {
        const demoUser: IUser = {
          _id: 'demo-user-123',
          name: 'Demo User',
          email: 'demo@example.com',
          role: 'admin',
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({
          user: demoUser,
          accessToken: 'demo-token',
          isAuthenticated: true,
          isLoading: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        // Don't persist tokens in localStorage for security
      }),
    }
  )
);
