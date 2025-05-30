import { commands, GiteeAiLoginStatus } from "@hypr/plugin-gitee-ai";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { create } from "zustand";

interface GiteeAiState {
  loginStatus: GiteeAiLoginStatus;
  loading: boolean;
  error: string | null;

  checkLoginStatus: () => Promise<void>;
  getUserInfo: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export type GiteeAiStore = ReturnType<typeof createGiteeAiStore>;

export function createGiteeAiStore() {
  return create<GiteeAiState>((set, get) => ({
    loginStatus: {
      is_logged_in: false,
      user_info: null,
      token_info: null,
    },
    loading: false,
    error: null,

    // 检查登录状态
    checkLoginStatus: async () => {
      try {
        set({ loading: true, error: null });
        const loginStatus = await commands.getLoginStatus();
        set({
          loginStatus,
          loading: false,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "检查登录状态失败";
        set({
          error: errorMessage,
          loading: false,
        });
        throw error;
      }
    },

    getUserInfo: async () => {
      try {
        set({ loading: true, error: null });
        const userInfo = await commands.getUserInfo();

        set((state) => ({
          loginStatus: {
            ...state.loginStatus,
            user_info: userInfo,
          },
          loading: false,
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "获取用户信息失败";
        set({
          error: errorMessage,
          loading: false,
        });
        throw error;
      }
    },

    logout: async () => {
      try {
        set({ loading: true, error: null });
        await commands.logout();

        set({
          loginStatus: {
            is_logged_in: false,
            user_info: null,
            token_info: null,
          },
          loading: false,
        });

        // 通知其他窗口登出
        try {
          const allWindows = await WebviewWindow.getAll();
          for (const window of allWindows) {
            await window.emit("gitee-ai-logout", {});
          }
        } catch (error) {
          console.error("通知其他窗口登出失败", error);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "注销失败";
        set({
          error: errorMessage,
          loading: false,
        });
        throw error;
      }
    },

    clearError: () => set({ error: null }),
    setLoading: (loading: boolean) => set({ loading }),
  }));
}
