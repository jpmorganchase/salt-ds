import { StackLayout, Switch } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Readonly = (): ReactElement => (
  <StackLayout>
    <Switch readOnly checked label="Read only + checked" />
    <Switch readOnly label="Read only" />
  </StackLayout>
);
