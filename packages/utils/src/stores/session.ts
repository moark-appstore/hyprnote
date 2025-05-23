import { create as mutate } from "mutative";
import { createStore } from "zustand";

import { commands as dbCommands, type Session } from "@hypr/plugin-db";
import pDebounce from "p-debounce";

type State = {
  session: Session;
  showRaw: boolean;
};

type Actions = {
  get: () => State & Actions;
  refresh: () => Promise<void>;
  setShowRaw: (showRaw: boolean) => void;
  updateTitle: (title: string) => void;
  updateRawNote: (note: string) => void;
  updateEnhancedNote: (note: string) => void;
  persistSession: (session?: Session, force?: boolean) => Promise<void>;
};

export type SessionStore = ReturnType<typeof createSessionStore>;

export const createSessionStore = (session: Session) => {
  return createStore<State & Actions>((set, get) => ({
    session,
    showRaw: !session.enhanced_memo_html,
    get,
    refresh: async () => {
      const { session: { id } } = get();
      const session = await dbCommands.getSession({ id });
      if (session) {
        set({ session });
      }
    },
    setShowRaw: (showRaw: boolean) => {
      set((state) =>
        mutate(state, (draft) => {
          draft.showRaw = showRaw;
        })
      );
    },
    updateTitle: (title: string) => {
      set((state) => {
        const next = mutate(state, (draft) => {
          draft.session.title = title;
        });
        get().persistSession(next.session);
        return next;
      });
    },
    updateRawNote: (note: string) => {
      set((state) => {
        const next = mutate(state, (draft) => {
          draft.session.raw_memo_html = note;
        });
        get().persistSession(next.session);
        return next;
      });
    },
    updateEnhancedNote: (note: string) => {
      set((state) => {
        const next = mutate(state, (draft) => {
          draft.showRaw = false;
          draft.session.enhanced_memo_html = note;
        });
        get().persistSession(next.session);
        return next;
      });
    },
    persistSession: async (session?: Session, force?: boolean) => {
      const { session: { id } } = get();
      const sessionFromDB = await dbCommands.getSession({ id });

      // TODO: this is temp solution.
      const item: Session = {
        ...(session ?? get().session),
        words: sessionFromDB?.words ?? [],
      };

      const fn = force
        ? dbCommands.upsertSession
        : pDebounce((v: Session) => dbCommands.upsertSession(v), 50);
      await fn(item);
    },
  }));
};
