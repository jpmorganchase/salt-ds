/**
 * Phase 0 skeleton for the Salt icon set part.
 *
 * Real icon glyphs + font registration land in Phase 1+ (per
 * `MIGRATION_PROPOSAL.md` §4.5). For now this part exists so that:
 *
 *   1. `iconSize` is a typed parameter of the theme (the `rowGroupIndentSize`
 *      calc expression in `saltTheme.ts` references it).
 *   2. The `iconSet` feature slot in the theme is occupied by Salt, so no
 *      built-in icon set (Quartz / Alpine / Balham / Material) leaks in.
 *
 * `feature: "iconSet"` is mutually exclusive across the registered parts —
 * adding any built-in `iconSetQuartz` / `iconSetAlpine` / etc. via
 * `saltTheme.withPart(...)` would replace this part.
 */
import { createPart } from "ag-grid-community";
import type { LengthValue } from "./_paramTypes";

export interface SaltIconSetParams {
  iconSize: LengthValue;
}

export const saltIconSet = createPart<SaltIconSetParams>({
  feature: "iconSet",
  params: {
    // Wired to Salt's icon size token. Will become the WOFF + codepoints
    // registration in Phase 1+ (proposal §4.5).
    iconSize: "var(--salt-size-icon)",
  },
});

