# Hand-off — `@salt-ds/ag-grid-theme` v3 migration

**Last updated:** 2026-06-12
**Status:** Phase −1 + Phase 0 spike both complete on `fix/ag-grid-theme-align-with-table` (uncommitted). Two §4.3 resolutions decided + applied. Typecheck green; visual diff vs legacy not yet captured.
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

- **2026-06-12** — Phase 0 spike complete (uncommitted). Stood up `src/saltTheme.ts` per the updated §4.3 + Resolutions 1 & 2, with 10 part stubs in `src/parts/` (saltIconSet, saltCheckboxStyle, saltInputStyle, saltColumnDropStyle, saltTabStyle, saltCellStates, saltFocusRing, saltRangeSelectionAdjustments, saltHeaderPrimary, saltHeaderDividerPrimary), the `saltAgGridDefaults` plain-object export, and a V3 `Default` story at `stories/v3/default.stories.tsx`. Wired `main: "src/index.ts"` in package.json (preserves the 2.x `style` field for legacy consumers); added a package-level `tsconfig.json` mirroring `@salt-ds/data-grid`. `yarn typecheck` green with zero `as any` in the params block — only outstanding error is the pre-existing `ContextMenu.tsx` `MenuItemDef` v34 issue from Phase −1. **Spike finding:** `createPart<TabStyleParams>(...)` rejects partial param objects (requires all 19 keys); resolved by narrowing the generic to a `SaltTabStyleParams` interface containing just the 2 params Salt opinionates on. Phase 1+ broadens this if/when Salt opinionates on more tab params.
- **2026-06-12** — Phase −1 follow-up: hit AG Grid v33's `error #272` (modules now require explicit registration) when starting Storybook. Fixed by introducing a shared `src/dependencies/setupAgGridLegacy.ts` module that registers `AllCommunityModule` + `AllEnterpriseModule` and calls `provideGlobalGridOptions({ theme: "legacy" })` once. All 32 example files now side-effect-import this module instead of inlining the legacy-mode call. Also caught: `HeaderVariants.tsx` was missing the Phase −1 shim entirely (now fixed by the refactor).
- **2026-06-12** — Phase −1 implemented on `fix/ag-grid-theme-align-with-table` (uncommitted): root `package.json` bumped to `ag-grid-* ^34`; `provideGlobalGridOptions({ theme: "legacy" })` (now via the shared setup module above) added to all 32 AgGridReact example files; `yarn build` + `yarn test` (260/260) green; `/tmp/ag34-probe.ts` type-checks against `createTheme` / `createPart` / `colorSchemeVariable`. Known minor: one `MenuItemDef` type error in `ContextMenu.tsx` (does not block runtime/build/tests).
- **2026-06-12** — §4.3 research complete (`/tmp/withParams-typecheck.md`). 34 of 39 params confirmed in `CoreParams`/`SharedThemeParams`; 5 params live on part-specific interfaces (`input-style`, `tab-style`); 0 removed in v34/v35. Method: read installed v35.3.0 `.d.ts` files directly (AG MCP docs unreachable).
- **2026-06-12** — Resolution 1 applied to proposal: added `saltTabStyle` part (new §4.6.3) covering `tabSelectedUnderline{Color,Width}` + bespoke `.ag-tabs`/`.ag-tab` CSS from `ag-menus.css`. Threaded through §4.1 (package tree), §4.2 (exports), §4.3 (chain + dropped inline tab params), §5 (mapping table).
- **2026-06-12** — Resolution 2 applied to proposal: §4.3 `accentColor` value `var(--salt-actionable-cta-background)` → `var(--salt-actionable-accented-bold-background)` to match the §2.1 token rename.
- **2026-06-11** — Decision 3 reversed: no `useSaltAgGrid()` hook (was: "yes, minimal"). Replaced with plain-object `saltAgGridDefaults` export. Rationale: a hook returning `{ theme: saltTheme }` wraps a module-level constant — no reactive work, no value over a direct import.
- **2026-06-11** — Initial hand-off created.

---

## When something changes

Update this hand-off (`MIGRATION_HANDOFF.md`) whenever:

- A phase is completed → strike it from the "Day-1 checklist" or add a "Status" line at the top.
- A decision in §9 is revisited → update both this doc *and* the proposal, and log it under "Change log".
- A new prerequisite is discovered → add it to the "Prerequisites" section.
- A risk in §8 of the proposal materialises → add a note here.

Treat the proposal as the *plan*, this doc as the *current state*. They should never disagree.

