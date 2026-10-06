const BASE = import.meta.env.BASE_URL ?? "/";

/**
 * Resolve a vendored public asset to a URL that respects Astro's `base`.
 *
 * The archive ships every image, font and logo in ./public, so this is a plain
 * path join, not a CDN lookup (the app's version of this helper rewrote paths
 * to jsDelivr, which this repository deliberately does not depend on).
 *
 * It exists so the sections can be ported from the app with their call sites
 * intact, and so the site still works while it is served from a GitHub Pages
 * project path before the shellhacks.net DNS switch.
 */
export function asset(path) {
  if (!path) return path;
  // Leave absolute and data URLs alone.
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("data:")) return path;
  const base = BASE.endsWith("/") ? BASE : `${BASE}/`;
  return `${base}${path.replace(/^\/+/, "")}`;
}

export default asset;
