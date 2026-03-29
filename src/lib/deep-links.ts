/**
 * Deep link URL parsing for graffiti:// and https://graffiti.app routes.
 *
 * Supported routes:
 * - graffiti://tag/<tag_id>
 * - graffiti://crew/<crew_id>
 * - graffiti://invite/<invite_code>
 * - https://graffiti.app/tag/<tag_id>
 * - https://graffiti.app/crew/<crew_id>
 */

export interface DeepLinkResult {
  type: "tag" | "crew" | "invite" | "unknown";
  id: string;
}

export function parseDeepLink(url: string): DeepLinkResult {
  try {
    // Handle graffiti:// scheme
    const normalized = url
      .replace(/^graffiti:\/\//, "https://graffiti.app/")
      .replace(/\/$/, "");

    const parsed = new URL(normalized);
    const segments = parsed.pathname.split("/").filter(Boolean);

    if (segments.length >= 2) {
      const [type, id] = segments;
      if (type === "tag" && id) {
        return { type: "tag", id };
      }
      if (type === "crew" && id) {
        return { type: "crew", id };
      }
      if (type === "invite" && id) {
        return { type: "invite", id };
      }
    }
  } catch {
    // Invalid URL
  }

  return { type: "unknown", id: "" };
}
