import { FlexLayout, Panel } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Primary = (): ReactElement => (
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
    >
      Example of a primary Panel
    </Panel>
  </FlexLayout>
);
