import { StackLayout, ToggleButton } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Sentiment = (): ReactElement => (
  <StackLayout>
    <ToggleButton value="accented" sentiment="accented">
      Accented
    </ToggleButton>
    <ToggleButton value="positive" sentiment="positive">
      Positive
    </ToggleButton>
    <ToggleButton value="negative" sentiment="negative">
      Negative
    </ToggleButton>
    <ToggleButton value="caution" sentiment="caution">
      Caution
    </ToggleButton>
  </StackLayout>
);
