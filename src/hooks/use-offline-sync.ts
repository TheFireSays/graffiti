import { useEffect, useRef } from "react";
import NetInfo from "@react-native-community/netinfo";
import { useOfflineStore } from "../stores/offline-store";
import { getQueue, updateStatus, removeFromQueue } from "../lib/offline-queue";
import { placeTagDirect } from "../lib/tag-placement";

export function useOfflineSync() {
  const loadQueue = useOfflineStore((s) => s.loadQueue);
  const setSyncing = useOfflineStore((s) => s.setSyncing);
  const setLastSyncMessage = useOfflineStore((s) => s.setLastSyncMessage);
  const syncingRef = useRef(false);

  useEffect(() => {
    loadQueue();

    const unsubscribe = NetInfo.addEventListener(async (state) => {
      if (state.isConnected && !syncingRef.current) {
        await syncPendingTags();
      }
    });

    return () => unsubscribe();
  }, [loadQueue]);

  async function syncPendingTags() {
    const queue = await getQueue();
    const pendingItems = queue.filter((q) => q.status === "queued");
    if (pendingItems.length === 0) return;

    syncingRef.current = true;
    setSyncing(true);
    let synced = 0;

    for (const item of pendingItems) {
      await updateStatus(item.id, "syncing");
      const result = await placeTagDirect(item.request);
      if (result.success) {
        await removeFromQueue(item.id);
        synced++;
      } else {
        await updateStatus(item.id, "failed");
      }
    }

    syncingRef.current = false;
    setSyncing(false);
    await loadQueue();

    if (synced > 0) {
      setLastSyncMessage(`${synced} tag${synced > 1 ? "s" : ""} synced!`);
      setTimeout(() => setLastSyncMessage(null), 3000);
    }
  }
}
