/**
 * Salt header layout part — always-on bespoke header CSS that's independent
 * of which header BACKGROUND variant the consumer composes
 * (`saltHeaderPrimary` / `saltHeaderSecondary` / `saltHeaderTertiary`).
 *
 * Lives separately from those variant parts because:
 *   - Layout rules (pinned dividers, floating-filter chrome, hover halos,
 *     open-menu-state, label icon spacing) apply to ALL header variants.
 *   - The variant parts use `feature: "saltHeaderBackground"` and are
 *     mutually exclusive (only one variant at a time wins) — putting
 *     layout CSS in one would lose it when the consumer swaps variants.
 *   - The `headerRowBorder` typed param in `saltTheme.ts` handles the
 *     `border-bottom` on `.ag-header` directly without needing CSS here.
 *
 * No `feature` key: this part composes additively. Consumers can opt out
 * with `withoutPart(saltHeaderLayout)` to fall back to AG's defaults.
 *
 * Ported from `packages/ag-grid-theme/css/parts/ag-header.css` (2.x line)
 * minus rules already covered by other parts (see CSS file's top JSDoc for
 * the exclusion list). (Phase 8 port 2026-06-14.)
 */
import { createPart } from "ag-grid-community";
import css from "../../css/salt-header.css?inline";

export const saltHeaderLayout = createPart({ css });
