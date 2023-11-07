import { ReactElement } from "react";
import { DropdownNext, Option } from "@salt-ds/lab";
import { shortColorData } from "./exampleData";

export const DisabledOption = (): ReactElement => {
  return (
    <DropdownNext style={{ width: "266px" }}>
      {shortColorData.map((color) => (
        <Option disabled={color === "Baby blue"} value={color} key={color}>
          {color}
        </Option>
      ))}
    </DropdownNext>
  );
};
