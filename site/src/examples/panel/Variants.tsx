import { GridLayout, Panel } from "@salt-ds/core";
import type { CSSProperties, ReactElement } from "react";

const panelStyle = {
  alignItems: "center",
  display: "flex",
  justifyContent: "center",
  minHeight: 144,
} satisfies CSSProperties;

export const Variants = (): ReactElement => (
  <GridLayout
    columns="repeat(auto-fit, minmax(180px, 1fr))"
    style={{ width: "100%" }}
  >
    <Panel style={panelStyle}>Primary</Panel>
    <Panel style={panelStyle} variant="secondary">
      Secondary
    </Panel>
    <Panel style={panelStyle} variant="tertiary">
      Tertiary
    </Panel>
  </GridLayout>
);
