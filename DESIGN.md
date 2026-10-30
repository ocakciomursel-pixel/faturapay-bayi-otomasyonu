# FaturaPay Kurumsal Design System (`DESIGN.md`)

Distilled from `taste-skill` (`framed-sheet`, seed `1544594749`), `impeccable` (`Operate` + `Persuade` craft floor), and `awesome-design-md` (`mercury`, `wise`, `linear.app`, `revolut`, `vercel`, `vodafone`).

## 1. Visual World & Architecture
- **Shell Archetype:** `Framed Sheet` (tinted L-frame `#f5f7f8` holding the `228px` sidebar and `48px` top bar with no dividing rule; workspace sits on a crisp `#ffffff` sheet inset `8px` from right and bottom window edges, `16px` sheet radius, `1px solid #e4e7ea` edge, zero resting drop shadow).
- **Colour Budget:** Under 3% chromatic pixels in chrome. Chrome and primary actions use deep neutral ink (`#131416`); chroma is reserved strictly for data (`--accent: #156275`), live chart series, focus rings, and semantic status pills (`>= 4.5:1` WCAG AA contrast across every surface).
- **Iconography:** Custom monochrome `16px` inline SVG icons at `1.5px` stroke width. Zero emoji glyphs anywhere in chrome, data, badges, or notifications.

## 2. Typography
- **Primary Grotesk:** `IBM Plex Sans` (weights `400`, `500`, `600`), sentence case everywhere, zero tracked uppercase headers.
- **Technical / IDs (`<code>`):** `IBM Plex Mono` (`400`, `500`) strictly for reference IDs, IBANs, PIN codes, and IP addresses.
- **Scale:**
  - Screen title (`h1`): `22px / 1.25`, weight `600`, `-0.01em`
  - Panel heading (`h2`): `16px / 1.3`, weight `600`
  - KPI figure: `28px / 1.15`, weight `400` (`500` when selected), `tabular-nums`
  - Body / Table cell / Nav item: `14px / 20px`, weight `400`
  - Meta / Table header (`th`) / Axis tick / Pill: `12px / 16px`, weight `400` (`500` on pills). Floor: `12px` minimum.

## 3. Switchable White-Label Worlds
1. `framed-sheet` — Petrol Teal L-Frame (`#f5f7f8` / `#ffffff` / `#156275`)
2. `achromatic-ledger` — Pure Ink & Cobalt Data (`#f9fafb` / `#ffffff` / `#1d5fbf`)
3. `wise-fintech` — Sage Frame & Deep Forest (`#f3f5f1` / `#ffffff` / `#186a42`)
4. `vercel-geist` — Swiss Monochrome (`#fafafa` / `#ffffff` / `#0761d1`)
5. `mercury-night` — Corporate Carbon Night (`#121318` / `#191b22` / `#5b8def`)
6. `linear-obsidian` — Deep Obsidian Flat (`#090a0c` / `#111317` / `#38bdf8`)
7. `revolut-carbon` — True-Black Data Terminal (`#000000` / `#111111` / `#2dd4bf`)
8. `telekom-counter` — High-Contrast Counter Crimson (`#f4f4f6` / `#ffffff` / `#be123c`)
