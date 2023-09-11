import { ReactElement } from "react";
import { DropdownNext } from "@salt-ds/lab";
import { StateNames } from "./exampleData";

export const Default = (): ReactElement => <DropdownNext source={StateNames} />;
