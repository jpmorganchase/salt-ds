import "./_setupV3";
/**
 * Phase 1 V3 spike — `HeaderVariants` story rendered against `saltTheme`.
 *
 * Exercises all six header variant parts in one story:
 *
 *   - `saltHeaderPrimary` / `saltHeaderSecondary` / `saltHeaderTertiary`
 *     (mutually exclusive within `feature: "saltHeaderBackground"`)
 *
 *   - `saltHeaderDividerPrimary` / `saltHeaderDividerSecondary` /
 *     `saltHeaderDividerTertiary` / `saltHeaderDividerNone`
 *     (mutually exclusive within `feature: "saltHeaderDivider"`)
 *
 * In 2.x these were swap-in modifier classes (`ag-theme-salt-header-{variant}`
 * + `ag-theme-salt-header-divider-{divider}`) applied to the grid wrapper.
 * In v3 we rebuild `saltTheme` per render with the chosen parts swapped in,
 * matching the proposal §4.6.1 API:
 *
 *   const myTheme = saltTheme
 *     .withPart(saltHeaderSecondary)
 *     .withPart(saltHeaderDividerNone);
 *
 * The legacy story uses two `<ToggleButtonGroup>`s for variant + divider.
 * This V3 story matches that UI exactly so visual comparison side-by-side
 * (`Ag Grid → Ag Grid Theme → HeaderVariants` vs this story) is trivial.
 */
import {
  FlexLayout,
  Label,
  StackLayout,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import {
  saltAgGridDefaults,
  saltHeaderDividerNone,
  saltHeaderDividerPrimary,
  saltHeaderDividerSecondary,
  saltHeaderDividerTertiary,
  saltHeaderPrimary,
  saltHeaderSecondary,
  saltHeaderTertiary,
  saltTheme,
} from "@salt-ds/ag-grid-theme";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import { type SyntheticEvent, useMemo, useState } from "react";
import dataGridExampleColumns from "../../src/dependencies/dataGridExampleColumns";
import dataGridExampleData from "../../src/dependencies/dataGridExampleData";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

type HeaderVariant = "primary" | "secondary" | "tertiary";
type HeaderDivider = "primary" | "secondary" | "tertiary" | "none";

const headerVariantPart = {
  primary: saltHeaderPrimary,
  secondary: saltHeaderSecondary,
  tertiary: saltHeaderTertiary,
} as const satisfies Record<HeaderVariant, unknown>;

const headerDividerPart = {
  primary: saltHeaderDividerPrimary,
  secondary: saltHeaderDividerSecondary,
  tertiary: saltHeaderDividerTertiary,
  none: saltHeaderDividerNone,
} as const satisfies Record<HeaderDivider, unknown>;

export default {
  title: "Ag Grid/Ag Grid Theme/V3 (Phase 0 spike)",
  component: AgGridReact,
  parameters: {
    chromatic: { disableSnapshot: false, delay: 200 },
  },
};

export const HeaderVariants = () => {
  // Match the legacy story's default state: secondary background + primary divider.
  const [variant, setVariant] = useState<HeaderVariant>("secondary");
  const [divider, setDivider] = useState<HeaderDivider>("primary");

  const onVariantChange = (event: SyntheticEvent<HTMLButtonElement>) =>
    setVariant(event.currentTarget.value as HeaderVariant);
  const onDividerChange = (event: SyntheticEvent<HTMLButtonElement>) =>
    setDivider(event.currentTarget.value as HeaderDivider);

  // Rebuild the theme when either selector changes. The `withPart` chain
  // replaces the same-feature parts already in saltTheme (Primary defaults).
  const themedForVariant = useMemo(
    () =>
      saltTheme
        .withPart(headerVariantPart[variant])
        .withPart(headerDividerPart[divider]),
    [variant, divider],
  );

  return (
    <StackLayout style={{ width: "100%" }}>
      <FlexLayout gap={3} wrap>
        <StackLayout gap={1}>
          <Label>Header background</Label>
          <ToggleButtonGroup onChange={onVariantChange} value={variant}>
            <ToggleButton value="primary">Primary</ToggleButton>
            <ToggleButton value="secondary">Secondary</ToggleButton>
            <ToggleButton value="tertiary">Tertiary</ToggleButton>
          </ToggleButtonGroup>
        </StackLayout>
        <StackLayout gap={1}>
          <Label>Header divider</Label>
          <ToggleButtonGroup onChange={onDividerChange} value={divider}>
            <ToggleButton value="primary">Primary</ToggleButton>
            <ToggleButton value="secondary">Secondary</ToggleButton>
            <ToggleButton value="tertiary">Tertiary</ToggleButton>
            <ToggleButton value="none">None</ToggleButton>
          </ToggleButtonGroup>
        </StackLayout>
      </FlexLayout>
      <div style={{ height: 400, width: 800 }}>
        <AgGridReact
          theme={themedForVariant}
          {...saltAgGridDefaults}
          columnDefs={dataGridExampleColumns}
          rowData={dataGridExampleData}
        />
      </div>
    </StackLayout>
  );
};

