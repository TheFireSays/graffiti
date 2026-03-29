import { create } from "zustand";
import { getQueue, enqueue, removeFromQueue, clearQueue } from "../lib/offline-queue";
import type { QueuedTag } from "../lib/offline-queue";

interface OfflineStoreState {
  pendingTags: QueuedTag[];
  isSyncing: boolean;
  lastSyncMessage: string | null;

  loadQueue: () => Promise<void>;
  addToQueue: (request: QueuedTag["request"]) => Promise<void>;
  removeTag: (id: string) => Promise<void>;
  setSyncing: (syncing: boolean) => void;
  setLastSyncMessage: (message: string | null) => void;
  clearAll: () => Promise<void>;
}

export const useOfflineStore = create<OfflineStoreState>((set) => ({
  pendingTags: [],
  isSyncing: false,
  lastSyncMessage: null,

  loadQueue: async () => {
    const queue = await getQueue();
    set({ pendingTags: queue });
  },

  addToQueue: async (request) => {
    await enqueue(request);
    const queue = await getQueue();
    set({ pendingTags: queue });
  },

  removeTag: async (id) => {
    await removeFromQueue(id);
    const queue = await getQueue();
    set({ pendingTags: queue });
  },

  setSyncing: (syncing) => set({ isSyncing: syncing }),

  setLastSyncMessage: (message) => set({ lastSyncMessage: message }),

  clearAll: async () => {
    await clearQueue();
    set({ pendingTags: [] });
  },
}));
