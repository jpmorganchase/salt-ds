import { ReactElement } from "react";
import { Input } from "@salt-ds/core";

export const Readonly = (): ReactElement => (
  <Input
    defaultValue="Value" 
    style={{width: "256px"}}
    readOnly
  />
);
