import * as Sharing from "expo-sharing";

interface ShareTagParams {
  id: string;
  tagImageName: string;
  zoneName?: string | null;
  username: string;
}

interface ShareProfileParams {
  id: string;
  username: string;
  level: number;
  tagCount: number;
  crewName?: string | null;
}

export function buildTagShareText(params: ShareTagParams): string {
  const lines = [
    `${params.tagImageName} by ${params.username}`,
  ];
  if (params.zoneName) {
    lines.push(`Zone: ${params.zoneName}`);
  }
  lines.push("");
  lines.push("Placed with Graffiti");
  lines.push(buildTagDeepLink(params.id));
  return lines.join("\n");
}

export function buildProfileShareText(params: ShareProfileParams): string {
  const lines = [
    `${params.username} — Level ${params.level}`,
    `${params.tagCount} tags placed`,
  ];
  if (params.crewName) {
    lines.push(`Crew: ${params.crewName}`);
  }
  lines.push("");
  lines.push("Check me out on Graffiti");
  lines.push(buildProfileDeepLink(params.id));
  return lines.join("\n");
}

export function buildTagDeepLink(tagId: string): string {
  return `https://graffiti.app/tag/${tagId}`;
}

export function buildProfileDeepLink(userId: string): string {
  return `https://graffiti.app/profile/${userId}`;
}

export async function shareTag(params: ShareTagParams): Promise<boolean> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) return false;

  const message = buildTagShareText(params);
  await Sharing.shareAsync(buildTagDeepLink(params.id), {
    dialogTitle: "Share Tag",
    mimeType: "text/plain",
    UTI: "public.plain-text",
  }).catch(() => {
    // Fallback: some platforms don't support shareAsync with URL
    // The share dialog was shown, user may have cancelled
  });

  return true;
}

export async function shareProfile(params: ShareProfileParams): Promise<boolean> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) return false;

  await Sharing.shareAsync(buildProfileDeepLink(params.id), {
    dialogTitle: "Share Profile",
    mimeType: "text/plain",
    UTI: "public.plain-text",
  }).catch(() => {
    // User may have cancelled
  });

  return true;
}
