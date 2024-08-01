import { FlexLayout, Panel } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Secondary = (): ReactElement => (
  <FlexLayout
    style={{
      width: "90%",
      height: "90%",
    }}
  >
    <Panel
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      variant="secondary"
    >
      Example of a secondary Panel
    </Panel>
  </FlexLayout>
);
