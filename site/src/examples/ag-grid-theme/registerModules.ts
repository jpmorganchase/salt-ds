import { ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";

// [VERSION DIVERGENCE]: AG Grid v33+ requires module registration, once, where the app starts.
// These examples register AG Grid Enterprise, because some of them use Enterprise features; an
// app with only ag-grid-community registers AllCommunityModule from "ag-grid-community" instead.
ModuleRegistry.registerModules([AllEnterpriseModule]);
