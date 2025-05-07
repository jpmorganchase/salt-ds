import { FlowLayout, ToggleButton } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Appearance = (): ReactElement => (
  <FlowLayout>
    <ToggleButton defaultChecked value="solid">
      Solid
    </ToggleButton>
    <ToggleButton defaultChecked value="bordered" appearance="bordered">
      Bordered
    </ToggleButton>
  </FlowLayout>
);
