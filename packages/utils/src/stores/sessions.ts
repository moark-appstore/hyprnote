import { create as mutate } from "mutative";
import { createStore } from "zustand";

import { type Session } from "@hypr/plugin-db";
import { createSessionStore, SessionStore } from "./session";

type State = {
  sessions: Record<string, SessionStore>;
};

type Actions = {
  insert: (session: Session) => SessionStore;
  remove: (sessionId: string) => void;
};

export type SessionsStore = ReturnType<typeof createSessionsStore>;

export const createSessionsStore = () => {
  return createStore<State & Actions>((set, get) => ({
    sessions: {},
    insert: (session: Session) => {
      const sessions = get().sessions;

      const existing = sessions[session.id];
      if (existing) {
        return existing;
      }

      const store = createSessionStore(session);

      set((state) =>
        mutate(state, (draft) => {
          draft.sessions[session.id] = store;
        })
      );

      return store;
    },
    remove: (sessionId: string) => {
      const sessions = get().sessions;
      delete sessions[sessionId];
      set({ sessions });
    },
  }));
};
