import { ReactElement } from "react";
import { Dropdown, Option } from "@salt-ds/core";
import { shortColorData } from "./exampleData";

export const Default = (): ReactElement => {
  return (
    <Dropdown style={{ width: "266px" }}>
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </Dropdown>
  );
};
