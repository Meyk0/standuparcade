export const RESERVED_SLUGS = [
  "admin",
  "api",
  "settings",
  "team",
  "teams",
  "health",
  "static",
  "www",
  "null",
  "undefined",
  "login",
  "signup",
  "dashboard",
  "support",
  "help",
  "about",
  "pricing",
];

export const CONTENT_BLOCKLIST = [
  "fuck",
  "shit",
  "ass",
  "bitch",
  "nigger",
  "faggot",
  "retard",
  "cunt",
  "dick",
  "pussy",
];

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase());
}

export function containsBlockedContent(text: string): boolean {
  const lower = text.toLowerCase();
  return CONTENT_BLOCKLIST.some((word) => lower.includes(word));
}
