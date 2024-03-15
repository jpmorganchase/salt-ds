import { ReactElement } from "react";
import { DropdownNext, Option } from "@salt-ds/core";
import { shortColorData } from "./exampleData";

export const Disabled = (): ReactElement => (
  <DropdownNext
    defaultSelected={["California"]}
    disabled
    style={{ width: "266px" }}
  >
    {shortColorData.map((color) => (
      <Option value={color} key={color} />
    ))}
  </DropdownNext>
);
