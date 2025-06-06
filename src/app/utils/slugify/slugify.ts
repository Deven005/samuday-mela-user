// util/slugify.ts
export const generateSlug = (text: string, uniqueId: string) => {
  let slug = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Convert spaces/special chars to "-"
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
    .replace(/-{2,}/g, '-') // Remove duplicate dashes
    .slice(0, 50);
  return `${slug}-${uniqueId.slice(0, 4)}-${uniqueId.slice(-4)}`;
};
