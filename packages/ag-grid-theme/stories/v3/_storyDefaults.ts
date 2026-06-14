/**
 * Shared V3 story scaffolding used by every story under `stories/v3/`.
 *
 * Mirrors the structural defaults that 2.x's `useAgGridHelpers()` baked into
 * every example (see `src/dependencies/useAgGridHelpers.ts`):
 *
 *   - container `{ height: 500, width: 800 }`
 *   - `onGridReady` -> `api.sizeColumnsToFit()` so columns spread to fill 800px
 *     instead of taking AG\'s 200px default
 *   - `suppressMenuHide: true` (matches 2.x stories)
 *
 * `saltAgGridDefaults` already provides `defaultColDef = { filter, resizable,
 * sortable }`. Stories spread that themselves; this file only adds the bits
 * that 2.x carried in the hook (which we deliberately don\'t ship in v3 — see
 * §9 decision 3: no `useSaltAgGrid()` hook).
 *
 * NOT in this file:
 *   - density branching (V3 uses `--salt-size-base` write-through, no rowHeight prop)
 *   - mode classes (V3 picks up `--salt-*` tokens via the SaltProvider parent)
 *
 * Phase 7 introduction (2026-06-13) — created when porting the temp-commit
 * stories revealed they all skipped the `sizeColumnsToFit` step, causing
 * column widths to render at AG\'s 200px default instead of stretching to
 * the legacy 800px-wide grids.
 */
import type { GridReadyEvent } from "ag-grid-community";
/** Default container size used by every V3 spike story (matches 2.x). */
export const V3_STORY_CONTAINER: {
  readonly height: number;
  readonly width: number;
} = {
  height: 500,
  width: 800,
};
/** Mirrors `useAgGridHelpers().onGridReady` from the legacy 2.x hook. */
export const fitColumnsOnReady = (params: GridReadyEvent): void => {
  params.api.sizeColumnsToFit();
};
