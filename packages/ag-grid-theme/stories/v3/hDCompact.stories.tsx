import "./_setupV3";
/**
 * Phase 2 V3 spike — `HDCompact` story rendered against `saltTheme`.
 *
 * Exercises Salt's high-density (compact) rhythm together with row variant
 * parts. Differences from the legacy story (`ag-theme-salt-compact-{mode}`
 * class wrapper + `useAgGridHelpers({ compact: true, density: "high" })`):
 *
 *   - **Density** flows from `SaltProvider density="high"` via inherited
 *     `--salt-size-base` (proposal §4.7) — saltTheme's `rowHeight` /
 *     `headerHeight` are `calc(var(--salt-size-base) + var(--salt-spacing-100))`
 *     so the grid contracts automatically. No `useAgGridHelpers` branching,
 *     no `ag-theme-salt-compact-*` class. The legacy "compact" tier (21/20px
 *     rows) is dropped per §9 decision 2 — `high` density alone now drives
 *     the contracted rhythm.
 *
 *   - **Variants** swap from CSS class names to typed parts:
 *       primary   → no extra part (defaults baked into `saltTheme`)
 *       secondary → `saltRowVariantSecondary`
 *       zebra     → `saltZebra`
 *
 *   - Status bar (`statusBar` prop) renders unchanged.
 *   - DropdownEditor cell editor is registered for use by columns that
 *     opt into it.
 *
 * Pairs with the legacy story `Ag Grid → Ag Grid Theme → HDCompact`
 * (`packages/ag-grid-theme/src/examples/HDCompact.tsx`).
 */
import {
  SaltProvider,
  SaltProviderNext,
  StackLayout,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from "@salt-ds/core";
import {
  saltAgGridDefaults,
  saltRowVariantSecondary,
  saltTheme,
  saltZebra,
} from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import { type SyntheticEvent, useMemo, useState } from "react";
import { DropdownEditor } from "../../src/dependencies/cell-editors/DropdownEditor";
import dataGridExampleColumnsHdCompact from "../../src/dependencies/dataGridExampleColumnsHdCompact";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";
import { V3_STORY_CONTAINER, fitColumnsOnReady } from "./_storyDefaults";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

type Variant = "primary" | "secondary" | "zebra";

const statusBar = {
  statusPanels: [
    { statusPanel: "agTotalRowCountComponent", align: "left" },
    { statusPanel: "agFilteredRowCountComponent" },
    { statusPanel: "agSelectedRowCountComponent" },
    { statusPanel: "agAggregationComponent" },
  ],
};

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const HDCompact = () => {
  const [selected, setSelected] = useState<Variant>("primary");
  const onChange = (event: SyntheticEvent<HTMLButtonElement>) => {
    setSelected(event.currentTarget.value as Variant);
  };
  const { themeNext } = useTheme();
  const Provider = themeNext ? SaltProviderNext : SaltProvider;

  // Rebuild the theme when the variant toggle changes. The variant parts use
  // distinct `feature` keys (`saltRowVariant`, `saltZebra`) so AG Grid's part
  // merging slots them in additively without colliding.
  const themed = useMemo(() => {
    switch (selected) {
      case "secondary":
        return saltTheme.withPart(saltRowVariantSecondary);
      case "zebra":
        return saltTheme.withPart(saltZebra);
      default:
        return saltTheme;
    }
  }, [selected]);

  return (
    <Provider density="high">
      <StackLayout style={{ width: "100%" }}>
        <ToggleButtonGroup onChange={onChange} value={selected}>
          <ToggleButton value="primary">Primary</ToggleButton>
          <ToggleButton value="secondary">Secondary</ToggleButton>
          <ToggleButton value="zebra">Zebra</ToggleButton>
        </ToggleButtonGroup>
        <div style={V3_STORY_CONTAINER}>
          <AgGridReact
            theme={themed}
            {...saltAgGridDefaults}
            columnDefs={dataGridExampleColumnsHdCompact}
            rowData={dataGridExampleData}
            statusBar={statusBar}
            rowSelection="multiple"
            cellSelection={true}
            onFirstDataRendered={(params) => {
              params.api.forEachNode((node, index) => {
                if (node.data && index < 3) {
                  node.setSelected(true);
                }
              });
            }}
            components={{ DropdownEditor }}
            onGridReady={fitColumnsOnReady}
          />
        </div>
      </StackLayout>
    </Provider>
  );
};
