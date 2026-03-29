import { clusterTags } from "@/lib/clustering";
import type { MapTag } from "@/lib/geo";

function makeTag(id: string, lat: number, lng: number): MapTag {
  return {
    id,
    latitude: lat,
    longitude: lng,
    compassHeading: 0,
    status: "active",
    crewId: "c1",
    crewColor: "#ff0000",
    crewAbbreviation: "TST",
    userId: "u1",
    username: "tester",
    tagImageName: "tag1",
    tagCategory: "basic",
    createdAt: new Date().toISOString(),
  };
}

describe("clusterTags", () => {
  it("returns individual tags when zoomed in (small delta)", () => {
    const tags = [
      makeTag("t1", 30.0, -97.0),
      makeTag("t2", 30.001, -97.001),
    ];

    const clusters = clusterTags(tags, 0.004, 0.004, 30.0, -97.0);

    expect(clusters).toHaveLength(2);
    expect(clusters.every((c) => c.count === 1)).toBe(true);
  });

  it("clusters nearby tags when zoomed out (large delta)", () => {
    const tags = [
      makeTag("t1", 30.0, -97.0),
      makeTag("t2", 30.0001, -97.0001),
    ];

    const clusters = clusterTags(tags, 0.1, 0.1, 30.0, -97.0);

    expect(clusters).toHaveLength(1);
    expect(clusters[0].count).toBe(2);
    expect(clusters[0].tags).toHaveLength(2);
  });

  it("keeps distant tags in separate clusters", () => {
    const tags = [
      makeTag("t1", 30.0, -97.0),
      makeTag("t2", 30.5, -97.5),
    ];

    const clusters = clusterTags(tags, 0.1, 0.1, 30.25, -97.25);

    expect(clusters.length).toBeGreaterThanOrEqual(2);
  });

  it("returns empty array for no tags", () => {
    const clusters = clusterTags([], 0.1, 0.1, 30.0, -97.0);
    expect(clusters).toHaveLength(0);
  });

  it("sets cluster center to average of tag positions", () => {
    const tags = [
      makeTag("t1", 30.0, -97.0),
      makeTag("t2", 30.002, -97.002),
    ];

    const clusters = clusterTags(tags, 0.1, 0.1, 30.001, -97.001);

    const cluster = clusters.find((c) => c.count === 2);
    if (cluster) {
      expect(cluster.latitude).toBeCloseTo(30.001, 3);
      expect(cluster.longitude).toBeCloseTo(-97.001, 3);
    }
  });
});
