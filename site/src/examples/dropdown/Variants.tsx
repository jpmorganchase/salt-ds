import { ReactElement } from "react";
import { DropdownNext } from "@salt-ds/lab";
import { StateNames } from "./exampleData";
import { StackLayout } from "@salt-ds/core";

export const Variants = (): ReactElement => (
  <StackLayout>
    <DropdownNext source={StateNames} />
    <DropdownNext source={StateNames} variant="secondary" />
  </StackLayout>
);
