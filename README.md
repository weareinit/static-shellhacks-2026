# static-shellhacks-2026

Static archive of the ShellHacks 2026 landing page and its two games, served at
[shellhacks.net](https://shellhacks.net) from GitHub Pages.

Extracted from the `glaucus` monorepo and frozen. There is no backend, no auth,
no service worker and no CDN dependency: every route is prerendered, and the only
runtime network requests are Google Fonts and one YouTube embed.

## What is here

- `/` — the landing page, section for section the same as the app's.
- `/404` — Brick Breaker, as before. The game is the 404.
- `/privacy`, `/terms` — the legal pages the footer links to.

Games live behind a floating controller button in the bottom-right corner:

- **Pixel Drop** (Tetris) — ported unchanged from the app.
- **Brick Breaker** — extracted from the app's `404.astro`, where the whole game
  was an inline script. Physics unchanged; it now also runs in the modal, with a
  separate hiscore from the one on `/404`.

## Differences from the app

The navbar is gone (`ArchiveLayout.astro` has no `NavbarIsland`, `ClientApp` or
view-transition router), and with it the API calls: the hero CTA is the frozen
end-of-life string **"See You Next Year!"** rather than a resolved auth state,
which is also why React Query is not a dependency. The FAQ's Tetris checkerboard
is decorative again instead of a button.

Assets are vendored into `public/` (~11 MB) instead of being fetched from
jsDelivr, so the archive keeps working regardless of what happens to the pithos
repo. `src/utils/assets.js` resolves them.

## Commands

```bash
bun install
bun run dev            # astro dev
bun run build          # astro build -> dist/
bun run test:run       # vitest
bun run check          # type check
bun run check:static   # fails if src/ regains an API or CDN reference
bunx biome check .     # lint + format
```

Pushes to `main` run all of the above and publish `dist/` to Pages.

## If you edit this

- The hero CTA is a frozen string, not a dead conditional. Unfreezing it is a
  real change, not a restoration.
- `lucide-react` must stay resolved to its ESM entry in `astro.config.mjs`, and
  the `react` package name must stay aliased to `@preact/compat` in
  `package.json`. Astro externalizes dependencies during prerender, and without
  both the build fails with `"[object Object] is not a valid HTML tag name"`.
- A local `403` from `googleapis.com/youtube/videos` is expected: the embedded
  player's key is referer-restricted to `shellhacks.net`.
- `--navbar-desktop-width` is still read by `AboutSection` for its heading math.
  It is pinned to `0rem` in `globals-base.css`; leave it there.