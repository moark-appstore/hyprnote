import { createContext, useContext, useEffect, useRef } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";

import { createGiteeAiStore, GiteeAiStore } from "@/stores/gitee-ai";

const GiteeAiContext = createContext<
  ReturnType<
    typeof createGiteeAiStore
  > | null
>(null);

export function GiteeAiProvider({
  children,
  store,
}: {
  children: React.ReactNode;
  store?: GiteeAiStore;
}) {
  const storeRef = useRef<ReturnType<typeof createGiteeAiStore> | null>(null);
  if (!storeRef.current) {
    storeRef.current = store || createGiteeAiStore();
  }

  // 初始化检查登录状态
  useEffect(() => {
    const store = storeRef.current!;
    store
      .getState()
      .checkLoginStatus()
      .catch((error) => {
        console.error("初始化Gitee AI状态失败:", error);
      });
  }, []);

  return (
    <GiteeAiContext.Provider value={storeRef.current}>
      {children}
    </GiteeAiContext.Provider>
  );
}

export function useGiteeAi<T>(
  selector: Parameters<
    typeof useStore<ReturnType<typeof createGiteeAiStore>, T>
  >[1],
) {
  const store = useContext(GiteeAiContext);

  if (!store) {
    throw new Error("'useGiteeAi' must be used within a 'GiteeAiProvider'");
  }

  return useStore(store, useShallow(selector));
}
