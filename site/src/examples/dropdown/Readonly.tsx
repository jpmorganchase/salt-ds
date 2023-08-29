import { ReactElement } from "react";
import { DropdownNext } from "@salt-ds/lab";
import { StateNames } from "./exampleData";

export const Readonly = (): ReactElement => (
  <DropdownNext source={StateNames} defaultSelected="California" readOnly />
);
