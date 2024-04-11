import { ReactElement } from "react";
import { Dropdown, Option } from "@salt-ds/core";
import { shortColorData } from "./exampleData";

export const DisabledOption = (): ReactElement => {
  return (
    <Dropdown style={{ width: "266px" }}>
      {shortColorData.map((color) => (
        <Option disabled={color === "Baby blue"} value={color} key={color} />
      ))}
    </Dropdown>
  );
};
