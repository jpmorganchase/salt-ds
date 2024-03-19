import { ReactElement } from "react";
import { Dropdown, Option } from "@salt-ds/core";
import { shortColorData } from "./exampleData";

export const Placeholder = (): ReactElement => {
  return (
    <Dropdown placeholder="Color" style={{ width: "266px" }}>
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </Dropdown>
  );
};
