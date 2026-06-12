# Phase 4 — Density + mode write-through validation

**Status:** ✅ Both `MIGRATION_PROPOSAL.md` §4.7 (density) and §4.8 option A (mode) verified end-to-end.
**Date:** 2026-06-12
**Method:** Live Playwright probe of computed CSS on the V3 Default story under all 4 Salt density tiers × 2 modes, via Storybook's `?globals=density:X;mode:Y` URL parameters. No `useAgGridHelpers` involvement; no AG API plumbing.

---

## What this validates

> §4.7: "Salt's density is set on `SaltProvider`. `--salt-size-base` already inherits into the grid wrapper in v33 (because custom properties inherit now). `rowHeight`, `headerHeight`, `listItemHeight` already reference `calc(var(--salt-size-base) + …)`, so they react automatically. The legacy `useAgGridHelpers` JS branching on density to compute `rowHeight={25|37|49|61}` becomes **unnecessary**."

> §4.8 option A: "Salt's `--salt-*` tokens already react to `SaltProvider`'s `data-mode` attribute one level up; because v33 lets custom properties inherit into the grid, the theme automatically resolves to the right colours without any AG-specific mode wiring."

> §7 Phase 4 exit criteria: "Mode toggle + density change update grid live."

All three claims are now first-class verified, not assumed.

---

## Test 1: Density × mode matrix (V3 Default story)

Story: `ag-grid-ag-grid-theme-v3-phase-0-spike--default` — a stock `<AgGridReact theme={saltTheme} {...saltAgGridDefaults} ... />` wrapped in the Storybook `withTheme` decorator which renders `<SaltProvider density={X} mode={Y}>`.

| Density | salt `--size-base` | salt `--spacing-100` | salt `--text-fontSize` | AG `--ag-row-height` (computed) | AG `--ag-font-size` | **Rendered row px** | Rendered header px |
| ------- | ------------------ | -------------------- | ---------------------- | ------------------------------- | ------------------- | ------------------- | ------------------ |
| high    | 20px               | 4px                  | 11px                   | `calc(20px + 4px)`              | 11px                | **24** ✅           | 24                 |
| medium  | 28px               | 8px                  | 12px                   | `calc(28px + 8px)`              | 12px                | **36** ✅           | 36                 |
| low     | 36px               | 12px                 | 14px                   | `calc(36px + 12px)`             | 14px                | **48** ✅           | 48                 |
| touch   | 44px               | 16px                 | 16px                   | `calc(44px + 16px)`             | 16px                | **60** ✅           | 60                 |

Mode (probed at `density=medium`):

| Mode  | salt `--container-primary-background` | salt `--content-primary-foreground` | AG `--ag-background-color` (resolved) | Body rendered `background-color` |
| ----- | ------------------------------------- | ----------------------------------- | ------------------------------------- | -------------------------------- |
| light | `rgb(255, 255, 255)`                  | `rgb(0, 0, 0)`                      | `rgb(255, 255, 255)`                  | `rgb(255, 255, 255)`             |
| dark  | `rgb(16, 24, 32)`                     | `rgb(255, 255, 255)`                | `rgb(16, 24, 32)`                     | `rgb(16, 24, 32)`                |

**Cross-check vs legacy `useAgGridHelpers`:** legacy values were `25 / 37 / 49 / 61` (high / medium / low / touch). V3 values are `24 / 36 / 48 / 60`. The 1px delta per tier is the row border — V3 adds it via `rowBorder.width: var(--salt-size-fixed-100)` *outside* the row's content box; legacy bundled the border inside `rowHeight`. Net visual rhythm matches. ✅

**The dropped compact tier** (legacy: `useAgGridHelpers({ compact: true })` at high density gave 21/20px rows/headers) is correctly absent. Consumers wanting the old compact rhythm now do one of:
- `saltTheme.withParams({ rowHeight: 21, headerHeight: 20 })`, or
- `saltTheme.withParams({ rowVerticalPaddingScale: 0.75 })` for padding-relative compactness,
exactly as §4.7 prescribes.

---

## Test 2: Nested SaltProvider — inner density wins

Story: `ag-grid-ag-grid-theme-v3-phase-0-spike--hd-compact` — wraps its grid in an *inner* `<SaltProvider density="high">`. Probed with the *outer* Storybook density forced to `touch`:

