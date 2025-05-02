import { FlowLayout, ToggleButton } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Appearance = (): ReactElement => (
  <FlowLayout>
    <ToggleButton value="solid">Solid</ToggleButton>
    <ToggleButton value="bordered" appearance="bordered">
      Bordered
    </ToggleButton>
  </FlowLayout>
);
