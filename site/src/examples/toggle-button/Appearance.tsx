import { FlowLayout, ToggleButton } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Appearance = (): ReactElement => (
  <FlowLayout>
    <ToggleButton defaultSelected value="solid">
      Solid
    </ToggleButton>
    <ToggleButton defaultSelected value="bordered" appearance="bordered">
      Bordered
    </ToggleButton>
  </FlowLayout>
);
