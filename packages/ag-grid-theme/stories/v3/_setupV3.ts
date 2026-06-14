/**
 * Shared setup for V3 spike stories — runs at module load time.
 *
 * Solves the "V3 theme loads then switches to OOTB styling" bug in the
 * full Storybook UI:
 *
 *   The legacy `ag-grid-community/styles/ag-grid.css` is side-effect-imported
 *   by `packages/ag-grid-theme/stories/ag-grid-theme.stories.tsx` (the 2.x
 *   stories file). Storybook eagerly evaluates every story module's top-level
 *   imports, so that CSS file ends up loaded into the shared Storybook iframe
 *   even when the user navigated directly to a V3 story. The CSS contains a
 *   `[class*=ag-theme-] { --ag-header-background-color: transparent; --ag-font-size: 14px; ... }`
 *   block whose selector specificity (0,1,0) beats V3's
 *   `:where(.ag-theme-params-N)` (0,0,0), so the legacy defaults clobber
 *   saltTheme's params.
 *
 * Fix: at V3 story load, find and remove the offending `<style>` tag(s).
 * V3 grids don't depend on `ag-grid.css` — they inject their own CSS via the
 * v33 theme parts system. The downside: 2.x stories rendered in the same
 * iframe AFTER removal will lose their base styling until the page reloads.
 * That's an acceptable tradeoff for the migration-spike Storybook context
 * (consumers in production use either 2.x or 3.0, not both).
 *
 * Production note: this helper is Storybook-only. The shipped V3 package
 * (`@salt-ds/ag-grid-theme@3.x`) does NOT remove anything from the
 * consumer's document — that would be surprising side-effect behaviour.
 */
if (typeof document !== "undefined") {
  const removeLegacyAgGridCss = () => {
    const tags = document.querySelectorAll(
      'style[data-vite-dev-id*="ag-grid-community/styles/ag-grid.css"]',
    );
    tags.forEach((t) => t.remove());
  };
  removeLegacyAgGridCss();
  // Vite HMR may re-inject the legacy CSS on hot reloads; observe and clean.
  if (typeof MutationObserver !== "undefined") {
    new MutationObserver(removeLegacyAgGridCss).observe(document.head, {
      childList: true,
    });
  }
}

export {};
