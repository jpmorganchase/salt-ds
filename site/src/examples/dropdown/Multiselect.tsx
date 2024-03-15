import { ReactElement } from "react";
import { DropdownNext, Option } from "@salt-ds/core";
import { shortColorData } from "./exampleData";

export const Multiselect = (): ReactElement => {
  return (
    <DropdownNext multiselect style={{ width: "266px" }}>
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </DropdownNext>
  );
};
