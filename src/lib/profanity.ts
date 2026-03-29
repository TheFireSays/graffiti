import { Filter } from "bad-words";

const filter = new Filter();

export function containsProfanity(text: string): boolean {
  if (!text) return false;
  return filter.isProfane(text);
}

export function cleanText(text: string): string {
  if (!text) return "";
  return filter.clean(text);
}
