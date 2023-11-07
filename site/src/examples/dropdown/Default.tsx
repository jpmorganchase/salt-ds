import { ReactElement } from "react";
import { DropdownNext, Option } from "@salt-ds/lab";
import { shortColorData } from "./exampleData";

export const Default = (): ReactElement => {
  return (
    <DropdownNext style={{ width: "266px" }}>
      {shortColorData.map((color) => (
        <Option value={color} key={color}>
          {color}
        </Option>
      ))}
    </DropdownNext>
  );
};
