# D3 SmartCut PWA

Mobile-first installable web app starter for D3 Interior Designs. This app is stored in the existing D3 website repository under `/smartcut`; it does not replace the public company website.

## Hosting and privacy architecture

- Source repository: `d3interiordesigns43-maker/D3-Interiordesigns`
- App subdomain target: `smartcut.d3interiordesigns.com`
- Recommended hosting: Cloudflare Pages connected to this GitHub repository, with project root directory set to `smartcut`.
- Restrict the hostname using Cloudflare Zero Trust Access (email one-time PIN / identity provider) and an allowlist of the owner's and workshop team's email addresses.
- Do **not** use ordinary GitHub Pages for a private app: GitHub Pages sites are public on the internet, even when their source repository is private. See GitHub's Pages privacy documentation.
- Do not put passwords, API keys, customer secrets or CNC machine credentials in this static repository.

## Cloudflare Pages configuration

Create a Pages project named `d3-smartcut`, connect this repository, select the `feature/d3-smartcut-pwa` branch for initial testing, and configure:

- Framework preset: None
- Root directory (advanced): `smartcut`
- Build command: leave empty
- Build output directory: `.`

After preview works, use the production branch chosen by the repository owner (normally a reviewed merge to `main`). Add the custom domain `smartcut.d3interiordesigns.com` in the Pages project.

## Access restriction (required before sharing)

In Cloudflare Zero Trust:
1. Open Access → Applications → Add an application → Self-hosted.
2. Application domain: `smartcut.d3interiordesigns.com`.
3. Add an Allow policy using **Include → Emails** and list only the owner's and approved workshop members' email addresses.
4. Set the login method (email one-time PIN is suitable for a small team).
5. Test from a private/incognito browser with an allowed email and a non-allowed email.
6. Only share the app URL after the denied-user test succeeds.

Cloudflare Access protects the hostname at the edge. The current app stores project data locally in the browser on each device; it does not yet provide a shared cloud database or cross-device sync. Each team member's projects remain on that device unless exported/imported as JSON.

## iPhone installation

1. Confirm the Access policy works and the site uses HTTPS.
2. On iPhone, open the app URL in Safari and complete the Access login.
3. Tap Share → Add to Home Screen → Add.
4. Launch the D3 SmartCut icon. Sign in again if Access requests it.

## Current capabilities and limits

- Project metadata and panel schedule in millimetres.
- Board size defaults to 2440 × 1220 mm; kerf and trim fields.
- Panel attributes: finished dimensions, quantity, thickness, material, colour, grain, selectable A/B/C/D edge band sides (0.8 mm or 2.0 mm), groove fields and adjustable hinge count, cup diameter, edge offset, end offset and cup depth.
- Automatic core-board dimension calculation: subtracts the selected edge-tape thickness from the finished size for each selected edge; cutting-list CSV includes both finished and core dimensions.
- Hinge planning coordinates are included in panel drawings and CSV exports. Hardware-specific drilling must be verified against the exact hinge manufacturer template.
- Local browser saving, JSON backup/restore and CSV cutting-list export.
- Browser print layout creates a separate print page for each panel; choose Save as PDF in the print dialog.
- Panel-saw cutting optimizer: guillotine-style heuristic layout planner groups parts by material and thickness, applies edge-band core-size deductions, kerf and trim allowances, respects grain direction by disabling rotation when grain is specified, and reports sheet layouts, utilization, reusable offcut rectangles and unplaced parts. A stock quantity of 0 means unlimited; a positive quantity is a per-material/thickness limit. Results can be exported as a layout CSV.
- Pro workshop reports: individual panel labels, panel pick list, edge-banding summary with estimated tape length, hinge-position schedule and CSV export.
- Reusable offcut register stored locally; optimizer residual rectangles can be saved and exported. The register is not automatically used as stock in later optimization runs.
- Service worker caches the static app shell for limited offline reopening.

Not yet implemented: authenticated cloud project storage, multi-user roles, production-grade global optimisation, a verified panel-saw cut sequence, automatic offcut reuse in later optimization runs, manufacturer-specific hinge templates, DXF export, WoodWOP MPR/MPRX export, or Mach3 G-code. The current groove/hinge fields are notes/illustrations, not verified machining coordinates. Do not use generated drawings or code as machine-ready instructions.

## Updating

Changes to files under `smartcut/` are deployed by the connected Pages project after the configured branch is updated. Review changes before merging to the production branch. Bump the cache name in `sw.js` when shipping a new static app version.