import { ReactElement } from "react";
import { Switch } from "@salt-ds/core";

export const DisabledChecked = (): ReactElement => (
  <Switch label="Disabled + Checked" disabled defaultChecked />
);
