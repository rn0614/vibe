import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Theme } from '@/shared/types';

interface AppState {
  // UI 상태
  theme: Theme;
  sidebarOpen: boolean;
  loading: boolean;
  
  // 글로벌 상태
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>;
  
  // 액션
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  
  // 알림 관련 액션
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태
        theme: 'light',
        sidebarOpen: false,
        loading: false,
        notifications: [],

        // 액션
        setTheme: (theme) => set({ theme }),
        
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        
        setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
        
        setLoading: (loading) => set({ loading }),

        addNotification: (notification) => {
          const id = crypto.randomUUID();
          const timestamp = Date.now();
          set((state) => ({
            notifications: [...state.notifications, { ...notification, id, timestamp }]
          }));
          
          // 5초 후 자동 제거
          setTimeout(() => {
            get().removeNotification(id);
          }, 5000);
        },

        removeNotification: (id) => set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        })),

        clearNotifications: () => set({ notifications: [] }),
      }),
      {
        name: 'app-store',
        partialize: (state) => ({ 
          theme: state.theme,
          sidebarOpen: state.sidebarOpen 
        }), // 테마와 사이드바 상태만 persist
      }
    ),
    { name: 'AppStore' }
  )
);
