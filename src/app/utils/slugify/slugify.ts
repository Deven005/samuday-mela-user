// util/slugify.ts
export const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Convert spaces/special chars to "-"
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
    .replace(/-{2,}/g, '-') // Remove duplicate dashes
    .slice(0, 50);
};
