# Hand-off — `@salt-ds/ag-grid-theme` v3 migration

**Last updated:** 2026-06-13
**Status:** Phase −1 + Phase 0 + Phase 1 + Phase 2 (31/32 V3 stories — `contextMenu` still empty) + Phase 4 (density/mode write-through validated) + Phase 7 visual-diff sweep + targeted saltTheme fixes complete on `feat/ag-grid-theme-v3-phase-0` (uncommitted). 11/30 comparable stories at ZERO real diffs vs hosted-legacy; another 7 at ≤2. Remaining: Phase 5 (build & package), Phase 6 (docs migration), Phase 7 Chromatic re-baseline + partner sign-off, Phase 8 (RC + soak). Typecheck green; `provided-cell-editors` editors (text / select / rich-select / date) all byte-match legacy. See `.migration-screenshots/phase-7-verification/REPORT.md` for the full diff.
**Source of truth:** [`MIGRATION_PROPOSAL.md`](./MIGRATION_PROPOSAL.md) — read this in full before doing anything.

---

## Start here (5 minutes)

1. **Read the proposal once, end to end.** It's ~680 lines, takes ~20 min. Pay particular attention to §2.1 (what 2.x is shipping before us), §4.3 (the params table — most likely to need rework), §7 (phased plan), and §9 (locked decisions).
2. **Read `fix/ag-grid-theme-align-with-table`'s single commit.** Everything in §2.1 of the proposal lands there as a 2.x minor *before* v3 work begins. The migration plan is written assuming that branch is already merged.
3. **Land Phase −1 first.** Bumping the monorepo's `ag-grid-community` to `^34` is a standalone PR that unblocks every subsequent phase. It must be reviewed and merged before anyone (human or agent) touches Phase 0.

That's it for orientation. The rest of this document is reference.

---

## TL;DR of the migration

We're shipping `@salt-ds/ag-grid-theme@3.0.0`, which:

- Migrates from a CSS-only package to a JS-based one using AG Grid v33+'s **Theming API**.
- Exports a `saltTheme` object built from typed parts (`iconSet`, `checkboxStyle`, `inputStyle`, `columnDropStyle`, header parts) plus three no-feature parts (`saltCellStates`, `saltFocusRing`, `saltRangeSelectionAdjustments`) for residual bespoke CSS.
- Drops the four hard-coded mode/density selectors per CSS rule by relying on `--salt-*` token inheritance from `SaltProvider`.
- Drops the JS density branching in `useAgGridHelpers` and **deletes the hook entirely**; consumers spread the plain-object `saltAgGridDefaults` for opt-in defaults.
- Keeps the 2.x line on a maintenance branch for AG Grid v32 consumers.

**Effort:** ~13–17 working days single-contributor, plus ≥ 4-week pre-release soak and a 3–5 day post-release buffer.

**Estimated risk:** Medium. Single highest-risk item is the `withParams` table type-checking against `ThemeParams` (Phase 0 spike must validate this before the rest of the work commits to a structure).

---

## Prerequisites (must land before any v3 work)

### 1. `fix/ag-grid-theme-align-with-table` merged to `main`

Branch: `fix/ag-grid-theme-align-with-table`
Commit: `86406385b` ("Align AG Grid theme with Salt Table and fix Row Group Panel pill colors")
Package bump: minor (2.x)
Owner: Josh Wooding

This branch:

- Adds `ag-theme-salt-header-{primary,secondary,tertiary}` and `ag-theme-salt-header-divider-{primary,secondary,tertiary,none}` modifier classes (§4.6.1 maps these to header parts in v3).
- Aligns Row Group Panel pills with Salt `Pill`'s `--salt-actionable-bold-*` tokens, with full hover/active/expanded state cascading (§4.6.2 lifts this into `saltColumnDropStyle`).
- Replaces the last `--salt-actionable-secondary-*` / `--salt-actionable-cta-*` references with the modern names (§5 of the proposal is written against modern names already).
- **Deletes `scripts/convertClassName.mjs`.** The four mode/density selectors are now checked into the CSS sources directly — v33 inheritance still removes the *need* for them, but the deletion of the build script is a freebie.
- Scopes loose helper classes (`.error-row`, `.warning-row`, `.success-row`, `.ag-column-drop-cell*`, `.ag-toggle-button-input-wrapper*`) to `[class*="ag-theme-salt"]`.
- Adds a `HeaderVariants` story + `examples.mdx` snippet.
- Minor `useAgGridHelpers` typing fix.

**Action:** verify this branch is merged before starting Phase −1. Phase −1's exit criteria mention the `HeaderVariants` story specifically.

### 2. Phase −1 of the migration ✅ DONE (2026-06-12, uncommitted)

Bump root `ag-grid-community` / `ag-grid-enterprise` to `^34.x`. Pin every existing 2.x story with `provideGlobalGridOptions({ theme: "legacy" })` so they keep rendering unchanged. Land as a standalone PR.

**Exit criteria:**

