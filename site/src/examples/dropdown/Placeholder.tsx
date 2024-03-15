import { ReactElement } from "react";
import { DropdownNext, Option } from "@salt-ds/core";
import { shortColorData } from "./exampleData";

export const Placeholder = (): ReactElement => {
  return (
    <DropdownNext placeholder="Color" style={{ width: "266px" }}>
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </DropdownNext>
  );
};
