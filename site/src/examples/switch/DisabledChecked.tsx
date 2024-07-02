import { Switch } from "@salt-ds/core";
import type { ReactElement } from "react";

export const DisabledChecked = (): ReactElement => (
  <Switch label="Disabled + Checked" disabled defaultChecked />
);
