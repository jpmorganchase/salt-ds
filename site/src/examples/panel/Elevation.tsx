import { GridLayout, Panel } from "@salt-ds/core";
import type { CSSProperties, ReactElement } from "react";

const panelStyle = {
  alignItems: "center",
  display: "flex",
  justifyContent: "center",
  minHeight: 144,
} satisfies CSSProperties;

export const Elevation = (): ReactElement => (
  <GridLayout
    columns="repeat(auto-fit, minmax(220px, 1fr))"
    style={{ width: "100%" }}
  >
    <Panel elevation="flat" style={panelStyle} variant="secondary">
      Flat
    </Panel>
    <Panel elevation="raised" style={panelStyle} variant="secondary">
      Raised
    </Panel>
  </GridLayout>
);
