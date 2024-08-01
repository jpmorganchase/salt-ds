import { FlexLayout, Panel } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Tertiary = (): ReactElement => (
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
      variant="tertiary"
    >
      Example of a Tertiary Panel
    </Panel>
  </FlexLayout>
);
