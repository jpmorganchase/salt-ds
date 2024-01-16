import { ReactElement } from "react";
import { DropdownNext, Option } from "@salt-ds/lab";
import { shortColorData } from "./exampleData";

export const Disabled = (): ReactElement => (
  <DropdownNext
    defaultSelected={["California"]}
    defaultValue="California"
    disabled
    style={{ width: "266px" }}
  >
    {shortColorData.map((color) => (
      <Option value={color} key={color}>
        {color}
      </Option>
    ))}
  </DropdownNext>
);