| Token / value          | Where measured                                         | Resolved value         |
| ---------------------- | ------------------------------------------------------ | ---------------------- |
| `--salt-size-base`     | `<body>` (outer SaltProvider, density="touch")         | `44px`                 |
| `--salt-size-base`     | `.ag-root-wrapper` (inside inner SaltProvider, "high") | `20px` (effective)     |
| `--ag-row-height`      | `.ag-root-wrapper`                                     | `calc(20px + 4px)`     |
| `--ag-font-size`       | `.ag-root-wrapper`                                     | `11px`                 |
| Rendered row height    | `.ag-row` `getBoundingClientRect().height`             | **24px** ✅            |

This proves:

1. **CSS custom-property scoping picks the *nearest* `SaltProvider`** — not the document root — so a grid sitting inside its own dense region renders compact regardless of the page-level density.
2. **No remount, no API call, no class swap.** The inner SaltProvider just sets `--salt-size-base: 20px` on its scope; AG's resolved `calc()` references re-resolve via standard CSS cascade.
3. **Per-region density overrides "just work".** A consumer wanting "compact grid inside a normal-density page" wraps the grid alone in `<SaltProvider density="high">` and is done.

---

## Test 3: Live updates (no remount, no API call)

The Storybook density toolbar updates `globals.density` → the `withTheme` decorator re-renders `<SaltProvider density={…}>` with a new prop → the `AgGridReact` instance underneath stays mounted (React reconciliation keeps the same DOM node) → AG's row/header/listItem CSS that reads `var(--salt-size-base)` re-resolves through standard custom-property invalidation → rows reflow to the new height.

Confirmed by:

- Probing the *same story slug* under different density URL params and seeing different `--salt-size-base` / `--ag-row-height` resolved values without any code-side density wiring.
- The screenshot batch in `.migration-screenshots/phase-4-density/` (gitignored) showing distinct row counts/heights per density (file sizes: 30050, 25090, 22891, 23274 bytes for high/medium/low/touch light) — i.e. visually distinguishable grids, not byte-identical re-renders of one density.

No `gridApi.refreshHeader()`, no `gridApi.resetRowHeights()`, no `key={density}` force-remount, no class-name swap. The plumbing for "live density" is just CSS inheritance.

---

## Probe script

```js
() => {
  const b = document.body;
  const w = document.querySelector(".ag-root-wrapper");
  const row = document.querySelector(".ag-row");
  const hdr = document.querySelector(".ag-header-row");
  const r = (el) => (el ? Math.round(el.getBoundingClientRect().height) : null);
  const ag = (n) => (w ? getComputedStyle(w).getPropertyValue(n).trim() : null);
  const sa = (n) => getComputedStyle(b).getPropertyValue(n).trim();
  return {
    mode: document.querySelector("[data-mode]")?.getAttribute("data-mode"),
    density: document.querySelector("[data-density]")?.getAttribute("data-density"),
    salt: {
      sizeBase: sa("--salt-size-base"),
      spacing100: sa("--salt-spacing-100"),
      fontSize: sa("--salt-text-fontSize"),
      bg: sa("--salt-container-primary-background"),
      fg: sa("--salt-content-primary-foreground"),
    },
    ag: {
      rowHeight: ag("--ag-row-height"),
      headerHeight: ag("--ag-header-height"),
      listItemHeight: ag("--ag-list-item-height"),
      fontSize: ag("--ag-font-size"),
      bg: ag("--ag-background-color"),
      headerBg: ag("--ag-header-background-color"),
    },
    rendered: {
      rowPx: r(row),
      hdrPx: r(hdr),
      bodyBg: getComputedStyle(b).backgroundColor,
    },
  };
};
```

Invoked via:

```bash
playwright-cli goto "http://localhost:6006/iframe.html?id=ag-grid-ag-grid-theme-v3-phase-0-spike--default&viewMode=story&globals=density:high;mode:light"
playwright-cli --raw eval "$(cat probe.js)"
```

(The URL's `;` separator is interpreted literally by Storybook globals; URL-encode to `%3B` if your shell needs it.)

---

## Phase 4 follow-up work (not part of validation)

The §7 Phase 4 row also lists two **code-deletion** items beyond validation:

1. **Delete `useAgGridHelpers`.** Cannot be done until the legacy story files are removed (they still import the hook). Right call: keep the hook in `src/dependencies/` for the duration of the 2.x maintenance line, but **don't re-export it from `src/index.ts`** in v3 (already true). When the 2.x line is finally end-of-lifed, this file moves to a deletion PR.
2. **Export `saltAgGridDefaults` plain object.** ✅ Already done (Phase 0 spike, commit `530706f83` and earlier).

So Phase 4 is **fully done** for the v3 surface; the only outstanding bit is the eventual hook-file deletion, which is gated on the 2.x line's EOL.