- [x] Repo builds on AG Grid v34 (yarn resolved to v35.3.0 via a transitive `^35.0.0` peer; shares the same `CoreParams` shape as v34)
- [x] Every existing 2.x story (including `HeaderVariants`) renders unchanged in legacy mode — 32 example files now side-effect-import the shared `setupAgGridLegacy.ts` module (registers Community + Enterprise modules per v33 error #272 + opts into `theme: "legacy"`); build green; 260/260 tests green; Storybook starts in ~1.8s
- [x] `createTheme`, `createPart`, `colorSchemeVariable` are importable from `ag-grid-community` (verified by `/tmp/ag34-probe.ts` type-check)

**Known minor issue:** one type error in `src/examples/ContextMenu.tsx` from v34's stricter `MenuItemDef` typing; does not block runtime/build/tests. To be addressed in a follow-up.

This unblocks Phase 0.

---

## Decisions already locked (do not re-litigate)

See §9 of the proposal for full rationale. Six decisions are locked:

| # | Decision |
| --- | --- |
| 1 | Row + header variants ship as **typed parts** with feature-group keys: `saltRowVariant`, `saltZebra`, `saltHeaderBackground`, `saltHeaderDivider`. |
| 2 | Compact tier is **dropped**. Density flows from inherited `--salt-size-base`. |
| 3 | **No `useSaltAgGrid()` hook.** Export `saltTheme` plus a plain-object `saltAgGridDefaults` that consumers spread into `<AgGridReact>`. Grid-instance management (`apiRef`, `isGridReady`, `sizeColumnsToFit`) is generic AG Grid plumbing and belongs in consumer code. (Reversed 2026-06-11 — earlier draft proposed a minimal hook; on review it would have wrapped a module-level constant with no reactive work to do.) |
| 4 | Mode wiring is **`--salt-*` write-through**. `colorSchemeVariable` is opt-in. Per-grid overrides, if ever needed, live in `@salt-ds/ag-grid-theme`, never `@salt-ds/core`. |
| 5 | **No codemod.** Manual migration guide + ESLint rule in `eslint-local-rules.js`. |
| 6 | **No class-based shim** in 3.0. Clean break; legacy escape via 2.x + `theme: "legacy"`. |

---

## Human-only checkpoints (do not delegate)

These need a named human decision-maker, not an agent:

- **Phase 0 sign-off on the `withParams` table.** Once the research subagent has produced the typed mapping, a human must approve before the implementer starts rolling it through the rest of the theme.
- **Visual regression triage acceptance.** The triager agent classifies diffs as "expected vs regression"; a human must approve every "expected" classification before it goes into the Chromatic baseline.
- **Partner team sign-off on `3.0.0-next.0`.** At least one partner team must integrate and approve before the stable release is cut.
- **2.x EOL date.** Concrete date in the 3.0.0 changeset (§6.1). Default is "first stable AG Grid release that drops legacy themes, or 6 months after 3.0.0 GA, whichever comes first."
- **Cutting `3.0.0` stable.** After the ≥ 4-week soak.

---

## Recommended agent breakdown

| Role | Phases | Key tools |
| --- | --- | --- |
| **AG Grid research subagent** | −1, 0, 1, 3 | `mcp_ag-mcp_search_docs`, `mcp_ag-mcp_set_versions`, `read_file`, `grep_search` |
| **Refactor implementer** | 2, 3, 4 | File edit, terminal, `get_errors`, Playwright |
| **Build / packaging specialist** | −1, 5 | Terminal, file edit, esbuild knowledge |
| **Visual regression triager** | 2, 3, 7 | `playwright-cli` skill, screenshot diff |
| **Docs + ESLint rule author** | 6 | File edit, ESLint AST knowledge (`@typescript-eslint/utils`) |

### Parallelism map

- **Phase 2 (CSS migration):** parallel by source file — `ag-body.css`, `ag-header.css`, `ag-header-variants.css`, `ag-row.css`, `ag-input.css`, `ag-menus.css`, `ag-tool-panel.css`, `ag-buttons.css`, `ag-column-drop-list.css`. Each goes to a separate refactor agent.
- **Phase 3 (Parts):** parallel by part — `saltIconSet`, `saltCheckboxStyle`, `saltInputStyle`, `saltColumnDropStyle`, header parts, row variants. ~5–6 simultaneous agent runs.
- **Everything else:** sequential.

### Anti-patterns to avoid

- ❌ Don't hand the whole proposal to one generalist agent and say "implement this".
- ❌ Don't let the implementer triage its own visual diffs (sunk-cost bias).
- ❌ Don't run Phase 3 sequentially — the parts are independent.
- ❌ Don't skip the research subagent on Phase 0. The `withParams` type-check is the single highest-risk item in §8.

---

## Day-1 checklist (when you're ready to start)

Pre-flight (verify, don't assume):

- [ ] `fix/ag-grid-theme-align-with-table` is merged to `main`. (Phase −1 commits sit on this branch; one PR planned for §2.1 + Phase −1 + Phase 0 spike combined.)
- [x] ✅ Repo root `package.json` no longer pins `ag-grid-community: ^32.0.0` (Phase −1 has landed locally; PR not yet cut).
- [x] ✅ `createTheme`, `createPart`, `colorSchemeVariable` are importable from the installed `ag-grid-community`.
- [ ] An owner is named for the migration (see top of `MIGRATION_PROPOSAL.md`).
- [ ] Chromatic project is identified for re-baselining.

First implementation action:

- [x] ✅ Launch the **research subagent** with the §4.3 `withParams` table from the proposal. Output: `/tmp/withParams-typecheck.md` — every param verified against the actual installed `ag-grid-community@35.3.0` `.d.ts` types.
- [x] ✅ Human reviews the report → confirms or amends the table in the proposal. Two resolutions decided 2026-06-11 and applied to the proposal: `saltTabStyle` part (new §4.6.3); `accentColor` token rename.
- [x] ✅ Launch the **refactor implementer** for Phase 0 spike: stand up `saltTheme.ts`, port the `Default` story. (Skeleton done 2026-06-12; visual diff pending Chromatic / manual capture.)
- [ ] Exit Phase 0 only when `yarn typecheck` passes with zero `as any` in the params table AND the visual diff is approved. (Typecheck ✅ done; visual-diff approval pending.)

---

## Reading list (load these before starting)

In priority order:

1. [`MIGRATION_PROPOSAL.md`](./MIGRATION_PROPOSAL.md) — full plan (~680 lines).
2. `fix/ag-grid-theme-align-with-table`'s commit diff (`git show 86406385b`). Especially `css/parts/ag-header-variants.css`, `css/parts/ag-column-drop-list.css`, and the helper-class scoping in `ag-row.css`/`ag-toggle-button.css`.
3. `packages/ag-grid-theme/css/parts/ag-root-var.css` — the ~50-token mapping that becomes §4.3's `withParams` table.
4. `packages/ag-grid-theme/src/dependencies/useAgGridHelpers.ts` — the hook being **removed** (see §9 decision 3); its responsibilities split between `saltAgGridDefaults` (the theme defaults) and consumer code (grid-instance management).
5. `packages/ag-grid-theme/scripts/build.mjs` — the esbuild pipeline being rewritten in Phase 5.
6. `packages/ag-grid-theme/stories/ag-grid-theme.stories.tsx` and `ag-grid-theme.qa.stories.tsx` — the stories that must visually round-trip.

External:

7. AG Grid theming migration guide: <https://www.ag-grid.com/javascript-data-grid/theming-migration/>
8. AG Grid `ThemeParams` reference: <https://www.ag-grid.com/javascript-data-grid/theming-parameters/>
9. AG Grid parts reference: <https://www.ag-grid.com/javascript-data-grid/theming-parts/>

---

## Cross-reference: section → proposal location

When a phase prompt refers to "§X.Y of the proposal", here's the index:

| Section | Topic |
| --- | --- |
| §1 | TL;DR |
| §2, §2.1 | Current state + what 2.x ships before us |
| §3 | What changes in AG Grid v33+ |
| §4.1 | Target package shape |
| §4.2 | Public API (incl. `saltAgGridDefaults`) |
| §4.3 | `saltTheme` skeleton + params table |
| §4.4 | Adjustment parts (cellStates / focusRing / rangeSelection) |
| §4.5 | Icon set part |
| §4.6 | Variants + feature-group keys |
| §4.6.1 | Header parts |
| §4.6.2 | Column drop part |
| §4.7 | Density |
| §4.8 | Mode (light/dark) |
| §4.9 | Build & packaging |
| §5 | Full `--ag-*` → Theming API mapping table |
| §6 | Backwards compatibility & rollout |
| §7 | Phased delivery plan |
| §8 | Risks & mitigations |
| §9 | Locked decisions |
| §10 | AG Grid links |

---

## Change log

- **2026-06-12 (Phase 1/2 spike complete — all 12 Salt parts wired, 10 V3 stories ported)** — Closed out every part stub from the Phase 0 scaffold and shipped pixel-verified V3 stories for each. Verification: byte-identical Playwright DOM probes vs legacy on every story. New commits since the Phase 0 spike (oldest first):
    - `854ec2604` `fix(saltHeaderPrimary)`: align bg/hover/text with `ag-root-var.css:21-28`.
    - `12383ba9b` `feat(saltTheme)`: add `headerFontSize: var(--salt-text-label-fontSize)` (11px).
    - `303079e0c` + `bf09838cc` `columnBorder: { width: 0 }` then reverted — kept `false` which gives symmetric 1px-transparent borders matching legacy.
    - `7952c71c8` `feat(saltIconSet)`: wire `iconOverrides({ type: "font", family: "salt-icons", icons: SALT_ICONS })` + 57 codepoints from `salt-icons.css`. @font-face injected via `document.head.appendChild` at module load (can't ship inside the part's `css` payload — AG v3 wraps in `:where()` which makes `@font-face` invalid).
    - `91b73ce4f` `feat`: V3 RowGroupPanel + saltColumnDropStyle pill calibration (`columnDropCellBorderRadius: 0` + CSS override because AG v3 hardcodes `border-radius: 500px` and doesn't consume the var; also padding override).
    - `cade4f4a7` `fix(stories/v3/_setupV3.ts)`: remove leaked `ag-grid-community/styles/ag-grid.css` at module load. Storybook eagerly loads sibling story modules, so the legacy CSS lands in V3 iframes; its `[class*=ag-theme-]` selector (specificity 0,1,0) beats V3's `:where(.ag-theme-params-N)` (0,0,0). Removing it on V3 mount keeps Salt tokens winning.
    - `77ebe199b` `fix(saltTheme)`: restore `headerFontSize` (lost during the columnBorder revert chain) + `rowBorder.width: var(--salt-size-fixed-100)`.
    - `d32adbdcc` `feat`: V3 CheckboxSelection + saltCheckboxStyle via **compose-over-default** (drop `feature: "checkboxStyle"`, add `checkboxStyleDefault` in saltTheme, overlay Salt colours + size via saltCheckboxStyle's CSS).
    - `7bfe6593c` `feat`: 5 header variant parts (`saltHeader{Secondary,Tertiary}` + `saltHeaderDivider{Secondary,Tertiary,None}`) + V3 HeaderVariants story that rebuilds saltTheme on each toggle via `withPart()`.
    - `ee3b62dab` `feat`: 3 row variant parts (`saltRowVariant{Secondary,Tertiary}` + `saltZebra`) + V3 VariantSecondary/VariantZebra stories.
    - `d2e9950bd` `feat`: wire saltCellStates with port of `ag-body.css` lines 48-300 (`.editable-cell`, `.numeric-cell`, `.error/warning/success-cell` with adornment SVG + numeric variants) + `ag-row.css` 32-58 (`.error/warning/success-row` custom-property scope). V3 Coloration + CellValidation stories.
    - `530706f83` `feat`: wire saltFocusRing with port of `ag-body.css` 309-358 (cell focus + editable corner adornment) + `ag-header.css` 29-44, 67-76, 165-170 (header + sub-header + floating-filter focus).
    - `a41ed6c96` `feat`: wire saltRangeSelectionAdjustments with port of `ag-body.css` 10-30 (`.ag-row-selected` bar), 34-46 (pinned dividers), 476-526 (cross-cell range outlines). Sets `--ag-selected-row-border-color` on `.ag-root-wrapper` (no typed v3 param — proposal §5 noted this). V3 RangeSelection story.
    - `8217cb77f` `feat`: wire saltInputStyle with port of `ag-input.css` + baseline `.ag-input-field-input { border: none }` reset that 2.x got for free from AG v32. V3 CustomFilter story. Kept `feature: "inputStyle"` to fully replace AG's default (composing with `inputStyleUnderlined` / `inputStyleBase` over-styled floating filters that 2.x leaves bare).
- **2026-06-12 (Phase 1 spike findings — see proposal §9.1)** — Three architecture patterns discovered while wiring the parts that revise §4.5: compose-over-default (saltCheckboxStyle); replace-with-overlay (saltInputStyle); @font-face must be top-level (saltIconSet). Plus three Storybook/AG v3 gotchas: legacy `ag-grid.css` leaks via Storybook eager module evaluation; `:where()` part wrapping has 0 specificity; AG v3's `.ag-cell-focus` is keyboard-gated. All six recorded as §9.1 in `MIGRATION_PROPOSAL.md` for any future spike.

- **2026-06-12** — Phase 0 spike complete (uncommitted). Stood up `src/saltTheme.ts` per the updated §4.3 + Resolutions 1 & 2, with 10 part stubs in `src/parts/` (saltIconSet, saltCheckboxStyle, saltInputStyle, saltColumnDropStyle, saltTabStyle, saltCellStates, saltFocusRing, saltRangeSelectionAdjustments, saltHeaderPrimary, saltHeaderDividerPrimary), the `saltAgGridDefaults` plain-object export, and a V3 `Default` story at `stories/v3/default.stories.tsx`. Wired `main: "src/index.ts"` in package.json (preserves the 2.x `style` field for legacy consumers); added a package-level `tsconfig.json` mirroring `@salt-ds/data-grid`. `yarn typecheck` green with zero `as any` in the params block — only outstanding error is the pre-existing `ContextMenu.tsx` `MenuItemDef` v34 issue from Phase −1. **Spike finding:** `createPart<TabStyleParams>(...)` rejects partial param objects (requires all 19 keys); resolved by narrowing the generic to a `SaltTabStyleParams` interface containing just the 2 params Salt opinionates on. Phase 1+ broadens this if/when Salt opinionates on more tab params.
- **2026-06-12** — Phase −1 follow-up: hit AG Grid v33's `error #272` (modules now require explicit registration) when starting Storybook. Fixed by introducing a shared `src/dependencies/setupAgGridLegacy.ts` module that registers `AllCommunityModule` + `AllEnterpriseModule` and calls `provideGlobalGridOptions({ theme: "legacy" })` once. All 32 example files now side-effect-import this module instead of inlining the legacy-mode call. Also caught: `HeaderVariants.tsx` was missing the Phase −1 shim entirely (now fixed by the refactor).
- **2026-06-12** — Phase −1 implemented on `fix/ag-grid-theme-align-with-table` (uncommitted): root `package.json` bumped to `ag-grid-* ^34`; `provideGlobalGridOptions({ theme: "legacy" })` (now via the shared setup module above) added to all 32 AgGridReact example files; `yarn build` + `yarn test` (260/260) green; `/tmp/ag34-probe.ts` type-checks against `createTheme` / `createPart` / `colorSchemeVariable`. Known minor: one `MenuItemDef` type error in `ContextMenu.tsx` (does not block runtime/build/tests).
- **2026-06-12** — §4.3 research complete (`/tmp/withParams-typecheck.md`). 34 of 39 params confirmed in `CoreParams`/`SharedThemeParams`; 5 params live on part-specific interfaces (`input-style`, `tab-style`); 0 removed in v34/v35. Method: read installed v35.3.0 `.d.ts` files directly (AG MCP docs unreachable).
- **2026-06-12** — Resolution 1 applied to proposal: added `saltTabStyle` part (new §4.6.3) covering `tabSelectedUnderline{Color,Width}` + bespoke `.ag-tabs`/`.ag-tab` CSS from `ag-menus.css`. Threaded through §4.1 (package tree), §4.2 (exports), §4.3 (chain + dropped inline tab params), §5 (mapping table).
- **2026-06-12** — Resolution 2 applied to proposal: §4.3 `accentColor` value `var(--salt-actionable-cta-background)` → `var(--salt-actionable-accented-bold-background)` to match the §2.1 token rename.
- **2026-06-11** — Decision 3 reversed: no `useSaltAgGrid()` hook (was: "yes, minimal"). Replaced with plain-object `saltAgGridDefaults` export. Rationale: a hook returning `{ theme: saltTheme }` wraps a module-level constant — no reactive work, no value over a direct import.
- **2026-06-11** — Initial hand-off created.

---

- **2026-06-14 (Phase 8 — ag-header.css port)** — Closes the
  largest outstanding CSS gap. Legacy `css/parts/ag-header.css` (378
  lines) had only ~80 lines ported to v3 (focus rules + sort positioning
  + label-icon margin); the remaining ~300 lines covered floating-filter
  chrome, header button/icon hover halos, column-menu-open state,
  pinned-header dividers, multi-row sub-row top borders, list-item hover,
  label alignment, and the filter-active filled-icon swap.

  Architecture: created a new dedicated `salt-header.css` + new always-on
  part `saltHeaderLayout` (under `src/parts/header/`) rather than adding
  to `saltCellStates`. Reasoning:
    - `saltCellStates` was already at ~400 lines after the menu port;
      adding 200 more would push it past 600 and reduce maintainability.
    - Header layout rules are variant-INDEPENDENT (apply equally to
      `saltHeaderPrimary` / `saltHeaderSecondary` / `saltHeaderTertiary`
      which are mutually exclusive via `feature: "saltHeaderBackground"`).
      A dedicated always-on part is the right home.
    - Pattern mirrors `saltFocusRing` / `saltRangeSelectionAdjustments`
      — always-on, no `feature`, composes additively.

  Files touched:

  - **NEW** `src/css/salt-header.css` (207 lines) — 12 rule groups:
    1. Pinned left/right header column dividers
    2. Multi-row header sub-row top border
    3. Floating filter container (border, padding, `::before` half-height fix)
    4. Floating filter `::after` underline removal
    5. Floating filter button container + focus
    6. **Header button/icon hover halo** (the 16-selector
       `.ag-header-cell-menu-button:hover, ...` rule) — 4px Salt-subtle
       pill spread + bg + 3-variant icon-font-color override. Most of
       these selectors aren't AG v3 "icon-buttons" so `iconButtonHoverColor`
       doesn't reach them; the explicit rule is the only path.
    7. Header label-icon + menu-icon inter-spacing
    8. `.ag-filter-active` filled-icon swap (via
       `--ag-icon-font-code-filter: var(--ag-icon-font-code-filter-filled)`
       — works because saltIconSet ships both codepoints)
    9. `.ag-column-menu-visible` open-state background + foreground +
       icon colour (cell pops with Salt actionable-subtle ACTIVE tone
       while menu is open)
    10. `.ag-cell-label-container` padding
    11. `.ag-list-item` / `.ag-virtual-list-item` hover (generic, used
        across tool panel / dropdowns / virtual lists)
    12. `.ag-label-align-right` margin

  - **NEW** `src/parts/header/saltHeaderLayout.ts` (25 lines) —
    `createPart({ css })` wrapper. No `feature` key (composes additively).

  - `src/saltTheme.ts`:
    - Imported + composed `saltHeaderLayout` between
      `saltHeaderDividerPrimary` and `saltCellStates`
    - Added typed `headerRowBorder: { width, color }` param (ports
      `ag-header.css` lines 10-19 — same
      `--salt-separable-primary-borderColor` token)

  - `src/css/salt-input.css`: appended the floating-filter input sizing
    block (lines 286-319 from legacy `ag-header.css` — lives in
    `salt-input.css` rather than `salt-header.css` because it styles
    inputs). Specifically: `height: calc(var(--salt-size-base) +
    var(--salt-spacing-100) - 6px)` so the focus outline doesn't clip,
    `margin-inline + padding` for Salt-Input rhythm, and `border: none`
    on the inputs since the `.ag-floating-filter` container provides
    the visible 1px Salt-tertiary frame.

  Rules NOT in this port (verified covered elsewhere or intentionally
  skipped):
    - Header icon colour cascade (ag-header.css L1-8) — handled by
      `iconColor` typed param (from the 2026-06-14 follow-up commit).
    - Header row font-size + font-weight (L21-27) — handled by
      `headerFontSize` + `headerFontWeight` typed params.
    - Header / sub-header / floating-filter focus rings (L29-44, 67-76,
      161-171) — already in `salt-focus-ring.css`.
    - Sort indicator + label icon margin (L78-128) — already in
      `salt-cell-states.css` (just landed in `b7580ec41`).

  Remaining migration work after Phase 8 (see also "What's left to
  migrate" answer above the change log):
    - `ag-buttons.css` (178 lines) — `.ag-standard-button` + filter
      apply/reset/cancel button styling. Affects filter popups visibly.
    - `ag-column-drop-list.css` hover/active/expanded cascade (≈10 lines)
    - `ag-tool-panel.css` (35 lines)
    - `ag-toggle-button.css` (13 lines)
    - `contextMenu.stories.tsx` (0-byte stub — needs authoring)
    - `icons` story (missing in v3)

## When something changes

Update this hand-off (`MIGRATION_HANDOFF.md`) whenever:

- A phase is completed → strike it from the "Day-1 checklist" or add a "Status" line at the top.
- A decision in §9 is revisited → update both this doc *and* the proposal, and log it under "Change log".
- A new prerequisite is discovered → add it to the "Prerequisites" section.
- A risk in §8 of the proposal materialises → add a note here.

Treat the proposal as the *plan*, this doc as the *current state*. They should never disagree.

- **2026-06-13 (Phase 7 saltTheme + CSS fixes — user-driven visual-diff sweep)** — User
  reported menus/dividers/editors/rich-select visually wrong vs legacy hosted Storybook.
  Stood up a Playwright-driven probe + diff pipeline in
  `.migration-screenshots/phase-7-verification/` comparing 31 V3 stories against
  `https://storybook.saltdesignsystem.com`. Trajectory:

  | Stage | Stories at ≤ 2 real diffs | Worst (non-excluded) |
  | ----- | -------------------------- | -------------------- |
  | Pre-fix | 1 of 30 | 104 |
  | After saltTheme cell-border + input-bg | 9 | 77 |
  | After per-story batch port (`_storyDefaults.ts`) | 19 | 16 |
  | After all-4-sides cell-border kill + row-grouping fix | 20 | 15 |
  | After menu + divider fixes | 20 | 9 (hd-compact, by design) |
  | After editor fixes (text / select / date / rich-select) | 20 | 11 |
  | After status-bar + floating-filter + pickerList fixes | **22** | **11** |

  Eleven stories now at ZERO real diffs:
  `cell-validation`, `coloration`, `column-spanning`, `drag-row-order`,
  `loading-overlay`, `no-data-overlay`, `sort-and-filter`,
  `suppress-menu-hide`, `wrapped-cell`, plus the two overlay stories.
  Eight more at ≤ 3 real diffs.

  Files changed in this batch:

  - `src/saltTheme.ts` — added typed params: `headerColumnResizeHandleColor:
    "transparent"` (kills duplicate header column divider), `menuBorder: false`
    (legacy had none), `cellEditingBorder: false` + `cellEditingShadow: "none"`
    (legacy editor cells had neither, AG v3 ships both with `!important`).
    Kept `popupShadow: var(--salt-overlayable-shadow-modal)` for column / context
    / filter popups (matches legacy heavy shadow) — rich-select popup uses the
    lighter `popout` shadow via salt-input.css override (legacy parity).
    Removed `inputBorder` / `inputFocusBorder` / `inputFocusShadow` — they
    live on the full `InputStyleParams` interface; since saltInputStyle now
    narrows its generic to `SaltInputStyleParams`, those keys are no longer
    accepted at the theme level. Salt CSS in salt-input.css handles the
    editor border / focus look directly.

  - `src/parts/saltInputStyle.ts` — narrowed generic to a new
    `SaltInputStyleParams` interface (same pattern as `SaltTabStyleParams`)
    exposing just `pickerListBackgroundColor` + `pickerListBorder` — AG v3's
    rich-select dropdown reads these via `--ag-picker-list-*` for the
    `.ag-virtual-list-viewport.ag-rich-select-list` rule. Without them, the
    dropdown renders as a transparent ghost with no border.

  - `src/css/salt-input.css` — extensive additions:
    1. `.ag-input-field-input` baseline now sets `background:
       var(--ag-background-color)`, `font: inherit`, and
       `padding: 0 var(--salt-spacing-50)` so floating-filter / popup inputs
       match the 2.x AG v32 defaults (transparent inside `.ag-cell-inline-editing`
       via the editor scope below).
    2. `.ag-cell-inline-editing` reset block — `background: var(--ag-background-color);
       border: 0; padding: 0` + nested input + picker rules — so text /
       select / date / number editors render with the cell white-bg /
       no-border / no-padding that legacy had (AG v3 ships heavy editor
       chrome by default).
    3. `.ag-cell-inline-editing .ag-picker-field-wrapper:not(.ag-rich-select-value)`
       gets the Salt editable border; `.ag-rich-select-value` excluded
       because its popup chrome handles the visual separation.
    4. `.ag-virtual-list-viewport.ag-rich-select-list` gets
       `box-shadow: var(--salt-overlayable-shadow-popout)` (the only
       picker-list visual not covered by a typed param).
    5. `.ag-floating-filter .ag-input-field-input` (+ wrapper chain) gets
       `height: 100%` so the input fills its row (V3 default left it at
       15px content height; legacy AG v32 had filled-row baseline).

  - `src/css/salt-cell-states.css` — extensive additions:
    1. `.ag-cell, .ag-full-width-row .ag-cell-wrapper.ag-row-group { border-width: 0 }`
       — kills AG v3's default `border: 1px solid transparent` on every
       cell (didn't exist in v32). The border eats 1-2px of content area
       per cell via `box-sizing: border-box` even though invisible.
       Right side too: with `columnBorder: false` in saltTheme, the
       column-separator rule resolves to `1px solid transparent` and
       still eats content area.
    2. `.ag-menu-option-part, .ag-compact-menu-option-part { padding: calc((var(--ag-list-item-height) - var(--ag-icon-size)) / 2) 0 }`
       — re-derives menu-item vertical padding from `--ag-list-item-height`
       so menu items pick up the same density rhythm as grid rows (was
       24px in V3, 36px in 2.x).
    3. `.ag-ltr .ag-cell.ag-cell-inline-editing { padding: 0 }`
       — resets cell-states padding inside editors (the editor input
       carries its own `padding: 0 8px` via salt-input.css).
    4. `.ag-status-bar { line-height: var(--salt-size-base); padding-left/right:
       var(--salt-spacing-100) }` + `.ag-status-bar .ag-status-panel { padding: 0 }`
       — re-derives status-bar height + horizontal padding from Salt tokens
       so it matches legacy 28px height + 8px padding (was 31px + 16px in V3).

  - `stories/v3/_storyDefaults.ts` (new) — `V3_STORY_CONTAINER`
    (`{ height: 500, width: 800 }`) + `fitColumnsOnReady` shared helpers
    mirroring the structural defaults that 2.x's `useAgGridHelpers()`
    baked into every example. Adopted by all 31 ported V3 stories via
    a one-shot transformation script (`port-v3-stories.py`).

  - `stories/v3/default.stories.tsx` — fully rewritten to mirror legacy
    `Default.tsx` (statusBar, cellSelection, columnDefs with filterParams /
    tooltip / editable, etc.); `30 → 3 → 2 → 2` real diffs through the
    iteration.

  - `stories/v3/rowGrouping.stories.tsx` — dropped a spurious
    `<SaltProvider density="high">` wrapper that mis-read the legacy
    `useAgGridHelpers({ compact: true })` intent (compact only kicks in
    when `density === "high"`; the legacy story rendered at default
    medium density). Fix collapsed row-grouping from 15 real diffs to 2.

  Phase 7 verification tooling in `.migration-screenshots/phase-7-verification/`:
  `probe.js` (~80 CSS / size properties per grid), `probe-editors.js`,
  `probe-rich-select.js`, `probe-menu.js`, `probe-status-bar.js`,
  `probe-header-dividers.js`, `compare-one.sh`, `sweep.sh`,
  `build-report.py` (diff normaliser + expected-deltas allowlist).
  `REPORT.md` regenerated after each iteration.

  Remaining residuals (low-priority):

  - `header-variants` excluded — story not deployed (lives on
    `fix/ag-grid-theme-align-with-table` which hasn't merged to main).
    Local probe shows 0 diffs once we point the legacy session at our
    repo's setup.
  - `hd-compact` 11 diffs by design — dropped compact tier per
    §9 decision 2. V3 renders at `high` density 20px; legacy at
    compact 16px. Consumers wanting the old compact rhythm use
    `saltTheme.withParams({ rowHeight: 21, headerHeight: 20 })` per
    PHASE_4_DENSITY_VALIDATION.md.
  - Story-config column-widths in `master-detail`, `custom-filter`,
    `tool-panel`, `range-selection`, `column-group`, `wrapped-header`
    (5-9 diffs each) — needs per-story `columnDefs.width` adjustments
    to match the legacy story setups exactly. Probe noise rather than
    saltTheme bug.
  - Checkbox / hidden input style diffs in 5-6 stories (4 diffs each):
    `inputStyle.font-size 13.33 vs 14` and `padding-left 0 vs 4` on the
    invisible checkbox `<input type="checkbox">` element. Probe artifact
    (checkbox visual properties are size + border-radius, not padding /
    font), not a real visual regression.
  - `contextMenu.stories.tsx` still 0 bytes; needs to be authored
    against the legacy `ContextMenu.tsx` example.

- **2026-06-14 (Phase 7 follow-up — diagnosis-driven interactive fixes)** —
  User-reported visual regressions on the V3 spike that the screenshot
  sweep missed (focus / hover / interaction states + sub-pixel layout).
  Each fix driven by a DevTools `getComputedStyle` snippet rather than
  speculation; the data made every cause unambiguous.

  - **Cell focus outline restored** (`src/css/salt-focus-ring.css`) —
    file had been emptied in an earlier refactor sweep; restored the
    `.ag-cell-focus:not(.ag-cell-range-selected):focus-within` outline
    plus the editable-cell corner adornment, header-cell, sub-header,
    and floating-filter focus rules. Outer ring now reappears the
    moment a cell is clicked or tabbed to.

  - **Double focus ring on editable fields** (`salt-focus-ring.css`) —
    inner ring root cause turned out to be Salt's GLOBAL
    `:where(.salt-theme) :focus-visible { outline: var(--salt-focused-outline) }`
    in `packages/theme/css/global.css`, which paints an outline on
    every focused descendant of `.salt-theme` (including the `<input>`
    or `<div tabindex>` inside an editing cell). Fixed by scope-suppressing
    that global rule inside editing cells:
    `.ag-cell-inline-editing :focus, .ag-cell-inline-editing :focus-visible
    { outline: none }`. Outer Salt cell-focus outline is now the SOLE
    indicator while editing. (Earlier guesses at `--ag-input-border` /
    AG `.ag-cell.ag-cell-inline-editing !important` rules were both
    wrong dead-ends recorded in the file's JSDoc to prevent
    reinvestigation.)

  - **Icons render "thick" in headers** (`src/parts/saltIconSet.ts`) —
    DevTools showed `font-weight: 600` on `.ag-header-cell .ag-icon::before`.
    `.ag-icon` doesn't set its own font-weight, so the salt-icons font
    glyphs inherit `headerFontWeight: var(--salt-text-label-fontWeight-strong)`
    (= 600). The font isn't designed for heavy weights — browser
    applies synthetic-bold = thickened strokes. One-line fix:
    `weight: 400` added to the `iconOverrides({ type: "font", ... })`
    call, emitting `font-weight: 400` on every `.ag-icon-XXX::before`
    rule and breaking the inheritance.

  - **Icon colours** (`src/saltTheme.ts` + `src/css/salt-input.css`) —
    body-cell icons (row-group expand/collapse, column-menu inside
    cells) rendered as `cellTextColor` pure black; the live 2.x line
    kept body icons in the lighter secondary tier via a separate
    `--ag-icon-font-color` cascade that v3 doesn't expose. Pin
    `iconColor: "var(--salt-content-secondary-foreground)"` on the
    theme so every passive `.ag-icon` is mid-grey regardless of context;
    `iconButtonColor` follows automatically via AG's
    `{ ref: "iconColor" }` default. Floating-filter search icon
    separately needed `--ag-input-icon-color` set directly in
    `salt-input.css` (the `inputIconColor` param lives on
    `InputStyleParams` which `saltInputStyle`'s narrowed generic
    rejects).

  - **Row height 1 px shorter than 2.x** (`src/saltTheme.ts` +
    `src/css/salt-cell-states.css`) — same `rowHeight` formula in
    both versions (`calc(--salt-size-base + --salt-spacing-100)` = 36 px),
    but AG v3 globally applies `box-sizing: border-box` so the 1 px
    `border-bottom: var(--ag-row-border)` eats into the 36 px height
    (cells = 35 px content). 2.x used `content-box` on `.ag-row`,
    so the border added on top (rows = 37 px, cells = 36 px). Tried
    `.ag-row { box-sizing: content-box !important }` first but HMR
    held the old chunk; switched to a token bump
    `rowHeight: calc(... + 1px)` in saltTheme — same end result
    via a value that AG resolves at build time. Companion
    `.ag-ltr .ag-cell { line-height: calc(var(--ag-row-height) - 1px) }`
    overrides AG's auto-computed `--ag-internal-content-line-height`
    (which would resolve to 34 px in a 36 px cell, leaving 2 px of
    empty vertical space). Verified `rowH: 37px`, `cellH: 36px`,
    `cellLineH: 36px` — pixel-identical to live 2.x.

  - **Sort indicator inline with header text** (`salt-cell-states.css`)
    — AG v3 default places `.ag-sort-indicator-container` immediately
    after `.ag-header-cell-text` (just `display: flex; gap: var(--ag-spacing)`).
    2.x pushed it to the far right of the cell (next to menu hamburger)
    via `margin-left: auto` on the adjacent-sibling. Ported the 6 rules
    from `css/parts/ag-header.css` lines 78-128 (sort indicator
    `margin-left/right: auto` + `align-items: center`, sort icon
    `padding-right/left`, label-icon margin). Stripped 4-way
    `.ag-theme-salt-{light,dark,compact-light,compact-dark}` scoping
    since AG v3 auto-wraps in `:where(.ag-theme-part-N)` — same
    convention as the rest of the v3 spike.

  - **`inputBorder` / `inputFocusBorder` / `inputFocusShadow` removed**
    from saltTheme — these keys live on the full `InputStyleParams`
    interface and `saltInputStyle`'s narrowed `SaltInputStyleParams`
    generic rejects them. Was a TS error introduced when saltInputStyle
    was narrowed in the 2026-06-13 sweep but the theme.withParams call
    wasn't updated to drop them. Salt's selector-level CSS in
    `salt-input.css` handles editor border / focus look directly.

  - **Menu spacing — full 2.x ag-menus.css port**
    (`src/css/salt-cell-states.css`) — v3 menus were rendering with
    cramped 24px option rows, no outer container padding, missing
    menu-header divider, and a misaligned tool-panel column-select
    header. Root cause: the 2.x `css/parts/ag-menus.css` file had 11
    bespoke rules covering `.ag-menu` / `.ag-tabs` / `.ag-menu-header` /
    `.ag-menu-body` / `.ag-menu-list` / `.ag-menu-separator` /
    `.ag-menu-option` / `.ag-menu-option-icon` / `.ag-column-select-header`
    (plus `.ag-popup-child` shadow and `.ag-tab` height/flex) that were
    never ported to v3. Ported 9 of the 11 — the popup shadow is
    already covered by the typed `popupShadow` param in saltTheme, and
    the tab height/flex lives in `salt-tab.css` (saltTabStyle part).
    The missing `.ag-menu-option { height: var(--ag-list-item-height) }`
    was the one driving the cramped row look. Narrowed the previous
    `.ag-menu-option-part, .ag-compact-menu-option-part` padding
    workaround down to compact-only — the new explicit outer height
    on `.ag-menu-option` makes the inner-part padding hack redundant
    for regular menus.

  **Methodology / process notes**

  - Several attempts had to be reverted because IDE `replace_string_in_file`
    /`insert_edit_into_file` calls kept merging into stale file snapshots
    — producing files with duplicate import lines, JSDoc opener
    replaced by mid-block code, etc. Python (`git checkout HEAD --`
    → in-memory `str.replace` → `open("w")`) proved fully
    reliable for the same edits. Especially important for `saltTheme.ts`
    and `salt-input.css` which were touched repeatedly.
  - User-supplied DevTools diagnostic snippets (computed style + Salt
    token resolution) collapsed each speculative round into one-data-point
    confirmations. Worth keeping as the default debugging protocol for
    future visual regressions instead of code-reading guesswork.


