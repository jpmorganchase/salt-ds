import { FlowLayout, StackLayout, ToggleButton } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Disabled = (): ReactElement => (
  <FlowLayout>
    <StackLayout>
      <ToggleButton value="disabled" disabled>
        Solid unselected
      </ToggleButton>
      <ToggleButton sentiment="accented" value="disabled" disabled>
        Solid unselected
      </ToggleButton>
      <ToggleButton sentiment="caution" value="disabled" disabled>
        Solid unselected
      </ToggleButton>
      <ToggleButton sentiment="negative" value="disabled" disabled>
        Solid unselected
      </ToggleButton>
      <ToggleButton sentiment="positive" value="disabled" disabled>
        Solid unselected
      </ToggleButton>
    </StackLayout>
    <StackLayout>
      <ToggleButton value="disabled" disabled selected>
        Solid selected
      </ToggleButton>
      <ToggleButton sentiment="accented" value="disabled" disabled selected>
        Solid selected
      </ToggleButton>
      <ToggleButton sentiment="caution" value="disabled" disabled selected>
        Solid selected
      </ToggleButton>
      <ToggleButton sentiment="negative" value="disabled" disabled selected>
        Solid selected
      </ToggleButton>
      <ToggleButton sentiment="positive" value="disabled" disabled selected>
        Solid selected
      </ToggleButton>
    </StackLayout>
    <StackLayout>
      <ToggleButton appearance="bordered" value="disabled" disabled selected>
        Bordered selected
      </ToggleButton>
      <ToggleButton
        appearance="bordered"
        sentiment="accented"
        value="disabled"
        disabled
        selected
      >
        Bordered selected
      </ToggleButton>
      <ToggleButton
        appearance="bordered"
        sentiment="caution"
        value="disabled"
        disabled
        selected
      >
        Bordered selected
      </ToggleButton>
      <ToggleButton
        appearance="bordered"
        sentiment="negative"
        value="disabled"
        disabled
        selected
      >
        Bordered selected
      </ToggleButton>
      <ToggleButton
        appearance="bordered"
        sentiment="positive"
        value="disabled"
        disabled
        selected
      >
        Bordered selected
      </ToggleButton>
    </StackLayout>
  </FlowLayout>
);
