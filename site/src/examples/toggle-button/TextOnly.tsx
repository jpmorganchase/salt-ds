import { ToggleButton, Tooltip } from "@salt-ds/core";
import type { ReactElement } from "react";

export const TextOnly = (): ReactElement => (
  <ToggleButton value="and">AND</ToggleButton>
);
