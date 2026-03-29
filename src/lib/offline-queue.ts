import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUE_KEY = "offline_tag_queue";
const EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export interface QueuedTag {
  id: string;
  request: {
    tagImageId: string;
    customColors: Record<string, string>;
    latitude: number;
    longitude: number;
    compassHeading: number;
    goOverTagId?: string;
  };
  timestamp: number;
  status: "queued" | "syncing" | "failed";
}

export async function getQueue(): Promise<QueuedTag[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  const items: QueuedTag[] = JSON.parse(raw);
  const now = Date.now();
  return items.filter((item) => now - item.timestamp < EXPIRY_MS);
}

export async function enqueue(request: QueuedTag["request"]): Promise<QueuedTag> {
  const queue = await getQueue();
  const item: QueuedTag = {
    id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    request,
    timestamp: Date.now(),
    status: "queued",
  };
  queue.push(item);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  return item;
}

export async function updateStatus(id: string, status: QueuedTag["status"]): Promise<void> {
  const queue = await getQueue();
  const item = queue.find((q) => q.id === id);
  if (item) {
    item.status = status;
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }
}

export async function removeFromQueue(id: string): Promise<void> {
  const queue = await getQueue();
  const filtered = queue.filter((q) => q.id !== id);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
}

export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}
