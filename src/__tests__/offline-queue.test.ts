import AsyncStorage from "@react-native-async-storage/async-storage";
import { getQueue, enqueue, removeFromQueue, updateStatus, clearQueue } from "@/lib/offline-queue";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockSetItem = AsyncStorage.setItem as jest.Mock;
const mockRemoveItem = AsyncStorage.removeItem as jest.Mock;

describe("Offline Queue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, "now").mockReturnValue(1000000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const sampleRequest = {
    tagImageId: "img1",
    customColors: { primary: "#ff0000" },
    latitude: 40.7128,
    longitude: -74.006,
    compassHeading: 180,
  };

  describe("getQueue", () => {
    it("returns empty array when no queue exists", async () => {
      mockGetItem.mockResolvedValue(null);
      const result = await getQueue();
      expect(result).toEqual([]);
    });

    it("filters out expired items (older than 1 hour)", async () => {
      const items = [
        { id: "q1", request: sampleRequest, timestamp: 1000000 - 3601000, status: "queued" },
        { id: "q2", request: sampleRequest, timestamp: 1000000 - 1000, status: "queued" },
      ];
      mockGetItem.mockResolvedValue(JSON.stringify(items));
      const result = await getQueue();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("q2");
    });

    it("keeps items within the 1 hour window", async () => {
      const items = [
        { id: "q1", request: sampleRequest, timestamp: 1000000 - 3599000, status: "queued" },
      ];
      mockGetItem.mockResolvedValue(JSON.stringify(items));
      const result = await getQueue();
      expect(result).toHaveLength(1);
    });
  });

  describe("enqueue", () => {
    it("adds item to queue with correct structure", async () => {
      mockGetItem.mockResolvedValue(null);
      const item = await enqueue(sampleRequest);

      expect(item.id).toMatch(/^q_/);
      expect(item.request).toEqual(sampleRequest);
      expect(item.status).toBe("queued");
      expect(item.timestamp).toBe(1000000);
      expect(mockSetItem).toHaveBeenCalledTimes(1);
    });

    it("appends to existing queue", async () => {
      const existing = [{ id: "q_existing", request: sampleRequest, timestamp: 999999, status: "queued" }];
      mockGetItem.mockResolvedValue(JSON.stringify(existing));

      await enqueue(sampleRequest);

      const savedData = JSON.parse(mockSetItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(2);
    });
  });

  describe("updateStatus", () => {
    it("updates the status of a specific item", async () => {
      const items = [
        { id: "q1", request: sampleRequest, timestamp: 999999, status: "queued" },
      ];
      mockGetItem.mockResolvedValue(JSON.stringify(items));

      await updateStatus("q1", "syncing");

      const savedData = JSON.parse(mockSetItem.mock.calls[0][1]);
      expect(savedData[0].status).toBe("syncing");
    });

    it("does nothing for non-existent id", async () => {
      const items = [
        { id: "q1", request: sampleRequest, timestamp: 999999, status: "queued" },
      ];
      mockGetItem.mockResolvedValue(JSON.stringify(items));

      await updateStatus("q_nonexistent", "failed");

      // setItem is still called because getQueue filters, but item unchanged
      expect(mockSetItem).not.toHaveBeenCalled();
    });
  });

  describe("removeFromQueue", () => {
    it("removes the correct item", async () => {
      const items = [
        { id: "q1", request: sampleRequest, timestamp: 999999, status: "queued" },
        { id: "q2", request: sampleRequest, timestamp: 999999, status: "queued" },
      ];
      mockGetItem.mockResolvedValue(JSON.stringify(items));

      await removeFromQueue("q1");

      const savedData = JSON.parse(mockSetItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(1);
      expect(savedData[0].id).toBe("q2");
    });
  });

  describe("clearQueue", () => {
    it("removes the queue key from AsyncStorage", async () => {
      await clearQueue();
      expect(mockRemoveItem).toHaveBeenCalledWith("offline_tag_queue");
    });
  });
});
