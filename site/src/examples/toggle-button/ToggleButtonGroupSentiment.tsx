import { StackLayout, ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import type { ReactElement } from "react";

export const ToggleButtonGroupSentiment = (): ReactElement => (
  <StackLayout>
    <ToggleButtonGroup defaultValue="all" sentiment="accented">
      <ToggleButton value="all">All</ToggleButton>
      <ToggleButton value="active">Active</ToggleButton>
      <ToggleButton value="archived">Archived</ToggleButton>
      <ToggleButton value="saved">Saved</ToggleButton>
    </ToggleButtonGroup>
    <ToggleButtonGroup defaultValue="all">
      <ToggleButton value="all" sentiment="accented">
        All
      </ToggleButton>
      <ToggleButton value="active" sentiment="positive">
        Active
      </ToggleButton>
      <ToggleButton value="archived" sentiment="negative">
        Archived
      </ToggleButton>
      <ToggleButton value="saved" sentiment="caution">
        Saved
      </ToggleButton>
    </ToggleButtonGroup>
  </StackLayout>
);
