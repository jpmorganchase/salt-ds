/**
 * Salt zebra-striping part (proposal §4.6).
 *
 * In 2.x this is the `.ag-theme-salt-variant-zebra` modifier class on the
 * grid wrapper (see `css/parts/ag-row.css` lines 13-18). Pattern: even
 * rows take Salt's secondary container colour, odd rows take primary
 * (white in light mode), header stays primary — gives the typical zebra
 * stripe look.
 *
 * Token mapping (verbatim from `ag-row.css`):
 *   --ag-background-color           ← --salt-container-secondary-background   (even rows)
 *   --ag-odd-row-background-color   ← --salt-container-primary-background     (odd rows)
 *   --ag-header-background-color    ← --salt-container-primary-background     (header)
 *
 * Has its own `feature: "saltZebra"` key so it's a singleton — adding the
 * part toggles zebra ON; omitting it leaves the grid in solid-colour mode.
 *
 * Phase 1 caveat: when combined with `saltRowVariantSecondary` or
 * `saltRowVariantTertiary` the 2.x line FLIPS the colours (e.g. variant-
 * secondary + zebra makes the even rows primary and odd rows secondary —
 * see `ag-row.css` lines 20-30). That combined behaviour doesn't translate
 * cleanly to AG Grid v3's additive part-merging (last-writer-wins per
 * param). For Phase 1 we ship plain saltZebra; the combined "variant +
 * zebra" interactions can land as dedicated combo parts
 * (saltRowVariantSecondaryZebra, saltRowVariantTertiaryZebra) in Phase 2+
 * if a real use-case appears. The legacy stories test each variant
 * standalone, so this is enough for parity.
 */
import { createPart } from "ag-grid-community";

export const saltZebra = createPart({
  feature: "saltZebra",
  params: {
    backgroundColor: "var(--salt-container-secondary-background)",
    oddRowBackgroundColor: "var(--salt-container-primary-background)",
    headerBackgroundColor: "var(--salt-container-primary-background)",
    headerCellHoverBackgroundColor: "var(--salt-container-primary-background)",
  },
});

