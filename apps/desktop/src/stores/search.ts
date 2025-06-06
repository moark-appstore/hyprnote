import { commands as dbCommands, type Event, type Human, type Organization, type Session } from "@hypr/plugin-db";
import { createStore } from "zustand";

export type SearchMatch = {
  type: "session";
  item: Session;
} | {
  type: "event";
  item: Event;
} | {
  type: "human";
  item: Human;
} | {
  type: "organization";
  item: Organization;
};

type State = {
  previous?: URL;
  query: string;
  matches: SearchMatch[];
  searchInputRef: React.RefObject<HTMLInputElement> | null;
  isLoading: boolean;
};

type Actions = {
  setInputQuery: (query: string) => void;
  performSearch: (query: string) => void;
  clearSearch: () => void;
  focusSearch: () => void;
  setSearchInputRef: (ref: React.RefObject<HTMLInputElement>) => void;
};

export type SearchStore = ReturnType<typeof createSearchStore>;

// 防抖定时器存储
let debounceTimer: NodeJS.Timeout | null = null;

export const createSearchStore = (userId: string) => {
  return createStore<State & Actions>((set, get) => ({
    query: "",
    matches: [],
    searchInputRef: null,
    isLoading: false,

    // 同步更新输入状态，不执行搜索
    setInputQuery: (query: string) => {
      set({ query });

      // 清除之前的防抖定时器
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // 设置新的防抖定时器，300ms后执行搜索
      debounceTimer = setTimeout(() => {
        get().performSearch(query);
      }, 300);
    },

    // 异步执行搜索
    performSearch: async (query: string) => {
      set({ isLoading: true });

      try {
        const [sessions, events, humans, organizations] = await Promise.all([
          dbCommands.listSessions({ type: "search", query, limit: 10, user_id: userId }),
          dbCommands.listEvents({ type: "search", query, limit: 5, user_id: userId }),
          dbCommands.listHumans({ search: [3, query] }),
          dbCommands.listOrganizations({ search: [3, query] }),
        ]);

        const matches: SearchMatch[] = [
          ...sessions.map((session) => ({
            type: "session" as const,
            item: session,
          })),
          ...events.map((event) => ({
            type: "event" as const,
            item: event,
          })),
          ...humans.map((human) => ({
            type: "human" as const,
            item: human,
          })),
          ...organizations.map((organization) => ({
            type: "organization" as const,
            item: organization,
          })),
        ];

        const url = new URL(window.location.href);
        if (url.pathname.includes("note")) {
          set({ previous: url });
        }

        if (query === "") {
          handleEmpty(get);
        }

        set({ matches, isLoading: false });
      } catch (error) {
        console.error("Search error:", error);
        set({ isLoading: false });
      }
    },

    clearSearch: () => {
      const { searchInputRef } = get();
      searchInputRef?.current?.blur();

      // 清除防抖定时器
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }

      handleEmpty(get);
      set({ query: "", matches: [], isLoading: false });
    },
    focusSearch: () => {
      setTimeout(() => {
        get().searchInputRef?.current?.focus();
      }, 10);
    },
    setSearchInputRef: (ref: React.RefObject<HTMLInputElement>) => set({ searchInputRef: ref }),
  }));
};

const handleEmpty = (get: () => State) => {
  const { previous } = get();
  if (previous) {
    window.history.pushState({}, "", previous.pathname);
  }
};
