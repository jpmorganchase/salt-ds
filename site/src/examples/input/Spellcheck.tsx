import { ReactElement } from "react";
import { Input } from "@salt-ds/core";

export const Spellcheck = (): ReactElement => (
  <Input
    defaultValue="Value"
    style={{ width: "256px" }}
    inputProps={{ spellCheck: true }}
  />
);
