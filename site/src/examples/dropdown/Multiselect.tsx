import { Dropdown, Option } from "@salt-ds/core";
import type { ReactElement } from "react";
import { shortColorData } from "./exampleData";

export const Multiselect = (): ReactElement => {
  return (
    <Dropdown multiselect style={{ width: "266px" }}>
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </Dropdown>
  );
};
