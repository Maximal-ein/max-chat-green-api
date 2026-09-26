// use-search: tiny Zustand store for the in-chat message search state.
// Holds the current query, the set of matching message ids, and the index
// of the currently focused match (for next/prev navigation).

"use client";

import { create } from "zustand";

interface SearchState {
  open: boolean;
  query: string;
  matchIds: string[];
  /** Index into matchIds of the currently focused match. */
  cursor: number;
  setOpen: (open: boolean) => void;
  setQuery: (q: string) => void;
  setMatches: (ids: string[]) => void;
  setCursor: (i: number) => void;
  next: () => void;
  prev: () => void;
  clear: () => void;
}

export const useSearch = create<SearchState>((set, get) => ({
  open: false,
  query: "",
  matchIds: [],
  cursor: 0,
  setOpen: (open) => set({ open }),
  setQuery: (query) => set({ query }),
  setMatches: (matchIds) =>
    set({ matchIds, cursor: matchIds.length > 0 ? 0 : -1 }),
  setCursor: (cursor) => set({ cursor }),
  next: () => {
    const { matchIds, cursor } = get();
    if (matchIds.length === 0) return;
    set({ cursor: (cursor + 1) % matchIds.length });
  },
  prev: () => {
    const { matchIds, cursor } = get();
    if (matchIds.length === 0) return;
    set({ cursor: (cursor - 1 + matchIds.length) % matchIds.length });
  },
  clear: () => set({ open: false, query: "", matchIds: [], cursor: 0 }),
}));
