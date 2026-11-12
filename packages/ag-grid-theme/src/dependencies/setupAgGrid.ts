import { ModuleRegistry, provideGlobalGridOptions } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";

// Storybook setup, imported by every story file that renders a grid; it is not part of the
// published CSS package. The site examples set these options on each grid instead, so they
// can be copied as they are.

// [VERSION DIVERGENCE]: AG Grid v33+ requires module registration, once, where the app starts.
ModuleRegistry.registerModules([AllEnterpriseModule]);

// Options every example grid shares. A grid's own value for an option replaces the global one.
provideGlobalGridOptions({
  // [VERSION DIVERGENCE]: AG Grid v33+ defaults to the Theming API; Salt uses legacy CSS themes.
  theme: "legacy",
  autoSizeStrategy: { type: "fitGridWidth" },
  defaultColDef: { filter: true },
});
