import { create } from "zustand";
import { DEMO_MODE } from "../lib/config";

interface QueuedTag {
  id: string;
  request: {
    tagImageId: string;
    customColors: Record<string, string>;
    latitude: number;
    longitude: number;
    compassHeading: number;
  };
  status: string;
  createdAt: string;
}

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

function getOfflineQueue() {
  if (DEMO_MODE) {
    return {
      getQueue: async () => [] as QueuedTag[],
      enqueue: async () => {},
      removeFromQueue: async () => {},
      clearQueue: async () => {},
    };
  }
  return require("../lib/offline-queue");
}

export const useOfflineStore = create<OfflineStoreState>((set) => ({
  pendingTags: [],
  isSyncing: false,
  lastSyncMessage: null,

  loadQueue: async () => {
    const { getQueue } = getOfflineQueue();
    const queue = await getQueue();
    set({ pendingTags: queue });
  },

  addToQueue: async (request) => {
    const { enqueue, getQueue } = getOfflineQueue();
    await enqueue(request);
    const queue = await getQueue();
    set({ pendingTags: queue });
  },

  removeTag: async (id) => {
    const { removeFromQueue, getQueue } = getOfflineQueue();
    await removeFromQueue(id);
    const queue = await getQueue();
    set({ pendingTags: queue });
  },

  setSyncing: (syncing) => set({ isSyncing: syncing }),

  setLastSyncMessage: (message) => set({ lastSyncMessage: message }),

  clearAll: async () => {
    const { clearQueue } = getOfflineQueue();
    await clearQueue();
    set({ pendingTags: [] });
  },
}));
