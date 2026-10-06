# static-shellhacks-2026

Static archive of the ShellHacks 2026 landing page and its two games. Served at
**shellhacks.net** from GitHub Pages.

This repository is a frozen snapshot, not a fork. It was extracted from the
`glaucus` monorepo (`client/`) and trimmed to what the public landing page
actually needed. There is no backend, no auth, no service worker and no CDN
dependency: every route is prerendered and the only network requests at runtime
are Google Fonts and one YouTube embed.

## What changed from the app

The landing page is a 1:1 copy of the app's, minus four things:

| Removed | Why |
| --- | --- |
| Navbar (desktop sidebar + mobile tab bar) | There is no app to navigate to. `Layout.astro` was replaced by `ArchiveLayout.astro`, which has no `NavbarIsland`, no `ClientApp` and no `<ClientRouter/>`. With no island toggling `html.has-app-navbar`, `globals-base.css` reserves no gutter on either side. |
| Hero CTA logic | `useRegistrationStatus` / `useIsEOL` / `useRegistrationOpen` read `/api/site-status`. The archive is frozen at end-of-life, so the pill is the literal **"See You Next Year!"** and the "last signed in as" cookie line is gone. |
| React Query | Follows from the above: `QueryClientProvider` and `@tanstack/react-query` are not dependencies. |
| FAQ checkerboard as a game trigger | `CheckerboardDivider` was a button that opened Pixel Drop. It is now decorative (`aria-hidden`), and both games live behind one arcade launcher. |

Two things were added:

- **`ArcadeLauncher`**: a fixed bottom-right button that opens a modal with
  both games. In the app, Pixel Drop was reachable only by clicking the FAQ
  divider and Brick Breaker only by typing a bad URL.
- **`BrickBreaker`** was extracted out of `404.astro`, where the whole game
  lived in an inline `<script is:inline>` bound to `#lite-pong` and
  document-level listeners. It is now `createBrickBreaker(canvas, options)` plus
  a thin component, so the same game runs in the modal and on `/404` with
  separate hiscores. The physics is unchanged.

## Layout

```
src/
  pages/          index (the archive), 404 (the game), privacy, terms
  layouts/        ArchiveLayout.astro - head, fonts, wear texture vars, no chrome
  components/
    Archive.jsx   section order, identical to the app's Landing.jsx
    landing/      the eight landing sections, ported as-is
    arcade/       ArcadeLauncher, GameModal, BrickBreaker
    ui/           FAQ, Footer, OrganizerCarousel, CheckerboardDivider, ...
    PixelDrop.jsx ported unchanged; it brings its own overlay and a11y wiring
  games/          pixelDropEngine.js (pure), brickBreakerEngine.js (canvas)
  data/           faq, tabs, organizers, sponsors, partners
  styles/         globals.css is the entry; see it for what was dropped and why
  utils/assets.js resolves vendored /public paths against Astro's base
```

## Assets

`public/landing`, `robots`, `sponsors`, `partners`, `organizers`, `fonts` and
`icons` are vendored from the app (about 11 MB). The app served these from
jsDelivr via `cdnUrl()`; here they are served from origin so the archive keeps
working no matter what happens to the pithos repo.

`src/utils/assets.js`'s `asset()` replaces the app's `cdnUrl()` with a plain
path join against `import.meta.env.BASE_URL`, so the site also works while it is
served from the `weareinit.github.io/static-shellhacks-2026` project path
before the DNS switch.

## Commands

```bash
bun install
bun run dev            # astro dev
bun run build          # astro build -> dist/
bun run preview        # astro preview
bun run test:run       # vitest (58 tests)
bun run check          # astro check (type check)
bun run check:static   # fails the build if src/ regains an API/CDN reference
bunx biome check .     # lint + format
```

`check:static` is the guard rail for the point of this repository. It greps
`src/` for `import.meta.env.PUBLIC_*`, `/api/`, jsDelivr/unpkg/cdnjs,
`@tanstack/react-query`, and fails CI on a hit. Reintroducing a runtime
dependency should be a deliberate act that changes this file.

## Deploying to shellhacks.net

Push to `main`; `.github/workflows/deploy.yml` runs the checks, builds, and
publishes `dist/` to GitHub Pages. The repo must be **public** for Pages to work
without a paid plan.

### Cutover, in this order

Current DNS state, measured while writing this (2026-10-06):

```
shellhacks.net      -> no A/AAAA records at all (nameservers are Route53's)
www.shellhacks.net  -> CNAME weareinit.github.io + the Pages A records
```

So the apex is already unpublished, and `www` already points at Pages but at no
site that claims it. That makes the switch additive rather than a cutover: add
the apex records and the archive is live.

1. **Done:** repo variable `PUBLIC_BASE_PATH=/static-shellhacks-2026`, and no
   `public/CNAME` in the artifact, so the build is correct under the Pages
   project path.
2. **To do:** add the apex records below in Route53, then set
   `PUBLIC_BASE_PATH=/` (or delete the variable) and push. Adding
   `public/CNAME` with `shellhacks.net` in it is optional belt-and-braces, but
   note the Pages site has already registered that CNAME from the first deploy.
   GitHub provisions the certificate once it can resolve the domain.
3. Optional: repoint `www` at the apex (CNAME `shellhacks.net`) instead of
   `weareinit.github.io`.

Shipping a `base: "/"` build under the Pages project path is what produced an
unstyled page at the `github.io` URL: Astro emits its own `/_astro/*` URLs from
`base`, and they resolve against the domain root.

DNS records for step 2:

```
A     185.199.108.153
A     185.199.109.153
A     185.199.110.153
A     185.199.111.153
AAAA  2606:50c0:8000::153
AAAA  2606:50c0:8001::153
```

**This replaces the current AWS-hosted glaucus deployment at the same hostname.**
Verify the Pages build on the `github.io` URL before touching DNS, and expect a
propagation window during which some resolvers still hit the old host.

## Notes for future edits

- The hero CTA is a frozen string, not a dead conditional. If the event comes
  back, that is a real change, not a restoration.
- `AboutSection` still measures its wordmark against `--navbar-desktop-width`.
  That token is kept at `0rem` in `globals-base.css` rather than deleted, so the
  heading math stays valid. Do not re-add `has-app-navbar` offsets; the code
  that set that class is in the other repository.
- `lucide-react` is CJS-first and Astro externalizes dependencies during
  prerender, which mixes real React internals into the Preact render. Two
  settings prevent that: the `react` package name is aliased to `@preact/compat`
  in `package.json`, and `astro.config.mjs` resolves `lucide-react` to its ESM
  entry. Removing either brings back
  `"[object Object] is not a valid HTML tag name"` at build time.
- The Experience section embeds a YouTube player through the YouTube IFrame API
  with a key that is HTTP referer-restricted to `shellhacks.net`. Local previews
  therefore log one `403` from `googleapis.com/youtube/v3/videos` and show an
  empty TV. That is expected and resolves on the real domain.