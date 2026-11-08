/** Other names for a brand or competitor ("HubSpot CRM" for "HubSpot"). The backend enforces the same limits. */
export const MAX_ALIASES = 5;
export const MAX_ALIAS_LENGTH = 60;

/** "HubSpot CRM, Hub Spot" -> ["HubSpot CRM", "Hub Spot"]: trimmed, no blanks, no repeats. */
export function parseAliases(text: string): string[] {
  const out: string[] = [];
  for (const part of text.split(",")) {
    const name = part.trim();
    if (name && !out.some((o) => o.toLowerCase() === name.toLowerCase())) out.push(name);
  }
  return out;
}

/** What is wrong with the list, in words the user can act on; "" when it is fine. */
export function aliasProblem(aliases: string[]): string {
  if (aliases.length > MAX_ALIASES) return `Add at most ${MAX_ALIASES} other names.`;
  if (aliases.some((a) => a.length > MAX_ALIAS_LENGTH)) return `Each other name can be at most ${MAX_ALIAS_LENGTH} characters.`;
  return "";
}
