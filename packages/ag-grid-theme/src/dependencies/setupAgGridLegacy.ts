/**
 * Phase −1 legacy-mode runtime shim for `@salt-ds/ag-grid-theme` 2.x stories.
 *
 * AG Grid v33+ requires two pieces of one-time, module-scope setup before any
 * `<AgGridReact>` is rendered:
 *
 *   1. **Module registration.** v33 split the monolithic build into discrete
 *      modules; rendering a grid without any module registered throws
 *      `AG Grid: error #272`. We register the full Community + Enterprise
 *      module sets to preserve 2.x behaviour (every story used the monolithic
 *      build implicitly).
 *
 *   2. **Legacy theme opt-in.** v33's new Theming API takes over by default;
 *      passing `theme: "legacy"` keeps the v32-era CSS pipeline
 *      (`--ag-*` custom properties + `.ag-theme-salt-*` classes) which is
 *      what `salt-ag-theme.css` was written for.
 *
 * Importing this file once (`import "../dependencies/setupAgGridLegacy";`)
 * is enough — both calls are idempotent and side-effect-only.
 *
 * This shim disappears in v3 (Phase 0+) — the Theming-API rewrite registers
 * its own theme via `<AgGridReact theme={saltTheme} />` and no longer needs
 * the legacy escape hatch.
 */
import { AllCommunityModule, ModuleRegistry, provideGlobalGridOptions } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);
provideGlobalGridOptions({ theme: "legacy" });

