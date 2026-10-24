# Spoor

Stealth website for Spoor: a shared sensor network that records drone tracks across many sites, traces an intruder back to its launch area, and cues police drones to follow it home.

## Run it

```bash
npm install
npm run dev
```

`npm run dev` prints two addresses and a QR code. Open the first on this machine and the second, or the QR code, on a phone connected to the same Wi-Fi.

Other scripts: `npm run build` writes the static site to `out/`, `npm run lint`, `npm run typecheck`.

## Deploy

The site is a static export. Every push to `main` builds it and publishes it to GitHub Pages through `.github/workflows/pages.yml`, under the `/spoor` path. The form needs a backend before it can accept registrations.

## Where things are

- `app/` pages: home (`page.tsx`), `/host`, `/imprint`, `/privacy`.
- `components/` the nav, panels, forms and the three canvas views (`PlanView`, `HowItWorks`, `CoverageGrowth`).
- `lib/scene/` the drawing code: `plan.ts` (map), `elevation.ts` (side view), `coverage.ts` (cluster growth), `common.ts` (shared machinery).
- `lib/site.ts` the brand name, contact address, nav links and launch year. Change the name there.
- The register-interest form is display-only while in stealth: it sends nothing and points to the contact address.

## Before going public

- Register the domain and check the trademark for the name.
- Replace the placeholder address in `lib/site.ts` and every bracketed item on `/imprint` and `/privacy`.
- Remove `robots: { index: false }` in `app/layout.tsx` when the site should be found.
