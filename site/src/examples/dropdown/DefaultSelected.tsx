import { ReactElement } from "react";
import { DropdownNext } from "@salt-ds/lab";
import { StateNames } from "./exampleData";

export const DefaultSelected = (): ReactElement => (
  <DropdownNext source={StateNames} defaultSelected="California" />
);
