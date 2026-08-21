import baseConfig from "./cypress.config";

const benchmarkSpecs = [
  "packages/core/src/__tests__/__e2e__/accordion/Accordion.cy.tsx",
  "packages/core/src/__tests__/__e2e__/badge/Badge.cy.tsx",
  "packages/core/src/__tests__/__e2e__/button/Button.cy.tsx",
  "packages/core/src/__tests__/__e2e__/checkbox/Checkbox.cy.tsx",
  "packages/core/src/__tests__/__e2e__/collapsible/Collapsible.cy.tsx",
  "packages/core/src/__tests__/__e2e__/divider/Divider.cy.tsx",
  "packages/core/src/__tests__/__e2e__/drawer/Drawer.cy.tsx",
  "packages/core/src/__tests__/__e2e__/panel/Panel.cy.tsx",
  "packages/core/src/__tests__/__e2e__/pill/Pill.cy.tsx",
  "packages/core/src/__tests__/__e2e__/radio-button/RadioButton.cy.tsx",
  "packages/core/src/__tests__/__e2e__/spinner/Spinner.cy.tsx",
  "packages/core/src/__tests__/__e2e__/toast/Toast.cy.tsx",
  "packages/core/src/__tests__/__e2e__/toggle-button/ToggleButton.cy.tsx",
  "packages/lab/src/__tests__/__e2e__/on-solid-button/OnSolidButton.cy.tsx",
  "packages/lab/src/__tests__/__e2e__/search-input/SearchInput.cy.tsx",
];

export default {
  ...baseConfig,
  component: {
    ...baseConfig.component,
    specPattern: benchmarkSpecs,
  },
};
